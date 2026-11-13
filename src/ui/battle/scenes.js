import { ENEMIES } from '../../domain/duel.js';

const W = 844;
const K = '#1d1640'; // outline colour
let gid = 'scene-0'; // gradient id prefix of the scene being drawn

const r1 = (v) => Math.round(v * 10) / 10;
const seq = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
const rng = (seed) => {
  let s = (seed * 7919 + 104729) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};
const mix = (a, b, t) =>
  `#${[1, 3, 5]
    .map((i) =>
      Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
const dark = (c, t) => mix(c, '#0e0a26', t);
const lite = (c, t) => mix(c, '#ffffff', t);

// Primitive shapes
const P = (d, fill, sw = 3, stroke = K, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;
const F = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const L = (d, stroke, sw = 2, extra = '') =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circ = (x, y, r, fill, extra = '') =>
  `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}" ${extra}/>`;
const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}" ${extra}/>`;
const ol = `stroke="${K}" stroke-width="3"`;
const at = (x, y, s, body, rot = 0, flip = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s * flip} ${s})">${body}</g>`;
const mir = (s) => `${s}<g transform="translate(${W} 0) scale(-1 1)">${s}</g>`;

// Gradients
const stops = (cs) =>
  cs.map((c, i) => `<stop offset="${r1(i / (cs.length - 1))}" stop-color="${c}"/>`).join('');
const lin = (name, cs, dir = 'x2="0" y2="1"') =>
  `<linearGradient id="${gid}-${name}" x1="0" y1="0" ${dir}>${stops(cs)}</linearGradient>`;
const rad = (name, c0, c1, o0 = 0.95, o1 = 0.55, mid = 0.25) =>
  `<radialGradient id="${gid}-${name}"><stop offset="0" stop-color="${c0}" stop-opacity="${o0}"/><stop offset="${mid}" stop-color="${c1}" stop-opacity="${o1}"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>`;
const glow = (x, y, r, kind = 'fire') => circ(x, y, r, `url(#${gid}-${kind})`);

// Light sources
const flame = (x, y, s = 1, c = '#ff9a3d', core = '#ffe681') =>
  at(
    x,
    y,
    s,
    `${P('M0-34Q14-14 9-3Q0 3-9-3Q-14-14 0-34z', c, 3.5)}${F('M0-22Q7-11 4-4Q0-1-4-4Q-7-11 0-22z', core)}`,
  );
const torch = (x, y, c, core, kind = 'fire') =>
  `${glow(x, y - 14, 80, kind)}${P(`M${x - 9} ${y}H${x + 9}L${x + 5} ${y + 26}H${x - 5}z`, '#7a4a22', 4)}${L(`M${x - 12} ${y}H${x + 12}`, '#d9a563', 5)}${flame(x, y, 1, c, core)}`;
const candle = (x, y, kind = 'fire', c = '#ff9a3d') =>
  `${glow(x, y - 16, 34, kind)}${rect(x - 3, y - 12, 6, 12, '#f1e6cf', `stroke="${K}" stroke-width="2"`)}${flame(x, y - 12, 0.38, c)}`;
const moon = (x, y, r, shade) =>
  `${glow(x, y, r * 2.8, 'moon')}${circ(x, y, r, '#fff3c9')}${shade ? circ(x + r * 0.42, y - r * 0.18, r * 0.86, shade) : `${circ(x - r * 0.3, y - r * 0.25, r * 0.24, '#ecd9a0', 'opacity=".7"')}${circ(x + r * 0.32, y + r * 0.36, r * 0.15, '#ecd9a0', 'opacity=".7"')}`}`;
// Star field drawn as round-capped zero-length strokes
const stars = (seed, n, x, y, w, h, c = '#fff6dc') => {
  const r = rng(seed);
  const d = ['', '', ''];
  for (let i = 0; i < n; i++)
    d[i % 3] += `M${Math.round(x + r() * w)} ${Math.round(y + r() * h)}h0`;
  return d.map((p, i) => L(p, c, 1.6 + i * 0.9, `opacity="${0.9 - i * 0.15}"`)).join('');
};
const sparkle = (x, y, r, c = '#ffffff') =>
  F(
    `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z`,
    c,
  );
const star5 = (x, y, r, fill = '#ffd23e') =>
  P(
    `M${seq(10, (i) => `${r1(x + Math.sin((i * Math.PI) / 5) * (i % 2 ? r * 0.45 : r))} ${r1(y - Math.cos((i * Math.PI) / 5) * (i % 2 ? r * 0.45 : r))}L`).slice(0, -1)}z`,
    fill,
    3,
  );
const fireflies = (seed, n, kind = 'acc', c = '#ffffff') => {
  const r = rng(seed);
  return seq(n, (i) => {
    const x = i % 2 ? 20 + r() * 190 : 634 + r() * 190;
    const y = 60 + r() * 220;
    return `${glow(x, y, 9 + r() * 8, kind)}${circ(x, y, 1.6, c)}`;
  });
};

// Masonry and architecture
const bricks = (seed, y0, y1, h, stroke = '#17123a', op = 0.38, bw = 62, x0 = 0, x1 = W) => {
  const r = rng(seed);
  let d = '';
  for (let y = y0; y < y1; y += h) {
    d += `M${x0} ${y}H${x1}`;
    for (let x = x0 + r() * bw; x < x1 - 6; x += bw * (0.85 + r() * 0.3))
      d += `M${Math.round(x)} ${y}V${Math.min(y + h, y1)}`;
  }
  return L(d, stroke, 2, `opacity="${op}"`);
};
const gothic = (x, hw, top, bot) =>
  `M${x - hw} ${bot}V${top + 84}Q${x - hw} ${top + 28} ${x} ${top}Q${x + hw} ${top + 28} ${x + hw} ${top + 84}V${bot}z`;
const roundArch = (x, hw, top, bot) =>
  `M${x - hw} ${bot}V${top + hw}A${hw} ${hw} 0 0 1 ${x + hw} ${top + hw}V${bot}z`;
const pillar = (x, w, top, c, bot = 300) =>
  `${P(`M${x - w / 2} ${bot}V${top}H${x + w / 2}V${bot}z`, c)}${F(`M${x + w / 6} ${top}H${x + w / 2}V${bot}H${x + w / 6}z`, '#0e0a26', 'opacity=".3"')}${P(`M${x - w / 2 - 6} ${top}h${w + 12}v11h${-w - 12}z`, lite(c, 0.18))}${P(`M${x - w / 2 - 6} ${bot - 11}h${w + 12}v11h${-w - 12}z`, lite(c, 0.18))}`;
const tower = (seed, x, w, top, rh, body, roof, lit = '#ffdc63') => {
  const r = rng(seed);
  return `${P(`M${x - w / 2} 300V${top}H${x + w / 2}V300z`, body, 4)}${P(`M${x - w / 2 - 7} ${top}L${x} ${top - rh}L${x + w / 2 + 7} ${top}z`, roof, 4)}${L(`M${x + w / 2 - 8} ${top + 6}V296`, lite(body, 0.3), 4, 'opacity=".6"')}${L(`M${x} ${top - rh}v-14`, K, 3)}${F(`M${x} ${top - rh - 14}l12 4-12 5z`, '#cfe0ff')}${seq(
    3,
    (i) => {
      const wx = Math.round(x - 4 + (r() - 0.5) * w * 0.4);
      const wy = top + 34 + i * 42;
      return wy < 290 ? F(`M${wx} ${wy}v-8q4-7 8 0v8z`, lit) : '';
    },
  )}`;
};
const banner = (x, c, top = 34, len = 192) =>
  `${L(`M${x - 33} ${top}H${x + 33}`, '#b9772a', 6)}${P(`M${x - 27} ${top}H${x + 27}V${top + len}L${x} ${top + len - 22}L${x - 27} ${top + len}z`, c, 4)}${L(`M${x - 21} ${top + 4}V${top + len - 12}M${x + 21} ${top + 4}V${top + len - 12}`, '#ffd23e', 3)}${star5(x, top + 86, 16)}`;
const flag = (x, y, c, top = 120) =>
  `${L(`M${x} ${y}V${top}`, K, 7)}${L(`M${x} ${y}V${top}`, '#8fa0c8', 3.5)}${P(`M${x + 2} ${top + 4}q28-8 54 8q-22 8 4 24q-30-6-58 6z`, c, 4)}`;
// Shelf unit filled with books or flasks
const flask = (x, y, s, c) =>
  at(
    x,
    y,
    s,
    `${P('M-3-24H3V-15Q10-11 10-4Q10 0 6 0H-6Q-10 0-10-4Q-10-11-3-15z', c, 2.5)}${rect(-4, -28, 8, 5, '#b9772a', `stroke="${K}" stroke-width="2"`)}${circ(-4, -6, 2, '#ffffff', 'opacity=".8"')}`,
  );
