import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateReleaseMetadata } from '../src/build/version.js';
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const info = validateReleaseMetadata(
  JSON.parse(readFileSync('dist/version.json', 'utf8')),
  process.env.RELEASE_VERSION,
  commit,
);
console.log(`Release vérifiée : ${info.version} · ${info.commit}`);
