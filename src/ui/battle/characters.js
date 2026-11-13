import { avatarColor, normalizeAvatar } from '../../domain/duel.js';
import { mageSVG, shade } from './mage-art.js';
import { dragonArt } from './dragon-art.js';

export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const POSE_NAMES = ['idle', 'cast', 'hit'];

const PLAYER_HATS = { pointed: '#9a32de', moon: '#3f55b8', crown: '#ffd23e' };
const PLAYER_TIPS = { star: 'star', crystal: 'crystal', oak: 'leaf', sun: 'sun' };
// The player's choices map one to one onto the puppet's parts.
export function playerLook(avatar) {
  const a = normalizeAvatar(avatar, Number.MAX_SAFE_INTEGER);
  const robe = avatarColor(a, 'robe'),
    wand = avatarColor(a, 'wand');
  return {
    skin: avatarColor(a, 'skin'),
    hair: avatarColor(a, 'hair'),
    robe,
    hat: a.hat === 'hood' ? shade(robe, 0.74) : PLAYER_HATS[a.hat],
    hatKind: a.hat,
    hairStyle: a.style,
    feature: a.face,
    body: a.kind === 'boy' ? 'tunic' : 'robe',
    lashes: a.kind === 'girl',
    tip: PLAYER_TIPS[a.wand],
    glow: wand,
    tipFill: a.wand === 'star' ? undefined : wand,
  };
}

const FOE_SKIN = { jaw: '#a9aebb', vines: '#c9c296', fangs: '#d3a08c', facets: '#b9d3e0' };
const FOE_HAIR = { vines: '#5f8a4c', embers: '#5a3340', tears: '#5d7f9c', visor: '#4a3f5c' };
const FOE_STYLE = { hood: 'none', horns: 'none', stone: 'none', scales: 'none' };
const FOE_TIPS = {
  leaves: 'leaf',
  thorns: 'leaf',
  feathers: 'leaf',
  mist: 'orb',
  moon: 'orb',
  bubbles: 'orb',
  water: 'orb',
  eclipse: 'orb',
  shield: 'orb',
  fire: 'flame',
  lightning: 'bolt',
  gears: 'gear',
  keys: 'gear',
  crystals: 'crystal',
  runes: 'crystal',
  scales: 'crystal',
};
export function enemyLook(enemy) {
  const robe = shade(enemy.color, 1.12);
  return {
    foe: true,
    body: 'ragged',
    skin: FOE_SKIN[enemy.feature] ?? '#dcc6b2',
    hair: FOE_HAIR[enemy.feature] ?? '#a6a096',
    robe,
    cape: shade(enemy.color, 0.52),
    hat: shade(enemy.color, 0.72),
    hatKind: enemy.hat,
    hairStyle: FOE_STYLE[enemy.hat] ?? 'elder',
    feature: enemy.id === 'verroux' ? 'handlebar' : enemy.feature,
    trim: enemy.accent,
    iris: shade(enemy.accent, 0.82),
    cheek: '#c98f9a',
    belt: ['#5a4632', '#4f3d2b', '#6b543b'],
    tip: FOE_TIPS[enemy.sigil] ?? 'star',
    tipFill: '#b23fc0',
    glow: '#d86bdc',
    core: '#fdeaff',
    spark: '#e79bea',
  };
}

export function wizardSVG({ avatar, enemy, prefix = 'mage', pose = 'idle' } = {}) {
  return mageSVG(enemy ? enemyLook(enemy) : playerLook(avatar), { pose, prefix });
}
export function dragonSVG(enemy, prefix = 'dragon', pose = 'idle') {
  return dragonArt(enemy, { pose, prefix });
}
// A fighter carries its three poses; the duel shows one at a time.
export function fighterSVG({ avatar, enemy, prefix }) {
  return POSE_NAMES.map((pose) =>
    enemy?.kind === 'dragon'
      ? dragonSVG(enemy, prefix, pose)
      : wizardSVG({ avatar, enemy, prefix, pose }),
  ).join('');
}
export function princessSVG() {
  return `<svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" aria-label="Princesse Aélis délivrée" role="img"><g stroke="#36263f" stroke-width="4" stroke-linejoin="round"><path d="M55 86q-21-71 34-73 56-3 37 76" fill="#65412f"/><path d="m72 105-39 109q59 29 115-1L108 105" fill="#f3c17d"/><path d="m85 111-14 103h41L99 111" fill="#d98ab8"/><path d="M57 49q-6 53 31 55 38-2 37-55" fill="#e7ac83"/><path d="M61 45q30 3 40-22 10 25 25 26" fill="#65412f"/><path d="m62 31-3-25 20 13L91 2l12 17 23-14-6 26z" fill="#ffe192"/><path d="M73 65h3m28 0h3m-25 17q9 8 17-1" fill="none" stroke-linecap="round"/></g></svg>`;
}