const shelves = (seed, x, y, w, h, rows, wood, potion) => {
  const r = rng(seed);
  const rh = h / rows;
  const cols = potion || [
    '#b5562f',
    '#8a5a36',
    '#d0a050',
    '#a23a5c',
    '#c8962f',
    '#7a4a8a',
    '#933a2a',
    '#3f7a6a',
  ];
  const d = cols.map(() => '');
  let tags = '';
  let out = rect(x, y, w, h, dark(wood, 0.72), `stroke="${K}" stroke-width="5"`);
  for (let j = 0; j < rows; j++) {
    const by = Math.round(y + (j + 1) * rh - 7);
    for (let bx = x + 6; bx < x + w - 14;) {
      const bw = potion ? 27 : 8 + Math.floor(r() * 4) * 2;
      const bh = Math.round(rh * (0.52 + r() * 0.3));
      const k = Math.floor(r() * cols.length);
      if (r() > 0.1) {
        if (potion) out += flask(bx + 13, by, 0.75 + r() * 0.45, cols[k]);
        else {
          d[k] += `M${bx} ${by}v${-bh}h${bw}v${bh}z`;
          if (r() > 0.6) tags += `M${bx + 3} ${by - bh + 7}h${bw - 6}`;
        }
      }
      bx += bw;
    }
    out += `${d.map((p, i) => (p ? P(p, cols[i], 2) : '')).join('')}${rect(x, by, w, 7, wood, ol)}`;
    d.fill('');
  }
  return `${out}${L(tags, '#ffd98a', 3, 'opacity=".85"')}`;
};

// Nature
const fir = (x, y, s, c, trunk = '#3a2440') =>
  at(
    x,
    y,
    s,
    `${P('M-6 0V-30H6V0z', trunk)}${[2, 1, 0].map((i) => P(`M0 ${-150 + i * 30}L${-20 - i * 11} ${-82 + i * 28}Q0 ${-72 + i * 28} ${20 + i * 11} ${-82 + i * 28}z`, lite(c, 0.16 - i * 0.08))).join('')}${L('M0-150L-9-112M0-112L-14-76', lite(c, 0.4), 2, 'opacity=".5"')}`,
  );
const crystal = (x, y, s, c, rot = 0) =>
  at(
    x,
    y,
    s,
    `${P('M-14 0L-18-70L0-100L18-70L14 0z', c)}${F('M0-100L18-70L14 0H2z', dark(c, 0.35), 'opacity=".6"')}${L('M-18-70L0-62L18-70M0-62V0', lite(c, 0.6), 2, 'opacity=".7"')}`,
    rot,
  );
