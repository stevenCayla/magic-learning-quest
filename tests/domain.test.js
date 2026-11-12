import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMath,
  generateClock,
  validateAnswer,
  tierFor,
  clockLevel,
  timeLimit,
  integer,
  explanation,
} from '../src/domain/exercises.js';
import {
  STAGES,
  position,
  level,
  unlockedRewards,
  scoreAnswer,
  recordAnswer,
} from '../src/domain/progression.js';
import { freshState, restore, load, save, SAVE_KEY } from '../src/domain/storage.js';
function seeded(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
for (const tier of [0, 1, 2]) {
  for (const op of ['+', '−', '×']) {
    test(`génération déterministe ${op}, difficulté ${tier}, 1000 exercices`, () => {
      const random = seeded(42);
      for (let i = 0; i < 1000; i++) {
        const ex = generateMath(tier, random, op),
          max = [20, 100, 500][tier];
        assert.equal(ex.mode, 'math');
        assert.equal(ex.tier, tier);
        assert.ok(Number.isInteger(ex.answer));
        assert.ok(ex.answer >= 0);
        if (op === '+') {
          assert.equal(ex.answer, ex.a + ex.b);
          assert.ok(ex.answer <= max);
        }
        if (op === '−') {
          assert.equal(ex.answer, ex.a - ex.b);
          assert.ok(ex.a >= ex.b);
          assert.ok(ex.a <= max);
        }
        if (op === '×') {
          assert.equal(ex.answer, ex.a * ex.b);
          assert.ok(ex.b >= 1 && ex.b <= (tier === 2 ? 12 : 10));
          if (tier === 0) assert.ok([2, 5, 10].includes(ex.a));
        }
        assert.ok(validateAnswer(ex, String(ex.answer)));
        assert.equal(validateAnswer(ex, ex.answer + 1), false);
      }
      assert.deepEqual(generateMath(tier, seeded(9), op), generateMath(tier, seeded(9), op));
    });
  }
}
test('opérations variées, bornes et hasard extrême', () => {
  assert.deepEqual(
    [0, 0.4, 0.9].map((n) => generateMath(0, () => n).op),
    ['+', '−', '×'],
  );
  assert.equal(
    integer(1, 12, () => 1),
    12,
  );
  assert.equal(
    integer(1, 12, () => 0),
    1,
  );
  assert.equal(
    integer(1, 12, () => -1),
    1,
  );
  assert.equal(generateMath(99, () => 1, '×').answer, 144);
  assert.equal(generateMath(-2, () => 0, '+').tier, 0);
  assert.throws(() => generateMath(0, Math.random, '/'));
});
for (let l = 0; l <= 4; l++)
  test(`horloge palier ${l}, bornes et intervalles`, () => {
    const random = seeded(7),
      hours = new Set(),
      mins = new Set();
    for (let i = 0; i < 2000; i++) {
      const ex = generateClock(l, random);
      assert.ok(ex.hour >= 1 && ex.hour <= 12);
      assert.ok(ex.minute >= 0 && ex.minute <= 59);
      assert.equal(ex.minute % [60, 30, 15, 5, 1][l], 0);
      assert.ok(validateAnswer(ex, { hour: ex.hour, minute: String(ex.minute).padStart(2, '0') }));
      hours.add(ex.hour);
      mins.add(ex.minute);
    }
    assert.equal(hours.size, 12);
    assert.equal(mins.size, [1, 2, 4, 12, 60][l]);
  });
test('validation stricte, midi, minutes, saisies vides ou malformées', () => {
  const ex = { mode: 'clock', hour: 12, minute: 0 };
  assert.ok(validateAnswer(ex, { hour: '12', minute: '00' }));
  for (const v of [
    null,
    {},
    '',
    { hour: 0, minute: 0 },
    { hour: 24, minute: 0 },
    { hour: 12, minute: 60 },
    { hour: 12, minute: -1 },
    { hour: 12, minute: '' },
    { hour: '12.0', minute: 0 },
    { hour: ' 12', minute: 0 },
  ])
    assert.equal(validateAnswer(ex, v), false);
  const m = { mode: 'math', answer: 0 };
  assert.ok(validateAnswer(m, '0'));
  for (const v of ['', null, undefined, '0.0', '-0', ' 0', '0abc'])
    assert.equal(validateAnswer(m, v), false);
});
test('progression pédagogique indépendante et options manuelles', () => {
  for (const [count, tier] of [
    [0, 0],
    [19, 0],
    [20, 1],
    [39, 1],
    [40, 2],
    [500, 2],
  ])
    assert.equal(tierFor({ difficulty: 'auto' }, count), tier);
  assert.equal(tierFor({ difficulty: 'easy' }, 900), 0);
  assert.equal(tierFor({ difficulty: 'medium' }, 0), 1);
  assert.equal(tierFor({ difficulty: 'advanced' }, 0), 2);
  assert.equal(clockLevel({ clockLevel: 'auto' }, 9), 0);
  assert.equal(clockLevel({ clockLevel: 'auto' }, 10), 1);
  assert.equal(clockLevel({ clockLevel: 'auto' }, 100), 4);
  assert.equal(clockLevel({ clockLevel: '3' }, 0), 3);
  assert.ok(timeLimit('clock', 0) > timeLimit('clock', 4));
  assert.ok(timeLimit('math', 0) > timeLimit('math', 2));
  assert.equal(timeLimit('clock', 4, true), 0);
});
test('score, XP, rapidité, séries et erreur non punitive', () => {
  assert.deepEqual(scoreAnswer({ correct: false, elapsed: 1, limit: 30, streak: 8 }), {
    xp: 0,
    score: 0,
    streak: 0,
    fast: false,
  });
  assert.deepEqual(scoreAnswer({ correct: true, elapsed: 15, limit: 30, streak: 0 }), {
    xp: 25,
    score: 150,
    streak: 1,
    fast: true,
  });
  assert.equal(scoreAnswer({ correct: true, elapsed: 16, limit: 30, streak: 2 }).score, 120);
  assert.equal(scoreAnswer({ correct: true, elapsed: 0, limit: 0, streak: 0 }).xp, 20);
  assert.equal(scoreAnswer({ correct: true, elapsed: 2, limit: 30, streak: 999 }).score, 250);
});
test('20 étapes, frontières, récompenses, dragon et princesse', () => {
  assert.equal(STAGES.length, 20);
  assert.equal(position(-10), 0);
  assert.equal(position(99), 0);
  assert.equal(position(100), 1);
  assert.equal(position(9999), 19);
  assert.equal(level(0), 1);
  assert.equal(level(100), 2);
  assert.equal(unlockedRewards(99).length, 0);
  assert.equal(unlockedRewards(100)[0], 'Baguette de noisetier');
  assert.equal(STAGES[position(1800)].name, 'Le dragon d’ombre');
  assert.equal(STAGES[position(1900)].name, 'Château de l’aurore');
  assert.ok(unlockedRewards(1900).includes('Couronne de l’aurore'));
});
test('les deux activités partagent la progression, sans mutation, et enregistrent les difficultés :35', () => {
  let state = freshState();
  const original = structuredClone(state);
  for (let i = 0; i < 3; i++)
    state = recordAnswer(
      state,
      { mode: 'clock', key: 'minute:35', level: 4 },
      { correct: true, elapsed: 2, limit: 20 },
      12,
    ).state;
  for (let i = 0; i < 5; i++)
    state = recordAnswer(
      state,
      { mode: 'math', key: '+:0', tier: 0 },
      { correct: true, elapsed: 2, limit: 30 },
      15,
    ).state;
  assert.deepEqual(original, freshState());
  assert.equal(state.xp, 200);
  assert.equal(state.streak, 8);
  assert.equal(state.bestStreak, 8);
  assert.equal(state.stats.clock.correct, 3);
  assert.equal(state.stats.math.correct, 5);
  assert.equal(state.history.length, 8);
  assert.equal(state.rewards.length, 1);
  const failed = recordAnswer(
    state,
    { mode: 'clock', key: 'minute:35', level: 4 },
    { correct: false, elapsed: 20, limit: 20, timedOut: true },
    18,
  ).state;
  assert.equal(failed.xp, 200);
  assert.equal(failed.streak, 0);
  assert.equal(failed.bestStreak, 8);
  assert.equal(failed.stats.clock.buckets['minute:35'].wrong, 1);
  assert.equal(failed.history.at(-1).timedOut, true);
});
test('historique borné, progression finale et coffre annoncé une seule fois', () => {
  let s = freshState();
  s.xp = 75;
  const ex = { mode: 'math', key: '×:0', tier: 0 };
  let r = recordAnswer(s, ex, { correct: true, elapsed: 1, limit: 30 });
  assert.equal(r.newStage, true);
  assert.deepEqual(r.newRewards, ['Baguette de noisetier']);
  r = recordAnswer(r.state, ex, { correct: true, elapsed: 1, limit: 30 });
  assert.equal(r.newRewards.length, 0);
  for (let i = 0; i < 510; i++)
    r = recordAnswer(r.state, ex, { correct: true, elapsed: 2, limit: 30 });
  assert.equal(r.state.history.length, 500);
  assert.equal(position(r.state.xp), 19);
});
test('sauvegarde/restauration, format versionné et stockage indisponible', () => {
  const s = recordAnswer(
    freshState(),
    { mode: 'clock', key: 'minute:40', level: 3 },
    { correct: false, elapsed: 12, limit: 25 },
    1,
  ).state;
  s.settings.difficulty = 'advanced';
  s.settings.clockLevel = '4';
  s.settings.relaxed = true;
  const memory = new Map();
  const store = { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) };
  assert.ok(save(s, store));
  assert.deepEqual(load(store).state, s);
  assert.equal(JSON.parse(memory.get(SAVE_KEY)).version, 1);
  assert.deepEqual(restore(null).state, freshState());
  for (const raw of [
    'bad',
    '{}',
    '{"version":99}',
    JSON.stringify({ ...s, xp: -1 }),
    JSON.stringify({ ...s, stats: {} }),
    JSON.stringify({ ...s, settings: {} }),
    JSON.stringify({ ...s, xp: 1.5 }),
  ]) {
    assert.ok(restore(raw).warning);
    assert.deepEqual(restore(raw).state, freshState());
  }
  const broken = {
    getItem: () => {
      throw Error();
    },
    setItem: () => {
      throw Error();
    },
  };
  assert.ok(load(broken).warning);
  assert.equal(save(s, broken), false);
});
test('correction pédagogique disponible pour chaque type', () => {
  assert.match(explanation({ mode: 'clock', hour: 12, minute: 5 }), /12 h 05/);
  for (const op of ['+', '−', '×'])
    assert.ok(explanation(generateMath(0, () => 0, op)).length > 15);
});
test('accès au stockage refusé dès la propriété localStorage', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError');
    },
  });
  try {
    assert.ok(load().warning);
    assert.equal(save(freshState()), false);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
test('préférence audio persistante et anciennes sauvegardes préservées', () => {
  const old = freshState();
  old.xp = 125;
  delete old.settings.sound;
  const loaded = restore(JSON.stringify(old));
  assert.equal(loaded.warning, '');
  assert.equal(loaded.state.xp, 125);
  assert.equal(loaded.state.settings.sound, true);
  loaded.state.settings.sound = false;
  assert.equal(restore(JSON.stringify(loaded.state)).state.settings.sound, false);
  loaded.state.settings.sound = 'yes';
  assert.ok(restore(JSON.stringify(loaded.state)).warning);
});
