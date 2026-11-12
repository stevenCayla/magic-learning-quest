import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshAdventure,
  journeyFor,
  difficultyForAdventure,
  resetAdventure,
} from '../src/domain/adventures.js';
import { freshState, restore, load, SAVE_KEY } from '../src/domain/storage.js';
import { recordAnswer } from '../src/domain/progression.js';
import {
  generateClock,
  generateMath,
  validateAnswer,
  timeLimit,
  explanation,
} from '../src/domain/exercises.js';
const right = { correct: true, elapsed: 1, limit: 40 };
const answer = (s, mode) =>
  recordAnswer(
    s,
    { mode, key: mode === 'clock' ? 'minute:00' : '+:0', level: 0, tier: 0 },
    right,
  );

test('20 niveaux par étoile, trois étoiles puis maîtrise sans quatrième étoile', () => {
  for (const [xp, stars, level, target] of [
    [0, 0, 1, 1],
    [1900, 0, 20, 1],
    [1999, 0, 20, 1],
    [2000, 1, 1, 2],
    [3999, 1, 20, 2],
    [4000, 2, 1, 3],
    [5999, 2, 20, 3],
    [6000, 3, 20, 3],
    [10000, 3, 20, 3],
  ]) {
    const j = journeyFor(xp);
    assert.equal(j.stars, stars);
    assert.equal(j.level, level);
    assert.equal(j.targetStar, target);
    assert.equal(j.complete, stars === 3);
  }
});
test('XP, score, série et récompenses d’une aventure ne modifient jamais l’autre', () => {
  const first = freshState();
  const clock = answer(first, 'clock').state;
  assert.deepEqual(clock.adventures.math, first.adventures.math);
  const second = answer(clock, 'math').state;
  assert.deepEqual(second.adventures.clock, clock.adventures.clock);
  assert.equal(second.adventures.math.streak, 1);
  assert.equal(second.adventures.clock.streak, 1);
  assert.equal(second.adventures.clock.xp, 25);
  assert.equal(second.adventures.math.xp, 25);
  const failed = recordAnswer(
    second,
    { mode: 'clock', key: 'minute:35', level: 4 },
    { correct: false, elapsed: 12, limit: 20 },
  ).state;
  assert.deepEqual(failed.adventures.math, second.adventures.math);
  assert.equal(failed.adventures.clock.xp, 25);
});
test('une étoile obtenue redémarre au niveau 1 sans remise à zéro de l’autre aventure', () => {
  let s = freshState();
  s.adventures.clock.xp = 1975;
  s.adventures.clock.cycleCorrect = 90;
  s.adventures.math.xp = 375;
  const r = answer(s, 'clock');
  assert.equal(r.starEarned, true);
  assert.equal(r.stars, 1);
  assert.equal(journeyFor(r.state.adventures.clock.xp).level, 1);
  assert.equal(r.state.adventures.clock.cycleCorrect, 0);
  assert.deepEqual(r.state.adventures.math, s.adventures.math);
  s = r.state;
  s.adventures.clock.xp = 3975;
  assert.equal(answer(s, 'clock').stars, 2);
  s.adventures.clock.xp = 5975;
  const third = answer(s, 'clock');
  assert.equal(third.stars, 3);
  assert.equal(third.completed, true);
  assert.equal(answer(third.state, 'clock').starEarned, false);
});
test('difficulté plus forte à chaque étoile, même avec un réglage facile', () => {
  const settings = { difficulty: 'auto', clockLevel: 'auto' };
  for (const mode of ['clock', 'math']) {
    const levels = [0, 2000, 4000].map((xp) =>
      difficultyForAdventure(mode, settings, { ...freshAdventure(), xp }),
    );
    assert.ok(levels[1].level > levels[0].level);
    assert.ok(levels[2].level >= levels[1].level);
    assert.ok(levels[1].timeFactor < levels[0].timeFactor);
    assert.ok(levels[2].timeFactor < levels[1].timeFactor);
  }
  assert.equal(
    difficultyForAdventure(
      'clock',
      { clockLevel: '0' },
      { ...freshAdventure(), xp: 4000 },
    ).level,
    4,
  );
  assert.equal(
    difficultyForAdventure(
      'math',
      { difficulty: 'easy' },
      { ...freshAdventure(), xp: 4000 },
    ).level,
    2,
  );
  for (const star of [1, 2, 3]) {
    const ex = generateMath(2, () => 0.9999, '+', star);
    assert.equal(ex.answer, [500, 750, 1000][star - 1]);
  }
});
test('progression pédagogique à l’intérieur de chaque étoile', () => {
  const s = { clockLevel: 'auto', difficulty: 'auto' };
  assert.equal(
    difficultyForAdventure('clock', s, {
      ...freshAdventure(),
      cycleCorrect: 60,
    }).level,
    3,
  );
  assert.equal(
    difficultyForAdventure('clock', s, {
      ...freshAdventure(),
      xp: 2000,
      cycleCorrect: 20,
    }).level,
    4,
  );
  assert.equal(
    difficultyForAdventure('math', s, { ...freshAdventure(), cycleCorrect: 40 })
      .level,
    1,
  );
  assert.equal(
    difficultyForAdventure('math', s, {
      ...freshAdventure(),
      xp: 2000,
      cycleCorrect: 40,
    }).level,
    2,
  );
  assert.equal(timeLimit('clock', 4, true), 0);
});
test('matin/après-midi dès la première étoile : seule l’heure 24 h demandée est valide', () => {
  for (let hour = 1; hour <= 12; hour++)
    for (const period of ['morning', 'afternoon']) {
      const expected = (hour % 12) + (period === 'afternoon' ? 12 : 0),
        ex = { mode: 'clock', hour, minute: 15, period, answerHour: expected };
      assert.equal(validateAnswer(ex, { hour: expected, minute: 15 }), true);
      assert.equal(
        validateAnswer(ex, { hour: (expected + 12) % 24, minute: 15 }),
        false,
      );
      assert.equal(validateAnswer(ex, { hour: expected, minute: 16 }), false);
      assert.match(
        explanation(ex),
        new RegExp(String(expected).padStart(2, '0') + ' h 15'),
      );
    }
  const morning = generateClock(0, () => 0, true);
  assert.equal(morning.period, 'morning');
  assert.equal(morning.answerHour, 1);
  const noon = generateClock(4, () => 0.9999, true);
  assert.equal(noon.hour, 12);
  assert.equal(noon.answerHour, 12);
  for (const hour of [24, -1, '', '1.0'])
    assert.equal(
      validateAnswer(
        {
          mode: 'clock',
          hour: 12,
          minute: 0,
          period: 'morning',
          answerHour: 0,
        },
        { hour, minute: 0 },
      ),
      false,
    );
});
test('migration V1 : prorata fiable, aucune duplication d’XP ou de score, avatar conservé', () => {
  const old = freshState();
  old.version = 1;
  delete old.adventures;
  old.xp = 2000;
  old.score = 1234;
  old.stats.clock.correct = 60;
  old.stats.math.correct = 20;
  old.avatar.name = 'Mira';
  const r = restore(JSON.stringify(old));
  assert.equal(r.migrated, true);
  assert.equal(r.state.version, 2);
  assert.equal(r.state.adventures.clock.xp, 1500);
  assert.equal(r.state.adventures.math.xp, 500);
  assert.equal(r.state.xp, 2000);
  assert.equal(
    r.state.adventures.clock.score + r.state.adventures.math.score,
    1234,
  );
  assert.equal(r.state.avatar.name, 'Mira');
  assert.deepEqual(restore(JSON.stringify(r.state)).state, r.state);
});
test('migration automatique garde une sauvegarde originale et ne la réécrit pas', () => {
  const old = freshState();
  old.version = 1;
  delete old.adventures;
  old.xp = 1900;
  const raw = JSON.stringify(old),
    memory = new Map([[SAVE_KEY, raw]]);
  const store = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, v) => memory.set(key, v),
  };
  const migrated = load(store);
  assert.equal(migrated.state.adventures.clock.xp, 1900);
  assert.equal(migrated.state.adventures.math.xp, 0);
  assert.equal(memory.get(`${SAVE_KEY}.v1.backup`), raw);
  assert.equal(JSON.parse(memory.get(SAVE_KEY)).version, 2);
  load(store);
  assert.equal(memory.get(`${SAVE_KEY}.v1.backup`), raw);
});
test('réinitialisation ciblée conserve autre aventure, personnage, réglages et statistiques', () => {
  let s = freshState();
  s = answer(s, 'clock').state;
  s = answer(s, 'math').state;
  s.adventures.clock.xp = 4000;
  s.xp = 4025;
  s.unlocksXP = 4025;
  s.avatar.name = 'Mira';
  const r = resetAdventure(s, 'clock');
  assert.deepEqual(r.adventures.clock, freshAdventure());
  assert.deepEqual(r.adventures.math, s.adventures.math);
  assert.deepEqual(r.avatar, s.avatar);
  assert.deepEqual(r.settings, s.settings);
  assert.deepEqual(r.stats, s.stats);
  assert.deepEqual(r.history, s.history);
  assert.equal(r.unlocksXP, 4025);
  assert.equal(r.xp, 25);
  assert.equal(s.adventures.clock.xp, 4000);
  assert.throws(() => resetAdventure(s, 'unknown'));
});
test('sauvegarde V2 rejette les données d’aventure corrompues', () => {
  const s = freshState();
  s.adventures.math.xp = -1;
  assert.ok(restore(JSON.stringify(s)).warning);
  delete s.adventures.math;
  assert.ok(restore(JSON.stringify(s)).warning);
});