const spikes = (seed, n, len, fill, y = -6, dir = 1) => {
  const r = rng(seed);
  const w = (W + 20) / n;
  return P(
    `M-10 ${y}${seq(n, (i) => `L${r1(-10 + (i + 0.3 + r() * 0.4) * w)} ${r1(y + dir * len * (0.3 + r() * 0.7))}L${r1(-10 + (i + 1) * w)} ${r1(y + dir * (6 + r() * 12))}`)}V${y}z`,
    fill,
  );
};
const cloud = (x, y, s, fill, op = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M-50 10Q-56-8-36-10Q-30-28-8-22Q6-38 26-22Q48-24 48-6Q62 4 50 10z" fill="${fill}" opacity="${op}"/>`;
const ridge = (seed, y, amp, fill, n = 9, op = 1) => {
  const r = rng(seed);
  return F(
    `M0 300V${y}${seq(n, (i) => `L${r1(((i + 0.5) * W) / n)} ${r1(y - amp * (0.3 + r() * 0.7))}L${r1(((i + 1) * W) / n)} ${r1(y - amp * 0.2 * r())}`)}V300z`,
    fill,
    `opacity="${op}"`,
  );
};
const peak = (x, h, w, c, snow = '#f4f0ff') =>
  `${P(`M${x - w / 2} 300L${x} ${300 - h}L${x + w / 2} 300z`, c)}${F(`M${x} ${300 - h}L${x + w / 2} 300H${x + w * 0.1}z`, '#0e0a26', 'opacity=".25"')}${P(`M${x} ${300 - h}L${r1(x - w * 0.17)} ${r1(300 - h * 0.66)}l${r1(w * 0.07)}-${r1(h * 0.05)} ${r1(w * 0.05)} ${r1(h * 0.1)} ${r1(w * 0.07)}-${r1(h * 0.08)} ${r1(w * 0.06)} ${r1(h * 0.09)} ${r1(w * 0.09)}-${r1(h * 0.06)}z`, snow, 2.5)}`;
const wind = (y, op = 0.35) =>
  L(
    `M-20 ${y}q110-22 210 0t210-6M430 ${y + 26}q110-20 220 2t220-10`,
    '#ffffff',
    2.5,
    `opacity="${op}"`,
  );
const thorns = (pts, c, sw = 5) =>
  `${L(
    `M${pts[0]}Q${pts[1]} ${pts[2]}${pts
      .slice(3)
      .map((p) => `T${p}`)
      .join('')}`,
    K,
    sw + 4,
  )}${L(
    `M${pts[0]}Q${pts[1]} ${pts[2]}${pts
      .slice(3)
      .map((p) => `T${p}`)
      .join('')}`,
    c,
    sw,
  )}${pts
    .slice(2)
    .map((p, i) => {
      const [x, y] = p.split(' ').map(Number);
      return P(`M${x - 5} ${y}l5 ${i % 2 ? 12 : -12} 5 ${i % 2 ? -12 : 12}z`, c, 2);
    })
    .join('')}`;
const mushroom = (x, y, s, cap) =>
  at(
    x,
    y,
    s,
    `${glow(0, -18, 34, 'acc')}${P('M-5 0Q-3-12-5-18H5Q3-12 5 0z', '#f1e6cf')}${P('M-18-16Q-16-36 0-36Q16-36 18-16Q0-10-18-16z', cap)}${circ(-7, -24, 2.6, '#fff')}${circ(6, -27, 2, '#fff')}${circ(4, -18, 1.6, '#fff')}`,
  );

// Ground band shared by every place
const floorBand = (seed, kind, strip, line) => {
  const r = rng(seed);
  const marks =
    kind === 'rough'
      ? L(
          seq(46, () => {
            const x = Math.round(r() * W);
            const y = Math.round(306 + r() * 30);
            return `M${x} ${y}q${5 + Math.round(r() * 8)}-${3 + Math.round(r() * 4)} ${12 + Math.round(r() * 16)} 0`;
          }),
          K,
          2,
          'opacity=".45"',
        )
      : L(
          `${kind === 'plank' ? '' : 'M0 314H844M0 334H844M0 362H844'}${seq(33, (i) => `M${Math.round(421 + (i - 16) * 43.7)} 300L${420 + (i - 16) * 70} 390`)}`,
          K,
          2,
          'opacity=".55"',
        );
  return `${rect(0, 300, W, 90, `url(#${gid}-fl)`)}${marks}${rect(0, 338, W, 52, strip)}${L('M0 338H844', K, 4)}${L('M0 346H844', line, 3)}${L('M0 300H844', K, 5)}`;
};

// One painter per place: returns sky/wall and floor colours plus back and front drawings
const SCENES = {
  village(c) {
    const house = (x, w, h, wall, roof) => {
      const y = 300 - h;
      const m = x + w / 2;
      return `${P(`M${x} 300V${y}H${x + w}V300z`, wall)}${L(`M${x} ${y + h * 0.48}H${x + w}M${x + w * 0.3} ${y}V300M${x + w * 0.7} ${y}V300M${x} ${y + h * 0.48}L${x + w * 0.3} ${y}M${x + w} ${y + h * 0.48}L${x + w * 0.7} ${y}`, '#3d2530', 4)}${P(`M${x + w * 0.74} ${y - w * 0.14}v${-w * 0.34}h14v${w * 0.42}z`, dark(wall, 0.45))}${P(`M${x - 12} ${y + 6}L${m} ${y - w * 0.5}L${x + w + 12} ${y + 6}z`, roof)}${L(`M${x + 6} ${y - 5}L${m} ${y - w * 0.5 + 15}L${x + w - 6} ${y - 5}`, lite(roof, 0.3), 2, 'opacity=".6"')}${[y + h * 0.25, y + h * 0.74].map((wy) => `${glow(m, wy, 44)}${P(`M${m - 11} ${wy + 13}V${wy - 8}Q${m} ${wy - 20} ${m + 11} ${wy - 8}V${wy + 13}z`, '#ffdc63')}${L(`M${m} ${wy - 14}V${wy + 13}M${m - 11} ${wy}H${m + 11}`, K, 2)}`).join('')}`;
    };
    const lamp = (x) =>
      `${L(`M${x} 300V200`, K, 7)}${L(`M${x} 300V200`, '#7c7aa0', 3)}${glow(x, 188, 62)}${P(`M${x - 8} 200L${x - 11} 180H${x + 11}L${x + 8} 200z`, '#ffe681')}${P(`M${x - 15} 181L${x} 166L${x + 15} 181z`, '#3d2530')}`;
    const wall = mix('#8f86a0', c, 0.4);
    return {
      bg: ['#0a1140', '#22407c', mix('#6f9fc0', c, 0.4)],
      fl: [mix(c, '#4a4470', 0.6), dark(c, 0.8)],
      strip: mix('#6b4a2e', c, 0.3),
      back: `${stars(1, 70, 0, 0, W, 200)}${moon(206, 92, 17)}${cloud(600, 110, 1.2, '#cfe0ff', 0.2)}${ridge(3, 262, 30, '#152a5c', 9, 0.9)}${seq(
        9,
        (i) => {
          const x = 196 + i * 52;
          const h = 44 + ((i * 37) % 30);
          return `${F(`M${x} 300v${-h}l22-20 22 20v${h}z`, dark(c, 0.62))}${rect(x + 16, 290 - h * 0.6, 9, 11, '#ffdc63', 'opacity=".85"')}`;
        },
      )}${house(4, 132, 168, wall, dark(c, 0.3))}${house(690, 96, 132, dark(wall, 0.12), mix('#8a3f4a', c, 0.2))}${house(770, 110, 186, wall, dark(c, 0.3))}${house(118, 70, 96, dark(wall, 0.15), mix('#8a3f4a', c, 0.2))}`,
      front: `${lamp(187)}${lamp(658)}`,
    };
  },
  forest(c, a) {
    const far = mix(c, '#123a4a', 0.55);
    return {
      bg: ['#04121f', dark(c, 0.55), mix(c, '#2a7a70', 0.3)],
      fl: [dark(c, 0.4), dark(c, 0.82)],
      strip: mix(dark(c, 0.45), '#2f6a2a', 0.3),
      kind: 'rough',
      back: `${glow(422, 250, 300, 'acc')}${seq(15, (i) => fir(20 + i * 58, 300, 0.75 + ((i * 7) % 5) * 0.12, far, far))}${F('M0 250Q200 225 422 252T844 244V300H0z', lite(c, 0.3), 'opacity=".22"')}${fir(120, 300, 1.35, dark(c, 0.35))}${fir(724, 300, 1.3, dark(c, 0.35))}${fir(46, 304, 1.95, dark(c, 0.15))}${fir(800, 304, 2.05, dark(c, 0.15))}${P('M196 300Q204 236 188 190Q176 160 186 124L196 130Q192 160 204 186Q224 236 220 300z', '#3a2440')}${L('M188 168Q164 150 158 122M194 142Q214 120 210 92M187 128Q176 104 182 84', '#3a2440', 6)}${thorns(['-10 96', '40 150', '92 108', '150 132', '200 84'], '#6a3a6e')}${thorns(['854 84', '800 140', '744 100', '690 126', '640 74'], '#6a3a6e')}${thorns(['-10 292', '60 244', '130 286', '210 262', '300 290', '422 268', '540 290', '640 262', '730 288', '854 258'], '#55305c', 4)}`,
      front: `${mushroom(176, 306, 1, '#e0524f')}${mushroom(668, 304, 1.25, '#e0524f')}${mushroom(652, 308, 0.7, '#c98bff')}${mushroom(18, 304, 0.9, '#c98bff')}${fireflies(5, 16, 'acc', a)}`,
    };
  },
  bridge(c) {
    const stone = mix(c, '#8c93b8', 0.4);
    const post = (x) =>
      `${rect(x - 15, 222, 30, 78, stone, ol)}${rect(x - 20, 214, 40, 11, lite(stone, 0.2), ol)}${L(`M${x} 214V132`, K, 7)}${L(`M${x} 214V132`, '#565a80', 3)}${glow(x, 116, 70)}${P(`M${x - 9} 132L${x - 12} 108H${x + 12}L${x + 9} 132z`, '#ffe9a0')}${P(`M${x - 16} 109L${x} 94L${x + 16} 109z`, '#2c2f55')}`;
    return {
      bg: ['#131a4c', mix(c, '#33407a', 0.45), lite(c, 0.45)],
      fl: [mix(c, '#4a4f80', 0.5), dark(c, 0.78)],
      strip: dark(c, 0.42),
      back: `${stars(2, 40, 0, 0, W, 120)}${moon(712, 84, 15)}${ridge(4, 214, 54, dark(c, 0.35), 7, 0.7)}${tower(6, 30, 40, 110, 60, dark(c, 0.5), dark(c, 0.3), '#ffe9a0')}${tower(7, 812, 44, 128, 56, dark(c, 0.5), dark(c, 0.3), '#ffe9a0')}${rect(0, 214, W, 86, dark(c, 0.3))}${L('M40 232h90M300 240h120M560 228h100M700 244h90M150 252h70M460 258h90', lite(c, 0.5), 2, 'opacity=".5"')}${seq(6, (i) => `<ellipse cx="${70 + i * 150}" cy="${206 + (i % 3) * 12}" rx="${120 + (i % 2) * 40}" ry="${14 + (i % 3) * 5}" fill="#eaf2ff" opacity="${0.16 + (i % 3) * 0.06}"/>`)}${P('M0 300V262H844V300z', stone)}${F(
        seq(28, (i) => `M${10 + i * 30} 300v-24q8-10 16 0v24z`),
        dark(c, 0.55),
      )}${P('M-5 252H849V264H-5z', lite(stone, 0.25))}${L('M60 150Q125 200 190 150M654 150Q719 200 784 150M190 150Q422 250 654 150', K, 5)}${L('M60 150Q125 200 190 150M654 150Q719 200 784 150M190 150Q422 250 654 150', '#8f95bc', 2)}${mir(`${post(60)}${post(190)}`)}`,
      front: `<ellipse cx="120" cy="300" rx="170" ry="12" fill="#eaf2ff" opacity=".16"/><ellipse cx="724" cy="296" rx="170" ry="12" fill="#eaf2ff" opacity=".16"/>`,
    };
  },
  griffin(c, a) {
    const stone = mix(c, '#b9a9c0', 0.55);
    const beast = (x, y, f) =>
      at(
        x,
        y,
        1.15,
        `${L('M-22-6q-18-4-14-26', stone, 7)}${P('M-8-40Q-44-66-34-104Q-16-82 0-76Q-4-58 4-44z', lite(stone, 0.12))}${L('M-28-88Q-14-70-4-64M-22-72Q-12-58-4-52', K, 2)}${P('M-24 0Q-32-30-10-46L2-52Q16-40 12-20L18 0z', stone)}${P('M-2-58a11 11 0 1 0 22 0a11 11 0 1 0-22 0zM2-66l-3-12 10 6z', stone)}${P('M18-62l13 6-12 5z', '#ffca76')}${circ(11, -60, 2, K)}`,
        0,
        f,
      );
    const nest = (x, y) =>
      `${P(`M${x - 24} ${y}q24 22 48 0z`, '#7a4a2a')}${L(`M${x - 26} ${y}h52M${x - 18} ${y + 7}l10-5M${x + 4} ${y + 9}l12-6`, '#c58a4a', 3)}${P(`M${x - 12} ${y}q4-16 10 0zM${x + 1} ${y}q5-18 11 0z`, '#f6ecd6', 2)}`;
    return {
      bg: ['#1b1650', mix('#7a3f8a', c, 0.35), c, lite(mix(c, a, 0.6), 0.1)],
      fl: [mix(c, '#6a4a6a', 0.45), dark(c, 0.78)],
      strip: dark(c, 0.3),
      kind: 'rough',
      back: `${stars(3, 30, 0, 0, W, 110)}${glow(240, 268, 230)}${circ(240, 268, 30, '#ffe9b0')}${cloud(150, 96, 1.5, '#ffd9b0', 0.3)}${cloud(690, 70, 1.8, '#ffd9b0', 0.25)}${cloud(470, 150, 1.3, '#ffd9b0', 0.25)}${wind(120)}${wind(196, 0.25)}${ridge(8, 286, 46, dark(c, 0.4), 8, 0.85)}${P('M0 300V236L26 224L52 240L70 300z', dark(c, 0.55))}${P('M844 300V214L816 204L790 226L776 300z', dark(c, 0.55))}${nest(30, 222)}${nest(814, 202)}${pillar(112, 46, 176, stone)}${pillar(738, 46, 150, stone)}${L('M100 190V288M112 190V288M726 164V288M738 164V288', K, 2, 'opacity=".4"')}${beast(112, 176, 1)}${beast(738, 150, -1)}`,
      front: '',
    };
  },
  library(c) {
    const wood = '#a0683a';
    return {
      bg: [mix('#4a2a3c', c, 0.15), '#2a1626'],
      fl: ['#6a3a34', '#2a141c'],
      strip: '#a02c2c',
      line: '#ffd23e',
      back: `${shelves(11, 14, 26, 182, 246, 4, wood)}${shelves(12, 222, 34, 112, 238, 4, wood)}${shelves(13, 510, 34, 112, 238, 4, wood)}${shelves(14, 648, 26, 182, 246, 4, wood)}${mir(`${rect(8, 18, 194, 10, wood, ol)}${rect(216, 26, 124, 10, wood, ol)}`)}${rect(352, 30, 140, 240, mix('#8a6a6a', c, 0.2), ol)}${bricks(15, 30, 150, 24, K, 0.4, 44, 352, 492)}${circ(422, 88, 30, '#2a1626', ol)}${circ(422, 88, 23, 'none', 'stroke="#ffd23e" stroke-width="4"')}${star5(422, 88, 13)}${glow(422, 240, 170, 'hearth')}${P('M366 270V206Q366 172 422 172Q478 172 478 206V270z', '#1a0c14')}${flame(402, 266, 1.3)}${flame(442, 266, 1.3)}${flame(422, 268, 2.1)}${rect(336, 150, 172, 16, wood, ol)}${rect(0, 270, W, 30, '#3a1e26')}${L('M0 270H844', wood, 5)}${L('M216 58L198 298M242 58L224 298', K, 8)}${L('M216 58L198 298M242 58L224 298', '#c58a3a', 4)}${L(
        seq(8, (i) => `M${214 - i * 2.1} ${84 + i * 28}h26`),
        '#c58a3a',
        4,
      )}`,
      front: `${torch(24, 150)}${torch(820, 150)}`,
      defs: rad('hearth', '#ffd27a', '#ff8a2a', 0.75, 0.38, 0.35),
    };
  },
  garden(c, a) {
    const hedge = mix(c, '#1f5a50', 0.6);
    const flower = (x, y, s, col) =>
      `${L(`M${x} ${y}q-4-18 0-${Math.round(34 * s)}`, '#3f9a7a', 3)}${glow(x, y - 34 * s, 30 * s, 'acc')}${seq(5, (i) => circ(x + Math.sin(i * 1.257) * 6 * s, y - 34 * s - Math.cos(i * 1.257) * 6 * s, 4.6 * s, col))}${circ(x, y - 34 * s, 3 * s, '#fff6c0')}`;
    const topiary = (x, h, r) =>
      `${rect(x - 4, 300 - h, 8, h, '#4a3050', ol)}${circ(x, 300 - h, r, hedge, ol)}${circ(x - r * 0.3, 300 - h - r * 0.3, r * 0.45, lite(hedge, 0.2), 'opacity=".5"')}${circ(x, 300 - h - r * 1.5, r * 0.6, hedge, ol)}`;
    return {
      bg: ['#0b0f44', mix(c, '#2a2f8a', 0.4), lite(c, 0.25)],
      fl: [mix(c, '#2f6a70', 0.5), dark(c, 0.75)],
      strip: mix(c, '#b9b4e0', 0.35),
      back: `${stars(5, 70, 0, 0, W, 210, a)}${moon(742, 100, 30, '#232a80')}${cloud(560, 96, 1.4, '#c9caff', 0.2)}${cloud(250, 130, 1.1, '#c9caff', 0.16)}${ridge(9, 250, 44, dark(c, 0.5), 10, 0.8)}${P(`M0 300V246${seq(14, (i) => `Q${i * 62 + 31} ${214 + (i % 3) * 10} ${(i + 1) * 62} ${246 + (i % 2) * 6}`)}V300z`, hedge)}${L(
        seq(20, (i) => `M${14 + i * 43} ${262 + (i % 3) * 8}q8-8 16 0`),
        lite(hedge, 0.35),
        2,
        'opacity=".6"',
      )}${topiary(690, 96, 26)}${topiary(800, 150, 30)}${topiary(196, 70, 20)}${P('M38 300V150Q38 76 106 76Q174 76 174 150V300H150V152Q150 100 106 100Q62 100 62 152V300z', mix(c, '#b9b4d8', 0.6))}${L('M38 190H62M38 240H62M150 170H174M150 222H174M150 268H174M70 110L88 124M106 76V100M142 110L124 124', K, 2, 'opacity=".5"')}${L('M40 300Q30 220 50 170T92 86T150 110T168 200', '#3f9a7a', 4)}${seq(7, (i) => circ([34, 44, 60, 92, 134, 164, 170][i], [250, 196, 130, 84, 96, 150, 210][i], 5, '#5fc79a', ol))}`,
      front: `${[
        [14, 1.3, a],
        [182, 1.6, '#ff9ad8'],
        [664, 1.7, a],
        [832, 1.3, '#ff9ad8'],
        [300, 1.1, a],
        [540, 1.1, '#ff9ad8'],
        [208, 1, a],
        [640, 1, '#ff9ad8'],
      ]
        .map(([x, s, col]) => flower(x, 306, s, col))
        .join('')}${fireflies(6, 8, 'acc', a)}`,
    };
  },
  potions(c, a) {
    const pots = ['#7dff8a', a, '#ff7ad1', '#6ad8ff', '#ffd23e', '#b98cff'];
    const pipe = (d) =>
      `${L(d, K, 15)}${L(d, '#b9772a', 9)}${L(d, '#f1c56a', 2.5, 'opacity=".7" transform="translate(0 -2)"')}`;
    const fume = (x, y, s) =>
      at(
        x,
        y,
        s,
        F(
          'M0 0Q-26-20-8-44Q-30-70-4-96Q-18-124 8-140Q30-120 14-98Q36-72 14-48Q32-22 0 0z',
          '#8dff9a',
          'opacity=".22"',
        ),
      );
    return {
      bg: [mix(c, '#1f3a3a', 0.5), dark(c, 0.72)],
      fl: [mix(c, '#3a4a4a', 0.55), dark(c, 0.8)],
      strip: mix(dark(c, 0.5), '#1f6a4a', 0.35),
      back: `${bricks(21, 22, 300, 30, '#0c1a14', 0.4, 70)}${glow(422, 250, 240, 'acc')}${shelves(22, 14, 92, 172, 168, 3, '#7a5a3a', pots)}${shelves(23, 658, 92, 172, 168, 3, '#7a5a3a', pots)}${pipe('M-10 66H854M206 66V190Q206 214 232 214H260M638 66V150M100 66V92M744 66V92')}${seq(8, (i) => rect(46 + i * 106, 56, 10, 20, '#d9a563', ol))}${circ(638, 160, 13, '#d9a563', ol)}${L('M630 160h16M638 152v16', K, 3)}${fume(232, 300, 1.3)}${fume(612, 300, 1.5)}${fume(422, 190, 1.2)}${P('M352 226Q340 300 422 300Q504 300 492 226z', '#2c2f4a', 4)}<ellipse cx="422" cy="226" rx="76" ry="15" fill="#7dff8a" ${ol}/>${circ(400, 222, 6, '#d8ff8c', ol)}${circ(440, 228, 4, '#d8ff8c', ol)}${circ(422, 196, 7, '#d8ff8c', 'opacity=".7"')}${circ(452, 176, 4, '#d8ff8c', 'opacity=".6"')}`,
      front: `${torch(202, 150, '#5fe07a', '#e6ffb0', 'acc')}${torch(642, 216, '#5fe07a', '#e6ffb0', 'acc')}${seq(10, (i) => circ(30 + ((i * 197) % 780), 70 + ((i * 83) % 200), 2 + (i % 3), '#b8ff9a', 'opacity=".5"'))}`,
    };
  },
  golem(c, a) {
    const stone = mix(c, '#8f96b4', 0.5);
    const statue = (x) =>
      `${P(roundArch(x, 58, 78, 300), dark(c, 0.72), 5)}${glow(x, 170, 80, 'acc')}${at(x, 300, 1.1, `${P('M-30 0V-52H-8V0zM8 0V-52H30V0z', dark(stone, 0.15))}${P('M-48-124h-20l-4 74h20zM48-124h20l4 74h-20z', dark(stone, 0.1))}${P('M-40-50L-48-124H48L40-50z', stone)}${P('M-19-124V-158H19V-124z', lite(stone, 0.1))}${L('M-30-110L-12-96M30-110L12-96M-40-70H40', K, 2, 'opacity=".5"')}${rect(-12, -148, 8, 5, a)}${rect(4, -148, 8, 5, a)}${L('M0-108v24M-9-98l9-10 9 10M-8-84h16', a, 3.5)}`)}`;
    const runes = (x) =>
      `${glow(x, 180, 60, 'acc')}${L(`M${x - 6} 110h12l-6 12zM${x} 140v18M${x - 6} 149h12M${x - 6} 178l6-8 6 8-6 8zM${x - 6} 206h12M${x - 6} 214h12M${x} 232v16l6-8`, a, 3)}`;
    return {
      bg: [mix(c, '#3a3f66', 0.45), dark(c, 0.68)],
      fl: [mix(c, '#4a4f78', 0.4), dark(c, 0.78)],
      strip: dark(c, 0.48),
      back: `${bricks(31, 26, 300, 46, '#10122c', 0.45, 118)}${rect(0, 46, W, 16, lite(stone, 0.1), ol)}${L(
        seq(21, (i) => `M${12 + i * 41} 50l8 8 8-8`),
        K,
        2,
        'opacity=".5"',
      )}${P(roundArch(422, 96, 70, 300), dark(c, 0.8), 5)}${glow(422, 190, 110, 'acc')}${mir(statue(104))}${mir(`${pillar(198, 36, 62, stone)}${pillar(8, 30, 62, stone)}${runes(198)}`)}`,
      front: L('M150 318l40 10 30-6M620 322l40 8 44-10', a, 2, 'opacity=".5"'),
    };
  },
  lake(c, a) {
    const hill = dark(c, 0.45);
    const reed = (x, h, lean) =>
      `${L(`M${x} 304Q${x + lean} ${304 - h / 2} ${x + lean * 2} ${304 - h}`, '#2f7a6a', 3)}<ellipse cx="${x + lean * 2}" cy="${304 - h - 6}" rx="3.5" ry="10" fill="#7a4a2a" ${ol}/>`;
    return {
      bg: ['#06163f', mix(c, '#1f4f8a', 0.45), lite(c, 0.3)],
      fl: [mix(c, '#2a5a6a', 0.5), dark(c, 0.8)],
      strip: mix(dark(c, 0.4), '#2f7a5a', 0.3),
      kind: 'rough',
      back: `${stars(8, 60, 0, 0, W, 190)}${moon(700, 92, 22)}${ridge(12, 204, 70, hill, 8)}<g transform="translate(0 408) scale(1 -1)" opacity=".45">${ridge(12, 204, 70, hill, 8)}</g>${rect(0, 204, W, 96, lite(c, 0.1), 'opacity=".55"')}${L('M0 204H844', lite(a, 0.3), 2, 'opacity=".8"')}${L(
        seq(16, (i) => `M${(i * 173) % 800} ${214 + ((i * 29) % 80)}h${30 + ((i * 13) % 50)}`),
        lite(a, 0.4),
        2,
        'opacity=".5"',
      )}${L(
        seq(
          9,
          (i) => `M${700 - 16 + i * 2 - (i % 2) * 8} ${212 + i * 9}h${32 - i * 2 + (i % 2) * 10}`,
        ),
        '#fff3c9',
        3,
        'opacity=".75"',
      )}${P('M22 300Q34 220 26 170Q22 120 60 96L74 104Q52 130 54 172Q58 230 60 300z', '#3a2a50')}${L('M40 150Q70 110 120 104M46 120Q30 90 8 84', '#3a2a50', 6)}${L(
        seq(13, (i) => {
          const x = 4 + i * 14;
          return `M${x} ${70 + Math.abs(i - 5) * 6}Q${x - 8} ${150 + (i % 3) * 20} ${x + 2} ${200 + ((i * 37) % 60)}`;
        }),
        mix(c, '#5fd09a', 0.5),
        4,
      )}${L(
        seq(12, (i) => {
          const x = 10 + i * 14;
          return `M${x} ${74 + Math.abs(i - 5) * 6}Q${x + 6} ${130 + (i % 3) * 20} ${x - 3} ${176 + ((i * 53) % 60)}`;
        }),
        mix(c, '#b8ffd0', 0.5),
        2.5,
      )}${seq(7, (i) => reed(690 + i * 22, 70 + ((i * 47) % 70), (i % 3) - 1))}${reed(200, 60, 2)}${reed(214, 86, -1)}`,
      front: `${glow(668, 280, 70, 'acc')}${crystal(660, 306, 0.75, a, -14)}${crystal(676, 306, 0.5, lite(a, 0.3), 16)}${glow(180, 284, 60, 'acc')}${crystal(178, 306, 0.6, a, 10)}${crystal(828, 306, 0.9, a, 12)}${fireflies(9, 8, 'acc', a)}`,
    };
  },
  clock(c) {
    const brass = mix(c, '#d9a040', 0.5);
    const gear = (x, y, r, n, col) => {
      const st = (Math.PI * 2) / n;
      const pt = (ang, rr) => `${r1(x + Math.cos(ang) * rr)} ${r1(y + Math.sin(ang) * rr)}`;
      return `${P(`M${seq(n, (i) => `${pt(i * st, r * 0.82)}L${pt((i + 0.15) * st, r)}L${pt((i + 0.5) * st, r)}L${pt((i + 0.65) * st, r * 0.82)}L`).slice(0, -1)}z`, col)}${circ(x, y, r * 0.56, dark(col, 0.45), ol)}${L(
        seq(3, (i) => `M${pt(i * 1.047 + 0.3, r * 0.56)}L${pt(i * 1.047 + 3.44, r * 0.56)}`),
        col,
        r * 0.12,
      )}${circ(x, y, r * 0.16, lite(col, 0.3), ol)}`;
    };
    return {
      bg: [mix(c, '#4a2f50', 0.55), dark(c, 0.74)],
      fl: [mix(c, '#5a3a4a', 0.5), dark(c, 0.8)],
      strip: mix(dark(c, 0.45), '#6a2f2a', 0.3),
      kind: 'plank',
      back: `${L(
        seq(20, (i) => `M${22 + i * 42} 0V300`),
        '#1a0f24',
        2,
        'opacity=".4"',
      )}${gear(422, 170, 150, 20, dark(c, 0.55))}${gear(64, 128, 62, 12, brass)}${gear(152, 208, 38, 9, mix(brass, '#8a4a3a', 0.5))}${gear(158, 84, 28, 8, lite(brass, 0.15))}${gear(24, 232, 30, 8, mix(brass, '#8a4a3a', 0.35))}${glow(742, 150, 150)}${circ(742, 150, 86, brass, `stroke="${K}" stroke-width="5"`)}${circ(742, 150, 72, '#fff3c9', ol)}${L(
        seq(
          12,
          (i) =>
            `M${r1(742 + Math.sin(i * 0.5236) * 58)} ${r1(150 - Math.cos(i * 0.5236) * 58)}L${r1(742 + Math.sin(i * 0.5236) * 68)} ${r1(150 - Math.cos(i * 0.5236) * 68)}`,
        ),
        K,
        4,
      )}${L('M742 150V96', K, 7)}${L('M742 150L778 172', K, 5)}${circ(742, 150, 7, brass, ol)}${gear(672, 250, 30, 8, mix(brass, '#8a4a3a', 0.5))}${gear(812, 262, 24, 7, lite(brass, 0.15))}${rect(0, 44, W, 16, mix(brass, '#5a3a2a', 0.5), ol)}${L(
        seq(22, (i) => `M${10 + i * 40} 52h0`),
        lite(brass, 0.4),
        5,
      )}${L('M204 60L190 226', K, 8)}${L('M204 60L190 226', brass, 4)}${glow(189, 236, 44)}${circ(189, 240, 20, lite(brass, 0.2), ol)}${circ(184, 234, 6, '#fff3c9', 'opacity=".7"')}${L('M640 60L654 196', K, 8)}${L('M640 60L654 196', brass, 4)}${P('M640 196h28l-6 26h-16z', brass)}`,
      front: '',
    };
  },
  clouds(c) {
    const rock = mix(c, '#8a84b8', 0.5);
    const isle = (x, y, w, grass) =>
      `${P(`M${x - w / 2} ${y}Q${x - w * 0.3} ${y + w * 0.42} ${x - w * 0.06} ${y + w * 0.62}Q${x + w * 0.2} ${y + w * 0.34} ${x + w / 2} ${y}z`, rock)}${F(`M${x} ${y}H${x + w / 2}Q${x + w * 0.2} ${y + w * 0.34} ${x - w * 0.06} ${y + w * 0.62}z`, '#0e0a26', 'opacity=".3"')}${P(`M${x - w / 2 - 5} ${y - 9}h${w + 10}q4 12-8 12h${-w + 6}q-12 0-8-12z`, grass)}`;
    const col = (x, y, h) =>
      `${rect(x - 7, y - h, 14, h, lite(rock, 0.3), ol)}${rect(x - 11, y - h - 6, 22, 7, lite(rock, 0.45), ol)}`;
    return {
      bg: ['#0e1a5e', mix(c, '#3f6fd0', 0.45), lite(c, 0.5)],
      fl: [mix(c, '#7f8fc8', 0.4), dark(c, 0.7)],
      strip: mix(c, '#dfe8ff', 0.45),
      line: '#ffffff',
      back: `${stars(10, 50, 0, 0, W, 130)}${cloud(330, 150, 2.2, '#ffffff', 0.25)}${cloud(560, 200, 1.6, '#ffffff', 0.25)}${isle(480, 110, 60, '#7fd08a')}${col(104, 128, 44)}${col(134, 128, 28)}${isle(110, 136, 150, '#7fd08a')}${L('M60 142Q56 190 62 236', '#dff2ff', 4, 'opacity=".7"')}${isle(180, 236, 56, '#7fd08a')}${isle(32, 226, 50, '#7fd08a')}${col(790, 196, 36)}${isle(776, 204, 110, '#7fd08a')}${isle(690, 250, 44, '#7fd08a')}${glow(742, 120, 120, 'acc')}${P('M736 78L708 142H730L700 222L764 128H738L760 78z', '#fff6a8', 3)}${cloud(752, 66, 2.3, dark(c, 0.55))}${cloud(690, 58, 1.5, dark(c, 0.45))}${cloud(812, 84, 1.2, dark(c, 0.45))}${seq(9, (i) => cloud(40 + i * 100, 276 + (i % 2) * 10, 1.9, '#ffffff', 0.5))}${seq(8, (i) => cloud(90 + i * 100, 296, 1.7, '#eaf2ff', 0.9))}`,
      front: '',
    };
  },
  phoenix(c) {
    const gold = '#ffc24a';
    const bird = (x, y, s) =>
      at(
        x,
        y,
        s,
        `${circ(0, 0, 40, dark(c, 0.6), `stroke="${gold}" stroke-width="4"`)}${P('M0-28Q6-17 4-9Q22-24 37-19Q31-2 12 6Q10 20 0 34Q-10 20-12 6Q-31-2-37-19Q-22-24-4-9Q-6-17 0-28z', gold, 2.5)}${F('M0-6Q6 8 0 24Q-6 8 0-6z', '#fff3a6')}`,
      );
    const brazier = (x) =>
      `${glow(x, 176, 110)}${L(`M${x - 18} 300L${x} 214L${x + 18} 300M${x - 10} 262h20`, K, 8)}${L(`M${x - 18} 300L${x} 214L${x + 18} 300M${x - 10} 262h20`, '#8a5a3a', 4)}${flame(x - 13, 206, 1.1)}${flame(x + 13, 206, 1.1)}${flame(x, 208, 1.9)}${P(`M${x - 30} 200Q${x - 26} 224 ${x} 226Q${x + 26} 224 ${x + 30} 200z`, '#5a3040')}${L(`M${x - 32} 200H${x + 32}`, gold, 5)}`;
    const crack = (d) => `${L(d, '#ff6a1a', 6, 'opacity=".45"')}${L(d, '#ffd27a', 2.5)}`;
    return {
      bg: [mix(c, '#5a1f4a', 0.4), dark(c, 0.74)],
      fl: [mix(c, '#5a2a3a', 0.4), dark(c, 0.82)],
      strip: dark(c, 0.62),
      line: '#ff9a3d',
      back: `${bricks(41, 22, 300, 28, '#2a0a1c', 0.5, 66)}${glow(422, 300, 300)}${bird(422, 140, 1.7)}${mir(bird(110, 104, 0.72))}${mir(`${pillar(190, 34, 56, mix(c, '#7a3a4a', 0.4))}${pillar(14, 34, 56, mix(c, '#7a3a4a', 0.4))}${L('M173 62H207M-3 62H31', gold, 4)}`)}${rect(0, 44, W, 14, dark(c, 0.3), ol)}${L('M0 58H844', gold, 2.5)}${crack('M60 300l8-34-12-22 10-30M150 300l-6-26 12-18M700 300l-10-30 14-26-8-34M790 300l8-22-10-20M300 300l6-20M540 300l-8-24')}`,
      front: `${brazier(110)}${brazier(734)}${crack('M0 322l60-8 40 10 70-6M844 318l-50 8-60-10-50 6M250 330l50-8 60 8M480 326l70-6 50 10')}${seq(14, (i) => circ(20 + ((i * 211) % 800), 80 + ((i * 97) % 210), 1.5 + (i % 3), '#ffb347', 'opacity=".7"'))}`,
    };
  },
  stars(c, a) {
    const gold = '#f1c56a';
    const ring = (x, y, rx, ry, rot) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="none" stroke="${K}" stroke-width="8"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="none" stroke="${gold}" stroke-width="4"/>`;
    const hole = 'M56 300V236Q64 70 300-10H544Q780 70 788 236V300z';
    return {
      bg: ['#05062a', '#1a1766', mix(c, '#5a3fc0', 0.5)],
      fl: [mix(c, '#3a2f70', 0.5), dark(c, 0.8)],
      strip: mix(dark(c, 0.5), '#3a1f8a', 0.4),
      back: `${glow(160, 110, 150, 'acc')}${glow(700, 150, 170, 'acc')}${glow(422, 80, 200, 'acc')}${stars(12, 190, 40, 0, 770, 290)}${stars(13, 50, 40, 0, 770, 290, a)}${L('M150 66L172 92L160 124L186 140M172 92L204 84M664 70L690 60L706 86L742 80L760 104', lite(a, 0.4), 1.5, 'opacity=".7"')}${[
        [150, 66],
        [172, 92],
        [160, 124],
        [186, 140],
        [204, 84],
        [664, 70],
        [690, 60],
        [706, 86],
        [742, 80],
        [760, 104],
        [120, 200],
        [730, 190],
      ]
        .map(([x, y], i) => sparkle(x, y, 5 + (i % 3) * 2, '#fff6dc'))
        .join(
          '',
        )}${L('M4 236Q120 250 250 120M840 236Q724 250 594 120', '#ffffff', 2, 'opacity=".5"')}<path d="M0 0H844V300H0z${hole}" fill="url(#${gid}-wall)" fill-rule="evenodd"/>${L(hole, K, 9)}${L(hole, lite(c, 0.25), 4)}${L('M56 236H0M788 236H844M40 150H0M30 90H0M804 150H844M814 90H844', K, 2, 'opacity=".5"')}${rect(92, 250, 36, 50, mix(c, '#6a5aa0', 0.5), ol)}${rect(84, 242, 52, 10, lite(c, 0.25), ol)}${L('M110 242V196', K, 8)}${L('M110 242V196', gold, 4)}${ring(110, 150, 48, 48, 0)}${ring(110, 150, 48, 15, -24)}${ring(110, 150, 17, 48, 28)}${L('M72 196Q110 214 148 196', gold, 4)}${glow(110, 150, 30)}${circ(110, 150, 9, '#ffe681', ol)}${L('M744 232L716 300M744 232L776 300M744 232V300', K, 8)}${L('M744 232L716 300M744 232L776 300M744 232V300', '#8a5a3a', 4)}${at(744, 228, 1, `${rect(-15, -150, 30, 190, mix(c, '#8a7ad0', 0.5), ol)}${rect(-19, -158, 38, 16, gold, ol)}${rect(-17, -60, 34, 9, gold, ol)}${rect(-17, 20, 34, 9, gold, ol)}${rect(-11, 40, 22, 16, dark(c, 0.3), ol)}${L('M-8-140V-66', '#ffffff', 3, 'opacity=".35"')}`, -28)}${circ(744, 230, 9, gold, ol)}`,
      front: '',
      defs: lin('wall', [dark(c, 0.45), dark(c, 0.75)]),
    };
  },
  crystals(c, a) {
    const vio = '#9a7bff';
    const cluster = (x, f) =>
      at(
        x,
        306,
        1,
        `${glow(0, -90, 150, 'acc')}${crystal(-52, 0, 1.25, vio, -24)}${crystal(46, 0, 1.2, lite(c, 0.25), 22)}${crystal(-4, 0, 2.05, a, -4)}${crystal(-28, 0, 0.9, lite(a, 0.4), -12)}${crystal(22, 0, 0.75, vio, 10)}`,
        0,
        f,
      );
    return {
      bg: ['#081230', dark(c, 0.45), mix(c, '#2ad0c0', 0.3)],
      fl: [mix(c, '#2a5a7a', 0.5), dark(c, 0.82)],
      strip: mix(dark(a, 0.62), c, 0.3),
      kind: 'rough',
      back: `${glow(422, 240, 260, 'acc')}${ridge(14, 290, 150, dark(c, 0.55), 6, 0.9)}${ridge(15, 300, 70, dark(c, 0.4), 11, 0.9)}${spikes(16, 13, 130, dark(c, 0.5))}${seq(7, (i) => crystal(240 + i * 62, 300, 0.4 + (i % 3) * 0.14, i % 2 ? a : vio, (i % 3) * 12 - 12))}${cluster(92, 1)}${cluster(752, -1)}${spikes(17, 19, 86, dark(c, 0.7))}${crystal(196, 44, 0.6, a, 172)}${crystal(646, 50, 0.7, vio, 186)}${crystal(60, 60, 0.5, vio, 190)}${crystal(790, 56, 0.55, a, 170)}`,
      front: [
        [60, 150, 9],
        [130, 96, 12],
        [168, 212, 7],
        [700, 120, 11],
        [776, 90, 8],
        [806, 200, 9],
        [300, 250, 6],
        [560, 240, 7],
        [20, 250, 6],
      ]
        .map(([x, y, r]) => sparkle(x, y, r))
        .join(''),
    };
  },
  crypt(c, a) {
    const stone = mix(c, '#8a84a8', 0.45);
    const web = (x, y, f) =>
      at(
        x,
        y,
        1,
        L(
          'M0 0L130 14M0 0L112 62M0 0L70 104M0 0L16 126M38 4Q40 24 30 34Q20 44 5 38M72 8Q74 44 54 60Q36 76 9 70M106 11Q104 60 76 86Q50 108 13 102',
          '#e6dcf5',
          1.6,
          'opacity=".55"',
        ),
        0,
        f,
      );
    const ghost = (x, y) => candle(x, y, 'acc', a);
    return {
      bg: [mix(c, '#3a2f5a', 0.5), dark(c, 0.74)],
      fl: [mix(c, '#3f3860', 0.5), dark(c, 0.82)],
      strip: dark(c, 0.55),
      back: `${bricks(51, 20, 300, 32, '#120c24', 0.45, 74)}${P(roundArch(422, 84, 84, 300), dark(c, 0.85), 5)}${P(roundArch(422, 50, 150, 300), '#07051a', 0)}${P(roundArch(106, 66, 72, 300), dark(c, 0.8), 5)}${P('M76 300L70 150L90 112H122L142 150L136 300z', stone)}${L('M106 132V230M86 160H126', dark(c, 0.6), 6)}${rect(40, 246, 132, 10, stone, ol)}${ghost(56, 246)}${ghost(156, 246)}${ghost(68, 246)}${P(roundArch(738, 66, 72, 300), stone, 5)}${L('M738 76V300M672 190H804M672 250H804', K, 3, 'opacity=".6"')}${L('M676 110L800 286M800 110L676 286', '#3a3350', 7)}${L('M676 110L800 286M800 110L676 286', '#8f88a8', 2, 'stroke-dasharray="7 5"')}${glow(738, 198, 90, 'acc')}${circ(738, 198, 34, dark(c, 0.7), `stroke="${a}" stroke-width="4"`)}${L('M738 174v48M720 186l18 12 18-12M724 214h28', a, 4)}${mir(`${pillar(198, 30, 60, stone)}${pillar(6, 26, 60, stone)}`)}${rect(0, 46, W, 16, dark(stone, 0.2), ol)}${web(0, 60, 1)}${web(844, 60, -1)}${web(214, 62, 1)}${web(630, 62, -1)}`,
      front: mir(
        `${L('M186 300V176M170 176H202', K, 7)}${L('M186 300V176M170 176H202', '#8f88a8', 3)}${ghost(172, 174)}${ghost(186, 174)}${ghost(200, 174)}`,
      ),
    };
  },
  vault(c) {
    const gold = '#ffcf4a';
    const steel = mix(c, '#9aa0c0', 0.6);
    const heap = (d) => `${P(d, gold)}${F(d, '#b9772a', 'opacity=".25"')}`;
    const key = (x, len, i) =>
      `${L(`M${x} 58V${58 + len}`, '#d9c9a0', 1.5)}${circ(x, 68 + len, 9, 'none', `stroke="${K}" stroke-width="7"`)}${L(`M${x} ${77 + len}v30h9M${x} ${95 + len}h7`, K, 7)}${circ(x, 68 + len, 9, 'none', `stroke="${i % 2 ? gold : '#e9ecff'}" stroke-width="3"`)}${L(`M${x} ${77 + len}v30h9M${x} ${95 + len}h7`, i % 2 ? gold : '#e9ecff', 3)}`;
    const coins = (seed, n, x, y, w, h) => {
      const r = rng(seed);
      return seq(
        n,
        () =>
          `<ellipse cx="${Math.round(x + r() * w)}" cy="${Math.round(y + r() * h)}" rx="7" ry="3.5" fill="#ffe681" stroke="${K}" stroke-width="1.5"/>`,
      );
    };
    return {
      bg: [mix(c, '#4a3560', 0.5), dark(c, 0.72)],
      fl: [mix(c, '#5a4460', 0.45), dark(c, 0.82)],
      strip: mix(dark(c, 0.5), '#6a1f3a', 0.35),
      back: `${L(
        seq(8, (i) => `M${i * 120 + 2} 0V300`),
        '#1a1030',
        4,
        'opacity=".5"',
      )}${L(
        seq(
          40,
          (i) =>
            `M${((i % 8) * 120 + 14) % W} ${70 + Math.floor(i / 8) * 54}h0M${(i % 8) * 120 + 110} ${70 + Math.floor(i / 8) * 54}h0`,
        ),
        lite(c, 0.35),
        5,
        'opacity=".7"',
      )}${rect(0, 44, W, 14, mix(c, '#5a4460', 0.3), ol)}${seq(7, (i) => key(672 + i * 25, [26, 54, 12, 40, 66, 20, 46][i], i))}${key(212, 30, 1)}${key(634, 44, 0)}${glow(104, 168, 150)}${circ(104, 168, 96, dark(steel, 0.35), `stroke="${K}" stroke-width="5"`)}${circ(104, 168, 82, steel, ol)}${circ(104, 168, 60, lite(steel, 0.15), ol)}${L(
        seq(
          12,
          (i) => `M${r1(104 + Math.sin(i * 0.5236) * 71)} ${r1(168 - Math.cos(i * 0.5236) * 71)}h0`,
        ),
        K,
        8,
      )}${L(
        seq(
          12,
          (i) => `M${r1(104 + Math.sin(i * 0.5236) * 71)} ${r1(168 - Math.cos(i * 0.5236) * 71)}h0`,
        ),
        gold,
        4,
      )}${L('M104 126V210M62 168H146M74 138L134 198M134 138L74 198', K, 9)}${L('M104 126V210M62 168H146M74 138L134 198M134 138L74 198', gold, 4.5)}${circ(104, 168, 15, gold, ol)}${rect(-4, 120, 16, 28, steel, ol)}${rect(-4, 190, 16, 28, steel, ol)}${glow(760, 230, 170)}${heap('M250 300Q300 262 350 284Q400 250 470 280Q540 262 600 300z')}${heap('M610 300Q660 284 700 232Q740 196 790 186Q830 180 850 170V300z')}${coins(61, 26, 650, 200, 190, 96)}${coins(62, 14, 280, 276, 280, 20)}${P('M742 190V160Q742 136 772 136H800Q830 136 830 160V190z', '#8a3a3a')}${P('M738 186H834V224H738z', '#a8523a')}${L('M738 190H834M762 138V224M810 138V224', gold, 4)}${rect(778, 182, 16, 16, gold, ol)}`,
      front: [
        [690, 214, 9],
        [800, 120, 7],
        [726, 262, 6],
        [330, 268, 7],
        [520, 272, 6],
        [104, 96, 6],
        [170, 220, 5],
      ]
        .map(([x, y, r]) => sparkle(x, y, r, '#fff6c0'))
        .join(''),
    };
  },
  mountains(c, a) {
    const rock = mix(c, '#5a4a80', 0.55);
    const scaly = (x, y, w, h) =>
      `${P(`M${x - w / 2} 300Q${x - w / 2} ${y} ${x} ${y}Q${x + w / 2} ${y} ${x + w / 2} 300z`, rock)}${L(
        seq(12, (i) => {
          const sx = x - w * 0.34 + (i % 4) * w * 0.16 + (Math.floor(i / 4) % 2) * w * 0.06;
          const sy = y + h * 0.34 + Math.floor(i / 4) * h * 0.24;
          return `M${r1(sx)} ${r1(sy)}q${r1(w * 0.07)} ${r1(h * 0.14)} ${r1(w * 0.14)} 0`;
        }),
        K,
        2,
        'opacity=".55"',
      )}`;
    const cairn = (x, y) =>
      seq(
        5,
        (i) =>
          `<ellipse cx="${x + (i % 2) * 3 - 1}" cy="${y - 6 - i * 11}" rx="${20 - i * 3.4}" ry="7" fill="${lite(rock, 0.12 + i * 0.07)}" ${ol}/>`,
      );
    return {
      bg: ['#1a1450', mix(c, '#6a3f8a', 0.45), c, lite(mix(c, a, 0.7), 0.05)],
      fl: [mix(c, '#b0a8d8', 0.6), dark(c, 0.7)],
      strip: mix(c, '#c9cff5', 0.42),
      line: '#ffffff',
      kind: 'rough',
      back: `${stars(16, 40, 0, 0, W, 120)}${glow(600, 286, 260)}${cloud(250, 86, 1.6, a, 0.25)}${cloud(640, 120, 1.9, a, 0.22)}${peak(300, 150, 260, mix(c, '#8a70b0', 0.5))}${peak(560, 180, 300, mix(c, '#8a70b0', 0.5))}${peak(422, 110, 240, mix(c, '#6a5aa0', 0.5))}${peak(130, 236, 300, mix(c, '#5a4a90', 0.55))}${peak(716, 214, 290, mix(c, '#5a4a90', 0.55))}${peak(838, 150, 180, mix(c, '#4a3a80', 0.6))}${peak(-6, 140, 170, mix(c, '#4a3a80', 0.6))}${wind(96, 0.4)}${wind(176, 0.3)}${scaly(28, 196, 96, 104)}${scaly(820, 180, 100, 120)}${scaly(196, 262, 50, 38)}${scaly(660, 256, 54, 44)}${cairn(30, 198)}${cairn(818, 182)}${cairn(196, 264)}`,
      front: seq(26, (i) =>
        circ((i * 151) % W, 56 + ((i * 89) % 240), 1.4 + (i % 3) * 0.7, '#ffffff', 'opacity=".7"'),
      ),
    };
  },
  ramparts(c, a) {
    const body = mix('#0f1a4a', c, 0.25);
    const roof = mix('#1f3478', c, 0.4);
    const stone = mix('#56689e', c, 0.3);
    return {
      bg: ['#050d3a', mix('#1c4590', c, 0.3), mix('#6aa0d8', c, 0.35)],
      fl: [mix('#3f5290', c, 0.3), '#141a40'],
      strip: mix('#2a3a80', c, 0.45),
      back: `${stars(17, 90, 0, 0, W, 210)}${cloud(310, 150, 1.3, '#cfe0ff', 0.22)}${cloud(620, 112, 1.4, '#cfe0ff', 0.22)}${moon(690, 112, 30)}${ridge(18, 250, 44, '#12235e', 6, 0.85)}${tower(1, 86, 44, 120, 60, body, roof)}${tower(2, 150, 34, 160, 44, body, roof)}${tower(3, 42, 30, 176, 38, body, roof)}${tower(4, 742, 46, 150, 62, body, roof)}${tower(5, 800, 32, 176, 44, body, roof)}${P(`M0 300V244${seq(15, (i) => `H${12 + i * 58}V222H${46 + i * 58}V244`)}H844V300z`, `url(#${gid}-wall)`, 5)}${bricks(19, 248, 300, 18, '#0a1030', 0.4, 54)}${L('M0 248H844', '#a8ccff', 3, 'opacity=".55"')}${flag(186, 244, a)}${flag(600, 244, '#5a6fe0')}${flag(322, 244, '#2f8fa0', 140)}`,
      front: `${F('M300 390L470 300H560L600 390z', '#a8ccff', 'opacity=".1"')}${torch(24, 214)}${torch(820, 214)}`,
      defs: lin('wall', [stone, mix('#232c5e', c, 0.3)]),
    };
  },
  dragon(c, a) {
    const rock = dark(c, 0.55);
    const fall = (x, w) =>
      `${glow(x, 180, 110)}${P(`M${x - w * 0.3} 92Q${x - w * 0.2} 190 ${x - w * 0.75} 272H${x + w * 0.75}Q${x + w * 0.2} 190 ${x + w * 0.3} 92z`, '#ff7a1a')}${L(`M${x - 3} 104Q${x - 6} 190 ${x - 2} 262M${x + 5} 130V230`, '#ffe681', 3)}`;
    const ribs = (x, f) =>
      at(
        x,
        300,
        1,
        seq(
          4,
          (i) =>
            `${L(`M${i * 17} 0Q${i * 17 - 6} ${-70 - i * 16} ${i * 17 + 34} ${-96 - i * 16}`, K, 11)}${L(`M${i * 17} 0Q${i * 17 - 6} ${-70 - i * 16} ${i * 17 + 34} ${-96 - i * 16}`, '#e9dfc9', 6)}`,
        ),
        0,
        f,
      );
    return {
      bg: ['#090518', dark(c, 0.62), dark(c, 0.3)],
      fl: [dark(c, 0.55), '#0b0618'],
      strip: '#2a0f1c',
      line: '#ff9a3d',
      kind: 'rough',
      back: `${ridge(71, 280, 190, rock, 5, 0.9)}${P('M300 300Q310 170 422 160Q534 170 544 300z', '#07040f')}${circ(396, 214, 5, a)}${circ(448, 214, 5, a)}${glow(422, 214, 60)}${mir(`${P('M0 0H130Q120 60 100 96H40Q30 180 0 210z', dark(c, 0.42))}${fall(70, 34)}`)}${spikes(72, 11, 150, dark(c, 0.5))}${spikes(73, 17, 90, dark(c, 0.75))}${glow(422, 296, 340)}${P('M0 300V272Q110 258 210 270T422 266T640 272T844 262V300z', '#ff7a1a')}${L('M20 284q60-10 120 0M260 280q70-8 130 2M500 286q60-10 130-2M700 278q60-6 120 2', '#ffe681', 3)}${ribs(150, 1)}${ribs(694, -1)}${P('M400 300Q390 280 404 268L384 240L414 258Q428 254 442 258L472 240L452 268Q466 280 456 300L440 292H416z', '#e9dfc9')}${circ(416, 280, 4.5, K)}${circ(440, 280, 4.5, K)}`,
      front: `${L('M60 320l50 8 40-10M230 328l60-6 50 10 70-8M560 322l60 10 50-8M740 326l60-8', '#ff6a1a', 5, 'opacity=".5"')}${L('M60 320l50 8 40-10M230 328l60-6 50 10 70-8M560 322l60 10 50-8M740 326l60-8', '#ffd27a', 2)}${seq(18, (i) => circ(10 + ((i * 223) % 820), 70 + ((i * 101) % 200), 1.4 + (i % 3) * 0.8, '#ffb347', 'opacity=".75"'))}`,
    };
  },
  castle(c) {
    const win = (x, stain) =>
      `${L(gothic(x, 56, 44, 246), '#5d52a0', 18)}${stain ? glow(x, 150, 130, 'acc') : ''}${F(gothic(x, 56, 44, 246), `url(#${gid}-${stain ? 'stain' : 'sky'})`)}${stain ? `${L(`M${x - 56} 110L${x + 56} 222M${x + 56} 110L${x - 56} 222M${x - 56} 160L${x + 20} 246M${x + 56} 160L${x - 20} 246M${x - 30} 70L${x + 56} 150M${x + 30} 70L${x - 56} 150`, K, 2.5, 'opacity=".7"')}${star5(x, 150, 20, '#fff3a6')}` : `${stars(190 + x, 14, x - 46, 100, 92, 140)}${moon(x, 158, 17)}`}${L(`M${x} 50V246M${x - 56} 181H${x + 56}M${x - 56} 128Q${x} 78 ${x + 56} 128`, '#17123a', 5)}${L(gothic(x, 56, 44, 246), '#17123a', 7)}${P(`M${x - 68} 246H${x + 68}V256H${x - 68}z`, '#6a5fb0', 4)}`;
    return {
      bg: [mix('#3d3478', c, 0.25), mix('#2a2259', c, 0.2)],
      fl: ['#4a3a86', '#231848'],
      strip: '#5a2494',
      line: '#ffd23e',
      back: `${bricks(91, 22, 268, 27)}${win(123, true)}${win(422, false)}${banner(272, '#2f9a62')}${banner(572, '#8a4be0')}${glow(721, 150, 150)}${P('M648 300V60Q721 30 794 60V300z', '#7a1f4a', 4)}${L('M672 66V300M698 54V300M744 54V300M770 66V300', '#4a0f30', 3, 'opacity=".6"')}${L('M648 60Q721 30 794 60', '#ffd23e', 5)}${P('M686 300V128L700 104L712 122L721 92L730 122L742 104L756 128V300z', '#ffc24a', 4)}${P('M698 300V146Q721 126 744 146V300z', '#a02c5a')}${star5(721, 116, 9, '#fff3a6')}${circ(721, 172, 9, '#ffd23e', ol)}${P('M672 300V214H690V300zM752 300V214H770V300z', '#ffc24a')}${circ(681, 212, 8, '#ffe681', ol)}${circ(761, 212, 8, '#ffe681', ol)}${rect(0, 268, W, 32, '#241c4f')}${L('M0 268H844', '#6a5fb0', 6)}${L('M0 272H844', '#17123a', 3)}${P('M640 300V284H802V300z', '#8a6fd0')}${seq(4, (i) => P(`M${i * 211} 0Q${i * 211 + 105.5} 46 ${(i + 1) * 211} 0`, '#1c1645', 5))}`,
      front: `${torch(24, 136)}${torch(820, 136)}${torch(347, 136)}${torch(497, 136)}${torch(204, 136)}${torch(640, 136)}`,
      defs: `${lin('sky', ['#16205f', '#3f55b8', '#7b6fd0'])}${lin('stain', ['#e0457a', '#ffb347', '#ffe681', '#4fd08a', '#4f8fe0', '#8a4be0'], 'x2="1" y2="1"')}`,
    };
  },
};

export function sceneSVG(index) {
  const e = ENEMIES[Math.max(0, Math.min(19, index))];
  gid = `scene-${e.index}`;
  const s = SCENES[e.scene](e.color, e.accent);
  const defs = `${rad('fire', '#fff3a6', '#ffb347')}${rad('acc', lite(e.accent, 0.5), e.accent, 0.85, 0.4)}${rad('moon', '#fff9e0', '#cfe0ff', 0.9, 0.35, 0.4)}<radialGradient id="${gid}-vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#0d0a20" stop-opacity="0"/><stop offset="1" stop-color="#0d0a20" stop-opacity=".7"/></radialGradient><linearGradient id="${gid}-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0a20" stop-opacity=".8"/><stop offset="1" stop-color="#0d0a20" stop-opacity="0"/></linearGradient>${lin('bg', s.bg)}${lin('fl', s.fl)}${s.defs || ''}`;
  return `<svg class="battle-scenery" viewBox="0 0 844 390" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-scene="${e.scene}"><defs>${defs}</defs>${rect(0, 0, W, 300, `url(#${gid}-bg)`)}${s.back}${floorBand(e.index + 1, s.kind || 'tile', s.strip, s.line || e.accent)}${s.front}${rect(0, 0, W, 390, `url(#${gid}-vig)`)}${rect(0, 0, W, 70, `url(#${gid}-top)`)}</svg>`;
}
