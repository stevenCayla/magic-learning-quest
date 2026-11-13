import { clockSVG } from '../clock.js';
import { fighterSVG, princessSVG, escapeHTML } from './characters.js';
import { sceneSVG } from './scenes.js';
const icon = (body, stroke = 2.4) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICONS = {
  back: icon('<path d="M20 12H5"/><path d="M11 5.5L4.5 12l6.5 6.5"/>', 3),
  lesson: icon(
    '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5z"/><path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v16h5.5c.8 0 1.5-.7 1.5-1.5z"/>',
  ),
  soundOn: icon(
    '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.5a7.8 7.8 0 0 1 0 11"/>',
  ),
  soundOff: icon(
    '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>',
  ),
  pause: icon('<path d="M8 5v14M16 5v14"/>', 4),
  play: icon('<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>', 2),
  next: icon('<path d="M5 12h14"/><path d="M13 5.5l6.5 6.5-6.5 6.5"/>', 3.4),
  replay: icon('<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4.5v4.5h4.5"/>', 3),
  home: icon('<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v9.5h11V10"/>', 2.6),
  bolt: icon('<path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" fill="currentColor"/>', 1.6),
  heart: icon(
    '<path d="M12 20.5S3.5 15 3.5 8.8A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.5 2.5C20.5 15 12 20.5 12 20.5z" fill="currentColor"/>',
    1.6,
  ),
  trophy: icon(
    '<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5.5H4c0 3.5 1.5 5 3.5 5M17 5.5h3c0 3.5-1.5 5-3.5 5M12 14v4M8 20h8"/>',
    2,
  ),
  check: icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 3.6),
  cross: icon('<path d="M6 6l12 12M18 6 6 18"/>', 3.6),
  erase: icon(
    '<path d="M9 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-6-6z"/><path d="M12 10l4 4M16 10l-4 4"/>',
  ),
  sun: icon(
    '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    2.6,
  ),
};
// Wizards are called by their first name, dragons by their full title.
export const shortName = (enemy) =>
  enemy.kind === 'dragon' ? enemy.name : enemy.name.split(' ')[0];
const LEVEL_LABELS = {
  clock: ['Heures pleines', 'Demi-heures', 'Quarts d’heure', 'De 5 en 5', 'Toutes les minutes'],
  math: ['Initié', 'Enchanteur', 'Grand mage'],
};
const levelLabel = (ex) => LEVEL_LABELS[ex.mode][ex.mode === 'clock' ? ex.level : ex.tier];
const titled = (text) => `<div class="panel-title"><h2>${text}</h2></div>`;
const starIcon = (full) =>
  `<svg viewBox="0 0 52 50" class="${full ? 'is-full' : ''}"><polygon points="26,4 31.4,18.6 46.5,19.2 34.6,28.8 38.6,43.6 26,35.2 13.4,43.6 17.4,28.8 5.5,19.2 20.6,18.6"/></svg>`;
