import { clockSVG } from '../clock.js';
import { wizardSVG, dragonSVG, princessSVG, escapeHTML } from './characters.js';
import { sceneSVG } from './scenes.js';
export function battleView({ exercise, encounter, avatar, xp, sound, health = 100 }) {
  const ex = exercise,
    c = encounter,
    enemy = c.enemy;
  const keys = ['1', '2', '3', 'delete', '4', '5', '6', 'clear', '7', '8', '9', '0'];
  const question =
    ex.mode === 'clock'
      ? clockSVG(ex.hour, ex.minute)
      : `<div class="math-problem" aria-label="${ex.a} ${ex.op === '×' ? 'fois' : ex.op === '−' ? 'moins' : 'plus'} ${ex.b}"><span>${ex.a}</span><span class="operator">${ex.op}</span><span>${ex.b}</span></div>`;
  const label =
    ex.mode === 'clock'
      ? ['Heures pleines', 'Demi-heures', 'Quarts d’heure', 'De 5 en 5', 'Toutes les minutes'][
          ex.level
        ]
      : ['Initié', 'Enchanteur', 'Grand mage'][ex.tier];
  return `<section class="battle-shell" data-phase="countdown" data-mode="${ex.mode}" data-star="${c.targetStar}" data-stage="${c.index}" style="--enemy-accent:${enemy.accent}">
 ${sceneSVG(c.index)}<div class="battle-vignette" aria-hidden="true"></div>
 <header class="battle-toolbar"><button class="battle-tool" id="back" aria-label="Retour au menu">← Menu</button><div class="battle-title"><h1>${ex.mode === 'clock' ? 'Horloge magique' : 'Maths magiques'}</h1><p>Niveau ${c.index + 1}/20 · Étoile ${c.targetStar}/3 · ${'★'.repeat(c.stars)}${'☆'.repeat(3 - c.stars)}</p></div>${ex.mode === 'clock' ? '<button class="battle-tool" id="battle-lesson" aria-label="Relire la leçon" title="Relire la leçon">📖</button>' : ''}<span class="battle-xp" data-testid="xp">${xp} XP</span><button id="toggle-sound" class="battle-tool battle-sound" aria-label="${sound ? 'Couper les sons' : 'Activer les sons'}" aria-pressed="${sound}">${sound ? '♫' : '♪'}</button></header>
 <div class="battle-content"><figure class="fighter fighter-player"><figcaption><span>TON MAGE</span><strong>${escapeHTML(avatar.name)}</strong><progress id="player-health" aria-label="Vie du joueur" value="${health}" max="100"></progress><small id="player-health-text">${health} / 100 PV</small></figcaption><div class="fighter-portrait">${wizardSVG({ avatar, prefix: 'player' })}</div><div class="fighter-platform" aria-hidden="true"></div></figure>
 <div class="duel-desk"><section class="exercise-board"><div class="exercise-meta"><span class="tag">${label}</span><span id="timer" role="timer" aria-label="Temps restant">${ex.limit ? `${ex.limit} s` : 'Sans chrono'}</span></div><div class="timer-track" aria-hidden="true"><span id="timer-bar"></span></div><h2>${ex.mode === 'clock' ? 'Quelle heure est-il ?' : 'Quel sort lanceras-tu ?'}</h2>${ex.mode === 'clock' ? `<p class="time-period" data-period="${ex.period}">${ex.period === 'morning' ? '☀ Matin' : '☀ Après-midi'}</p>` : ''}${question}<p class="exercise-hint">${ex.mode === 'clock' ? 'Réponds au format 24 h' : 'La bonne réponse libère ta magie.'}</p></section>
 <section class="answer-board" aria-label="Lance ton sort"><div class="answer-display">${ex.mode === 'clock' ? `<button id="hour" class="answer-field selected" aria-label="Heures" aria-pressed="true" disabled><span id="hour-value">--</span><small>heures</small></button><span class="colon">:</span><button id="minute" class="answer-field" aria-label="Minutes" aria-pressed="false" disabled><span id="minute-value">--</span><small>minutes</small></button>` : '<output id="math-answer" aria-label="Réponse au calcul">?</output>'}</div><div class="keypad" aria-label="Pavé numérique">${keys.map((k) => `<button class="key" data-key="${k}" ${k === 'clear' ? 'aria-label="Effacer la réponse"' : k === 'delete' ? 'aria-label="Effacer le dernier chiffre"' : ''} disabled>${k === 'clear' ? 'C' : k === 'delete' ? '⌫' : k}</button>`).join('')}</div><button class="primary validate" id="validate" disabled>Prépare ta baguette…</button></section>
 <div id="feedback" class="duel-feedback" aria-live="polite" aria-atomic="true"></div></div>
 <figure class="fighter fighter-enemy"><figcaption><span>${c.rescued ? 'ENTRAÎNEMENT LIBRE' : enemy.kind === 'dragon' ? 'BOSS FINAL' : 'SORCIER ADVERSE'}</span><strong>${enemy.name}</strong><progress id="enemy-health" aria-label="Énergie de l’adversaire" value="${c.remaining}" max="100"></progress><small id="enemy-health-text">${c.remaining} / 100</small></figcaption><div class="fighter-portrait">${enemy.kind === 'dragon' ? dragonSVG(enemy) : wizardSVG({ enemy, prefix: 'enemy' })}</div><div class="fighter-platform" aria-hidden="true"></div></figure></div>
 <div class="spell-layer" aria-hidden="true"><div class="wand-charge"></div><div class="spell-projectile"><span></span></div><div class="spell-impact"></div><div class="spell-sparks">${Array.from({ length: 16 }, (_, i) => `<i style="--spark-angle:${i * 22.5}deg;--spark-distance:${45 + (i % 4) * 18}px"></i>`).join('')}</div></div>
 <div id="duel-intro" class="duel-intro"><p class="intro-label">${c.rescued ? 'ENTRAÎNEMENT MAGIQUE' : 'LE DUEL COMMENCE'}</p><h2>${enemy.name}</h2><div class="countdown-orbit" aria-hidden="true"></div><span id="countdown-value" role="timer" aria-label="Départ dans 5 secondes">5</span><p>Prépare ta baguette !</p></div><div class="battle-go" aria-hidden="true">COMBAT !</div>
 <section class="rotate-notice" hidden aria-label="Tourne ton téléphone"><div class="rotate-phone" aria-hidden="true">▯ ↻ ▭</div><h2>Tourne ton téléphone</h2><p>Le duel se joue à l’horizontale.<br>Le décompte et le chrono t’attendent.</p><button class="battle-tool" id="rotate-exit">Retour à l’accueil</button></section>
 <div class="rescue-celebration" hidden><div>${princessSVG()}</div><h2>Aélis est libre !</h2><p>Le dragon d’ombre est vaincu. Ta magie a sauvé Astréa.</p><button class="primary" id="rescue-continue">Continuer l’entraînement</button><button class="secondary" id="rescue-home">Retour à l’accueil</button></div>
 </section>`;
}
