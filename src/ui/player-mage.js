import { avatarColor } from '../domain/duel.js';
// The creation preview and the actual fighter share the same customizable drawing.
export function playerMageSVG({ avatar, prefix, hat }) {
  const skin = avatarColor(avatar, 'skin'),
    hair = avatarColor(avatar, 'hair'),
    robe = avatarColor(avatar, 'robe'),
    gold = avatarColor(avatar, 'wand');
  const braids = ['braids', 'long'].includes(avatar.style)
    ? `<g fill="url(#${prefix}-hair)">${[83, 198].map((x, j) => (avatar.style === 'braids' ? Array.from({ length: 6 }, (_, i) => `<ellipse cx="${x + (j ? -1 : 1) * Math.sin(i) * 5}" cy="${152 + i * 13}" rx="12" ry="13"/>`).join('') + `<path d="m${x - 10} 224 20 0-4 9-12 0z" fill="${gold}"/>` : `<path d="M${x - 10} 115q-25 77 4 119l20-26q-7-42 0-86z"/>`)).join('')}</g>`
    : '';
  const curls =
    avatar.style === 'curls'
      ? `<g fill="${hair}">${Array.from({ length: 7 }, (_, i) => `<circle cx="${82 + i * 19}" cy="${119 - Math.sin(i) * 10}" r="18"/>`).join('')}</g>`
      : '';
  const freckles =
    avatar.face === 'freckles'
      ? '<g fill="#b96958" stroke="none"><circle cx="100" cy="173" r="2"/><circle cx="108" cy="177" r="2"/><circle cx="178" cy="176" r="2"/><circle cx="185" cy="170" r="2"/></g>'
      : '';
  const glasses =
    avatar.face === 'glasses'
      ? '<g fill="none" stroke="#d4b45e" stroke-width="4"><circle cx="112" cy="153" r="23"/><circle cx="170" cy="153" r="23"/><path d="M135 151h12"/></g>'
      : '';
  const lashes =
    avatar.kind === 'girl' ? '<path d="m96 145-6-5m90 5 6-5" fill="none" stroke-width="3"/>' : '';
  return `<svg class="wizard-art" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
  <linearGradient id="${prefix}-cloth" x2="1" y2="1"><stop stop-color="${robe}"/><stop offset=".55" stop-color="${robe}"/><stop offset="1" stop-color="#282344"/></linearGradient>
  <linearGradient id="${prefix}-hat-cloth" x2="1" y2="1"><stop stop-color="#a875f5"/><stop offset=".5" stop-color="#8055d9"/><stop offset="1" stop-color="#39244f"/></linearGradient>
  <linearGradient id="${prefix}-hair" x2="1" y2="1"><stop stop-color="${hair}"/><stop offset="1" stop-color="#302039"/></linearGradient>
  <radialGradient id="${prefix}-skin"><stop stop-color="${skin}"/><stop offset="1" stop-color="${skin}"/></radialGradient>
  </defs><g stroke="#281a37" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="142" cy="358" rx="88" ry="12" fill="#10102b" opacity=".35" stroke="none"/>
  <path d="M103 207Q48 233 29 328q39 4 69-27l92 26 46-2q-3-82-60-120z" fill="url(#${prefix}-cloth)"/>
  <path d="M102 213q-30 39-49 97" fill="none" stroke="${gold}" stroke-width="4" opacity=".85"/>
  <path d="m107 307-13 36-23 6-8 13q31 10 62-2l14-46m20-1 9 47q33 10 63-1l-13-13-24-5-7-33" fill="#594039"/>
  <path d="m105 214-16 102q57 19 114-1l-30-101z" fill="url(#${prefix}-cloth)"/>
  <path d="m113 217 10 98 19 10 17-11 4-96" fill="${gold}" stroke-width="3"/>
  <path d="m99 245-3 61m80-61 11 59" fill="none" stroke="#ffffff" stroke-width="2" opacity=".18"/>
  <path d="M88 285q57 13 109-1l3 16q-56 15-114 0z" fill="#634631"/>
  <rect x="131" y="286" width="27" height="22" rx="4" fill="${gold}"/><rect x="138" y="291" width="13" height="11" rx="1" fill="#66432e" stroke-width="2"/>
  <path d="m91 291-23 7 3 32q21 10 35-3l-1-32z" fill="#99613a"/><path d="m72 306 27-3-9 15z" fill="#bd8253" stroke-width="2"/>
  <path d="M103 218q-43 9-48 48l25 14 41-43" fill="${robe}"/><path d="m57 260 27 12-7 12-27-12z" fill="${gold}" stroke-width="2"/>
  <path d="M55 271q-14-7-17 5l6 12q20 15 33-4" fill="${skin}"/>
  <g class="wand-arm"><path d="M166 215q22 20 53-26l-14-17q-26 31-43 24" fill="${robe}"/><path d="m202 181 17 16 9-13-18-17z" fill="${gold}" stroke-width="2"/><path d="M207 174q-6-21 6-23l12 9q15-2 13 11l-17 19z" fill="${skin}"/>
  <path d="m224 166 35-66" stroke="#584031" stroke-width="8"/><path d="m225 158 30-55" stroke="${gold}" stroke-width="3"/><g data-wand-tip transform="translate(260 97)"><path d="m0-16 5 10 12 2-9 8 2 12-10-6-11 6 3-12-9-8 12-2z" fill="${gold}" stroke-width="3"/><circle r="4" fill="#fffbe3" stroke="none"/></g></g>
  ${braids}<path class="hit-target" d="M85 122q-9 63 21 80 36 24 72 0 31-20 23-78z" fill="url(#${prefix}-skin)"/>
  <path d="M91 144q16-13 30-6m36 0q16-7 30 6" fill="none" stroke="${hair}" stroke-width="4"/>
  <g fill="#fffaf0" stroke-width="3"><ellipse cx="112" cy="155" rx="15" ry="20"/><ellipse cx="170" cy="155" rx="15" ry="20"/></g>
  <g fill="${hair}" stroke-width="2"><ellipse cx="116" cy="157" rx="9" ry="14"/><ellipse cx="174" cy="157" rx="9" ry="14"/></g>
  <g fill="#fff" stroke="none"><circle cx="118" cy="150" r="4"/><circle cx="176" cy="150" r="4"/><circle cx="111" cy="162" r="2"/><circle cx="169" cy="162" r="2"/></g>
  ${lashes}<path d="m140 163-4 8 8 1" fill="none" stroke="#b16d58" stroke-width="2"/>
  <g fill="#ee8c84" opacity=".5" stroke="none"><ellipse cx="99" cy="175" rx="11" ry="6"/><ellipse cx="184" cy="175" rx="11" ry="6"/></g>
  <path d="M123 181q20 23 38-2-15 5-38 2z" fill="#733044" stroke-width="2"/><path d="M131 184h19" stroke="#fff5dd" stroke-width="3"/>
  ${freckles}${glasses}<path d="M83 132q2-36 36-37l58 2q24 4 28 39-19-3-34-24-7 19-25 22l-3-20q-15 27-38 27l7-16z" fill="url(#${prefix}-hair)"/>
  <path d="m101 120 14-9m44 6 11 9" fill="none" stroke="#d5a36d" opacity=".55" stroke-width="3"/>${curls}
  ${hat}<path d="M106 207q37 23 69-2l-16 25-18-10-20 14z" fill="${gold}" stroke-width="3"/><circle cx="142" cy="222" r="9" fill="${gold}"/><path d="m142 215 2 5 5 1-4 3 1 5-4-3-5 3 2-5-4-3 5-1z" fill="${robe}" stroke="none"/>
  </g></svg>`;
}
