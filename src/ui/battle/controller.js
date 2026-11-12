import {
  generateClock,
  generateMath,
  timeLimit,
  validateAnswer,
  explanation,
} from '../../domain/exercises.js';
import { adventureFor, difficultyForAdventure } from '../../domain/adventures.js';
import { recordAnswer } from '../../domain/progression.js';
import { encounter, DuelClock, SPELL_MS, avatarColor } from '../../domain/duel.js';
import { openClockLesson } from '../clock-lesson.js';
import { battleView } from './view.js';

export function createBattleController({ getState, setState, render, onNavigate, sounds }) {
  let mode = null,
    exercise = null,
    current = null,
    clock = null,
    result = null,
    answer = '',
    hour = '',
    minute = '',
    field = 'hour',
    ticker,
    lastCount = -1,
    impactPlayed = false,
    rescue = false,
    lessonOpen = false;
  const phonePortrait = matchMedia('(max-width: 600px) and (orientation: portrait)');
  const blocked = () => document.hidden || phonePortrait.matches || rescue || lessonOpen;
  const root = () => document.querySelector('.battle-shell');
  const valid = () =>
    mode === 'math'
      ? answer !== ''
      : hour !== '' &&
        Number(hour) >= 0 &&
        Number(hour) <= 23 &&
        minute !== '' &&
        Number(minute) <= 59;
  function stop() {
    clearInterval(ticker);
    sounds.stop();
    mode = null;
    lessonOpen = false;
    document.querySelector('.clock-lesson')?.close();
    exercise = null;
    result = null;
    clock = null;
  }
  function start(nextMode) {
    stop();
    mode = nextMode;
    current = encounter(adventureFor(getState(), mode).xp);
    clock = new DuelClock(performance.now());
    rescue = false;
    if (getState().settings.sound) void sounds.unlock();
    makeQuestion();
    ticker = setInterval(tick, 50);
  }
  function makeQuestion(retry = false) {
    const state = getState();
    const progress = adventureFor(state, mode);
    const difficulty = difficultyForAdventure(mode, state.settings, progress);
    if (!retry)
      exercise =
        mode === 'clock'
          ? generateClock(difficulty.level, Math.random, true)
          : generateMath(difficulty.level, Math.random, undefined, difficulty.star);
    const baseLimit = timeLimit(mode, exercise.level ?? exercise.tier, state.settings.relaxed);
    exercise.limit = baseLimit ? Math.max(8, Math.round(baseLimit * difficulty.timeFactor)) : 0;
    answer = '';
    hour = '';
    minute = '';
    field = 'hour';
    result = null;
    impactPlayed = false;
    lastCount = -1;
    current = encounter(adventureFor(state, mode).xp);
    render(
      battleView({
        exercise,
        encounter: current,
        avatar: state.avatar,
        xp: progress.xp,
        sound: state.settings.sound,
      }),
    );
    if (clock.phase !== 'countdown') document.querySelector('.battle-go')?.remove();
    root().style.setProperty('--spell-color', avatarColor(state.avatar, 'wand'));
    document.querySelector('#battle-lesson')?.addEventListener('click', () => {
      lessonOpen = true;
      sounds.stop();
      clock.step(performance.now(), true);
      syncOrientation();
      openClockLesson({
        onClose: () => {
          lessonOpen = false;
          if (!mode) return;
          clock.step(performance.now(), false);
          syncOrientation();
          document.querySelector('#main').focus({ preventScroll: true });
        },
      });
    });
    document.querySelector('#back').onclick = () => onNavigate('home');
    document.querySelector('#rotate-exit').onclick = () => onNavigate('home');
    document.querySelector('#toggle-sound').onclick = toggleSound;
    document.querySelectorAll('[data-key]').forEach((b) => (b.onclick = () => key(b.dataset.key)));
    for (const f of ['hour', 'minute']) {
      const button = document.querySelector(`#${f}`);
      if (button) button.onclick = () => selectField(f);
    }
    document.querySelector('#validate').onclick = submit;
    document.querySelector('#rescue-continue').onclick = () => {
      rescue = false;
      clock.question(performance.now(), true);
      makeQuestion(false);
    };
    document.querySelector('#rescue-home').onclick = () => onNavigate('home');
    syncOrientation();
    syncPhase();
    window.scrollTo(0, 0);
    if (!phonePortrait.matches) document.querySelector('#main').focus({ preventScroll: true });
  }
  function selectField(f) {
    if (!clock || clock.phase !== 'active' || blocked()) return;
    field = f;
    for (const name of ['hour', 'minute']) {
      const b = document.querySelector(`#${name}`);
      b.classList.toggle('selected', f === name);
      b.setAttribute('aria-pressed', String(f === name));
    }
  }
  function key(k) {
    if (!clock || clock.phase !== 'active' || blocked()) return;
    if (getState().settings.sound) void sounds.unlock();
    if (mode === 'math')
      answer = k === 'clear' ? '' : k === 'delete' ? answer.slice(0, -1) : (answer + k).slice(0, 4);
    else {
      let value = field === 'hour' ? hour : minute;
      value =
        k === 'clear'
          ? ''
          : k === 'delete'
            ? value.slice(0, -1)
            : value.length === 2
              ? k
              : value + k;
      if (field === 'hour') {
        hour = value;
        if (/^\d$/.test(k) && (hour.length === 2 || Number(hour) > 2)) selectField('minute');
      } else minute = value;
    }
    if (mode === 'math') document.querySelector('#math-answer').textContent = answer || '?';
    else {
      document.querySelector('#hour-value').textContent = hour || '--';
      document.querySelector('#minute-value').textContent = minute || '--';
    }
    document.querySelector('#validate').disabled = !valid();
  }
  function syncPhase() {
    if (!clock || !root()) return;
    root().dataset.phase = clock.phase;
    const active = clock.phase === 'active' && !blocked();
    document.querySelectorAll('[data-key], .answer-field').forEach((b) => (b.disabled = !active));
    const button = document.querySelector('#validate');
    button.disabled = clock.phase === 'failure' ? blocked() : !active || !valid();
    button.textContent =
      clock.phase === 'countdown'
        ? 'Prépare ta baguette…'
        : clock.phase === 'success'
          ? 'Bravo ! ✦'
          : clock.phase === 'failure-cast'
            ? 'Le sorcier riposte…'
            : clock.phase === 'failure'
              ? 'Recommencer ↻'
              : 'Lancer mon sort ✦';
    document.querySelector('#duel-intro').hidden = clock.phase !== 'countdown';
  }
  function syncOrientation() {
    if (!mode || !root()) return;
    const notice = document.querySelector('.rotate-notice');
    notice.hidden = !phonePortrait.matches;
    root().classList.toggle('needs-rotation', phonePortrait.matches);
    root().classList.toggle('battle-paused', blocked());
    document.querySelector('.battle-content').inert = phonePortrait.matches;
    if (phonePortrait.matches) {
      sounds.stop();
      document.querySelector('#rotate-exit').focus({ preventScroll: true });
    }
    if (clock) clock.step(performance.now(), blocked());
    syncPhase();
    measureSpell();
  }
  function tick() {
    if (!mode || !clock || !root()) return;
    const before = clock.phase;
    clock.step(performance.now(), blocked());
    if (blocked()) return;
    if (clock.phase === 'countdown') {
      const count = clock.count;
      if (count !== lastCount) {
        lastCount = count;
        const counter = document.querySelector('#countdown-value');
        counter.textContent = count;
        counter.setAttribute('aria-label', `Départ dans ${count} secondes`);
        counter.classList.remove('count-pulse');
        void counter.offsetWidth;
        counter.classList.add('count-pulse');
        if (getState().settings.sound) sounds.cue('tick', count);
      }
    }
    if (before !== clock.phase) {
      syncPhase();
      if (clock.phase === 'active' && getState().settings.sound) sounds.cue('go');
    }
    if (clock.phase === 'active' && exercise.limit) {
      const left = Math.max(0, exercise.limit - clock.answerMs / 1000);
      document.querySelector('#timer').textContent = `${Math.ceil(left)} s`;
      document.querySelector('#timer-bar').style.width = `${(left / exercise.limit) * 100}%`;
      document.querySelector('#timer').classList.toggle('urgent', left < 6);
      if (left === 0) submit(true);
    }
    if (['success', 'failure-cast', 'failure'].includes(clock.phase) && result) {
      if (clock.spellMs >= 1000 && !impactPlayed) {
        impactPlayed = true;
        if (getState().settings.sound)
          sounds.cue(clock.phase === 'success' ? 'impact' : 'enemy-impact');
        const health = document.querySelector('#enemy-health');
        if (clock.phase === 'success')
          health.value = Math.max(0, current.remaining - result.result.xp);
        document.querySelector('#enemy-health-text').textContent = `${health.value} / 100`;
        root().classList.add('spell-hit');
      }
      if (clock.phase === 'success' && clock.spellMs >= SPELL_MS) advance();
    }
  }
  function measureSpell() {
    if (!root()) return;
    const reverse = clock?.phase?.startsWith('failure');
    const from = document
      .querySelector(reverse ? '.fighter-enemy [data-wand-tip]' : '.fighter-player [data-wand-tip]')
      ?.getBoundingClientRect();
    const to = document
      .querySelector(reverse ? '.fighter-player .hit-target' : '.fighter-enemy .hit-target')
      ?.getBoundingClientRect();
    const box = root().getBoundingClientRect();
    if (!from || !to) return;
    const x = from.x + from.width / 2 - box.x,
      y = from.y + from.height / 2 - box.y,
      tx = to.x + to.width / 2 - box.x,
      ty = to.y + to.height / 2 - box.y;
    for (const [name, value] of Object.entries({
      'from-x': x,
      'from-y': y,
      'to-x': tx,
      'to-y': ty,
    }))
      root().style.setProperty(`--${name}`, `${value}px`);
    root().style.setProperty(
      '--flight-angle',
      `${(Math.atan2(ty - y, tx - x) * 180) / Math.PI}deg`,
    );
  }
  function submit(timedOut = false) {
    if (!clock || blocked()) return;
    if (clock.phase === 'failure') {
      clock.question(performance.now());
      makeQuestion(true);
      return;
    }
    if (clock.phase !== 'active' || (timedOut !== true && !valid())) return;
    clock.step(performance.now(), false);
    const correct =
      timedOut !== true && validateAnswer(exercise, mode === 'clock' ? { hour, minute } : answer);
    result = recordAnswer(getState(), exercise, {
      correct,
      elapsed: clock.answerMs / 1000,
      limit: exercise.limit,
      timedOut: timedOut === true,
    });
    setState(result.state);
    clock.result(correct, performance.now());
    syncPhase();
    document.querySelector('[data-testid="xp"]').textContent =
      `${adventureFor(getState(), mode).xp} XP`;
    const feedback = document.querySelector('#feedback');
    feedback.className = `duel-feedback ${correct ? 'success' : 'retry'}`;
    feedback.innerHTML = correct
      ? `<h3>Bravo !</h3><p><strong>+${result.result.xp} XP</strong> · +${result.result.score} points${result.result.fast ? ' · Sort éclair !' : ''}</p>${result.newStage ? `<p class="duel-unlock">${result.starEarned ? `★ Étoile ${result.stars}/3 gagnée !` : encounter(adventureFor(getState(), mode).xp).stage.name}</p>` : ''}${result.newRewards.length ? `<p class="duel-unlock">🎁 ${result.newRewards.join(', ')}</p>` : ''}`
      : `<h3>${timedOut === true ? 'Le temps s’est envolé !' : 'Oups, c’est raté !'}</h3><p>${explanation(exercise)}</p><small>Le bon sort est à ta portée. Essaie encore !</small>`;
    if (correct) root().classList.add('is-casting');
    else {
      root().classList.add('spell-blocked', 'is-enemy-casting');
      root().style.setProperty('--spell-color', current.enemy.accent);
    }
    if (result.newStage) root().classList.add('enemy-defeated');
    measureSpell();
    if (getState().settings.sound) sounds.cue(correct ? 'cast' : 'enemy-cast');
    document.querySelector('#main').focus({ preventScroll: true });
  }
  function advance() {
    const completed = result;
    const destination = encounter(adventureFor(getState(), mode).xp);
    if (completed.starEarned) {
      rescue = true;
      clock.phase = 'victory';
      root().dataset.phase = 'victory';
      const celebration = document.querySelector('.rescue-celebration');
      celebration.hidden = false;
      celebration.querySelector('h2').textContent = `★ Étoile ${completed.stars}/3 gagnée !`;
      celebration.querySelector('p').textContent = completed.completed
        ? 'Tu as maîtrisé les trois étoiles de cette aventure !'
        : `Bravo ! L’aventure ${mode === 'clock' ? 'Horloge' : 'Maths'} recommence au niveau 1 avec plus de difficulté.`;
      document.querySelector('#rescue-continue').textContent = completed.completed
        ? 'Continuer à s’entraîner'
        : 'Repartir plus fort';
      document.querySelector('#rescue-continue').focus({ preventScroll: true });
      if (getState().settings.sound) sounds.play(true);
      return;
    }
    clock.question(performance.now(), completed.newStage);
    makeQuestion(false);
    const text = [
      completed.newStage ? `${destination.stage.icon} ${destination.stage.name}` : '',
      ...completed.newRewards.map((r) => `🎁 ${r}`),
    ]
      .filter(Boolean)
      .join(' · ');
    if (text) {
      const toast = document.querySelector('#toast');
      toast.textContent = text;
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 6000);
    }
  }
  function toggleSound() {
    const state = structuredClone(getState());
    state.settings.sound = !state.settings.sound;
    setState(state);
    if (state.settings.sound) void sounds.unlock();
    else sounds.stop();
    const b = document.querySelector('#toggle-sound');
    b.setAttribute('aria-pressed', String(state.settings.sound));
    b.setAttribute('aria-label', state.settings.sound ? 'Couper les sons' : 'Activer les sons');
    b.textContent = state.settings.sound ? '♫' : '♪';
  }
  document.addEventListener('keydown', (e) => {
    if (!mode || e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.target.matches('input'))
      return;
    if (lessonOpen) return;
    if (e.key === 'Escape') {
      onNavigate('home');
      return;
    }
    if (blocked()) return;
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      key(e.key);
    } else if (['Delete', 'Backspace'].includes(e.key)) {
      e.preventDefault();
      key('delete');
    } else if (e.key === 'Enter' && !e.target.matches('button,a')) {
      e.preventDefault();
      submit();
    }
  });
  document.addEventListener('focusin', (e) => {
    if (mode && ['hour', 'minute'].includes(e.target.id)) selectField(e.target.id);
  });
  document.addEventListener('visibilitychange', () => {
    if (!mode) return;
    if (document.hidden) sounds.stop();
    syncOrientation();
  });
  phonePortrait.addEventListener('change', syncOrientation);
  window.addEventListener('resize', syncOrientation);
  return { start, stop };
}
