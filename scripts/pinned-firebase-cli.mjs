import fs from 'node:fs';
import path from 'node:path';
import { validateFirebaseToolsLock } from './audit-policy.mjs';

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const assertRegularFile = (filePath, label) => {
  const status = fs.lstatSync(filePath);
  if (!status.isFile() || status.isSymbolicLink()) {
    throw new Error(`${label} must be a regular, non-symlink file.`);
  }
};

const assertRegularDirectory = (directory, label) => {
  const status = fs.lstatSync(directory);
  if (!status.isDirectory() || status.isSymbolicLink()) {
    throw new Error(`${label} must be a real, non-symlink directory.`);
  }
};

export const resolvePinnedFirebaseCli = ({ repositoryRoot = process.cwd() } = {}) => {
  const policy = readJson(path.join(repositoryRoot, 'scripts', 'dependency-audit-policy.json'));
  const rootManifest = readJson(path.join(repositoryRoot, 'package.json'));
  const lockfile = readJson(path.join(repositoryRoot, 'package-lock.json'));
  const functionsManifest = readJson(path.join(repositoryRoot, 'functions', 'package.json'));
  validateFirebaseToolsLock({ rootManifest, lockfile, functionsManifest, policy });

  const packageDirectory = path.join(repositoryRoot, 'node_modules', 'firebase-tools');
  assertRegularDirectory(packageDirectory, 'Installed firebase-tools package directory');
  const packageManifestPath = path.join(packageDirectory, 'package.json');
  assertRegularFile(packageManifestPath, 'Installed firebase-tools package manifest');
  const installedManifest = readJson(packageManifestPath);
  if (
    installedManifest.version !== policy.firebaseToolsVersion
    || installedManifest.bin?.firebase !== './lib/bin/firebase.js'
  ) {
    throw new Error('Installed firebase-tools does not match the exact audited CLI contract.');
  }

  const cliPath = path.join(packageDirectory, 'lib', 'bin', 'firebase.js');
  assertRegularFile(cliPath, 'Pinned Firebase CLI entry point');
  const realPackageDirectory = `${fs.realpathSync(packageDirectory)}${path.sep}`;
  const realCliPath = fs.realpathSync(cliPath);
  if (!realCliPath.startsWith(realPackageDirectory)) {
    throw new Error('Pinned Firebase CLI entry point escapes its installed package directory.');
  }
  return Object.freeze({
    command: process.execPath,
    argsPrefix: Object.freeze([realCliPath]),
    version: policy.firebaseToolsVersion
  });
};
