import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildVersion } from './src/build/version.js';
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const info = buildVersion(process.env.RELEASE_VERSION, pkg.version);
let commit = '';
try {
  commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  /* Source archive builds have no git metadata. */
}
export default defineConfig({
  base: '/magic-learning-quest/',
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(info.version),
  },
  plugins: [
    {
      name: 'release-metadata',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ ...info, commit }),
        });
      },
    },
  ],
});