export function battleView({ exercise, encounter, avatar, xp, sound, health = 100 }) {
  const ex = exercise,
    c = encounter,
    enemy = c.enemy;
  const keys = ['1', '2', '3', 'delete', '4', '5', '6', 'clear', '7', '8', '9', '0'];
  const question =
    ex.mode === 'clock'
      ? clockSVG(ex.hour, ex.minute)
      : `<div class="math-tile"><div class="math-problem" aria-label="${ex.a} ${ex.op === '×' ? 'fois' : ex.op === '−' ? 'moins' : 'plus'} ${ex.b}"><span>${ex.a}</span><span class="operator">${ex.op}</span><span>${ex.b}</span></div><p class="math-equals" aria-hidden="true">= ?</p></div>`;
  const label = levelLabel(ex);
  return `<section class="battle-shell" data-phase="intro" data-mode="${ex.mode}" data-star="${c.targetStar}" data-stage="${c.index}" style="--enemy-accent:${enemy.accent}">
 ${sceneSVG(c.index)}<div class="battle-vignette" aria-hidden="true"></div>
 <header class="battle-toolbar"><button class="battle-tool" id="pause" aria-label="Pause" title="Pause">${ICONS.pause}</button><div class="battle-title"><h1>${ex.mode === 'clock' ? 'Horloge magique' : 'Maths magiques'}</h1><p>Niveau ${c.index + 1}/20 · Étoile ${c.targetStar}/3 <span class="battle-stars" role="img" aria-label="${c.stars} étoile${c.stars > 1 ? 's' : ''} sur 3">${[0, 1, 2].map((i) => starIcon(i < c.stars)).join('')}</span></p></div><div class="battle-tools"><span class="battle-xp" data-testid="xp">${xp} XP</span>${ex.mode === 'clock' ? `<button class="battle-tool" id="battle-lesson" aria-label="Relire la leçon" title="Relire la leçon">${ICONS.lesson}</button>` : ''}<button id="toggle-sound" class="battle-tool battle-sound" aria-label="${sound ? 'Couper les sons' : 'Activer les sons'}" aria-pressed="${sound}">${sound ? ICONS.soundOn : ICONS.soundOff}</button></div></header>
 <div class="battle-content"><figure class="fighter fighter-player"><figcaption><span>TON MAGE</span><strong>${escapeHTML(avatar.name)}</strong><progress id="player-health" aria-label="Vie du joueur" value="${health}" max="100"></progress><small id="player-health-text">${health} / 100 PV</small></figcaption><div class="fighter-portrait">${fighterSVG({ avatar, prefix: 'player' })}</div><div class="fighter-platform" aria-hidden="true"></div></figure>
 <div class="duel-desk"><section class="exercise-board"><div class="exercise-meta"><span class="tag">${label}</span><span id="timer" role="timer" aria-label="Temps restant">${ex.limit ? `${ex.limit} s` : 'Sans chrono'}</span></div><div class="timer-track" aria-hidden="true"><span id="timer-bar"></span></div><h2>${ex.mode === 'clock' ? 'Quelle heure est-il ?' : 'Quel sort lanceras-tu ?'}</h2>${ex.mode === 'clock' ? `<p class="time-period" data-period="${ex.period}">${ICONS.sun}${ex.period === 'morning' ? 'Matin' : 'Après-midi'}</p>` : ''}${question}<p class="exercise-hint">${ex.mode === 'clock' ? 'Réponds au format 24 h' : 'La bonne réponse libère ta magie.'}</p></section>
 <section class="answer-board" aria-label="Lance ton sort"><div class="answer-display">${ex.mode === 'clock' ? `<button id="hour" class="answer-field selected" aria-label="Heures" aria-pressed="true" disabled><span id="hour-value">--</span><small>heures</small></button><span class="colon">:</span><button id="minute" class="answer-field" aria-label="Minutes" aria-pressed="false" disabled><span id="minute-value">--</span><small>minutes</small></button>` : '<output id="math-answer" aria-label="Réponse au calcul">?</output>'}</div><div class="keypad" aria-label="Pavé numérique">${keys.map((k) => `<button class="key" data-key="${k}" ${k === 'clear' ? 'aria-label="Effacer la réponse"' : k === 'delete' ? 'aria-label="Effacer le dernier chiffre"' : ''} disabled>${k === 'clear' ? 'C' : k === 'delete' ? ICONS.erase : k}</button>`).join('')}</div><button class="primary validate" id="validate" disabled>Lancer mon sort ✦</button></section>
 <div id="feedback" class="duel-feedback" aria-live="polite" aria-atomic="true"></div><section id="duel-panel" class="duel-panel" hidden></section></div>
 <figure class="fighter fighter-enemy"><figcaption><span>${c.rescued ? 'ENTRAÎNEMENT LIBRE' : enemy.kind === 'dragon' ? 'BOSS FINAL' : 'SORCIER ADVERSE'}</span><strong>${enemy.name}</strong><progress id="enemy-health" aria-label="Énergie de l’adversaire" value="${c.remaining}" max="100"></progress><small id="enemy-health-text">${c.remaining} / 100</small></figcaption><div class="fighter-portrait">${fighterSVG({ enemy, prefix: 'enemy' })}</div><div class="fighter-platform" aria-hidden="true"></div></figure></div>
 <div class="spell-layer" aria-hidden="true"><div class="wand-charge"></div><div class="spell-projectile"><span></span></div><div class="spell-impact"></div><p id="damage-pop" class="damage-pop"></p><div class="spell-sparks">${Array.from({ length: 16 }, (_, i) => `<i style="--spark-angle:${i * 22.5}deg;--spark-distance:${45 + (i % 4) * 18}px"></i>`).join('')}</div></div>
 <div class="duel-pause" hidden><section role="dialog" aria-modal="true" aria-labelledby="pause-title"><div class="panel-title">${starIcon(true)}<h2 id="pause-title">Pause</h2>${starIcon(true)}</div><p class="panel-lead">Le chrono est arrêté. ${escapeHTML(shortName(enemy))} t’attend !</p><button class="panel-go" id="pause-resume">${ICONS.play}REPRENDRE</button><button class="panel-quiet" id="pause-quit">Quitter le duel</button><p class="panel-note">Ta progression est enregistrée.</p></section></div>
 <section class="rotate-notice" hidden aria-label="Tourne ton téléphone"><div class="rotate-phone" aria-hidden="true">▯ ↻ ▭</div><h2>Tourne ton téléphone</h2><p>Le duel se joue à l’horizontale.<br>Le décompte et le chrono t’attendent.</p><button class="battle-tool" id="rotate-exit">Retour à l’accueil</button></section>
 <div class="rescue-celebration" hidden><div>${princessSVG()}</div><h2>Aélis est libre !</h2><p>Le dragon d’ombre est vaincu. Ta magie a sauvé Astréa.</p><button class="primary" id="rescue-continue">Continuer l’entraînement</button><button class="secondary" id="rescue-home">Retour à l’accueil</button></div>
 </section>`;
}

