import fs from 'node:fs';
import path from 'node:path';

const currentUid = () => (
  typeof process.getuid === 'function' ? process.getuid() : null
);

const assertOwnedByCurrentUser = (status, target) => {
  const uid = currentUid();
  if (uid !== null && status.uid !== uid) {
    throw new Error(`Refusing private migration path owned by another user: ${target}.`);
  }
};

const assertPrivateDirectoryStatus = (status, directory) => {
  if (status.isSymbolicLink() || !status.isDirectory()) {
    throw new Error(`Refusing non-directory private migration path: ${directory}.`);
  }
  assertOwnedByCurrentUser(status, directory);
};

const assertPrivateFileStatus = (status, destination) => {
  if (status.isSymbolicLink() || !status.isFile() || status.nlink !== 1) {
    throw new Error(`Refusing non-regular private migration summary: ${destination}.`);
  }
  assertOwnedByCurrentUser(status, destination);
};

const noFollow = fs.constants.O_NOFOLLOW ?? 0;
const directoryOnly = fs.constants.O_DIRECTORY ?? 0;

const openVerifiedDirectory = (directory) => {
  const pathStatus = fs.lstatSync(directory);
  assertPrivateDirectoryStatus(pathStatus, directory);
  const descriptor = fs.openSync(
    directory,
    fs.constants.O_RDONLY | directoryOnly | noFollow
  );
  const descriptorStatus = fs.fstatSync(descriptor);
  try {
    assertPrivateDirectoryStatus(descriptorStatus, directory);
    if (
      descriptorStatus.dev !== pathStatus.dev
      || descriptorStatus.ino !== pathStatus.ino
    ) {
      throw new Error(`Private migration directory changed while opening: ${directory}.`);
    }
    fs.fchmodSync(descriptor, 0o700);
    return {
      descriptor,
      identity: { dev: descriptorStatus.dev, ino: descriptorStatus.ino }
    };
  } catch (error) {
    fs.closeSync(descriptor);
    throw error;
  }
};

const ensurePrivateDirectory = (directory) => {
  try {
    fs.mkdirSync(directory, { mode: 0o700 });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
  }
  return openVerifiedDirectory(directory);
};

const assertDirectoryUnchanged = (directory, expectedIdentity) => {
  const { descriptor, identity } = openVerifiedDirectory(directory);
  try {
    if (
      identity.dev !== expectedIdentity.dev
      || identity.ino !== expectedIdentity.ino
    ) {
      throw new Error(`Private migration directory changed during summary write: ${directory}.`);
    }
  } finally {
    fs.closeSync(descriptor);
  }
};

const acceptExistingSummary = ({ destination, serialized }) => {
  const pathStatus = fs.lstatSync(destination);
  assertPrivateFileStatus(pathStatus, destination);
  const descriptor = fs.openSync(destination, fs.constants.O_RDONLY | noFollow);
  try {
    const descriptorStatus = fs.fstatSync(descriptor);
    assertPrivateFileStatus(descriptorStatus, destination);
    if (
      descriptorStatus.dev !== pathStatus.dev
      || descriptorStatus.ino !== pathStatus.ino
    ) {
      throw new Error(`Private migration summary changed while opening: ${destination}.`);
    }
    if (fs.readFileSync(descriptor, 'utf8') !== serialized) {
      throw new Error(`Existing local migration summary does not match: ${destination}.`);
    }
    fs.fchmodSync(descriptor, 0o600);
  } finally {
    fs.closeSync(descriptor);
  }
};

const createSummary = ({ destination, serialized }) => {
  const descriptor = fs.openSync(
    destination,
    fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | noFollow,
    0o600
  );
  try {
    assertPrivateFileStatus(fs.fstatSync(descriptor), destination);
    fs.writeFileSync(descriptor, serialized, 'utf8');
    fs.fsyncSync(descriptor);
    fs.fchmodSync(descriptor, 0o600);
  } finally {
    fs.closeSync(descriptor);
  }
};

export const writePrivateMigrationSummary = ({ directory, destination, serialized }) => {
  const resolvedDirectory = path.resolve(directory);
  const resolvedDestination = path.resolve(destination);
  if (path.dirname(resolvedDestination) !== resolvedDirectory) {
    throw new Error('Private migration summary must be a direct child of its private directory.');
  }
  if (typeof serialized !== 'string') {
    throw new Error('Private migration summary must be serialized text.');
  }

  const { descriptor: directoryDescriptor, identity } = ensurePrivateDirectory(
    resolvedDirectory
  );
  try {
    try {
      createSummary({ destination: resolvedDestination, serialized });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      acceptExistingSummary({ destination: resolvedDestination, serialized });
    }
    fs.fsyncSync(directoryDescriptor);
  } finally {
    fs.closeSync(directoryDescriptor);
  }
  assertDirectoryUnchanged(resolvedDirectory, identity);
  return resolvedDestination;
};
