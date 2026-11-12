import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_AVATAR,
  AVATAR_OPTIONS,
  normalizeAvatar,
  ENEMIES,
  encounter,
  DuelClock,
  COUNTDOWN_MS,
  SPELL_MS,
} from '../src/domain/duel.js';
import { freshState, restore } from '../src/domain/storage.js';
import { recordAnswer } from '../src/domain/progression.js';
import { wizardSVG, dragonSVG, escapeHTML } from '../src/ui/battle/characters.js';
import { sceneSVG } from '../src/ui/battle/scenes.js';

test('20 rencontres originales, cohérentes avec les étapes et le dragon final', () => {
  assert.equal(ENEMIES.length, 20);
  assert.equal(new Set(ENEMIES.map((e) => e.id)).size, 20);
  assert.equal(new Set(ENEMIES.map((e) => e.name)).size, 20);
  assert.ok(ENEMIES.slice(0, 18).every((e) => e.kind === 'wizard'));
  assert.equal(encounter(1800).enemy.kind, 'dragon');
  assert.equal(encounter(1899).rescued, false);
  assert.equal(encounter(1900).rescued, false);
  assert.equal(encounter(6000).rescued, true);
  assert.equal(encounter(0).enemy.id, 'brindor');
  assert.equal(encounter(900).enemy.scene, 'clock');
});
test('énergie indépendante dans chaque aventure', () => {
  for (const [xp, hp, index] of [
    [0, 100, 0],
    [25, 75, 0],
    [99, 1, 0],
    [100, 100, 1],
    [1875, 25, 18],
    [1900, 100, 19],
  ]) {
    assert.equal(encounter(xp).remaining, hp);
    assert.equal(encounter(xp).index, index);
  }
  let s = freshState();
  s.xp = 75;
  s.adventures.clock.xp = 75;
  s = recordAnswer(
    s,
    { mode: 'clock', key: 'minute:00', level: 0 },
    { correct: true, elapsed: 1, limit: 40 },
  ).state;
  assert.equal(encounter(s.adventures.clock.xp).index, 1);
  s = recordAnswer(
    s,
    { mode: 'math', key: '+:0', tier: 0 },
    { correct: true, elapsed: 1, limit: 30 },
  ).state;
  assert.equal(encounter(s.adventures.clock.xp).remaining, 100);
  assert.equal(encounter(s.adventures.math.xp).remaining, 75);
});
test('décompte exact 5,4,3,2,1 puis chrono de question, sans bonus de temps sur l’introduction', () => {
  const c = new DuelClock(100);
  assert.equal(c.count, 5);
  for (let i = 1; i <= 4; i++) {
    c.step(100 + i * 1000);
    assert.equal(c.count, 5 - i);
    assert.equal(c.phase, 'countdown');
    assert.equal(c.answerMs, 0);
  }
  c.step(5099);
  assert.equal(c.count, 1);
  c.step(5100);
  assert.equal(c.phase, 'active');
  assert.equal(c.answerMs, 0);
  c.step(5500);
  assert.equal(c.answerMs, 400);
  assert.equal(COUNTDOWN_MS, 5000);
});
test('le décompte se suspend complètement en portrait ou en arrière-plan', () => {
  const c = new DuelClock(0);
  c.step(1000);
  c.step(2000, true);
  c.step(70000, true);
  assert.equal(c.introMs, 1000);
  assert.equal(c.answerMs, 0);
  c.step(80000, false);
  assert.equal(c.introMs, 1000);
  c.step(81000, false);
  assert.equal(c.introMs, 2000);
});
test('réponse et animation ont des temps indépendants, une interruption ne tue pas le duel', () => {
  const c = new DuelClock(0);
  c.step(5000);
  c.step(6200);
  assert.equal(c.answerMs, 1200);
  c.step(6300, true);
  c.step(90000, true);
  c.step(91000, false);
  c.step(91500, false);
  assert.equal(c.answerMs, 1700);
  c.result(true, 91500);
  c.step(92000);
  assert.equal(c.spellMs, 500);
  assert.equal(c.answerMs, 1700);
  c.step(93000, true);
  c.step(99000, false);
  assert.equal(c.spellMs, 500);
  c.step(100300);
  assert.equal(c.spellMs, SPELL_MS);
});
test('réessai sans décompte, nouvelle étape avec décompte, temps monotone protégé', () => {
  const c = new DuelClock(0);
  c.step(5000);
  c.result(false, 5500);
  c.step(20000);
  assert.equal(c.phase, 'failure');
  c.question(20000);
  assert.equal(c.phase, 'active');
  assert.equal(c.answerMs, 0);
  c.step(19999);
  assert.equal(c.answerMs, 0);
  c.question(30000, true);
  assert.equal(c.phase, 'countdown');
  assert.equal(c.count, 5);
});
test('personnalisation normalisée, accessoires verrouillés et débloqués', () => {
  assert.deepEqual(normalizeAvatar(null), DEFAULT_AVATAR);
  assert.deepEqual(normalizeAvatar({ robe: 'introuvable' }), DEFAULT_AVATAR);
  assert.equal(normalizeAvatar({ hat: 'crown', wand: 'sun' }, 0).hat, 'pointed');
  assert.equal(normalizeAvatar({ wand: 'sun' }, 399).wand, 'star');
  assert.equal(normalizeAvatar({ wand: 'sun' }, 400).wand, 'sun');
  assert.equal(normalizeAvatar({ robe: 'aurora' }, 1200).robe, 'aurora');
  assert.equal(normalizeAvatar({ hat: 'crown' }, 1900).hat, 'crown');
  assert.equal(normalizeAvatar({ name: '\n  Mira\t  ' }).name, 'Mira');
  assert.equal(normalizeAvatar({ name: 'x'.repeat(50) }).name.length, 18);
  for (const [key, options] of Object.entries(AVATAR_OPTIONS))
    for (const [id] of options) assert.equal(normalizeAvatar({ [key]: id }, 1900)[key], id);
});
test('les anciennes sauvegardes et les choix personnalisés se restaurent sans perte d’XP', () => {
  const old = freshState();
  old.xp = 125;
  old.version = 1;
  delete old.adventures;
  delete old.avatar;
  const restored = restore(JSON.stringify(old));
  assert.equal(restored.warning, '');
  assert.equal(restored.state.xp, 125);
  assert.deepEqual(restored.state.avatar, DEFAULT_AVATAR);
  restored.state.avatar = normalizeAvatar(
    { name: 'Mira', skin: 'deep', style: 'braids', robe: 'emerald', wand: 'crystal' },
    125,
  );
  assert.deepEqual(restore(JSON.stringify(restored.state)).state, restored.state);
});
test('20 décors distincts et des silhouettes distinctes, avec ancrages de baguette pour le projectile', () => {
  assert.equal(new Set(ENEMIES.map((_, i) => sceneSVG(i))).size, 20);
  const characters = ENEMIES.slice(0, 18).map((enemy) => wizardSVG({ enemy, prefix: 'same' }));
  assert.equal(new Set(characters).size, 18);
  for (const svg of [...characters, dragonSVG(ENEMIES[18])]) {
    assert.match(svg, /data-wand-tip/);
    assert.match(svg, /wand-arm/);
    assert.match(svg, /hit-target/);
  }
  assert.match(sceneSVG(4), /data-scene="library"/);
  assert.match(sceneSVG(18), /data-scene="dragon"/);
  assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
