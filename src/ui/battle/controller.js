import {
  generateClock,
  generateMath,
  timeLimit,
  validateAnswer,
  expectedAnswer,
  correctionSteps,
} from '../../domain/exercises.js';
import {
  adventureFor,
  difficultyForAdventure,
  restartLevel,
  ENEMY_DAMAGE,
  LEVEL_XP,
} from '../../domain/adventures.js';
import { recordAnswer } from '../../domain/progression.js';
import { encounter, DuelClock, NEXT_MS, avatarColor } from '../../domain/duel.js';
import { openClockLesson } from '../clock-lesson.js';
import {
  battleView,
  introPanel,
  correctionPanel,
  victoryPanel,
  defeatPanel,
  shortName,
  ICONS,
} from './view.js';

const freshDuel = () => ({ errors: 0, fast: 0, xp: 0 });

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
    given = '',
    ticker,
    impactPlayed = false,
    rescue = false,
    paused = false,
    lessonOpen = false,
    shownPanel = null,
    duel = freshDuel(),
    spoils = null;
  const phonePortrait = matchMedia('(max-width: 600px) and (orientation: portrait)');
  const blocked = () => document.hidden || phonePortrait.matches || rescue || lessonOpen || paused;
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
    paused = false;
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
    duel = freshDuel();
    if (getState().settings.sound) void sounds.unlock();
    makeQuestion();
    ticker = setInterval(tick, 50);
  }
  function openLesson() {
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
  }
  function setPaused(value) {
    if (!mode || paused === value) return;
    paused = value;
    if (paused) sounds.stop();
    document.querySelector('.duel-pause').hidden = !paused;
    syncOrientation();
    document.querySelector(paused ? '#pause-resume' : '#main').focus({ preventScroll: true });
  }
  function makeQuestion() {
    const state = getState();
    const progress = adventureFor(state, mode);
    const difficulty = difficultyForAdventure(mode, state.settings, progress);
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
    shownPanel = null;
    paused = false;
    current = encounter(progress.xp);
    render(
      battleView({
        exercise,
        encounter: current,
        avatar: state.avatar,
        xp: progress.xp,
        sound: state.settings.sound,
        health: progress.health,
      }),
    );
    if (progress.health === 0) clock.phase = 'defeat';
    root().style.setProperty('--spell-color', avatarColor(state.avatar, 'wand'));
    document.querySelector('#battle-lesson')?.addEventListener('click', openLesson);
    document.querySelector('#pause').onclick = () => setPaused(true);
    document.querySelector('#pause-resume').onclick = () => setPaused(false);
    document.querySelector('#pause-quit').onclick = () => onNavigate('home');
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
      nextLevel();
    };
    document.querySelector('#rescue-home').onclick = () => onNavigate('home');
    syncOrientation();
    syncPlayerHealth(progress.health);
    window.scrollTo(0, 0);
    if (!phonePortrait.matches) focusStage();
  }
  // Keyboard players land on the panel's main action, otherwise on the arena itself.
  function focusStage() {
    const action = document.querySelector('#duel-panel:not([hidden]) #panel-next');
    (action ?? document.querySelector('#main')).focus({ preventScroll: true });
  }
  function nextLevel() {
    duel = freshDuel();
    clock.question(performance.now(), true);
    makeQuestion();
  }
  function showPanel() {
    const panel = document.querySelector('#duel-panel');
    const kind = ['intro', 'correction', 'victory', 'defeat'].includes(clock.phase)
      ? clock.phase
      : null;
    if (kind === shownPanel) return;
    shownPanel = kind;
    panel.hidden = !kind;
    panel.dataset.panel = kind ?? '';
    if (!kind) {
      panel.innerHTML = '';
      return;
    }
    const progress = adventureFor(getState(), mode);
    panel.setAttribute(
      'aria-label',
      { intro: 'Défi', correction: 'Correction', victory: 'Victoire', defeat: 'Défaite' }[kind],
    );
    panel.innerHTML =
      kind === 'intro'
        ? introPanel({ exercise, encounter: current })
        : kind === 'correction'
          ? correctionPanel({
              exercise,
              given,
              expected: expectedAnswer(exercise),
              steps: correctionSteps(exercise),
              last: progress.health === 0,
            })
          : kind === 'victory'
            ? victoryPanel({ encounter: current, duel, ...spoils })
            : defeatPanel({
                encounter: encounter(progress.xp),
                mode,
                levelXP: progress.xp % LEVEL_XP,
              });
    panel.querySelector('#panel-next').onclick = panelNext;
    const home = panel.querySelector('#panel-home');
    if (home) home.onclick = () => onNavigate('home');
    const lesson = panel.querySelector('#panel-lesson');
    if (lesson) lesson.onclick = openLesson;
    if (kind === 'defeat') {
      document.querySelector('#feedback').innerHTML = '';
      root().classList.add('player-defeated');
    }
    if (!blocked()) focusStage();
  }
  function panelNext() {
    if (!clock || blocked()) return;
    if (getState().settings.sound) void sounds.unlock();
    const now = performance.now();
    if (clock.phase === 'intro') {
      clock.begin(now);
      syncPhase();
      if (getState().settings.sound) sounds.cue('go');
      focusStage();
    } else if (clock.phase === 'correction') {
      if (adventureFor(getState(), mode).health === 0) {
        clock.phase = 'defeat';
        syncPhase();
      } else {
        clock.question(now);
        makeQuestion();
      }
    } else if (clock.phase === 'victory') nextLevel();
    else if (clock.phase === 'defeat') {
      setState(restartLevel(getState(), mode));
      nextLevel();
    }
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
    document.querySelector('#validate').disabled = !active || !valid();
    showPanel();
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
    // Back in landscape, focus must not stay on the hidden rotation notice.
    if (!blocked() && document.activeElement?.id === 'rotate-exit') focusStage();
  }
  function tick() {
    if (!mode || !clock || !root()) return;
    const before = clock.phase;
    clock.step(performance.now(), blocked());
    if (blocked()) return;
    if (before !== clock.phase) syncPhase();
    if (clock.phase === 'active' && exercise.limit) {
      const left = Math.max(0, exercise.limit - clock.answerMs / 1000);
      document.querySelector('#timer').textContent = `${Math.ceil(left)} s`;
      document.querySelector('#timer-bar').style.width = `${(left / exercise.limit) * 100}%`;
      document.querySelector('#timer').classList.toggle('urgent', left < 6);
      if (left === 0) submit(true);
    }
    if (['success', 'failure-cast', 'failure'].includes(clock.phase) && result) {
      if (clock.spellMs >= 1000 && !impactPlayed) impact();
      if (clock.phase === 'success' && !result.newStage) {
        const left = Math.max(0, NEXT_MS - clock.spellMs);
        const wait = document.querySelector('#feedback-wait');
        if (wait) {
          wait.querySelector('span').textContent = `Suite dans ${Math.ceil(left / 1000)} s`;
          wait.querySelector('i').style.width = `${(left / NEXT_MS) * 100}%`;
        }
        if (left === 0) advance();
      }
    }
  }
  const hidePop = () => document.querySelector('#damage-pop').classList.remove('visible');
  // The spell lands: bars move, the target flinches and the damage pops up.
  function impact(silent = false) {
    impactPlayed = true;
    const won = clock.phase === 'success';
    if (!silent && getState().settings.sound) sounds.cue(won ? 'impact' : 'enemy-impact');
    const health = document.querySelector('#enemy-health');
    if (won) health.value = Math.max(0, current.remaining - result.result.xp);
    document.querySelector('#enemy-health-text').textContent = `${health.value} / 100`;
    if (!won) syncPlayerHealth(result.health);
    root().classList.add('spell-hit');
    const pop = document.querySelector('#damage-pop');
    pop.textContent = `−${won ? result.result.xp : ENEMY_DAMAGE}`;
    pop.classList.add('visible');
  }
  function syncPlayerHealth(value) {
    document.querySelector('#player-health').value = value;
    document.querySelector('#player-health-text').textContent = `${value} / 100 PV`;
    root().classList.toggle('player-critical', value <= 25);
  }
  function measureSpell() {
    if (!root()) return;
    const reverse = clock?.phase?.startsWith('failure');
    const from = document
      .querySelector(`${reverse ? '.fighter-enemy' : '.fighter-player'} .pose-cast [data-wand-tip]`)
      ?.getBoundingClientRect();
    const to = document
      .querySelector(`${reverse ? '.fighter-player' : '.fighter-enemy'} .pose-idle .hit-target`)
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
    if (clock.phase !== 'active' || (timedOut !== true && !valid())) return;
    clock.step(performance.now(), false);
    const correct =
      timedOut !== true && validateAnswer(exercise, mode === 'clock' ? { hour, minute } : answer);
    given =
      timedOut === true
        ? 'pas de réponse'
        : mode === 'clock'
          ? `${Number(hour)}:${minute.padStart(2, '0')}`
          : answer;
    result = recordAnswer(getState(), exercise, {
      correct,
      elapsed: clock.answerMs / 1000,
      limit: exercise.limit,
      timedOut: timedOut === true,
    });
    setState(result.state);
    if (correct) {
      duel.xp += result.result.xp;
      duel.fast += Number(result.result.fast);
    } else duel.errors++;
    clock.result(correct, performance.now());
    syncPhase();
    document.querySelector('[data-testid="xp"]').textContent =
      `${adventureFor(getState(), mode).xp} XP`;
    const name = shortName(current.enemy);
    const feedback = document.querySelector('#feedback');
    feedback.className = `duel-feedback ${correct ? 'success' : 'retry'}`;
    feedback.innerHTML = correct
      ? `<div class="feedback-text"><h3>Bravo !</h3><p><strong>+${result.result.xp} XP</strong> · +${result.result.score} points</p></div><button class="panel-go" id="feedback-next">CONTINUER${ICONS.next}</button><div class="feedback-meta">${result.result.fast ? '<span class="panel-pill">Sort éclair !</span>' : ''}${result.starEarned ? `<span class="duel-unlock">★ Étoile ${result.stars}/3 gagnée !</span>` : ''}${result.newRewards.length ? `<span class="duel-unlock">🎁 ${result.newRewards.join(', ')}</span>` : ''}${result.newStage ? '' : '<span id="feedback-wait" class="feedback-wait"><span>Suite dans 3 s</span><b aria-hidden="true"><i></i></b></span>'}</div>`
      : `<div class="feedback-text"><h3>${timedOut === true ? 'Temps écoulé !' : 'Oups, c’est raté !'}</h3><p>${name} ${timedOut === true ? 'en profite' : 'riposte'} : −${ENEMY_DAMAGE} PV</p></div><button class="panel-go" id="feedback-next">VOIR LA<br>CORRECTION${ICONS.next}</button>`;
    feedback.querySelector('#feedback-next').onclick = feedbackNext;
    if (correct) root().classList.add('is-casting');
    else {
      root().classList.add('spell-blocked', 'is-enemy-casting');
      root().style.setProperty(
        '--spell-color',
        current.enemy.kind === 'dragon' ? current.enemy.accent : '#e58bf0',
      );
    }
    if (result.newStage) root().classList.add('enemy-defeated');
    measureSpell();
    if (getState().settings.sound) sounds.cue(correct ? 'cast' : 'enemy-cast');
    document.querySelector('#main').focus({ preventScroll: true });
  }
  // The banner's button skips the rest of the spell animation.
  function feedbackNext() {
    if (!clock || blocked() || !result) return;
    if (clock.phase === 'success') advance();
    else if (['failure-cast', 'failure'].includes(clock.phase)) {
      if (!impactPlayed) impact(true);
      hidePop();
      sounds.stop();
      clock.phase = 'correction';
      document.querySelector('#feedback').innerHTML = '';
      root().classList.remove('is-enemy-casting', 'spell-blocked', 'spell-hit');
      syncPhase();
    }
  }
  function advance() {
    const completed = result;
    const destination = encounter(adventureFor(getState(), mode).xp);
    if (completed.starEarned) {
      rescue = true;
      clock.phase = 'star';
      root().dataset.phase = 'star';
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
    if (completed.newStage) {
      if (!impactPlayed) impact(true);
      spoils = { stage: destination.stage, rewards: completed.newRewards };
      hidePop();
      clock.phase = 'victory';
      document.querySelector('#feedback').innerHTML = '';
      syncPhase();
      return;
    }
    clock.question(performance.now());
    makeQuestion();
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
    b.innerHTML = state.settings.sound ? ICONS.soundOn : ICONS.soundOff;
  }
  document.addEventListener('keydown', (e) => {
    if (!mode || e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.target.matches('input'))
      return;
    if (lessonOpen) return;
    if (e.key === 'Escape') {
      if (!rescue) setPaused(!paused);
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
      if (clock.phase === 'active') submit();
      else if (document.querySelector('#feedback-next')) feedbackNext();
      else panelNext();
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
