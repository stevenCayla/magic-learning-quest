import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, restore } from '../src/domain/storage.js';
import { recordAnswer } from '../src/domain/progression.js';
import { restartLevel, journeyFor } from '../src/domain/adventures.js';
const exercise = (mode) => ({
  mode,
  key: mode === 'clock' ? 'minute:35' : '+:0',
  level: 3,
  tier: 0,
});
const reply = (state, mode, correct, timedOut = false) =>
  recordAnswer(state, exercise(mode), {
    correct,
    timedOut,
    elapsed: 12,
    limit: 20,
  });

test('100 PV par aventure, quatre impacts de 25 PV, zéro borné et défaite unique', () => {
  let s = freshState();
  for (const [i, hp] of [75, 50, 25, 0].entries()) {
    const r = reply(s, 'clock', false);
    s = r.state;
    assert.equal(r.health, hp);
    assert.equal(r.defeated, i === 3);
    assert.equal(s.adventures.math.health, 100);
    assert.equal(s.adventures.clock.defeats, Number(i === 3));
  }
  assert.throws(() => reply(s, 'clock', false));
  assert.throws(() => reply(s, 'clock', true));
});
test('expiration coûte de la vie, réussite dans le même niveau ne guérit pas', () => {
  let s = reply(freshState(), 'math', false, true).state;
  assert.equal(s.adventures.math.health, 75);
  s = reply(s, 'math', true).state;
  assert.equal(s.adventures.math.health, 75);
  assert.equal(s.adventures.math.xp, 20);
});
test('un nouveau niveau et chaque nouvelle étoile restaurent toute la vie', () => {
  for (const xp of [80, 1980, 3980, 5980, 6080]) {
    const s = freshState();
    s.adventures.math.xp = xp;
    s.adventures.math.health = 25;
    s.adventures.math.cycleCorrect = 60;
    const r = reply(s, 'math', true);
    assert.equal(r.state.adventures.math.health, 100);
    assert.equal(r.state.adventures.math.levelStartCorrect, r.state.adventures.math.cycleCorrect);
  }
});
test('recommencer rend toute la vie sans rien retirer de ce qui est gagné', () => {
  let s = freshState();
  s.adventures.clock.xp = 550;
  s.adventures.clock.score = 7500;
  s.adventures.clock.bestStreak = 12;
  s.adventures.clock.cycleCorrect = 23;
  s.adventures.clock.levelStartCorrect = 21;
  s.adventures.math.xp = 290;
  s.adventures.math.health = 50;
  for (let i = 0; i < 4; i++) s = reply(s, 'clock', false).state;
  const before = structuredClone(s),
    next = restartLevel(s, 'clock');
  assert.equal(next.adventures.clock.xp, 550);
  assert.equal(next.adventures.clock.health, 100);
  assert.equal(next.adventures.clock.cycleCorrect, 23);
  assert.equal(next.adventures.clock.defeats, 1);
  assert.equal(journeyFor(next.adventures.clock.xp).level, 6);
  for (const key of ['score', 'bestStreak', 'rewards'])
    assert.deepEqual(next.adventures.clock[key], before.adventures.clock[key]);
  for (const key of ['stats', 'history', 'avatar', 'settings', 'unlocksXP'])
    assert.deepEqual(next[key], before[key]);
  assert.deepEqual(next.adventures.math, before.adventures.math);
  assert.deepEqual(s, before);
  assert.equal(next.xp, 840);
  assert.throws(() => restartLevel(next, 'clock'));
  assert.throws(() => restartLevel(next, 'unknown'));
});
test('une défaite ne retire jamais une étoile, même après la maîtrise complète', () => {
  for (const xp of [1999, 2075, 4075, 6075, 6175]) {
    const s = freshState();
    s.adventures.clock.xp = xp;
    s.adventures.clock.health = 0;
    const next = restartLevel(s, 'clock');
    assert.equal(journeyFor(next.adventures.clock.xp).stars, journeyFor(xp).stars);
    assert.equal(journeyFor(next.adventures.clock.xp).level, journeyFor(xp).level);
  }
});
test('vie et défaite survivent à la restauration ; anciennes V2 accueillies à 100 PV', () => {
  for (const health of [100, 75, 50, 25, 0]) {
    const s = freshState();
    s.adventures.clock.health = health;
    s.adventures.clock.defeats = health === 0 ? 1 : 0;
    assert.deepEqual(restore(JSON.stringify(s)).state, s);
  }
  const old = freshState();
  delete old.adventures.clock.health;
  delete old.adventures.clock.defeats;
  delete old.adventures.clock.levelStartCorrect;
  const result = restore(JSON.stringify(old));
  assert.equal(result.warning, '');
  assert.equal(result.state.adventures.clock.health, 100);
});
test('les valeurs de combat corrompues sont refusées', () => {
  for (const [key, value] of [
    ['health', -1],
    ['health', 101],
    ['health', 0.5],
    ['health', '75'],
    ['defeats', -1],
    ['levelStartCorrect', 1],
  ]) {
    const s = freshState();
    s.adventures.clock[key] = value;
    assert.ok(restore(JSON.stringify(s)).warning);
  }
});
