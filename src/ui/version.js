import { escapeHTML } from './battle/characters.js';
export const APP_VERSION = import.meta.env.APP_VERSION;
export function versionMarkup() {
  return `<p class="app-version" data-testid="app-version" aria-label="Version ${escapeHTML(APP_VERSION)}">${escapeHTML(APP_VERSION)}</p>`;
}
