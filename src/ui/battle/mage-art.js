import { INK, star, hatArt, featureArt, tipArt } from './mage-parts.js';

// Every wizard, player or opponent, is built from the same puppet: a palette, a few
// interchangeable parts and one of three poses. Drawings face right in a 540 × 600 box.
const channel = (v) =>
  Math.max(0, Math.min(255, Math.round(v)))
    .toString(16)
    .padStart(2, '0');
export const shade = (hex, k) =>
  '#' + [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) * k)).join('');
export const tint = (hex, t) =>
  '#' +
  [1, 3, 5]
    .map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16);
      return channel(c + (255 - c) * t);
    })
    .join('');
const turn = ([x, y], deg, [ox, oy] = [0, 0]) => {
  const a = (deg * Math.PI) / 180,
    dx = x - ox,
    dy = y - oy;
  return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
};

export const POSES = {
  idle: { body: 0, feet: [0, 0], left: 16, head: -4, arm: -30, hand: 38 },
  cast: { body: 6, feet: [-8, 10], left: 36, head: 6, arm: -140, hand: 170 },
  hit: { body: -11, feet: [10, -6], left: 118, head: -14, arm: -58, hand: 186 },
};
// Hem of the cape for each silhouette and pose: left x, right x, right y.
const HEMS = {
  robe: { idle: [96, 304, 548], cast: [89, 338, 528], hit: [98, 294, 554] },
  tunic: { idle: [104, 296, 486], cast: [97, 330, 466], hit: [106, 286, 492] },
};
const SPARKS = {
  idle: [
    [80.6, 300, 7.5],
    [330.5, 420, 6.5],
    [60.5, 440, 5.5],
  ],
  cast: [
    [371, 240, 11],
    [400.7, 330, 8.5],
    [320.6, 360, 7.5],
    [150.5, 380, 6.5],
    [60.6, 120, 7.5],
  ],
  hit: [
    [331, 180, 10],
    [360.7, 260, 8.5],
    [300.6, 320, 7.5],
  ],
};

const gradient = (id, [a, b, c], dir = 'x1="0" y1="0" x2="1" y2="1"', mid = '.55') =>
  `<linearGradient id="${id}" ${dir}><stop stop-color="${a}"/><stop offset="${mid}" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;

// Resolves a look into the colours shared by the body and by every part.
export function palette(look, p) {
  const skin = look.skin,
    hair = look.hair,
    robe = look.robe,
    cape = look.cape ?? shade(robe, 0.74),
    hat = look.hat ?? '#9a32de',
    trim = look.trim ?? '#ffd23e';
  return {
    p,
    url: (name) => `url(#${p}-${name})`,
    skin,
    skinL: shade(skin, 1.05),
    skinD: shade(skin, 0.84),
    hair,
    hairL: shade(hair, 1.35),
    hairD: shade(hair, 0.68),
    robe,
    robeL: shade(robe, 1.3),
    robeD: shade(robe, 0.6),
    cape,
    capeD: shade(cape, 0.62),
    hat,
    hatL: shade(hat, 1.28),
    hatD: shade(hat, 0.6),
    hatHi: tint(hat, 0.62),
    trim,
    trimL: tint(trim, 0.6),
    trimD: look.trim ? shade(trim, 0.62) : '#d68a1c',
    glow: look.glow ?? '#ffe681',
    core: look.core ?? '#fffde6',
    tipFill: look.tipFill,
    spark: look.spark ?? trim,
    iris: look.iris ?? '#8a2f5e',
    cheek: look.cheek ?? '#f58a8a',
    belt: look.belt ?? ['#a26a35', '#9a6132', '#b97a44'],
  };
}

