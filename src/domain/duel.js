import { journeyFor } from './adventures.js';
import { STAGES } from './progression.js';

export const AVATAR_OPTIONS = {
  skin: [
    ['peach', 'Pêche', '#f2bf93'],
    ['warm', 'Doré', '#c88b58'],
    ['brown', 'Brun', '#945734'],
    ['deep', 'Ébène', '#593727'],
  ],
  hair: [
    ['chestnut', 'Châtain', '#64391f'],
    ['black', 'Noir', '#252139'],
    ['blond', 'Blond', '#f2cb66'],
    ['silver', 'Argent', '#ced9ed'],
  ],
  style: [
    ['short', 'Court'],
    ['curls', 'Boucles'],
    ['braids', 'Tresses'],
    ['long', 'Long'],
  ],
  face: [
    ['freckles', 'Taches de rousseur'],
    ['smile', 'Sourire'],
    ['glasses', 'Lunettes'],
  ],
  robe: [
    ['violet', 'Violet', '#8055d9'],
    ['blue', 'Azur', '#397fda'],
    ['emerald', 'Émeraude', '#299b82'],
    ['crimson', 'Rubis', '#d95175'],
    ['aurora', 'Aurore', '#d7af4e', 1200],
  ],
  hat: [
    ['pointed', 'Étoilé'],
    ['moon', 'Lunaire'],
    ['hood', 'Capuche'],
    ['crown', 'Couronne', null, 1900],
  ],
  wand: [
    ['star', 'Étoile', '#ffe681'],
    ['crystal', 'Cristal', '#8aeaff'],
    ['oak', 'Noisetier', '#b8ff9e'],
    ['sun', 'Soleil', '#ffbd76', 400],
  ],
};
export const DEFAULT_AVATAR = {
  name: 'Apprenti mage',
  skin: 'peach',
  hair: 'chestnut',
  style: 'short',
  face: 'freckles',
  robe: 'violet',
  hat: 'pointed',
  wand: 'star',
};
export function normalizeAvatar(input, xp = 0) {
  const avatar = { ...DEFAULT_AVATAR };
  if (!input || typeof input !== 'object') return avatar;
  if (typeof input.name === 'string')
    avatar.name =
      Array.from(input.name)
        .filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
        .join('')
        .trim()
        .slice(0, 18) || DEFAULT_AVATAR.name;
  for (const [key, options] of Object.entries(AVATAR_OPTIONS)) {
    const choice = options.find((option) => option[0] === input[key]);
    if (choice && xp >= (choice[3] ?? 0)) avatar[key] = choice[0];
  }
  return avatar;
}
export function avatarColor(avatar, key) {
  return AVATAR_OPTIONS[key]?.find((option) => option[0] === avatar[key])?.[2] ?? '#f7dc85';
}
// Each guardian has its own silhouette, accessory, expression and magical signature.
export const ENEMIES = [
  [
    'brindor',
    'Brindor le Sournois',
    'pointed',
    'moustache',
    'leaves',
    '#69884c',
    '#d5ef88',
    'village',
  ],
  [
    'roncielle',
    'Roncielle des Ronces',
    'antlers',
    'vines',
    'thorns',
    '#3e8c72',
    '#a7ffcc',
    'forest',
  ],
  ['brumel', 'Brumel le Voilé', 'hood', 'mask', 'mist', '#5e729f', '#b3dcff', 'bridge'],
  [
    'seraphax',
    'Séraphax aux Plumes',
    'feather',
    'beak',
    'feathers',
    '#bd7248',
    '#ffca76',
    'griffin',
  ],
  ['encrius', 'Encrius le Censeur', 'square', 'glasses', 'pages', '#6f4e95', '#e9b3ff', 'library'],
  ['selenore', 'Sélénore Sans-Lune', 'moon', 'crescent', 'moon', '#635ac3', '#c9caff', 'garden'],
  [
    'fumebulle',
    'Fumebulle le Toxique',
    'flask',
    'goggles',
    'bubbles',
    '#668547',
    '#d8ff8c',
    'potions',
  ],
  ['rocambre', 'Rocambre de Granit', 'stone', 'jaw', 'runes', '#7b7e99', '#c7e3ff', 'golem'],
  ['ondrille', 'Ondrille aux Reflets', 'crown', 'tears', 'water', '#398eae', '#99edff', 'lake'],
  ['ticton', 'Ticton le Détraqué', 'gears', 'monocle', 'gears', '#a8864c', '#ffe694', 'clock'],
  [
    'nimbrax',
    'Nimbrax Foudrenuage',
    'cloud',
    'longbeard',
    'lightning',
    '#657ca2',
    '#c4e4ff',
    'clouds',
  ],
  ['cendrel', 'Cendrel aux Braises', 'flame', 'embers', 'fire', '#a54852', '#ffd07b', 'phoenix'],
  [
    'astravor',
    'Astravor le Dévoreur',
    'stars',
    'third-eye',
    'stars',
    '#5e4b9d',
    '#d9aaff',
    'stars',
  ],
  [
    'cristombre',
    'Cristombre aux Éclats',
    'crystal',
    'facets',
    'crystals',
    '#557f9e',
    '#aefff0',
    'crystals',
  ],
  ['noctegarde', 'Noctegarde le Scellé', 'horns', 'visor', 'shield', '#6d527f', '#eebdff', 'crypt'],
  ['verroux', 'Verroux aux Cent Clefs', 'keys', 'moustache', 'keys', '#9d743f', '#ffe997', 'vault'],
  ['dravok', 'Dravok l’Écailleux', 'scales', 'fangs', 'scales', '#9a5758', '#ffbda1', 'mountains'],
  [
    'malgoris',
    'Malgoris le Dernier Mage',
    'horned-crown',
    'longbeard',
    'eclipse',
    '#66417f',
    '#e4a1ff',
    'ramparts',
  ],
  ['ombre-dragon', 'Le dragon d’ombre', 'dragon', 'dragon', 'fire', '#713d92', '#ffbd68', 'dragon'],
  [
    'dragon-lumiere',
    'Le dragon du château',
    'dragon',
    'dragon',
    'stars',
    '#624681',
    '#ffce84',
    'castle',
  ],
].map(([id, name, hat, feature, sigil, color, accent, scene], index) => ({
  id,
  name,
  hat,
  feature,
  sigil,
  color,
  accent,
  scene,
  index,
  kind: hat === 'dragon' ? 'dragon' : 'wizard',
}));
export function encounter(xp) {
  const journey = journeyFor(xp);
  const index = journey.stageIndex;
  return {
    index,
    stage: STAGES[index],
    enemy: ENEMIES[index],
    remaining: 100 - (Math.max(0, xp) % 100),
    rescued: journey.complete,
    ...journey,
  };
}
export const COUNTDOWN_MS = 5000;
export const SPELL_MS = 1800;
// One injectable clock for the introduction, questions and spell: never count hidden/portrait time.
export class DuelClock {
  constructor(now = 0) {
    this.phase = 'countdown';
    this.last = now;
    this.introMs = 0;
    this.answerMs = 0;
    this.spellMs = 0;
    this.wasBlocked = false;
  }
  step(now, blocked = false) {
    const delta = Math.max(0, now - this.last);
    this.last = now;
    if (blocked || this.wasBlocked) {
      this.wasBlocked = blocked;
      return this.phase;
    }
    if (this.phase === 'countdown') {
      this.introMs = Math.min(COUNTDOWN_MS, this.introMs + delta);
      if (this.introMs === COUNTDOWN_MS) {
        this.phase = 'active';
        this.answerMs = 0;
      }
    } else if (this.phase === 'active') this.answerMs += delta;
    else if (this.phase === 'success' || this.phase === 'failure-cast') {
      this.spellMs += delta;
      if (this.phase === 'failure-cast' && this.spellMs >= SPELL_MS) this.phase = 'failure';
    }
    return this.phase;
  }
  get count() {
    return Math.max(0, Math.ceil((COUNTDOWN_MS - this.introMs) / 1000));
  }
  result(correct, now) {
    this.last = now;
    this.phase = correct ? 'success' : 'failure-cast';
    this.spellMs = 0;
  }
  question(now, newEncounter = false) {
    this.last = now;
    this.answerMs = 0;
    this.spellMs = 0;
    this.phase = newEncounter ? 'countdown' : 'active';
    if (newEncounter) this.introMs = 0;
  }
}
