import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { writePrivateMigrationSummary } from './private-summary.js';

const withTemporaryDirectory = (run) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ackaraca-private-summary-'));
  try {
    return run(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

test('private migration summaries are owner-only, immutable, and idempotent', () => {
  withTemporaryDirectory((root) => {
    const directory = path.join(root, '.legacy-migration');
    const destination = path.join(directory, 'summary.json');
    assert.equal(writePrivateMigrationSummary({
      directory,
      destination,
      serialized: '{"reviewed":true}\n'
    }), destination);
    assert.equal(fs.readFileSync(destination, 'utf8'), '{"reviewed":true}\n');
    assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
    assert.equal(fs.statSync(destination).mode & 0o777, 0o600);

    writePrivateMigrationSummary({
      directory,
      destination,
      serialized: '{"reviewed":true}\n'
    });
    assert.throws(() => writePrivateMigrationSummary({
      directory,
      destination,
      serialized: '{"reviewed":false}\n'
    }), /does not match/u);
  });
});

test('private migration summaries reject symlinked directories and files', () => {
  withTemporaryDirectory((root) => {
    const targetDirectory = path.join(root, 'target-directory');
    const linkedDirectory = path.join(root, '.legacy-migration');
    fs.mkdirSync(targetDirectory);
    fs.symlinkSync(targetDirectory, linkedDirectory);
    assert.throws(() => writePrivateMigrationSummary({
      directory: linkedDirectory,
      destination: path.join(linkedDirectory, 'summary.json'),
      serialized: '{}\n'
    }), /non-directory/u);
  });

  withTemporaryDirectory((root) => {
    const directory = path.join(root, '.legacy-migration');
    const target = path.join(root, 'target.json');
    const destination = path.join(directory, 'summary.json');
    fs.mkdirSync(directory);
    fs.writeFileSync(target, 'do-not-overwrite\n');
    fs.symlinkSync(target, destination);
    assert.throws(() => writePrivateMigrationSummary({
      directory,
      destination,
      serialized: '{}\n'
    }), /non-regular/u);
    assert.equal(fs.readFileSync(target, 'utf8'), 'do-not-overwrite\n');
  });
});

test('private migration summaries reject hard links, directories, and path escape', () => {
  withTemporaryDirectory((root) => {
    const directory = path.join(root, '.legacy-migration');
    const original = path.join(root, 'original.json');
    const destination = path.join(directory, 'summary.json');
    fs.mkdirSync(directory);
    fs.writeFileSync(original, '{}\n');
    fs.linkSync(original, destination);
    assert.throws(() => writePrivateMigrationSummary({
      directory,
      destination,
      serialized: '{}\n'
    }), /non-regular/u);
  });

  withTemporaryDirectory((root) => {
    const directory = path.join(root, '.legacy-migration');
    const destination = path.join(directory, 'summary.json');
    fs.mkdirSync(destination, { recursive: true });
    assert.throws(() => writePrivateMigrationSummary({
      directory,
      destination,
      serialized: '{}\n'
    }), /non-regular/u);
    assert.throws(() => writePrivateMigrationSummary({
      directory,
      destination: path.join(root, 'escaped.json'),
      serialized: '{}\n'
    }), /direct child/u);
  });
});