function defs(c, pose, foe) {
  const hit = foe ? ['#fff3a6', '#ffd23e'] : ['#ffd0e0', '#ff5d8a'];
  return `<defs>${gradient(`${c.p}-skin`, [c.skinL, c.skin, c.skinD], 'x1="0" y1="0" x2=".5" y2="1"', '.72')}${gradient(`${c.p}-hair`, [c.hairL, c.hair, c.hairD])}${gradient(`${c.p}-robe`, [c.robeL, c.robe, c.robeD])}${gradient(`${c.p}-cape`, [c.cape, c.cape, c.capeD], 'x1="0" y1="0" x2=".3" y2="1"')}${gradient(`${c.p}-hat`, [c.hatL, c.hat, c.hatD])}${gradient(`${c.p}-trim`, [c.trimL, c.trim, c.trimD], 'x1="0" y1="0" x2="0" y2="1"')}${gradient(`${c.p}-boot`, ['#a0683a', '#7a4a22', '#4e2c12'], 'x1="0" y1="0" x2="0" y2="1"')}<radialGradient id="${c.p}-glow"><stop stop-color="${c.core}"/><stop offset=".3" stop-color="${c.glow}" stop-opacity=".85"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient><radialGradient id="${c.p}-shadow"><stop stop-color="#120a2a" stop-opacity=".55"/><stop offset="1" stop-color="#120a2a" stop-opacity="0"/></radialGradient>${pose === 'hit' ? `<radialGradient id="${c.p}-hit"><stop stop-color="#ffffff"/><stop offset=".35" stop-color="${hit[0]}" stop-opacity=".9"/><stop offset="1" stop-color="${hit[1]}" stop-opacity="0"/></radialGradient>` : ''}</defs>`;
}

function boots(c, [l, r]) {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M${156 + l} 508h40v54q0 18-24 18h-32q-8-20 8-28l8-6z" fill="${c.url('boot')}"/><path d="M${244 + r} 508h-40v54q0 18 24 18h32q8-20-8-28l-8-6z" fill="${c.url('boot')}"/><path d="M${156 + l} 524h40M${204 + r} 524h40" fill="none" stroke="#d9a563" stroke-width="4"/></g>`;
}

