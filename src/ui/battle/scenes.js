import { ENEMIES } from '../../domain/duel.js';
const tree = (x, y, s = 1, color = '#213c53') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 0h18v164H-9z" fill="#42314c"/><path d="M0-109-64 23h29L-88 84h46l-65 60h214l-65-60h46L35 23h29z" fill="${color}" stroke="#17263c" stroke-width="5"/></g>`;
const pillar = (x) =>
  `<g stroke="#36334e" stroke-width="6"><path d="M${x} 286h75v390h-75z" fill="#68647c"/><path d="M${x - 14} 283h104v27H${x - 14}zM${x - 16} 660h106v28H${x - 16}z" fill="#9690a2"/></g>`;
const crystal = (x, y, color = '#97e7e2', scale = 1) =>
  `<g transform="translate(${x} ${y}) scale(${scale})" stroke="#3f466a" stroke-width="5"><path d="m0 0-32-119 16-46 44 21 14 121z" fill="${color}"/><path d="m0 0 42-91 30-9 11 45-49 60z" fill="${color}"/><path d="m-15-163 19 77L0 0M43-91l9 40L34 5" fill="none" stroke="white" opacity=".4"/></g>`;
function library() {
  return [80, 330, 1120, 1370]
    .map(
      (x) =>
        `<g stroke="#2d2441" stroke-width="8"><path d="M${x} 180h155v470H${x}z" fill="#63445b"/>${[232, 340, 448, 556].map((y, r) => `<path d="M${x} ${y + 73}h155" fill="none"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${x + 12 + i * 22}" y="${y - 15 + (i % 3) * 7}" width="17" height="${86 - (i % 3) * 7}" rx="3" fill="${['#b89264', '#618c93', '#aa6078', '#8476b3'][(i + r) % 4]}" stroke-width="3"/>`).join('')}`).join('')}</g>`,
    )
    .join('');
}
function landmark(scene, i, accent) {
  const castle = `<g fill="#726888" stroke="#383052" stroke-width="6"><path d="M448 251h690v349H448z"/><path d="M418 199h130v422H418zm598 0h130v422h-130zM733 136h137v458H733z"/><path d="m398 202 83-169 87 169zm599 0 84-167 84 167zM709 139l95-130 91 130z" fill="#46345e"/><path d="M744 602V458q60-89 118 0v144" fill="#ddba84"/><g fill="${accent}" stroke="none">${[477, 789, 1082].map((x) => `<path d="M${x} 280v-45q15-25 30 0v45zM${x} 373v-45q15-25 30 0v45z"/>`).join('')}</g></g>`;
  switch (scene) {
    case 'village':
      return `${[120, 390, 1060, 1360].map((x, n) => `<g stroke="#43314c" stroke-width="6"><path d="M${x} ${440 - (n % 2) * 70}h150v180H${x}z" fill="#a99181"/><path d="m${x - 25} ${440 - (n % 2) * 70} 100-93 95 93z" fill="#6d4b73"/><path d="M${x + 60} ${620 - (n % 2) * 70}v-80h40v80" fill="#5a3f5d"/><path d="M${x + 17} ${475 - (n % 2) * 70}h27v35h-27z" fill="${accent}"/></g>`).join('')}`;
    case 'forest':
      return Array.from({ length: 10 }, (_, n) =>
        tree(50 + n * 165, 380 + (n % 3) * 85, 1.1 + (n % 3) * 0.25, n % 2 ? '#2f6a66' : '#274a62'),
      ).join('');
    case 'bridge':
      return `<path d="M0 671q290-160 540 0t530-11 530 0v240H0z" fill="#77abb5"/><path d="M190 505q590-211 1220 0v122h-110q-70-203-180 0h-95q-70-203-180 0h-96q-70-203-180 0H470q-70-203-180 0H190z" fill="#858493" stroke="#45435f" stroke-width="9"/>`;
    case 'griffin':
      return `${tree(110, 430, 2)}${tree(1490, 460, 2)}<g fill="#9b9a9d" stroke="#515066" stroke-width="7"><path d="M641 652h319V530H641z"/><path d="M713 528V412l-57-66 62 15 71-108 42 103 88-22-42 75v120z"/><path d="M720 417 554 255l25 140 120 108m156-83 174-160-33 141-123 101"/></g>`;
    case 'library':
      return library();
    case 'garden':
      return `${[140, 300, 450, 1130, 1300, 1460].map((x, n) => `<path d="M${x} 690v-${80 + (n % 3) * 25}" stroke="#468878" stroke-width="12"/><g transform="translate(${x} ${590 - (n % 3) * 25})" fill="${accent}" stroke="#8e647f" stroke-width="4"><ellipse rx="18" ry="48"/><ellipse rx="48" ry="18"/><circle r="13" fill="#fff0bf"/></g>`).join('')}<path d="M560 650v-250q240-280 480 0v250" fill="none" stroke="#a0a8ac" stroke-width="30"/>`;
    case 'potions':
      return `${library()}<g stroke="#342d49" stroke-width="8"><path d="M480 510q-32 230 320 230t310-230z" fill="#393d57"/><ellipse cx="796" cy="510" rx="317" ry="60" fill="#8cda9c"/>${[620, 760, 920].map((x, n) => `<path d="M${x} 468q-63-68 12-108t-6-120" fill="none" stroke="${accent}" stroke-width="${24 - n * 4}" opacity=".45"/>`).join('')}</g>`;
    case 'golem':
      return `${pillar(270)}${pillar(1260)}<g fill="#838c9c" stroke="#48506b" stroke-width="8"><path d="m561 633-31-258 93-107 305 0 113 113-18 253z"/><path d="m600 418 82 16m196 1 87-20" stroke="${accent}" stroke-width="23"/><path d="m720 362 41 137h-59m-58 63h257" fill="none" stroke-width="17"/></g>`;
    case 'lake':
      return `${tree(120, 395, 2)}${tree(1490, 405, 2)}<path d="M0 636q800-180 1600 0v264H0z" fill="#4878a2"/><g fill="none" stroke="${accent}" opacity=".5">${[665, 700, 760, 830].map((y, n) => `<path d="M${300 - n * 60} ${y}q480 35 ${980 + n * 60} 0" stroke-width="5"/>`).join('')}</g>${crystal(400, 620, accent, 1.1)}${crystal(1200, 620, accent, 0.9)}`;
    case 'clock':
      return `<g stroke="#34334d" stroke-width="8"><path d="M607 212h398v470H607z" fill="#81738b"/><path d="m563 213 240-192 243 192z" fill="#463c68"/><circle cx="804" cy="360" r="111" fill="#f4dfb3"/><path d="M804 282v78l67 47" fill="none" stroke-width="14"/><path d="M738 681V549q70-85 135 0v132" fill="#393350"/></g>`;
    case 'clouds':
      return `<g fill="#adadcf" stroke="#747a9c" stroke-width="5">${Array.from({ length: 8 }, (_, n) => `<path d="M${100 + n * 180} ${650 - n * 50}v-45h200v45z"/><ellipse cx="${100 + n * 180}" cy="${700 - n * 50}" rx="150" ry="38"/>`).join('')}</g>`;
    case 'phoenix':
      return `${pillar(270)}${pillar(1260)}<path d="M800 655Q506 627 617 428l76 92-19-180 129 102 131-101-29 179 80-95q106 202-185 230" fill="#ed9a67" stroke="#7e4263" stroke-width="9"/><path d="m800 488-42 96 42-31 47 32z" fill="#ffe393"/>`;
    case 'stars':
      return `<g fill="none" stroke="${accent}" opacity=".55"><circle cx="804" cy="410" r="230" stroke-width="12"/><ellipse cx="804" cy="410" rx="360" ry="85" stroke-width="7" transform="rotate(-30 804 410)"/><ellipse cx="804" cy="410" rx="360" ry="85" stroke-width="7" transform="rotate(35 804 410)"/><path d="M804 178v464m-232-232h464" stroke-width="4"/></g>`;
    case 'crystals':
      return Array.from({ length: 9 }, (_, n) =>
        crystal(70 + n * 180, 640 + (n % 2) * 50, n % 2 ? accent : '#997ed2', 1 + (n % 3) * 0.5),
      ).join('');
    case 'crypt':
      return `${[130, 400, 1130, 1400].map(pillar).join('')}<path d="M635 690V365q160-180 330 0v325" fill="#26273f" stroke="#78718c" stroke-width="24"/><path d="M801 415v176m-68-87h135" stroke="${accent}" stroke-width="14"/>`;
    case 'vault':
      return `${pillar(230)}${pillar(1300)}<g stroke="#54415b" stroke-width="9"><path d="M490 455q310-100 620 0v235H490z" fill="#b38a5b"/><path d="M492 498h616v64H492z" fill="#d3af78"/><rect x="752" y="478" width="92" height="108" rx="13" fill="#efd998"/><circle cx="798" cy="521" r="13" fill="#54415b"/></g>`;
    case 'mountains':
      return `<path d="m0 620 245-382 204 309 334-407 300 409 233-331 284 402z" fill="#6d5d86" stroke="#413b5c" stroke-width="8"/><path d="m150 384 95-146 106 160-75-19-32 35-31-40m444-83 126-151 115 155-73-28-40 45-59-44" fill="#beb8c9"/>${crystal(110, 691, accent, 1.5)}`;
    case 'ramparts':
      return castle;
    case 'dragon':
      return `<path d="M0 0h1600v210l-120-87-85 178-109-155-129 135-140-135-110 167-123-148-112 140L560 137 452 302 338 112 215 282 109 127 0 254z" fill="#352d47"/><path d="M0 695q250-74 530 2t530 0 540-7v210H0z" fill="#b76864"/><path d="M0 756q260-62 520 4t580-2 500 0" fill="none" stroke="#f2b77a" stroke-width="24"/>${crystal(160, 670, accent, 1.8)}${crystal(1460, 660, accent, 1.5)}`;
    case 'castle':
      return `${castle}<path d="M0 691q800-95 1600 0v209H0z" fill="#8ca58c"/>`;
    default:
      return '';
  }
}
export function sceneSVG(index) {
  const e = ENEMIES[Math.max(0, Math.min(19, index))];
  const id = `scene-${e.index}`;
  const stars = Array.from(
    { length: 36 },
    (_, n) =>
      `<circle cx="${(n * 193 + index * 71) % 1600}" cy="${35 + ((n * 67) % 410)}" r="${(n % 3) + 1.5}" fill="${e.accent}" opacity="${0.25 + (n % 4) * 0.17}"/>`,
  ).join('');
  return `<svg class="battle-scenery" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-scene="${e.scene}"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="#171e42"/><stop offset="1" stop-color="${e.color}"/></linearGradient><radialGradient id="${id}-moon"><stop stop-color="${e.accent}"/><stop offset="1" stop-color="${e.accent}" stop-opacity="0"/></radialGradient></defs><path d="M0 0h1600v900H0z" fill="url(#${id}-sky)"/>${stars}<circle cx="${1240 - (index % 3) * 140}" cy="175" r="180" fill="url(#${id}-moon)" opacity=".25"/><circle cx="${1240 - (index % 3) * 140}" cy="175" r="48" fill="${e.accent}" opacity=".6"/><path d="m0 550 200-180 200 160 250-240 230 220 180-180 240 210 300-180v540H0z" fill="#26324f" opacity=".6"/>${landmark(e.scene, index, e.accent)}<path d="M0 730q400-90 800 0t800 0v170H0z" fill="#202b43"/><path d="m400 900 250-169 320 0 260 169z" fill="${e.color}" opacity=".35"/><ellipse cx="800" cy="824" rx="700" ry="73" fill="#0f142b" opacity=".35"/></svg>`;
}