// The centre of the arena turns into a single panel between two questions.
export function introPanel({ exercise, encounter }) {
  const name = escapeHTML(shortName(encounter.enemy));
  return `<p class="panel-eyebrow">${encounter.rescued ? 'ENTRAÎNEMENT LIBRE' : `NIVEAU ${encounter.index + 1}`} · ${levelLabel(exercise).toUpperCase()}</p>${titled(`${name} te défie !`)}<p class="panel-lead">${exercise.mode === 'clock' ? 'Lis l’heure sur l’horloge pour lancer tes sorts.' : 'Trouve le résultat du calcul pour lancer tes sorts.'}</p><ul class="panel-rules"><li class="rule-good">${ICONS.bolt}<span>Bonne réponse : ton sort lui retire 20, ou 25 si tu es rapide.</span></li><li class="rule-bad">${ICONS.heart}<span>Erreur ou temps écoulé : il riposte, −25 PV.</span></li><li class="rule-goal">${ICONS.trophy}<span>Vide sa barre avant la tienne pour gagner.</span></li></ul><button class="panel-go" id="panel-next">${ICONS.bolt}COMMENCER LE DUEL</button>`;
}
export function correctionPanel({ exercise, given, expected, steps, last }) {
  const ex = exercise,
    clock = ex.mode === 'clock';
  const side = clock
    ? `<div class="correction-figure"><p class="time-period" data-period="${ex.period}">${ICONS.sun}${ex.period === 'morning' ? 'Matin' : 'Après-midi'}</p>${clockSVG(ex.hour, ex.minute)}<p class="correction-legend"><span class="legend-hour">petite aiguille = heures</span><span class="legend-minute">grande aiguille = minutes</span></p></div>`
    : `<div class="correction-figure"><div class="math-tile"><div class="math-problem"><span>${ex.a}</span><span class="operator">${ex.op}</span><span>${ex.b}</span></div><p class="math-equals">= ${ex.answer}</p></div></div>`;
  return `${side}<div class="correction-text"><h2>Regardons ensemble</h2><dl class="correction-answers"><div><dt>Ta réponse</dt><dd class="is-wrong">${ICONS.cross}<s>${escapeHTML(given)}</s></dd></div><div><dt>Il fallait</dt><dd class="is-right">${ICONS.check}${escapeHTML(expected)}</dd></div></dl><ol class="correction-steps">${steps.map((step, i) => `<li><span aria-hidden="true">${i + 1}</span><span>${escapeHTML(step)}</span></li>`).join('')}</ol><button class="panel-go" id="panel-next">${last ? 'CONTINUER' : clock ? 'ESSAYER UNE AUTRE HEURE' : 'ESSAYER UN AUTRE CALCUL'}${ICONS.next}</button></div>`;
}
export function victoryPanel({ encounter, duel, stage, rewards = [] }) {
  const goal = (done, text) =>
    `<li class="${done ? 'is-done' : ''}">${done ? ICONS.check : '<i aria-hidden="true"></i>'}<span>${text}</span></li>`;
  return `${titled('Victoire !')}<p class="panel-lead">${escapeHTML(shortName(encounter.enemy))} est vaincu.</p><ul class="panel-goals">${goal(true, 'Duel gagné')}${goal(duel.errors <= 1, 'Une erreur au plus')}${goal(duel.fast >= 3, `3 sorts éclair : tu en as lancé ${duel.fast}`)}</ul><p class="panel-pill">+${duel.xp} XP${rewards.length ? ` · ${escapeHTML(rewards.join(', '))}` : ''}</p>${stage ? `<p class="panel-note" id="panel-stage">Prochaine étape : ${escapeHTML(stage.name)}</p>` : ''}<div class="panel-actions"><button class="panel-quiet" id="panel-home">${ICONS.home}Accueil</button><button class="panel-go" id="panel-next">NIVEAU SUIVANT${ICONS.next}</button></div>`;
}
export function defeatPanel({ encounter, mode, levelXP }) {
  const name = escapeHTML(shortName(encounter.enemy)),
    casts = Math.floor((100 - encounter.remaining) / 20),
    left = Math.ceil(encounter.remaining / 20);
  return `${titled(`${name} a gagné… cette fois !`)}<p class="panel-text">${casts ? `Tu lui as lancé ${casts} sort${casts > 1 ? 's' : ''} : encore ${left} et il était vaincu.` : `Il te faut ${left} sorts réussis pour le vaincre.`}</p><p class="panel-lead">${mode === 'clock' ? 'Relis la leçon, puis retente ta chance.' : 'Respire un grand coup, puis retente ta chance.'}</p><p class="panel-pill">Tu gardes tes ${levelXP} XP</p><div class="panel-actions">${mode === 'clock' ? `<button class="panel-quiet" id="panel-lesson">${ICONS.lesson}Relire la leçon</button>` : `<button class="panel-quiet" id="panel-home">${ICONS.home}Accueil</button>`}<button class="panel-go" id="panel-next">${ICONS.replay}REJOUER</button></div>`;
}
