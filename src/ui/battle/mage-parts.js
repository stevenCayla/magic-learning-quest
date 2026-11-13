// Interchangeable parts of the wizard puppet, drawn in head coordinates
// (eyes at 172 and 228 × 208, hat brim around y 146).
export const INK = '#2b1430';
export const star = (cx, cy, R, rot = -90, k = 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = ((rot + i * 36) * Math.PI) / 180,
      q = i % 2 ? R * k : R;
    return `${(cx + q * Math.cos(a)).toFixed(1)},${(cy + q * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
const BONE = '#e6d3a8';
// A line with a dark outline, for thin shapes such as antlers, keys or rims.
const piped = (d, color, width = 7) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${width + 7}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;

const brim = (c) =>
  `<ellipse cx="196" cy="146" rx="128" ry="34" transform="rotate(-8 196 146)" fill="${c.url('hat')}"/><path d="M88 150Q120 130 196 122Q260 120 300 128" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".7"/>`;
const cone = (c) =>
  `<path d="M130 136Q146 70 188 40Q232 12 272 24Q296 34 290 56Q270 42 246 50Q238 52 232 60Q252 92 262 124Q200 112 130 136z" fill="${c.url('hat')}"/><path d="M150 104Q164 66 196 46" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".75"/>`;
const band = (c) =>
  `<path d="M132 134Q198 108 262 122L264 138Q198 124 136 150z" fill="${c.url('trim')}" stroke-width="4.5"/>`;
const dome = (c, top = 84) =>
  `<path d="M128 154Q124 ${top + 6} 200 ${top}Q276 ${top + 6} 272 150Q200 130 128 154z" fill="${c.url('hat')}"/><path d="M146 126Q156 ${top + 18} 196 ${top + 12}" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".7"/>`;
const hatStars = (c, list) =>
  `<g fill="${c.url('trim')}" stroke-width="3">${list.map(([x, y, r, rot = -70]) => `<polygon points="${star(x, y, r, rot)}"/>`).join('')}</g>`;
const horns = () =>
  `<path d="M146 116Q92 104 94 44Q118 84 164 88z" fill="${BONE}"/><path d="M254 112Q308 100 306 40Q282 80 236 84z" fill="${BONE}"/><path d="M104 62q14 22 38 30M296 58q-14 22-38 30" fill="none" stroke="#b79c6c" stroke-width="3.5" opacity=".8"/>`;
const crown = (c, tall = 0) =>
  `<path d="M138 152L128 ${84 - tall}L168 118L200 ${70 - tall}L232 118L272 ${84 - tall}L262 152Q200 134 138 152z" fill="${c.url('trim')}"/><path d="M139 150Q200 132 261 150L260 134Q200 118 140 134z" fill="${c.trimD}" stroke-width="4"/><circle cx="200" cy="${104 - tall / 2}" r="9" fill="${c.glow}" stroke-width="3.5"/><circle cx="160" cy="126" r="6" fill="${c.core}" stroke-width="3"/><circle cx="240" cy="126" r="6" fill="${c.core}" stroke-width="3"/>`;

const HATS = {
  pointed: (c) =>
    `${brim(c)}${cone(c)}${band(c)}${hatStars(c, [
      [180, 82, 12.5],
      [213, 63, 10],
      [222, 100, 8],
    ])}<circle cx="288" cy="62" r="7" fill="${c.url('trim')}" stroke-width="3.5"/><polygon points="${star(288, 84, 14.5, -75)}" fill="${c.url('trim')}" stroke-width="4"/>`,
  moon: (c) =>
    `${brim(c)}${cone(c)}${band(c)}<path d="M204 56a24 24 0 1 0 22 36a19 19 0 1 1-22-36z" fill="${c.url('trim')}" stroke-width="4"/><circle cx="288" cy="62" r="8" fill="${c.core}" stroke-width="3.5"/>${hatStars(c, [[168, 100, 7]])}`,
  hood: (c) =>
    `<path d="M150 104Q118 58 92 86Q122 88 136 122z" fill="${c.url('hat')}"/><path d="M112 262Q84 100 200 78Q316 100 288 262Q292 150 200 136Q108 150 112 262z" fill="${c.url('hat')}"/><path d="M120 244Q112 156 200 146Q288 156 280 244" fill="none" stroke="${c.trim}" stroke-width="5"/><path d="M130 130Q160 96 200 92" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".7"/>`,
  crown: (c) => crown(c),
  'horned-crown': (c) => `${horns()}${crown(c, 14)}`,
  antlers: (c) =>
    `${piped('M160 106Q138 70 148 30M152 66L122 46M149 46L168 24', BONE, 9)}${piped('M240 102Q262 66 252 26M248 62L278 42M251 42L232 20', BONE, 9)}${dome(c, 92)}<path d="M176 100q-14-22 6-36 16 16-6 36zM214 96q-2-26 22-30 6 22-22 30z" fill="${c.url('trim')}" stroke-width="3.5"/>`,
  feather: (c) =>
    `${brim(c)}${cone(c)}<path d="M240 122Q244 44 310 18Q322 76 266 130z" fill="${c.url('trim')}"/><path d="M250 120Q270 70 304 30M262 96l22-4M270 76l20-6" fill="none" stroke="${c.trimD}" stroke-width="3.5"/>${band(c)}`,
  square: (c) =>
    `${dome(c, 100)}<path d="M80 98L200 62L320 98L200 132z" fill="${c.url('hat')}"/><path d="M104 98L200 70L296 98" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".7"/><path d="M200 98Q268 100 290 116V150" fill="none" stroke="${c.trim}" stroke-width="5"/><path d="M282 148h16l4 26h-24z" fill="${c.url('trim')}" stroke-width="3.5"/><circle cx="200" cy="98" r="8" fill="${c.url('trim')}" stroke-width="3.5"/>`,
  flask: (c) =>
    `${brim(c)}<path d="M184 26H216V62L252 114Q258 130 240 132L160 136Q142 134 150 118L184 62z" fill="#d9f2ee"/><path d="M166 98Q200 108 238 96L252 114Q258 130 240 132L160 136Q142 134 150 118z" fill="${c.url('trim')}" stroke-width="3.5"/><circle cx="188" cy="118" r="6" fill="${c.core}" stroke-width="2.5"/><circle cx="216" cy="112" r="4" fill="${c.core}" stroke-width="2.5"/><circle cx="204" cy="82" r="5" fill="${c.trim}" stroke-width="2.5"/><rect x="178" y="12" width="44" height="18" rx="6" fill="#a0683a"/><path d="M192 40V58" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>${band(c)}`,
  stone: (c) =>
    `<path d="M122 158L130 98L164 62L212 70L246 48L282 100L278 152Q200 132 122 158z" fill="${c.url('hat')}"/><path d="M164 62L182 104L160 140M246 48L226 100L252 134M130 98L158 110" fill="none" stroke="${c.trim}" stroke-width="4.5"/><path d="M140 104L168 72" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".7"/>`,
  gears: (c) =>
    `${brim(c)}<path d="M146 132L150 46Q202 30 256 42L260 122Q200 110 146 132z" fill="${c.url('hat')}"/><path d="M162 116L164 60" fill="none" stroke="${c.hatHi}" stroke-width="4" opacity=".7"/>${band(c)}<g fill="${c.url('trim')}" stroke-width="3.5">${Array.from({ length: 8 }, (_, i) => `<rect x="204" y="48" width="12" height="16" rx="3" transform="rotate(${i * 45} 210 82)"/>`).join('')}<circle cx="210" cy="82" r="22"/><circle cx="210" cy="82" r="8" fill="${c.hatD}"/></g>`,
  cloud: (c) =>
    `${brim(c)}<path d="M136 132Q104 124 112 96Q112 70 144 72Q152 40 192 46Q218 22 248 48Q284 44 286 78Q308 92 290 118Q200 104 136 132z" fill="#e3ebf8"/><path d="M150 86Q168 62 194 66M214 56q20-10 34 6" fill="none" stroke="#fff" stroke-width="4" opacity=".9"/><path d="M210 58L186 98H204L190 128L228 84H208z" fill="${c.url('trim')}" stroke-width="3.5"/>`,
  flame: (c) =>
    `${brim(c)}<path d="M140 134Q116 92 150 64Q152 90 170 84Q160 40 206 12Q200 48 228 58Q240 40 236 24Q280 60 262 126Q200 110 140 134z" fill="${c.url('trim')}"/><path d="M174 124Q162 98 188 78Q190 98 206 90Q204 70 218 58Q242 90 232 120Q200 112 174 124z" fill="${c.core}" stroke="none" opacity=".85"/>${band(c)}`,
  stars: (c) =>
    `${brim(c)}${cone(c)}${band(c)}${hatStars(c, [
      [176, 86, 10],
      [206, 60, 8],
      [224, 96, 9],
      [240, 44, 6],
      [158, 112, 6],
    ])}<circle cx="288" cy="66" r="13" fill="${c.url('trim')}" stroke-width="3.5"/><ellipse cx="288" cy="66" rx="24" ry="7" transform="rotate(-20 288 66)" fill="none" stroke="${c.core}" stroke-width="3"/>`,
  crystal: (c) =>
    `${brim(c)}<path d="M148 132L158 52L186 34L206 122z" fill="${c.url('trim')}"/><path d="M196 122L214 18L246 44L242 120z" fill="${c.url('trim')}"/><path d="M236 120L262 60L284 76L264 124z" fill="${c.url('trim')}"/><path d="M186 34L180 120M214 18L222 116M262 60L256 118" fill="none" stroke="${c.core}" stroke-width="3" opacity=".9"/>${band(c)}`,
  horns: (c) =>
    `${horns()}${dome(c, 82)}<path d="M200 84V140" fill="none" stroke="${c.trim}" stroke-width="6"/><path d="M132 150Q200 130 268 148" fill="none" stroke="${c.trim}" stroke-width="6"/>`,
  keys: (c) =>
    `${[
      [164, 60],
      [200, 44],
      [236, 58],
    ]
      .map(
        ([x, y]) =>
          piped(`M${x} 118V${y + 12}M${x} ${y + 34}h12M${x} ${y + 48}h9`, c.trim, 6) +
          `<circle cx="${x}" cy="${y}" r="13" fill="${c.url('trim')}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="4.5" fill="${c.hatD}" stroke-width="3"/>`,
      )
      .join(
        '',
      )}<path d="M134 154L132 112Q200 94 268 110L266 150Q200 132 134 154z" fill="${c.url('hat')}"/><path d="M134 128Q200 108 267 126" fill="none" stroke="${c.trim}" stroke-width="6"/>`,
  scales: (c) =>
    `<path d="M150 100L138 58L170 86L176 42L200 80L226 38L232 84L264 56L252 102z" fill="${c.url('trim')}"/>${dome(c, 80)}<path d="M150 124q12-12 24 0 12-12 24 0 12-12 24 0 12-12 24 0M162 106q12-12 24 0 12-12 24 0 12-12 24 0" fill="none" stroke="${c.hatD}" stroke-width="3.5" opacity=".8"/>`,
};
export const hatArt = (c, kind) => (HATS[kind] ?? HATS.pointed)(c);

const moustache = (c) =>
  `<path d="M200 233Q184 220 166 231Q150 241 138 229Q142 254 168 252Q188 250 200 241Q212 250 232 252Q258 254 262 229Q250 241 234 231Q216 220 200 233z" fill="${c.url('hair')}" stroke-width="4.5"/><path d="M168 240q14 4 26-3M232 240q-14 4-26-3" fill="none" stroke="${c.hairD}" stroke-width="3" opacity=".7"/>`;
// Each feature may draw under the eyes and over the mouth.
const FEATURES = {
  moustache: {
    over: (c) =>
      `<path d="M168 256Q170 300 200 344Q230 300 232 256Q200 282 168 256z" fill="${c.url('hair')}" stroke-width="4.5"/><path d="M190 286Q194 310 200 326M210 286Q207 306 203 318" fill="none" stroke="${c.hairD}" stroke-width="3" opacity=".7"/>${moustache(c)}`,
  },
  handlebar: {
    over: (c) =>
      `<path d="M200 236Q178 222 156 238Q138 248 126 226Q118 262 160 258Q186 256 200 244Q214 256 240 258Q282 262 274 226Q262 248 244 238Q222 222 200 236z" fill="${c.url('hair')}" stroke-width="4.5"/>`,
  },
  longbeard: {
    over: (c) =>
      `<path d="M148 240Q140 330 200 400Q260 330 252 240Q200 280 148 240z" fill="${c.url('hair')}" stroke-width="4.5"/><path d="M176 290Q184 340 198 372M224 290Q218 334 208 360" fill="none" stroke="${c.hairD}" stroke-width="3.5" opacity=".7"/>${moustache(c)}`,
  },
  vines: {
    over: (c) =>
      `${piped('M142 262Q156 240 144 214M258 262Q244 240 256 214', '#4f9a5e', 5)}<path d="M150 236q-16-2-18-16 16 0 18 16zM250 236q16-2 18-16-16 0-18 16zM148 262q-14 6-24-4 12-10 24 4zM252 262q14 6 24-4-12-10-24 4z" fill="${c.trim}" stroke-width="3"/>`,
  },
  mask: {
    over: (c) =>
      `<path d="M138 232Q200 214 262 232Q262 280 200 296Q138 280 138 232z" fill="${c.url('cape')}" stroke-width="4.5"/><path d="M160 250Q200 262 240 250M170 270Q200 280 230 270" fill="none" stroke="${c.capeD}" stroke-width="3.5" opacity=".8"/><path d="M140 234Q200 216 260 234" fill="none" stroke="${c.trim}" stroke-width="4"/>`,
  },
  beak: {
    over: () =>
      '<path d="M182 216Q200 204 218 216L208 256Q200 266 192 256z" fill="#f0b451" stroke-width="4.5"/><path d="M192 224q8-5 16 0" fill="none" stroke="#b9772a" stroke-width="3"/>',
  },
  glasses: {
    over: (c) =>
      `<g fill="#cfe9ff" fill-opacity=".2" stroke-width="8"><rect x="148" y="190" width="46" height="38" rx="9"/><rect x="206" y="190" width="46" height="38" rx="9"/></g><g fill="none" stroke="${c.trim}" stroke-width="3.5"><rect x="148" y="190" width="46" height="38" rx="9"/><rect x="206" y="190" width="46" height="38" rx="9"/></g><path d="M194 206h12" fill="none" stroke-width="5"/>`,
  },
  crescent: {
    under: (c) =>
      `<path d="M198 148a15 15 0 1 0 14 22a12 12 0 1 1-14-22z" fill="${c.url('trim')}" stroke-width="3.5"/>`,
  },
  goggles: {
    over: (c) =>
      `<path d="M138 206H262" fill="none" stroke-width="14"/><path d="M138 206H262" fill="none" stroke="#7a4a22" stroke-width="7"/><g fill="#9fe8d2" stroke-width="5"><circle cx="172" cy="208" r="26"/><circle cx="228" cy="208" r="26"/></g><g fill="none" stroke="${c.trim}" stroke-width="5"><circle cx="172" cy="208" r="19"/><circle cx="228" cy="208" r="19"/></g><path d="M160 198q8-8 18-6M216 198q8-8 18-6" fill="none" stroke="#fff" stroke-width="4" opacity=".9"/>`,
  },
  jaw: {
    over: (c) =>
      `<path d="M146 240L160 286H240L254 240L228 254H172z" fill="${c.skinD}" stroke-width="4.5"/><path d="M176 254l6-18 8 18M210 254l8-18 6 18" fill="#fffdf6" stroke-width="3"/><path d="M164 272h72" fill="none" stroke="${c.trim}" stroke-width="4"/>`,
  },
  tears: {
    over: () =>
      '<path d="M166 234q9 15 0 24-9-9 0-24zM234 234q9 15 0 24-9-9 0-24z" fill="#9fe3ff" stroke-width="3"/>',
  },
  monocle: {
    over: (c) =>
      `<circle cx="228" cy="208" r="27" fill="#cfe9ff" fill-opacity=".2" stroke-width="8"/><circle cx="228" cy="208" r="27" fill="none" stroke="${c.trim}" stroke-width="4"/><path d="M252 222Q270 250 262 286" fill="none" stroke="${c.trim}" stroke-width="3"/>`,
  },
  embers: {
    under: () =>
      '<path d="M146 230l18 9M254 230l-18 9M150 246l13 4M250 246l-13 4" fill="none" stroke="#ff9d3c" stroke-width="5" stroke-linecap="round"/>',
  },
  'third-eye': {
    under: (c) =>
      `<ellipse cx="200" cy="162" rx="15" ry="10" fill="#fffdf6" stroke-width="4"/><circle cx="200" cy="162" r="6.5" fill="${c.iris}" stroke-width="2.5"/><circle cx="202" cy="160" r="2" fill="#fff" stroke="none"/>`,
  },
  facets: {
    under: (c) =>
      `<path d="M142 232L164 248L148 270M258 232L236 248L252 270M186 150L200 166L214 150" fill="none" stroke="${c.trim}" stroke-width="4"/>`,
  },
  visor: {
    over: (c) =>
      `<path d="M136 184L264 178L260 230L140 234z" fill="${c.url('cape')}" stroke-width="4.5"/><path d="M154 208L190 205M210 204L246 201" fill="none" stroke="${c.core}" stroke-width="8" stroke-linecap="round"/><path d="M154 208L190 205M210 204L246 201" fill="none" stroke="${c.trim}" stroke-width="3" stroke-linecap="round"/>`,
  },
  fangs: {
    over: () => '<path d="M182 256l6 16 7-14M205 258l7 14 6-16" fill="#fffdf6" stroke-width="3"/>',
  },
};
export const featureArt = (c, kind, layer, pose) => FEATURES[kind]?.[layer]?.(c, pose) ?? '';

// Wand tips are drawn around the origin; R is the outer radius.
const TIPS = {
  star: (c, R) =>
    `<polygon points="${star(0, 0, R)}" fill="${c.tipFill ?? c.url('trim')}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><polygon points="${star(0, 0, R * 0.54)}" fill="${c.core}"/>`,
  crystal: (c, R) =>
    `<path d="M0-${R * 1.2}L${R * 0.72} 0L0 ${R * 1.2}L-${R * 0.72} 0z" fill="${c.glow}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M0-${R * 1.2}L${R * 0.2} 0L0 ${R * 1.2}M-${R * 0.72} 0H${R * 0.72}" fill="none" stroke="${c.core}" stroke-width="2.5" opacity=".9"/>`,
  leaf: (c, R) =>
    `<path d="M0-${R * 1.2}Q${R * 1.1}-${R * 0.2} 0 ${R * 1.1}Q-${R * 1.1}-${R * 0.2} 0-${R * 1.2}z" fill="${c.glow}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M0-${R * 0.8}V${R * 0.8}M0-${R * 0.2}l${R * 0.4}-${R * 0.3}M0 ${R * 0.2}l-${R * 0.4}-${R * 0.3}" fill="none" stroke="${c.core}" stroke-width="2.5"/>`,
  sun: (c, R) =>
    `<path d="${Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4,
        p = (r, d) => `${(r * Math.cos(a + d)).toFixed(1)} ${(r * Math.sin(a + d)).toFixed(1)}`;
      return `M${p(R * 0.6, -0.24)}L${p(R * 1.25, 0)}L${p(R * 0.6, 0.24)}z`;
    }).join(
      '',
    )}" fill="${c.glow}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle r="${R * 0.66}" fill="${c.glow}" stroke="${INK}" stroke-width="5"/><circle r="${R * 0.36}" fill="${c.core}"/>`,
  orb: (c, R) =>
    `<circle r="${R * 0.82}" fill="${c.tipFill ?? c.glow}" stroke="${INK}" stroke-width="5"/><path d="M-${R * 0.44}-${R * 0.2}q${R * 0.14}-${R * 0.34} ${R * 0.5}-${R * 0.4}" fill="none" stroke="${c.core}" stroke-width="4" stroke-linecap="round"/>`,
  flame: (c, R) =>
    `<path d="M0-${R * 1.35}Q${R * 0.3}-${R * 0.6} ${R * 0.8}-${R * 0.3}Q${R * 1.1} ${R * 0.9} 0 ${R}Q-${R * 1.1} ${R * 0.9}-${R * 0.8}-${R * 0.1}Q-${R * 0.3}-${R * 0.3} 0-${R * 1.35}z" fill="${c.tipFill ?? c.glow}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M0-${R * 0.3}Q${R * 0.5} ${R * 0.3} 0 ${R * 0.7}Q-${R * 0.5} ${R * 0.3} 0-${R * 0.3}z" fill="${c.core}"/>`,
  bolt: (c, R) =>
    `<path d="M${R * 0.3}-${R * 1.3}L-${R * 0.7} ${R * 0.1}H-${R * 0.05}L-${R * 0.4} ${R * 1.3}L${R * 0.8}-${R * 0.25}H${R * 0.1}z" fill="${c.tipFill ?? c.glow}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
  gear: (c, R) =>
    `<g fill="${c.tipFill ?? c.glow}" stroke="${INK}" stroke-width="4">${Array.from({ length: 8 }, (_, i) => `<rect x="-${R * 0.2}" y="-${R * 1.12}" width="${R * 0.4}" height="${R * 0.5}" rx="2" transform="rotate(${i * 45})"/>`).join('')}<circle r="${R * 0.72}"/></g><circle r="${R * 0.3}" fill="${c.core}" stroke="${INK}" stroke-width="3"/>`,
};
export const tipArt = (c, kind, R = 26) => (TIPS[kind] ?? TIPS.star)(c, R);