function backHair(c, style) {
  if (style === 'none') return '';
  if (style === 'short' || style === 'elder')
    return `<ellipse cx="${style === 'elder' ? 208 : 200}" cy="${style === 'elder' ? 217 : 198}" rx="${style === 'elder' ? 60 : 69}" ry="${style === 'elder' ? 61 : 70}" fill="${c.url('hair')}"/>`;
  if (style === 'long')
    return `<path d="M122 190Q92 300 118 412Q150 396 164 330L236 330Q250 396 282 412Q308 300 278 190Q200 110 122 190z" fill="${c.url('hair')}"/><path d="M128 300Q124 350 132 392M272 300Q276 350 268 392" fill="none" stroke="${c.hairL}" stroke-width="4" opacity=".8"/>`;
  if (style === 'curls')
    return `<g fill="${c.url('hair')}">${Array.from({ length: 9 }, (_, i) => {
      const a = ((150 + i * 30) * Math.PI) / 180;
      return `<circle cx="${(200 + 80 * Math.cos(a)).toFixed(0)}" cy="${(212 + 74 * Math.sin(a)).toFixed(0)}" r="27"/>`;
    }).join('')}<ellipse cx="200" cy="210" rx="78" ry="74" stroke="none"/></g>`;
  return `<ellipse cx="200" cy="214" rx="82" ry="80" fill="${c.url('hair')}"/>`;
}
const braid = (c) =>
  [
    [150, 262, 22, 18],
    [144, 290, 21, 17],
    [140, 316, 19, 16],
    [138, 340, 17, 14],
  ]
    .map(
      ([x, y, rx, ry]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(-20 ${x} ${y})" fill="${c.url('hair')}"/><path d="M${x - rx * 0.6} ${y - 2}q${rx * 0.6}-${ry * 0.7} ${rx * 1.18}-2" fill="none" stroke="${c.hairL}" stroke-width="3.5" opacity=".9"/>`,
    )
    .join('') +
  `<path d="M126 352l24 8-4 12-24-8z" fill="${c.url('trim')}" stroke-width="3.5"/><path d="M124 364q-20 14-10 34 16 10 28-4 6-16-4-28z" fill="${c.url('hair')}"/>`;

function frontHair(c, style) {
  const left = `<path d="M136 190Q128 216 140 238Q148 216 148 192z" fill="${c.url('hair')}"/>`;
  const right = `<path d="M264 190Q272 216 260 238Q252 216 252 192z" fill="${c.url('hair')}"/>`;
  const fringe = `<path d="M134 210Q126 150 176 128Q228 112 262 140Q278 162 268 206Q258 180 246 164Q240 182 226 184Q228 168 220 156Q206 174 182 176Q194 162 192 150Q170 170 148 178Q140 192 134 210z" fill="${c.url('hair')}"/><path d="M150 170q16-24 40-34M206 140q30-6 50 14M258 160q8 14 6 30" fill="none" stroke="${c.hairL}" stroke-width="4.5" opacity=".9"/>`;
  if (style === 'none') return '';
  if (style === 'elder') return right;
  if (style === 'short') return fringe + left + right;
  if (style === 'curls')
    return `${fringe}<g fill="${c.url('hair')}">${[
      [136, 204, 17],
      [130, 232, 16],
      [266, 204, 17],
      [272, 232, 16],
      [158, 160, 15],
      [244, 158, 15],
    ]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
      .join('')}</g>`;
  const lock = `<path d="M262 186q16 20 8 52 8 16-4 30-10 10-22 8 14-28 10-60z" fill="${c.url('hair')}"/><path d="M266 214q6 18 0 36" fill="none" stroke="${c.hairL}" stroke-width="3.5" opacity=".85"/>`;
  if (style === 'long')
    return `${fringe}<path d="M138 186q-16 20-8 52-8 16 4 30 10 10 22 8-14-28-10-60z" fill="${c.url('hair')}"/>${lock}`;
  return fringe + left + lock;
}

// Friendly face of the player; opponents get the scowl below.
function face(c, look, pose) {
  const nose = `<path d="M200 220q6 4 2 9" fill="none" stroke="${c.skinD}" stroke-width="3"/>`;
  const cheeks = `<ellipse cx="160" cy="236" rx="15" ry="9" fill="${c.cheek}" stroke="none" opacity=".5"/><ellipse cx="240" cy="236" rx="15" ry="9" fill="${c.cheek}" stroke="none" opacity=".5"/>`;
  const eye = (x) =>
    `<ellipse cx="${x}" cy="208" rx="16" ry="21" fill="#fffdf6" stroke-width="4.5"/><ellipse cx="${x + 2}" cy="210" rx="11" ry="16" fill="${c.iris}" stroke-width="2.5"/><ellipse cx="${x + 3}" cy="211" rx="6" ry="10" fill="${INK}" stroke="none"/><circle cx="${x + 7}" cy="202" r="5" fill="#fff" stroke="none"/><circle cx="${x - 2}" cy="218" r="2.5" fill="#fff" stroke="none"/>`;
  const tear = `<path d="M278 176q8 14 0 22-8-8 0-22z" fill="#9fe3ff" stroke-width="3"/>`;
  if (look.foe) {
    const brow =
      pose === 'hit' ? 'M150 190L182 180M250 190L218 180' : 'M146 178L192 196M254 178L208 196';
    const brows = `<path d="${brow}" fill="none" stroke-width="12" stroke-linecap="round"/><path d="${brow}" fill="none" stroke="${c.hair}" stroke-width="6" stroke-linecap="round"/>`;
    const eyes =
      pose === 'hit'
        ? '<path d="M160 204l18 8-18 8M240 204l-18 8 18 8" fill="none" stroke-width="5"/>'
        : `${eye(172)}${eye(228)}<path d="M150 182H194V207L150 195zM250 182H206V207L250 195z" fill="${c.url('skin')}" stroke="none"/><path d="M150 195L194 207M250 195L206 207" fill="none" stroke-width="5" stroke-linecap="round"/>`;
    const mouth =
      pose === 'hit'
        ? '<ellipse cx="200" cy="252" rx="9" ry="11" fill="#8a1f3a" stroke-width="4"/>'
        : pose === 'cast'
          ? '<path d="M182 250q18 4 36 0-2 16-18 17-16-1-18-17z" fill="#8a1f3a" stroke-width="4"/><path d="M186 252q14 3 28 0v5q-14 4-28 0z" fill="#fffdf6" stroke="none"/>'
          : '<path d="M188 258q12 7 26-3" fill="none" stroke-width="4.5" stroke-linecap="round"/>';
    return `${cheeks}${featureArt(c, look.feature, 'under')}${eyes}${brows}${mouth}${featureArt(c, look.feature, 'over', pose)}${nose}${pose === 'hit' ? tear : ''}`;
  }
  const freckles =
    look.feature === 'freckles'
      ? '<g fill="#c9744f" stroke="none"><circle cx="154" cy="232" r="1.8"/><circle cx="162" cy="229" r="1.8"/><circle cx="238" cy="229" r="1.8"/><circle cx="246" cy="232" r="1.8"/></g>'
      : '';
  const glasses =
    look.feature === 'glasses'
      ? `<g fill="#cfe9ff" fill-opacity=".22"><circle cx="172" cy="210" r="25" stroke-width="8"/><circle cx="228" cy="210" r="25" stroke-width="8"/></g><g fill="none" stroke="${c.trim}" stroke-width="3.5"><circle cx="172" cy="210" r="25"/><circle cx="228" cy="210" r="25"/></g><path d="M197 208q3-4 6 0" fill="none" stroke-width="5"/>`
      : '';
  if (pose === 'hit')
    return `${cheeks}${freckles}<path d="M160 204l18 8-18 8M240 204l-18 8 18 8" fill="none" stroke-width="5"/><path d="M156 186q12-8 24-2M220 184q12-6 24 2" fill="none" stroke="${c.hairD}" stroke-width="5"/><ellipse cx="200" cy="246" rx="9" ry="11" fill="#8a1f3a" stroke-width="4"/>${glasses}${nose}${tear}`;
  const lashes = look.lashes
    ? '<path d="M155 200l-9-4M158 193l-7-7M245 200l9-4M242 193l7-7" fill="none" stroke-width="3.5"/>'
    : '';
  const wide = pose === 'cast' || look.feature === 'smile';
  const mouth = wide
    ? '<path d="M176 234q24 8 48-2-2 30-24 32-22-2-24-30z" fill="#8a1f3a" stroke-width="4"/><path d="M180 237q20 6 40-2v7q-20 7-40 2z" fill="#fffdf6" stroke="none"/><path d="M186 254q14-8 28 0-4 9-14 9-10 0-14-9z" fill="#ff8f9a" stroke="none"/>'
    : '<path d="M180 238q20 6 40 0-2 20-20 22-18-2-20-22z" fill="#8a1f3a" stroke-width="4"/><path d="M184 240q16 4 32 0v6q-16 4-32 0z" fill="#fffdf6" stroke="none"/><path d="M188 252q12-6 24 0-4 8-12 8-8 0-12-8z" fill="#ff8f9a" stroke="none"/>';
  const lift = pose === 'cast' ? 2 : 0;
  return `${cheeks}${freckles}${eye(172)}${eye(228)}<path d="M155 196q14-12 30-6M215 190q16-6 30 6" fill="none" stroke-width="5"/>${lashes}<path d="M158 ${176 + lift}q14-8 28-2M214 ${174 + lift}q14-6 28 2" fill="none" stroke="${c.hairD}" stroke-width="5"/>${mouth}${glasses}${nose}`;
}

const sleeve = (c) =>
  `<rect x="-8" y="74" width="16" height="20" rx="6" fill="${c.url('skin')}" stroke-width="3.5"/><path d="M-17 -6Q-22 36 -34 72L32 78Q22 36 17 -6Q0 -14 -17 -6z" fill="${c.url('robe')}"/><path d="M-6 6Q-10 40 -14 66" fill="none" stroke="${c.robeL}" stroke-width="3.5" opacity=".7"/><path d="M8 10Q14 40 18 68" fill="none" stroke="${c.robeD}" stroke-width="3.5" opacity=".5"/><path d="M-36 70Q0 82 34 76L36 86Q0 94 -38 82z" fill="${c.url('trim')}" stroke-width="4"/>`;

export function mageSVG(look, { pose = 'idle', prefix = 'mage', className = 'wizard-art' } = {}) {
  const c = palette(look, `${prefix}-${pose}`),
    q = POSES[pose],
    foe = !!look.foe,
    shape = look.body ?? 'robe';
  const skin = c.url('skin'),
    robe = c.url('robe'),
    cape = c.url('cape'),
    trim = c.url('trim');
  const cloak =
    shape === 'ragged'
      ? `<path d="M146 298Q88 388 58 548L92 530L118 552L146 532L174 550L200 534L226 550L254 532L282 552L308 530L342 548Q312 388 254 298Q200 282 146 298z" fill="${cape}"/><path d="M118 400Q100 456 90 520M282 400Q300 456 310 520" fill="none" stroke="${c.capeD}" stroke-width="4" opacity=".7"/><path d="M150 302L112 222L182 288zM250 302L288 222L218 288z" fill="${cape}"/>`
      : (() => {
          const [lx, rx, ry] = HEMS[shape][pose];
          return shape === 'tunic'
            ? `<path d="M150 300Q116 380 ${lx} 486Q200 470 ${rx} ${ry}Q284 380 250 300Q200 284 150 300z" fill="${cape}"/><path d="M130 400Q120 440 116 474M272 400Q${rx - 14} 440 ${rx - 10} ${ry - 12}" fill="none" stroke="${c.capeD}" stroke-width="4" opacity=".7"/>`
            : `<path d="M150 300Q112 400 ${lx} 548Q200 566 ${rx} ${ry}Q288 400 250 300Q200 284 150 300z" fill="${cape}"/><path d="M132 440Q118 500 112 540M276 440Q${rx - 14} 500 ${rx - 8} ${ry - 12}" fill="none" stroke="${c.capeD}" stroke-width="4" opacity=".7"/>`;
        })();
  const skirt =
    shape === 'tunic'
      ? `<path d="M158 456H197V516H158zM203 456H242V516H203z" fill="#efe2c4"/><path d="M177 478V508M223 478V508" fill="none" stroke="#c9b68c" stroke-width="3" opacity=".8"/><path d="M152 386L138 470Q200 486 262 470L248 386z" fill="${robe}"/><path d="M193 396H207V478H193z" fill="${trim}" stroke-width="3.5"/><path d="M138 470Q200 486 262 470" fill="none" stroke="${c.trim}" stroke-width="5"/><path d="M166 404L156 462" fill="none" stroke="${c.robeL}" stroke-width="4" opacity=".7"/>`
      : shape === 'ragged'
        ? `<path d="M152 386L124 542Q200 560 276 542L248 386z" fill="${robe}"/><path d="M193 396H207V550H193z" fill="${trim}" stroke-width="3.5"/><path d="M124 542Q200 560 276 542" fill="none" stroke="${c.trim}" stroke-width="6"/><path d="M164 404L142 528" fill="none" stroke="${c.robeL}" stroke-width="4" opacity=".7"/><path d="M240 404L258 528" fill="none" stroke="${c.robeD}" stroke-width="4" opacity=".5"/>`
        : `<path d="M152 386L134 538Q200 556 266 538L248 386z" fill="${robe}"/><path d="M193 396L191 546H209L207 396z" fill="${trim}" stroke-width="3.5"/><path d="M160 410L148 530M240 410L252 530" fill="none" stroke="${c.robeD}" stroke-width="3.5" opacity=".6"/><path d="M166 404L156 520" fill="none" stroke="${c.robeL}" stroke-width="4" opacity=".7"/><path d="M134 538Q200 556 266 538" fill="none" stroke="${c.trim}" stroke-width="5"/>`;
  const torso = `<path d="M156 300Q200 290 244 300L252 388Q200 398 148 388z" fill="${robe}"/><path d="M168 318Q164 350 166 380" fill="none" stroke="${c.robeL}" stroke-width="4" opacity=".75"/><path d="M232 318Q238 350 236 380" fill="none" stroke="${c.robeD}" stroke-width="4" opacity=".5"/><path d="M193 318H207V384H193z" fill="${trim}" stroke-width="3.5"/><path d="M148 378Q200 390 252 378L254 398Q200 410 146 398z" fill="${c.belt[0]}"/><rect x="188" y="378" width="24" height="24" rx="5" fill="${trim}" stroke-width="3.5"/><rect x="195" y="385" width="10" height="10" rx="2" fill="#7a4a22" stroke-width="2.5"/><path d="M150 398q20-8 38 0v30q-19 8-38 0z" fill="${c.belt[1]}"/><path d="M148 402q22-10 42 0-4 14-21 14-15 0-21-14z" fill="${c.belt[2]}"/><circle cx="169" cy="416" r="4" fill="${trim}" stroke-width="2.5"/><path d="M188 262L186 302Q200 310 214 302L212 262z" fill="${skin}"/><path d="M187 276Q200 288 213 276V290Q200 300 187 290z" fill="${c.skinD}" stroke="none" opacity=".75"/><path d="M156 300Q170 290 188 296L196 330Q170 334 148 320z" fill="${cape}"/><path d="M244 300Q230 290 212 296L204 330Q230 334 252 320z" fill="${cape}"/><circle cx="200" cy="310" r="14" fill="${trim}" stroke-width="4"/><polygon points="${star(200, 310, 8)}" fill="${c.trimL}" stroke="${c.trimD}" stroke-width="1.5"/>`;
  const leftArm = `<g transform="translate(152 308)"><g transform="rotate(${q.left})">${sleeve(c)}<g transform="translate(0 99) scale(1.3)" stroke-width="3"><ellipse cx="16" cy="2" rx="5.5" ry="10" transform="rotate(-38 16 2)" fill="${skin}"/><rect x="-12.5" y="6" width="6.5" height="15" rx="3.25" transform="rotate(-13 -9.25 8)" fill="${skin}"/><rect x="-6" y="6" width="6.5" height="19" rx="3.25" transform="rotate(-4 -2.75 8)" fill="${skin}"/><rect x=".5" y="6" width="6.5" height="18" rx="3.25" transform="rotate(5 3.75 8)" fill="${skin}"/><rect x="7" y="6" width="6.5" height="13.5" rx="3.25" transform="rotate(14 10.25 8)" fill="${skin}"/><rect x="-14" y="-11" width="28" height="24" rx="9.5" fill="${skin}"/><path d="M-9 9Q0 14 10 9V15H-9z" fill="${c.skin}" stroke="none"/><path d="M-6 -2q6 5 12 0" fill="none" stroke="${c.skinD}" stroke-width="2.5"/></g></g></g>`;
  const headPlace = foe
    ? `translate(8 10) rotate(${q.head} 200 270) translate(200 270) scale(.88) translate(-200 -270)`
    : `rotate(${q.head} 200 270)`;
  const head = `<g transform="${headPlace}"><path d="M134 214Q122 196 136 186Q146 200 146 222z" fill="${skin}"/><path d="M266 214Q278 196 264 186Q254 200 254 222z" fill="${skin}"/><path d="M136 198q4 8 4 18M264 198q-4 8-4 18" fill="none" stroke="${c.skinD}" stroke-width="3"/><path class="hit-target" d="M136 196Q132 140 200 132Q268 140 266 200Q268 250 234 268Q200 284 166 268Q134 250 136 196z" fill="${skin}"/><path d="M150 252Q174 276 200 277Q226 276 250 252" fill="none" stroke="${c.skinD}" stroke-width="5" opacity=".45"/>${face(c, look, pose)}${frontHair(c, look.hairStyle)}${hatArt(c, look.hatKind)}</g>`;
  const wandArm = `<g class="wand-arm"><g transform="translate(248 308)"><g transform="rotate(${q.arm})">${sleeve(c)}<g transform="translate(0 99) rotate(${q.hand}) scale(1.3)" stroke-width="3"><rect x="-14" y="-15" width="29" height="30" rx="11" fill="${skin}"/><path d="M0 30V-104" stroke="${INK}" stroke-width="13"/><path d="M0 30V-104" stroke="#b9772a" stroke-width="7"/><path d="M-1.5 26V-100" stroke="#f0bf62" stroke-width="2" opacity=".9"/><rect x="-8" y="-62" width="16" height="10" rx="3" fill="${trim}" stroke-width="3"/>${[-15.5, -7.9, -0.3, 7.3].map((y) => `<rect x="-6" y="${y}" width="23" height="8.6" rx="4.3" fill="${skin}"/>`).join('')}<path d="M-15 0q-3-13 9-13q9 1 8 9q-2 7-17 4z" fill="${skin}"/></g></g></g></g>`;
  // Where the wand ends once the hand, the arm and the whole body have turned.
  const inHand = turn([0, -142], q.hand),
    inArm = turn([inHand[0], inHand[1] + 99], q.arm),
    [tx, ty] = turn([248 + inArm[0], 308 + inArm[1]], q.body, [200, 520]);
  const glowR = pose === 'cast' ? 78 : pose === 'hit' ? 30 : 46;
  const rays =
    pose === 'cast'
      ? `<path d="${Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6,
            far = i % 3 === 0 ? 70 : i % 3 === 1 ? 54 : 70,
            near = 30;
          return `M${(tx + near * Math.cos(a)).toFixed(1)} ${(ty + near * Math.sin(a)).toFixed(1)}L${(tx + far * Math.cos(a)).toFixed(1)} ${(ty + far * Math.sin(a)).toFixed(1)}`;
        }).join('')}" stroke="${c.core}" stroke-width="5" stroke-linecap="round" opacity=".9"/>`
      : '';
  const tip = `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${glowR}" fill="${c.url('glow')}"/>${rays}<g data-wand-tip="" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) rotate(${pose === 'cast' ? 18 : pose === 'hit' ? 50 : 0})">${tipArt(c, look.tip, pose === 'hit' ? 20 : 26)}</g>`;
  const sparkFill = pose === 'hit' ? '#ffffff' : c.spark;
  const sparks = SPARKS[pose]
    .map(
      ([x, y, r]) =>
        `<polygon points="${star(x, y, r, -70)}" fill="${sparkFill}" stroke="${c.core}" stroke-width="2"/>`,
    )
    .join('');
  const impact =
    pose === 'hit'
      ? `<polygon points="${star(320, 245, 43, -75)}" fill="#ffffff" stroke="${foe ? '#ffd23e' : '#ff5d8a'}" stroke-width="5" stroke-linejoin="round" opacity=".95"/><polygon points="${star(320, 247, 21, -60)}" fill="${foe ? '#fff3a6' : '#ffd0e0'}"/>`
      : '';
  const swoosh =
    pose === 'cast'
      ? `<path d="M300 150C420 120 470 260 380 330S180 300 120 380" fill="none" stroke="${c.glow}" stroke-width="18" stroke-linecap="round" opacity=".28"/><path d="M300 150C420 120 470 260 380 330S180 300 120 380" fill="none" stroke="${c.core}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`
      : '';
  return `<svg class="${className} pose-${pose}" viewBox="-60 0 540 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs(c, pose, foe)}<ellipse cx="200" cy="584" rx="${pose === 'hit' ? 96 : 110}" ry="16" fill="${c.url('shadow')}"/>${pose === 'hit' ? `<circle cx="306" cy="250" r="86" fill="${c.url('hit')}"/>` : ''}${swoosh}${boots(c, q.feet)}<g transform="rotate(${q.body} 200 520)" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${cloak}${backHair(c, look.hairStyle)}${skirt}${torso}${look.hairStyle === 'braids' ? braid(c) : ''}${leftArm}${head}${wandArm}</g>${tip}${sparks}${impact}</svg>`;
}
