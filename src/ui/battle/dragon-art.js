import { INK, star } from './mage-parts.js';
import { shade, tint } from './mage-art.js';

// The two final bosses share one dragon puppet, drawn like the wizards: facing right,
// in the same 540 × 600 box and with the same three poses.
const POSES = {
  idle: { body: 0, head: -4, wings: 0, arm: 0 },
  cast: { body: 5, head: 9, wings: -9, arm: -34 },
  hit: { body: -10, head: -15, wings: 12, arm: 30 },
};
const BONE = '#ecd9ae';
const gradient = (id, [a, b, c], dir = 'x1="0" y1="0" x2="1" y2="1"') =>
  `<linearGradient id="${id}" ${dir}><stop stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;

export function dragonArt(enemy, { pose = 'idle', prefix = 'dragon' } = {}) {
  const p = `${prefix}-${pose}`,
    q = POSES[pose],
    url = (name) => `url(#${p}-${name})`,
    accent = enemy.accent,
    accentD = shade(accent, 0.62),
    royal = enemy.sigil === 'stars',
    // The castle dragon wears midnight blue so the two bosses never look alike.
    base = royal ? '#4a55b4' : enemy.color;
  const body = shade(base, 1.1),
    light = shade(base, 1.5),
    dark = shade(base, 0.55);
  const defs = `<defs>${gradient(`${p}-body`, [light, body, dark])}${gradient(`${p}-wing`, [shade(base, 0.8), shade(base, 0.55), shade(base, 0.34)])}${gradient(`${p}-belly`, [tint(accent, 0.6), accent, accentD], 'x1="0" y1="0" x2="0" y2="1"')}<radialGradient id="${p}-glow"><stop stop-color="#fffbe0"/><stop offset=".3" stop-color="${accent}" stop-opacity=".85"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient><radialGradient id="${p}-shadow"><stop stop-color="#120a2a" stop-opacity=".55"/><stop offset="1" stop-color="#120a2a" stop-opacity="0"/></radialGradient>${pose === 'hit' ? `<radialGradient id="${p}-hit"><stop stop-color="#ffffff"/><stop offset=".35" stop-color="#fff3a6" stop-opacity=".9"/><stop offset="1" stop-color="#ffd23e" stop-opacity="0"/></radialGradient>` : ''}</defs>`;
  const wing = (flip) =>
    `<g transform="${flip ? 'translate(400 0) scale(-1 1) ' : ''}rotate(${q.wings} 170 310)"><path d="M172 300Q96 176 8 196Q34 240 26 292Q64 280 76 326Q108 308 124 356Q150 338 178 362z" fill="${url('wing')}"/><path d="M172 300Q110 230 8 196M172 300Q104 262 26 292M172 300Q116 290 76 326M172 304Q138 312 124 356" fill="none" stroke="${accent}" stroke-width="4" opacity=".75"/><path d="M8 196l-14-22 28 8z" fill="${BONE}" stroke-width="4"/></g>`;
  const tail = `<path d="M176 470Q70 520 30 452Q8 408 44 372Q40 426 84 446Q124 462 180 424z" fill="${url('body')}"/><path d="M44 374L14 346L64 340z" fill="${url('belly')}"/><path d="M52 440l-16 14M84 462l-10 18M122 468l-4 20" fill="none" stroke="${accent}" stroke-width="5"/>`;
  const foot = (x, flip) =>
    `<g transform="translate(${x} 0)${flip ? ' scale(-1 1)' : ''}"><path d="M-14 520Q-52 540-50 574Q-46 586-20 584H22Q30 548 16 520z" fill="${url('body')}"/><path d="M-48 572l-8 12 16-2zM-28 580l-4 10 14-4zM-6 582l0 10 12-6z" fill="#fffdf6" stroke-width="3"/></g>`;
  const torso = `<path d="M200 276Q116 288 108 420Q106 544 200 552Q294 544 292 420Q284 288 200 276z" fill="${url('body')}"/><path d="M132 330Q118 380 122 450" fill="none" stroke="${light}" stroke-width="5" opacity=".6"/><path d="M200 326Q154 338 150 432Q150 524 200 532Q250 524 250 432Q246 338 200 326z" fill="${url('belly')}"/><path d="M158 380Q200 392 242 380M152 422Q200 436 248 422M153 464Q200 478 247 464M164 502Q200 512 236 502" fill="none" stroke="${accentD}" stroke-width="4" opacity=".8"/>${royal ? `<polygon points="${star(200, 352, 14)}" fill="#fffbe0" stroke-width="3"/>` : ''}`;
  const claws =
    '<path d="M-10 46l-6 16 12-6zM2 50l0 16 10-10zM14 44l8 14 4-14z" fill="#fffdf6" stroke-width="3"/>';
  const arm = (x, rot, flip, cls = '') =>
    `<g ${cls}transform="translate(${x} 352) rotate(${rot})${flip ? ' scale(-1 1)' : ''}"><path d="M-16-8Q-34 24-22 48Q0 62 22 46Q30 22 14-8z" fill="${url('body')}"/>${claws}</g>`;
  const eye = (x) =>
    pose === 'hit'
      ? `<path d="M${x - 16} 176l22 12-22 12" fill="none" stroke-width="6" transform="${x > 200 ? `translate(${2 * x} 0) scale(-1 1)` : ''}"/>`
      : `<ellipse cx="${x}" cy="190" rx="24" ry="27" fill="#fffdf6" stroke-width="4.5"/><ellipse cx="${x + 3}" cy="193" rx="14" ry="20" fill="${accent}" stroke-width="2.5"/><ellipse cx="${x + 4}" cy="194" rx="5" ry="15" fill="${INK}" stroke="none"/><circle cx="${x + 9}" cy="182" r="5" fill="#fff" stroke="none"/>`;
  const lids =
    pose === 'hit'
      ? ''
      : `<path d="M126 156H190V192L126 172zM294 156H230V192L294 172z" fill="${url('body')}" stroke="none"/><path d="M126 172L190 192M294 172L230 192" fill="none" stroke-width="6"/>`;
  const mouth =
    pose === 'cast'
      ? `<path d="M156 250Q226 272 290 246Q288 300 226 306Q160 302 156 250z" fill="#7a1930" stroke-width="5"/><path d="M168 256l8 16 10-12 10 14 10-13 10 13 10-14 10 13 10-14 9 12 8-16" fill="#fffdf6" stroke-width="3"/><path d="M196 298Q226 280 256 296Q226 306 196 298z" fill="#ff8f9a" stroke="none"/>`
      : pose === 'hit'
        ? '<ellipse cx="226" cy="266" rx="13" ry="15" fill="#7a1930" stroke-width="5"/>'
        : '<path d="M160 258Q226 290 288 254" fill="none" stroke-width="5.5"/><path d="M180 268l6 16 9-12M250 272l8 12 7-16" fill="#fffdf6" stroke-width="3"/>';
  const crest = royal
    ? `<path d="M156 122L148 62L180 92L200 50L222 92L254 62L246 122Q200 108 156 122z" fill="${url('belly')}"/><circle cx="200" cy="84" r="8" fill="#fffbe0" stroke-width="3"/>`
    : `<path d="M168 118L180 78L198 108L216 70L230 112z" fill="${url('belly')}"/>`;
  const head = `<g transform="rotate(${q.head} 200 290)"><path d="M148 136Q110 84 128 34Q156 66 184 116z" fill="${BONE}"/><path d="M254 134Q294 84 278 34Q250 66 220 116z" fill="${BONE}"/><path d="M132 60q10 24 30 44M274 60q-10 24-30 44" fill="none" stroke="#b79c6c" stroke-width="3.5" opacity=".8"/><path d="M116 196Q62 160 56 222Q84 238 120 234z" fill="${url('belly')}"/><path d="M288 196Q342 160 348 222Q320 238 284 234z" fill="${url('belly')}"/><path class="hit-target" d="M200 108Q102 112 98 206Q96 292 204 300Q312 294 308 206Q300 112 200 108z" fill="${url('body')}"/><path d="M124 176Q130 136 172 124" fill="none" stroke="${light}" stroke-width="5" opacity=".6"/><ellipse cx="224" cy="254" rx="78" ry="44" fill="${light}" stroke="none" opacity=".45"/>${eye(158)}${eye(262)}${lids}<path d="M122 150L192 178M298 150L228 178" fill="none" stroke-width="13"/><path d="M122 150L192 178M298 150L228 178" fill="none" stroke="${dark}" stroke-width="6"/><ellipse cx="206" cy="232" rx="5" ry="8" fill="${INK}" stroke="none"/><ellipse cx="246" cy="232" rx="5" ry="8" fill="${INK}" stroke="none"/>${mouth}${crest}${pose === 'hit' ? '<path d="M322 150q9 15 0 24-9-9 0-24z" fill="#9fe3ff" stroke-width="3"/>' : ''}</g>`;
  // The spell leaves from the jaws rather than from a wand.
  const tx = pose === 'cast' ? 372 : 330,
    ty = pose === 'cast' ? 262 : 286;
  const breath =
    pose === 'cast'
      ? `<circle cx="${tx}" cy="${ty}" r="84" fill="${url('glow')}"/><path d="M${tx - 62} ${ty + 4}Q${tx - 20} ${ty - 44} ${tx + 44} ${ty - 30}Q${tx + 12} ${ty - 12} ${tx + 58} ${ty + 6}Q${tx + 10} ${ty + 12} ${tx + 36} ${ty + 40}Q${tx - 24} ${ty + 44} ${tx - 62} ${ty + 4}z" fill="${accent}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M${tx - 40} ${ty + 4}Q${tx - 10} ${ty - 18} ${tx + 22} ${ty - 10}Q${tx} ${ty + 2} ${tx + 20} ${ty + 16}Q${tx - 16} ${ty + 22} ${tx - 40} ${ty + 4}z" fill="#fffbe0"/>`
      : pose === 'idle'
        ? `<circle cx="${tx}" cy="${ty}" r="34" fill="${url('glow')}" opacity=".7"/><path d="M${tx - 8} ${ty + 6}q-6-16 8-22 12 10 2 24z" fill="${accent}" stroke="${INK}" stroke-width="3.5"/>`
        : '';
  const sparks = (
    pose === 'cast'
      ? [
          [420, 190, 10],
          [444, 320, 8],
          [330, 370, 7],
          [70, 130, 7],
        ]
      : pose === 'hit'
        ? [
            [350, 170, 10],
            [372, 268, 8],
            [316, 330, 7],
          ]
        : [
            [70, 300, 7],
            [352, 420, 6],
          ]
  )
    .map(
      ([x, y, r]) =>
        `<polygon points="${star(x, y, r, -70)}" fill="${pose === 'hit' ? '#ffffff' : accent}" stroke="#fffbe0" stroke-width="2"/>`,
    )
    .join('');
  const impact =
    pose === 'hit'
      ? `<polygon points="${star(326, 236, 43, -75)}" fill="#ffffff" stroke="#ffd23e" stroke-width="5" stroke-linejoin="round" opacity=".95"/><polygon points="${star(326, 238, 21, -60)}" fill="#fff3a6"/>`
      : '';
  return `<svg class="dragon-art pose-${pose}" viewBox="-60 0 540 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}<ellipse cx="200" cy="584" rx="${pose === 'hit' ? 118 : 132}" ry="17" fill="${url('shadow')}"/>${pose === 'hit' ? `<circle cx="312" cy="240" r="90" fill="${url('hit')}"/>` : ''}<g transform="rotate(${q.body} 200 540)" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${wing(false)}${wing(true)}${tail}${foot(160, false)}${foot(240, true)}${torso}${arm(128, 14 - q.arm / 3, false)}${head}${arm(274, -14 + q.arm, true, 'class="wand-arm" ')}</g>${breath}<g data-wand-tip="" transform="translate(${tx} ${ty})"><circle r="1" fill="none"/></g>${sparks}${impact}</svg>`;
}
