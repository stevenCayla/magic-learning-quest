import { avatarColor, normalizeAvatar } from '../../domain/duel.js';
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const star = (x, y, r = 12, fill = '#ffe28b') =>
  `<path d="M${x} ${y - r}l${r * 0.28} ${r * 0.68} ${r * 0.72} ${r * 0.32}-${r * 0.72} ${r * 0.28}-${r * 0.28} ${r * 0.72}-${r * 0.32}-${r * 0.72}-${r * 0.68}-${r * 0.28} ${r * 0.68}-${r * 0.32}z" fill="${fill}"/>`;
function hatSVG(kind, color, accent, prefix) {
  const shadow = `url(#${prefix}-cloth)`;
  const base = `<path d="M66 113q80-34 151 0l13 15q-91 25-178 0z" fill="${color}" stroke-width="6"/>`;
  if (kind === 'hood')
    return `<path d="M58 144Q44 15 140 26q95-6 88 122l-31-17q-55-116-106 0z" fill="${shadow}"/><path d="M68 137q68-131 145 0" fill="none" stroke="${accent}" stroke-width="8"/>`;
  if (['crown', 'horned-crown', 'keys'].includes(kind))
    return `<path d="m72 101-4-60 38 28 34-42 31 42 38-29-4 61z" fill="${color}"/><path d="M74 91h131v22H74z" fill="${accent}"/>${[88, 140, 192].map((x) => star(x, 78, 8, accent)).join('')}${kind === 'horned-crown' ? '<path d="M80 57 49 12l11 61m139-14 29-47-7 63" fill="#e3bd8a"/>' : ''}${kind === 'keys' ? '<path d="M78 36v-24m-8 0h16m48 10V2m-8 0h16m54 34V12m-8 0h16" stroke="#f9d989" stroke-width="9"/>' : ''}`;
  if (kind === 'antlers')
    return `<path d="M82 102Q55 69 72 24m0 36L43 37m32 7 19-25M188 102q30-34 13-78m0 36 29-23m-32 7-19-25" fill="none" stroke="#b3936a" stroke-width="13"/>${base}<path d="M80 109q62-66 120 0" fill="${shadow}"/>`;
  if (kind === 'square')
    return `<path d="m66 97 5-66 126 0 12 66z" fill="${shadow}"/><path d="m42 31 100-23 96 23-95 25z" fill="${color}"/><path d="M219 33v52" stroke="${accent}" stroke-width="6"/>${base}`;
  if (kind === 'moon')
    return `<path d="M78 111Q79 6 161 7q-45 28 18 55l24 48z" fill="${shadow}"/>${base}<path d="M143 45q-26 28 10 32-20 17-32-4-9-20 22-28" fill="${accent}" stroke="none"/>`;
  if (kind === 'flask')
    return `${base}<path d="M95 109 87 80l29-40V12h40v28l32 40-8 29z" fill="${shadow}"/><path d="M101 79h71l-8 22h-50z" fill="${accent}" stroke="none"/><circle cx="136" cy="62" r="7" fill="${accent}"/>`;
  if (kind === 'stone')
    return `<path d="m62 114 8-57 30-28 46 9 28-15 41 45-7 48z" fill="${shadow}"/><path d="m99 30 17 48-18 34m74-86-24 54 29 36" fill="none" stroke="${accent}" stroke-width="4"/>`;
  const extras = {
    feather: '<path d="M159 66q17-96 55-59 4 36-55 59m22-17 14-29" fill="#e8c1ad"/>',
    gears:
      '<g fill="#e5c27a"><circle cx="129" cy="72" r="22"/><path d="M125 40h9v64h-9m-29-36h65v9H96"/></g>',
    cloud:
      '<path d="M74 69q-36-30 3-51 16-29 49-12 36-26 57 8 38-5 35 31 14 31-32 25z" fill="#b6c7dd"/>',
    flame:
      '<path d="M108 96q-53-23-14-62 1 26 20 19L144 3q46 45 23 67l30-18q14 47-32 55z" fill="#ffba62"/>',
    crystal:
      '<path d="m96 89-6-50 20-22 23 21-2 51m6 0 12-73 25-12 15 33-21 59m9 2 22-42 24-4 3 28-29 35" fill="#b5f6ed"/>',
    horns:
      '<path d="M90 76Q35 65 51 13q13 35 52 32m77 31q55-11 39-63-13 35-52 32" fill="#d1b3d4"/>',
    scales:
      '<path d="m81 95-20-27 25-2-9-25 30 10 5-29 26 24 22-27 11 31 33-12-9 31 31 9-25 20z" fill="#b88d74"/>',
  };
  const pointed = ['feather', 'gears', 'stars', 'pointed'].includes(kind)
    ? `<path d="M76 109 118 12q9-16 22-4l18 28 36 12-25 17 34 46z" fill="${shadow}"/><path d="M87 88 186 83l8 18-116 8z" fill="${accent}"/>${star(133, 57, 13, accent)}`
    : '';
  return `${pointed}${extras[kind] ?? ''}${base}`;
}
export function wizardSVG({ avatar, enemy, prefix = 'mage' } = {}) {
  const player = !enemy;
  const a = normalizeAvatar(avatar, Number.MAX_SAFE_INTEGER);
  const color = enemy?.color ?? avatarColor(a, 'robe'),
    accent = enemy?.accent ?? avatarColor(a, 'wand');
  const skin = player
    ? avatarColor(a, 'skin')
    : enemy.feature === 'jaw'
      ? '#a0a5b2'
      : enemy.feature === 'vines'
        ? '#c1ba8b'
        : '#d4b5a1';
  const hair = player
    ? avatarColor(a, 'hair')
    : ['longbeard', 'moustache'].includes(enemy.feature)
      ? '#c4b2c9'
      : '#372e48';
  const hat = enemy?.hat ?? a.hat,
    feature = enemy?.feature ?? a.face;
  const extraHair =
    player && a.style === 'braids'
      ? '<path d="M82 128v96m117-96v96" stroke-width="17" fill="none"/>'
      : player && a.style === 'long'
        ? '<path d="M76 99q-15 68 13 111l21-58m84-51q25 69 1 108l-24-55"/>'
        : player && a.style === 'curls'
          ? Array.from(
              { length: 7 },
              (_, i) => `<circle cx="${76 + i * 21}" cy="${103 - Math.sin(i) * 8}" r="17"/>`,
            ).join('')
          : '';
  const face = player
    ? `<path d="M103 147q6-12 15 0m43 0q7-12 15 0" fill="none" stroke-width="5"/><ellipse cx="111" cy="155" rx="6" ry="10" fill="#30213e"/><ellipse cx="169" cy="155" rx="6" ry="10" fill="#30213e"/><circle cx="113" cy="151" r="2.5" fill="white" stroke="none"/><circle cx="171" cy="151" r="2.5" fill="white" stroke="none"/><path d="M122 177q17 26 36 0z" fill="#702b3b" stroke-width="3"/><path d="M130 179h20" stroke="white" stroke-width="5"/>${feature === 'freckles' ? '<g fill="#b76f5e" stroke="none"><circle cx="97" cy="170" r="2"/><circle cx="105" cy="174" r="2"/><circle cx="176" cy="173" r="2"/><circle cx="185" cy="169" r="2"/></g>' : ''}`
    : `<path d="m99 140 27 10m30 0 25-13" fill="none" stroke-width="8"/><path d="M101 154h22m35-1h22" stroke="${accent}" stroke-width="6"/><path d="m141 155-8 17h16" fill="none" stroke-width="3"/><path d="M120 186q25-20 47-1" fill="none" stroke-width="4"/>`;
  const faceFeature =
    {
      glasses:
        '<g fill="none" stroke="#b5964d" stroke-width="5"><circle cx="110" cy="155" r="19"/><circle cx="170" cy="155" r="19"/><path d="M129 154h22"/></g>',
      goggles:
        '<g fill="#6d756a" stroke="#d9c27b" stroke-width="5"><rect x="89" y="139" width="42" height="31" rx="8"/><rect x="150" y="139" width="42" height="31" rx="8"/><path d="M132 153h18"/></g>',
      monocle:
        '<circle cx="170" cy="155" r="21" fill="none" stroke="#efcc6e" stroke-width="6"/><path d="M190 159v43" fill="none" stroke="#efcc6e" stroke-width="3"/>',
      mask: '<path d="M93 172q45-15 94 0l-18 28h-58z" fill="#6b7190"/>',
      beak: '<path d="m123 162 15-13 22 32-22-6z" fill="#e0ab69"/>',
      visor:
        '<path d="m87 137 104-6-5 36-96 4z" fill="#51446b"/><path d="m98 152 27 1m28-2h24" stroke="#eac9ff" stroke-width="5"/>',
      moustache:
        '<path d="M138 180q-19-20-32 4-8 14-18 2 4 32 49 7 46 24 54-7-14 12-23-4-17-18-30-2" fill="#b9a0a3"/>',
      longbeard:
        '<path d="M94 179q49 35 91 0l-14 71-30 23-32-28z" fill="#c3bbd9"/><path d="m129 199 8 47m17-49-3 41" stroke="#8c7d9c" stroke-width="3"/>',
      'third-eye': '<path d="m126 125 13-11 16 11-15 10z" fill="#f5d686"/>',
      tears: '<path d="m108 166-12 18m72-18 15 17" stroke="#7de5ef" stroke-width="5"/>',
      fangs: '<path d="m124 186 4 14 7-13m17-1 6 14 3-16" fill="#f8edcf" stroke-width="2"/>',
      vines:
        '<path d="M90 181q-28-17-16-38m121 39q30-21 16-40" fill="none" stroke="#62865b" stroke-width="7"/>',
      jaw: '<path d="m100 182 16 25 42 0 22-25" fill="#858b9a"/>',
      embers: '<path d="m97 170 11 6m65-7-12 8" stroke="#f6ac61" stroke-width="5"/>',
      crescent:
        '<path d="M143 117q-12 15 8 15-14 14-21 0-3-11 13-15" fill="#f6deae" stroke="none"/>',
      facets:
        '<path d="m102 172 12 10-15 13m76-23-14 10 16 12" stroke="#7ac3d8" fill="none" stroke-width="4"/>',
    }[feature] ?? '';
  return `<svg class="wizard-art" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${prefix}-cloth" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#282344"/></linearGradient></defs><g stroke="#221d35" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="142" cy="355" rx="85" ry="14" fill="#100d24" opacity=".3" stroke="none"/><path d="M98 211Q37 251 46 323l61-13 86 14 39-8q-7-79-64-111z" fill="url(#${prefix}-cloth)"/><path d="m106 306-11 42-24 2-4 13h65l2-52m26 0 5 51h63l-8-15-24-2-10-38" fill="#4b3343"/><path d="m98 211-19 104q64 22 125 0l-34-104z" fill="${color}"/><path d="M126 213v104l18 10 15-10-6-104" fill="${accent}" stroke-width="3"/><path d="M86 286q58 16 110 0l4 16q-58 17-114 0z" fill="#554034"/><rect x="133" y="288" width="24" height="21" rx="3" fill="${accent}"/>${star(141, 248, 15, accent)}<path d="M101 216q-47 15-42 53l29 9 31-44" fill="${color}"/><path d="M62 263q-20-7-19 9l10 15q20 7 27-9" fill="${skin}"/><g class="wand-arm"><path d="M165 218q27 25 55-22l-18-19q-20 33-38 22" fill="${color}"/><path d="M202 180q-3-23 11-22l13 8q16 0 11 15l-17 18z" fill="${skin}"/><path d="m220 174 39-74" stroke="#493447" stroke-width="9"/><path d="m222 166 33-62" stroke="${accent}" stroke-width="3"/><g data-wand-tip transform="translate(260 97)">${star(0, 0, 13, accent)}<circle r="5" fill="white" stroke="none"/></g></g><g fill="${hair}">${extraHair}</g><path class="hit-target" d="M88 116q-17 67 13 82 38 25 77 2 36-24 17-83z" fill="${skin}"/><path d="M85 130q25 4 39-25l12 26 18-21 37 29-1-43H88z" fill="${hair}"/>${face}${faceFeature}${hatSVG(hat, color, accent, prefix)}<path d="M105 211q34 24 66 0l-12 22-20-12-21 12z" fill="${accent}" stroke-width="3"/></g></svg>`;
}
export function dragonSVG(enemy, prefix = 'dragon') {
  return `<svg class="dragon-art" viewBox="0 0 340 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${prefix}-dragon" x2="1" y2="1"><stop stop-color="${enemy.color}"/><stop offset="1" stop-color="#25213c"/></linearGradient></defs><g stroke="#241b35" stroke-width="6" stroke-linejoin="round"><ellipse cx="162" cy="372" rx="116" ry="16" fill="#100b20" opacity=".4" stroke="none"/><path d="M147 212Q46 92 15 173l13 125 37-44 28 53 36-54m65-42q101-121 132-38l-12 126-38-45-29 52-30-51" fill="${enemy.color}"/><path d="m29 180 90 59-56 15m247-74-91 59 57 15" fill="none" stroke="${enemy.accent}" stroke-width="4"/><path d="M201 320q88-8 112-58 21 100-97 100" fill="url(#${prefix}-dragon)"/><path d="M118 197q-62 96-26 156l-22 15 71-2 25-23 27 23 72-1-21-17q20-107-45-155z" fill="url(#${prefix}-dragon)"/><path d="M146 211q-33 74-18 111 39 32 70 0 12-72-22-112z" fill="${enemy.accent}"/><path d="M133 264h55m-58 30h64" stroke="#6b5a63" stroke-width="4"/><path d="m97 117-22-56 47 31m77 6 40-36-16 64" fill="#e4c292"/><path class="hit-target" d="M88 114q60-73 129-8l-2 55 40 31-24 32-79-3-53-36z" fill="url(#${prefix}-dragon)"/><path d="m102 135 42 11m30-5 31-18" stroke="${enemy.accent}" stroke-width="9"/><path d="m105 195 26 15 79 0" fill="none"/><path d="m121 204 9 20 12-14m41 1 12 16 6-19" fill="#fff0ca" stroke-width="3"/><g class="wand-arm"><path d="M105 236 65 256l-14-17-13 20 27 28 60-20" fill="${enemy.color}"/><circle data-wand-tip cx="45" cy="250" r="9" fill="${enemy.accent}"/></g><path d="m123 100 12-31 22 17 21-28 15 39" fill="${enemy.accent}"/></g></svg>`;
}
export function princessSVG() {
  return `<svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" aria-label="Princesse Aélis délivrée" role="img"><g stroke="#36263f" stroke-width="4" stroke-linejoin="round"><path d="M55 86q-21-71 34-73 56-3 37 76" fill="#65412f"/><path d="m72 105-39 109q59 29 115-1L108 105" fill="#f3c17d"/><path d="m85 111-14 103h41L99 111" fill="#d98ab8"/><path d="M57 49q-6 53 31 55 38-2 37-55" fill="#e7ac83"/><path d="M61 45q30 3 40-22 10 25 25 26" fill="#65412f"/><path d="m62 31-3-25 20 13L91 2l12 17 23-14-6 26z" fill="#ffe192"/><path d="M73 65h3m28 0h3m-25 17q9 8 17-1" fill="none" stroke-linecap="round"/></g></svg>`;
}
