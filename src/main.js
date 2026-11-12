import './style.css';
import {
  generateMath,
  generateClock,
  tierFor,
  clockLevel,
  validateAnswer,
  timeLimit,
  explanation,
} from './domain/exercises.js';
import { STAGES, position, level, recordAnswer } from './domain/progression.js';
import { load, save } from './domain/storage.js';
import { clockSVG } from './ui/clock.js';
import { createSoundPlayer } from './ui/sound.js';
const sounds = createSoundPlayer();
const ADVANCE_DELAY = 1200;
let advanceTimer;

const restored = load();
let state = restored.state;
let warning = restored.warning;
let screen = 'home',
  exercise = null,
  answer = '',
  hour = '',
  minute = '',
  field = 'hour';
let started = 0,
  pausedAt = 0,
  feedback = null,
  ticker;
let installPrompt = null;
const app = document.querySelector('#app');
const escape = (str) =>
  String(str).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const persist = () => {
  if (!save(state)) {
    warning = 'La sauvegarde est indisponible. Garde cette page ouverte pour conserver ta partie.';
    const main = document.querySelector('#main');
    if (main && !main.querySelector('.notice')) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.role = 'status';
      notice.textContent = warning;
      main.prepend(notice);
    }
  }
};
const stage = () => STAGES[position(state.xp)];
const difficultyLabel = () =>
  ['Initié', 'Enchanteur', 'Grand mage'][tierFor(state.settings, state.stats.math.correct)];
function navButton(id, icon, title) {
  return `<button data-nav="${id}" class="nav-item ${screen === id || (id === 'home' && ['clock', 'math'].includes(screen)) ? 'active' : ''}" ${screen === id ? 'aria-current="page"' : ''}><span aria-hidden="true">${icon}</span><span>${title}</span></button>`;
}
function shell(content) {
  app.innerHTML = `<div class="app-shell ${exercise ? 'in-exercise' : ''} ${screen === 'home' ? 'is-home' : ''}"><header class="topbar"><a class="brand" href="#home" aria-label="Astréa, accueil"><span class="brand-mark" aria-hidden="true">✦</span><span>ASTRÉA<small>MAGIC LEARNING QUEST</small></span></a><div class="top-status"><span class="online-dot ${navigator.onLine ? '' : 'offline'}"></span><span id="connection">${navigator.onLine ? 'Prêt à explorer' : 'Hors connexion'}</span></div><div class="profile" aria-label="Apprenti mage, niveau ${level(state.xp)}"><span aria-hidden="true">🧙</span><div>Apprenti mage<small>Niveau ${level(state.xp)}</small></div></div></header><div class="layout"><aside class="sidebar"><p class="eyebrow">TON ACADÉMIE</p><nav aria-label="Navigation principale">${navButton('home', '✦', 'Entraînement')}${navButton('adventure', '◇', 'Aventure')}${navButton('collection', '♜', 'Grimoire')}${navButton('settings', '⚙', 'Réglages')}</nav><div class="sidebar-quote"><span>☾</span><p>Les plus grands sorts<br>commencent par<br>un petit progrès.</p><small>ACADÉMIE D’ASTRÉA</small></div><button class="install sidebar-install" data-install>＋ Installer l’application</button></aside><main id="main" tabindex="-1">${warning ? `<p class="notice" role="status">${escape(warning)}</p>` : ''}${content}</main></div><nav class="mobile-nav" aria-label="Navigation mobile">${navButton('home', '✦', 'S’entraîner')}${navButton('adventure', '◇', 'Aventure')}${navButton('collection', '♜', 'Grimoire')}${navButton('settings', '⚙', 'Réglages')}</nav><div id="toast" role="status" class="toast"></div></div>`;
  app
    .querySelectorAll('[data-nav]')
    .forEach((b) => b.addEventListener('click', () => navigate(b.dataset.nav)));
  app.querySelector('.brand').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('home');
  });
  app.querySelectorAll('[data-install]').forEach((b) => b.addEventListener('click', install));
}
function home() {
  shell(`<section class="arcade-home" aria-label="Accueil de l’académie d’Astréa">
    <header class="arcade-brand"><p>L’ACADÉMIE D’ASTRÉA</p><h1 aria-label="Magic Learning Quest"><span>MAGIC</span><span>QUEST</span></h1><p class="arcade-subtitle">De petits défis. De grands pouvoirs !</p></header>
    <div class="arcade-heroes" role="img" aria-label="Un apprenti mage, une chouette et un petit dragon devant l’académie magique"></div>
    <div class="arcade-home-bottom"><div class="arcade-home-progress"><span>🧙 Niveau ${level(state.xp)}</span><strong data-testid="xp">${state.xp} XP</strong><span>◈ ${state.rewards.length} trésors</span></div>
    <div class="arcade-menu" aria-label="Choisis ton entraînement">
      <button class="arcade-menu-button clock-button" id="choose-clock"><span aria-hidden="true">◷</span><span>Horloge magique<small>Maîtrise le temps !</small></span><span aria-hidden="true">➜</span></button>
      <button class="arcade-menu-button math-button" id="choose-math"><span aria-hidden="true">✦</span><span>Maths magiques<small>Fais parler les nombres !</small></span><span aria-hidden="true">➜</span></button>
      <button class="arcade-menu-button adventure-button" id="explore" aria-label="Explorer mon aventure"><span aria-hidden="true">♜</span><span>Mon aventure<small>Direction le château !</small></span><span aria-hidden="true">➜</span></button>
    </div><p class="arcade-current-stage">${position(state.xp) === 19 ? '<strong>👑 Aélis est libre !</strong>' : ''}${stage().icon} ${stage().name} · Étape ${position(state.xp) + 1} / 20</p></div>
  </section>`);
  document.querySelector('#explore').onclick = () => navigate('adventure');
  document.querySelector('#choose-clock').onclick = () => start('clock');
  document.querySelector('#choose-math').onclick = () => start('math');
}
function adventure() {
  const pos = position(state.xp);
  shell(
    `<div class="page-heading"><div><p class="eyebrow">LE VOYAGE D’ASTRÉA</p><h1>Une aventure, deux pouvoirs<span class="gold">.</span></h1><p>L’heure et les maths te font avancer sur le même chemin.</p></div></div><section class="quest-summary glass"><span class="quest-icon">${stage().icon}</span><div><span class="eyebrow">ÉTAPE ${pos + 1} / 20</span><h2>${stage().name}</h2><p>${stage().story}</p><progress aria-label="Progression vers le château" max="1900" value="${Math.min(1900, state.xp)}"></progress><p>${pos === 19 ? 'Princesse Aélis délivrée ! Tu peux continuer à t’entraîner.' : `${100 - (state.xp % 100)} XP avant la prochaine étape · 20 à 25 XP par bonne réponse`}</p>${pos === 18 ? `<p>🐉 Ombre du dragon : ${100 - (state.xp % 100)} / 100. Tes bonnes réponses lancent des sorts de lumière !</p>` : ''}</div><div class="quest-actions"><button class="primary" data-train="clock">◷ Horloge</button><button class="secondary" data-train="math">✧ Maths</button></div></section><ol class="journey">${STAGES.map((s, i) => `<li class="journey-stop ${i < pos ? 'complete' : i === pos ? 'current' : 'locked'}" ${i === pos ? 'aria-current="step"' : ''}><span class="stop-number">${i < pos ? '✓' : i + 1}</span><span class="stop-icon" aria-hidden="true">${s.icon}</span><div><small>${i < pos ? 'EXPLORÉ' : i === pos ? 'TU ES ICI' : `${i * 100} XP`}</small><h3>${s.name}</h3><p>${s.story}</p>${s.reward ? `<span class="reward-label">${i <= pos ? '✦ Reçu : ' : '🎁 '}${s.reward}</span>` : ''}</div></li>`).join('')}</ol>`,
  );
  app.querySelectorAll('[data-train]').forEach((b) => (b.onclick = () => start(b.dataset.train)));
}
function collection() {
  shell(
    `<div class="page-heading"><div><p class="eyebrow">TES POUVOIRS GRANDISSENT</p><h1>Le grimoire des trésors<span class="gold">.</span></h1><p>${state.rewards.length} récompenses découvertes · Record : ${state.bestStreak} bonnes réponses à la suite</p></div></div><div class="collection-grid">${STAGES.filter(
      (s) => s.reward,
    )
      .map(
        (s) =>
          `<article class="glass treasure ${s.index <= position(state.xp) ? '' : 'undiscovered'}"><span aria-hidden="true">${s.index <= position(state.xp) ? s.icon : '♧'}</span><small>${s.index <= position(state.xp) ? 'DÉBLOQUÉ' : `${s.index * 100} XP`}</small><h2>${s.reward}</h2><p>${s.name}</p></article>`,
      )
      .join(
        '',
      )}</div><p class="footnote">Les coffres s’ouvrent automatiquement quand tu arrives à leur étape.</p>`,
  );
}
function settings() {
  const math = state.stats.math,
    clock = state.stats.clock;
  const errors = Object.entries(clock.buckets)
    .filter(([, v]) => v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 5);
  shell(
    `<div class="page-heading"><div><p class="eyebrow">À TON RYTHME</p><h1>Réglages de l’académie<span class="gold">.</span></h1><p>Choisis un défi confortable. Tu peux changer à tout moment.</p></div></div><div class="settings-grid"><section class="glass settings-panel"><h2>✧ Difficulté des maths</h2><fieldset><legend>Choisis ton niveau</legend>${[
      [
        'auto',
        'Progression automatique',
        'Le niveau augmente après 20 puis 40 bonnes réponses en maths.',
      ],
      [
        'easy',
        'Initié · Facile',
        'Additions jusqu’à 20, soustractions positives, tables de 2, 5 et 10.',
      ],
      [
        'medium',
        'Enchanteur · Intermédiaire',
        'Calculs jusqu’à 100, tables de 2, 3, 4, 5, 6, 8 et 10.',
      ],
      ['advanced', 'Grand mage · Avancé', 'Calculs jusqu’à 500, toutes les tables de 2 à 12.'],
    ]
      .map(
        ([v, t, d]) =>
          `<label class="choice"><input type="radio" name="difficulty" value="${v}" ${state.settings.difficulty === v ? 'checked' : ''}><span><strong>${t}</strong><small>${d}</small></span></label>`,
      )
      .join(
        '',
      )}</fieldset></section><section class="glass settings-panel"><h2>◷ Maîtrise de l’heure</h2><fieldset><legend>Choisis un palier</legend>${[
      ['auto', 'Progression automatique'],
      ['0', '1 · Heures pleines'],
      ['1', '2 · Demi-heures'],
      ['2', '3 · Quarts d’heure'],
      ['3', '4 · De 5 en 5 minutes'],
      ['4', '5 · Toutes les minutes'],
    ]
      .map(
        ([v, t]) =>
          `<label class="choice compact"><input type="radio" name="clockLevel" value="${v}" ${String(state.settings.clockLevel) === v ? 'checked' : ''}><span>${t}</span></label>`,
      )
      .join(
        '',
      )}</fieldset><p class="footnote">En automatique, un palier s’ouvre toutes les 10 bonnes réponses d’horloge.</p><label class="choice"><input type="checkbox" id="relaxed" ${state.settings.relaxed ? 'checked' : ''}><span><strong>Mode découverte · Sans chrono</strong><small>Tout le temps pour apprendre. Mêmes XP de base.</small></span></label></section><section class="glass settings-panel"><h2>Tes progrès</h2><div class="learning-stats">${[
      ['Horloge', clock],
      ['Maths', math],
    ]
      .map(
        ([n, s]) =>
          `<div><h3>${n}</h3><p>${s.correct} réussites · ${s.wrong} essais à revoir</p><p>Temps moyen : ${s.correct + s.wrong ? (s.totalMs / (s.correct + s.wrong) / 1000).toFixed(1) : '0'} s</p></div>`,
      )
      .join(
        '',
      )}</div><p>Score total : ${state.score} · Meilleure série : ${state.bestStreak}</p><h3>Minutes à apprivoiser</h3><p>${errors.length ? errors.map(([k, v]) => `:${k.split(':')[1]} (${v.wrong} essai${v.wrong > 1 ? 's' : ''} à revoir)`).join(' · ') : 'Les difficultés apparaîtront ici après tes premiers essais.'}</p><button class="secondary" id="export">Exporter la sauvegarde</button></section><section class="glass settings-panel"><h2>Emporte ta magie</h2><label class="choice"><input type="checkbox" id="sound-enabled" ${state.settings.sound ? 'checked' : ''}><span><strong>Sons magiques</strong><small>Carillons de victoire et sons doux pour réessayer.</small></span></label><p>Installe Astréa sur ton écran d’accueil. Après une première ouverture en ligne, l’aventure fonctionne hors connexion.</p><button class="primary" data-install>＋ Installer l’application</button><p class="footnote">Sur iPhone ou iPad : dans Safari, touche Partager, puis « Sur l’écran d’accueil ». Sur Android ou ordinateur : utilise le bouton d’installation du navigateur.</p><p class="footnote">Ta progression reste sur cet appareil et ce navigateur. Aucune donnée n’est envoyée à un serveur.</p></section></div><p id="settings-status" class="footnote" role="status">Réglages enregistrés automatiquement.</p>`,
  );
  app.querySelectorAll('input[name]').forEach(
    (input) =>
      (input.onchange = () => {
        state.settings[input.name] = input.value;
        persist();
        document.querySelector('#settings-status').textContent = 'Nouveaux réglages enregistrés.';
      }),
  );
  document.querySelector('#relaxed').onchange = (e) => {
    state.settings.relaxed = e.target.checked;
    persist();
  };
  document.querySelector('#sound-enabled').onchange = (e) => {
    state.settings.sound = e.target.checked;
    if (state.settings.sound) void sounds.unlock();
    else sounds.stop();
    persist();
  };
  document.querySelector('#export').onclick = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrea-sauvegarde.json';
    a.click();
    URL.revokeObjectURL(url);
  };
}
function navigate(next) {
  clearTimeout(advanceTimer);
  sounds.stop();
  clearInterval(ticker);
  exercise = null;
  feedback = null;
  screen = next;
  (({ home, adventure, settings, collection })[next] ?? home)();
  window.scrollTo(0, 0);
  document.querySelector('#main').focus({ preventScroll: true });
}
function start(mode, retryExercise = null) {
  clearTimeout(advanceTimer);
  sounds.stop();
  screen = mode;
  feedback = null;
  answer = '';
  hour = '';
  minute = '';
  field = 'hour';
  exercise = retryExercise
    ? { ...retryExercise }
    : mode === 'clock'
      ? generateClock(clockLevel(state.settings, state.stats.clock.correct))
      : generateMath(tierFor(state.settings, state.stats.math.correct));
  exercise.limit = timeLimit(mode, exercise.level ?? exercise.tier, state.settings.relaxed);
  started = performance.now();
  pausedAt = document.hidden ? started : 0;
  renderExercise();
  window.scrollTo(0, 0);
  document.querySelector('#main').focus({ preventScroll: true });
  clearInterval(ticker);
  ticker = setInterval(updateTimer, 100);
}
function renderExercise() {
  const isClock = screen === 'clock';
  shell(
    `<div class="exercise-heading"><button class="back secondary" id="back">← Menu</button><div><p class="eyebrow">${isClock ? 'LE POUVOIR DU TEMPS' : 'LE POUVOIR DES NOMBRES'}</p><h1>${isClock ? 'Horloge magique' : 'Maths magiques'}</h1></div><span class="pill" data-testid="xp">${state.xp} XP</span></div><section class="exercise-layout"><div class="exercise-board glass"><div class="exercise-meta"><span class="tag">${isClock ? ['Heures pleines', 'Demi-heures', 'Quarts d’heure', 'De 5 en 5', 'Toutes les minutes'][exercise.level] : difficultyLabel()}</span><span id="timer" role="timer" aria-label="Temps restant">${exercise.limit ? `${exercise.limit} s` : 'Sans chrono'}</span><button id="toggle-sound" class="sound-toggle" aria-pressed="${state.settings.sound}" aria-label="${state.settings.sound ? 'Couper les sons' : 'Activer les sons'}">${state.settings.sound ? '♫' : '♪'}<span aria-hidden="true">${state.settings.sound ? 'Son' : 'Muet'}</span></button></div><div class="timer-track" aria-hidden="true"><span id="timer-bar"></span></div><h2>${isClock ? 'Quelle heure est-il ?' : 'Quel sort lanceras-tu ?'}</h2>${isClock ? clockSVG(exercise.hour, exercise.minute) : `<div class="math-problem" aria-label="${exercise.a} ${exercise.op === '×' ? 'fois' : exercise.op === '−' ? 'moins' : 'plus'} ${exercise.b}"><span>${exercise.a}</span><span class="operator">${exercise.op}</span><span>${exercise.b}</span></div><div class="math-magic" aria-hidden="true">✧ · ✦ · ✧</div>`}<p class="exercise-hint">${isClock ? 'Petite aiguille = heures · Grande = minutes' : 'Prends ton temps, puis fais confiance à ta magie.'}</p></div><div class="answer-board glass"><p class="eyebrow">${isClock ? 'INDIQUE L’HEURE' : 'TA RÉPONSE'}</p><div class="answer-display">${isClock ? `<button id="hour" class="answer-field selected" aria-label="Heures" aria-pressed="true"><span id="hour-value">--</span><small>heures</small></button><span class="colon">:</span><button id="minute" class="answer-field" aria-label="Minutes" aria-pressed="false"><span id="minute-value">--</span><small>minutes</small></button>` : '<output id="math-answer" aria-label="Réponse au calcul">?</output>'}</div><div class="keypad" aria-label="Pavé numérique">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'].map((k) => `<button class="key" data-key="${k}" ${k === 'clear' ? 'aria-label="Effacer la réponse"' : k === 'delete' ? 'aria-label="Effacer le dernier chiffre"' : ''}>${k === 'clear' ? 'C' : k === 'delete' ? '⌫' : k}</button>`).join('')}</div><button class="primary validate" id="validate" disabled>Lancer mon sort <span>✦</span></button><p class="keyboard-hint">Clavier : chiffres · Tab pour changer de champ · Entrée pour valider</p><div id="feedback" aria-live="polite" aria-atomic="true"></div></div></section><div class="session-footer"><span>ϟ Série de ${state.streak}</span><span>📍 ${stage().name}</span><span>Bonne réponse : +20 XP · Rapide : +5 XP</span></div>`,
  );
  document.querySelector('#back').onclick = () => navigate('home');
  app.querySelectorAll('[data-key]').forEach((b) => (b.onclick = () => key(b.dataset.key)));
  document.querySelector('.exercise-board').append(document.querySelector('#feedback'));
  document.querySelector('#validate').onclick = submit;
  document.querySelector('#toggle-sound').onclick = () => {
    state.settings.sound = !state.settings.sound;
    persist();
    if (state.settings.sound) void sounds.unlock();
    else sounds.stop();
    const button = document.querySelector('#toggle-sound');
    button.setAttribute('aria-pressed', String(state.settings.sound));
    button.setAttribute(
      'aria-label',
      state.settings.sound ? 'Couper les sons' : 'Activer les sons',
    );
    button.innerHTML = `${state.settings.sound ? '♫' : '♪'}<span aria-hidden="true">${state.settings.sound ? 'Son' : 'Muet'}</span>`;
  };
  if (isClock)
    ['hour', 'minute'].forEach((f) => {
      document.querySelector(`#${f}`).onclick = () => selectField(f);
    });
}
function selectField(next) {
  field = next;
  for (const f of ['hour', 'minute']) {
    document.querySelector(`#${f}`).classList.toggle('selected', f === next);
    document.querySelector(`#${f}`).setAttribute('aria-pressed', String(f === next));
  }
}
function key(k) {
  if (!exercise || feedback) return;
  if (state.settings.sound) void sounds.unlock();
  if (screen === 'math')
    answer = k === 'clear' ? '' : k === 'delete' ? answer.slice(0, -1) : (answer + k).slice(0, 4);
  else {
    let value = field === 'hour' ? hour : minute;
    value =
      k === 'clear' ? '' : k === 'delete' ? value.slice(0, -1) : value.length === 2 ? k : value + k;
    if (field === 'hour') {
      hour = value;
      if (/^\d$/.test(k) && (hour.length === 2 || Number(hour) > 1)) selectField('minute');
    } else minute = value;
  }
  updateAnswer();
}
function updateAnswer() {
  if (screen === 'math') document.querySelector('#math-answer').textContent = answer || '?';
  else {
    document.querySelector('#hour-value').textContent = hour || '--';
    document.querySelector('#minute-value').textContent = minute || '--';
  }
  document.querySelector('#validate').disabled =
    screen === 'math'
      ? answer === ''
      : !(Number(hour) >= 1 && Number(hour) <= 12 && minute !== '' && Number(minute) <= 59);
}
function elapsed() {
  return Math.max(0, ((pausedAt || performance.now()) - started) / 1000);
}
function updateTimer() {
  if (!exercise || feedback || !exercise.limit) return;
  const left = Math.max(0, exercise.limit - elapsed());
  document.querySelector('#timer').textContent = `${Math.ceil(left)} s`;
  document.querySelector('#timer-bar').style.width = `${(left / exercise.limit) * 100}%`;
  document.querySelector('#timer').classList.toggle('urgent', left < 6);
  if (left <= 0) submit(true);
}
function submit(timedOut = false) {
  if (!exercise || feedback || (timedOut !== true && document.querySelector('#validate').disabled))
    return;
  timedOut = timedOut === true;
  const correct =
    !timedOut && validateAnswer(exercise, screen === 'clock' ? { hour, minute } : answer);
  const response = recordAnswer(state, exercise, {
    correct,
    elapsed: elapsed(),
    limit: exercise.limit,
    timedOut,
  });
  state = response.state;
  feedback = { ...response, correct };
  persist();
  clearInterval(ticker);
  app.querySelectorAll('[data-key], .answer-field').forEach((b) => (b.disabled = true));
  document.querySelector('[data-testid="xp"]').textContent = `${state.xp} XP`;
  if (state.settings.sound && !document.hidden) sounds.play(correct);
  const region = document.querySelector('#feedback');
  region.className = `arcade-feedback ${correct ? 'success' : 'retry'}`;
  const particles = correct
    ? Array.from(
        { length: 14 },
        (_, i) =>
          `<span class="arcade-star" style="--angle:${(i * 360) / 14}deg;--reach:${80 + (i % 3) * 28}px;--delay:${(i % 4) * 45}ms">${i % 3 ? '✦' : '✧'}</span>`,
      ).join('')
    : '';
  region.innerHTML = `<div class="arcade-particles" aria-hidden="true">${particles}</div><div class="arcade-medallion" aria-hidden="true">${correct ? '✦' : '☾'}</div><h3>${correct ? 'Bravo !' : timedOut ? 'Le temps s’est envolé !' : 'Oups, c’est raté !'}</h3><p class="arcade-caption">${correct ? (response.result.fast ? 'Un sort éclair !' : 'Ta magie grandit !') : 'Tu peux y arriver. Essaie encore !'}</p>${correct ? `<p class="arcade-points">+${response.result.xp} XP <span>+${response.result.score} points</span></p><p class="arcade-followup">Le prochain sort arrive…</p>` : `<p class="arcade-correction">${explanation(exercise)}</p>`}${response.newStage ? `<p class="arcade-unlock">${stage().icon} ${stage().name} ${position(state.xp) === 19 ? '· Aélis est délivrée !' : '· Nouvelle étape !'}</p>` : ''}${response.newRewards.length ? `<p class="arcade-unlock">🎁 Coffre ouvert : ${response.newRewards.join(', ')}</p>` : ''}`;
  const button = document.querySelector('#validate');
  button.disabled = correct;
  button.textContent = correct ? 'Bravo ! ✦' : 'Recommencer ↻';
  button.onclick = correct ? null : () => start(screen, exercise);
  // Keep the result on the exercise itself. No modal, result page or extra success click.
  document.querySelector('#main').focus({ preventScroll: true });
  if (correct) scheduleNext();
}
function scheduleNext() {
  clearTimeout(advanceTimer);
  if (!feedback?.correct || document.hidden) return;
  const completedExercise = exercise;
  const completedFeedback = feedback;
  advanceTimer = setTimeout(() => {
    if (exercise !== completedExercise || feedback !== completedFeedback || document.hidden) return;
    const notice = [
      completedFeedback.newStage ? `${stage().icon} ${stage().name}` : '',
      ...completedFeedback.newRewards.map((r) => `🎁 ${r}`),
    ]
      .filter(Boolean)
      .join(' · ');
    start(completedExercise.mode);
    if (notice) {
      const toast = document.querySelector('#toast');
      toast.textContent = notice;
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 6000);
    }
  }, ADVANCE_DELAY);
}
document.addEventListener('keydown', (e) => {
  if (!exercise || e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input')) return;
  if (/^\d$/.test(e.key)) {
    e.preventDefault();
    key(e.key);
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault();
    key('delete');
  } else if (e.key === 'Escape') navigate('home');
  else if (e.key === 'Enter' && !e.target.matches('button, a')) {
    e.preventDefault();
    if (feedback && !feedback.correct) start(screen, exercise);
    else if (!feedback) submit();
  }
});
document.addEventListener('focusin', (e) => {
  if (e.target.id === 'hour' || e.target.id === 'minute') selectField(e.target.id);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(advanceTimer);
    sounds.stop();
  }
  if (feedback) {
    if (!document.hidden) scheduleNext();
    return;
  }
  if (!exercise) return;
  if (document.hidden) pausedAt = performance.now();
  else if (pausedAt) {
    started += performance.now() - pausedAt;
    pausedAt = 0;
  }
});
async function install() {
  if (installPrompt) {
    await installPrompt.prompt();
    installPrompt = null;
  } else {
    const toast = document.querySelector('#toast');
    toast.textContent =
      'iPhone/iPad : Safari → Partager → Sur l’écran d’accueil. Android/PC : menu du navigateur → Installer l’application.';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 12000);
  }
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});
for (const event of ['online', 'offline'])
  window.addEventListener(event, () => {
    document.querySelector('#connection').textContent = navigator.onLine
      ? 'Prêt à explorer'
      : 'Hors connexion';
    document.querySelector('.online-dot').classList.toggle('offline', !navigator.onLine);
  });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        const toast = document.querySelector('#toast');
        toast.textContent =
          'Le mode hors connexion n’a pas pu être préparé. Réessaie avec une connexion.';
        toast.classList.add('visible');
      }),
  );
}
home();
