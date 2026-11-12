import { expect } from '@playwright/test';
const base = '/magic-learning-quest/';
const battleSizes = new WeakMap();
const fixed = new Date('2026-01-01T00:00:00Z');
async function boot(page, overrides = {}, viewport = { width: 844, height: 390 }) {
  battleSizes.set(page, viewport);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install({ time: fixed });
  await page.clock.pauseAt(new Date(+fixed + 1000));
  await page.addInitScript((overrides) => {
    Math.random = () => 0;
    if (localStorage.getItem('test-seeded')) return;
    const state = {
      version: 2,
      unlocksXP: 0,
      legacyRewards: [],
      adventures: {
        clock: {
          xp: 0,
          score: 0,
          streak: 0,
          bestStreak: 0,
          cycleCorrect: 0,
          levelStartCorrect: 0,
          health: 100,
          defeats: 0,
          rewards: [],
        },
        math: {
          xp: 0,
          score: 0,
          streak: 0,
          bestStreak: 0,
          cycleCorrect: 0,
          levelStartCorrect: 0,
          health: 100,
          defeats: 0,
          rewards: [],
        },
      },
      xp: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      rewards: [],
      settings: {
        difficulty: 'auto',
        clockLevel: 'auto',
        relaxed: true,
        sound: true,
      },
      stats: {
        clock: { correct: 0, wrong: 0, totalMs: 0, buckets: {} },
        math: { correct: 0, wrong: 0, totalMs: 0, buckets: {} },
      },
      history: [],
      ...overrides,
    };
    if (overrides.clockXP !== undefined) state.adventures.clock.xp = overrides.clockXP;
    if (overrides.mathXP !== undefined) state.adventures.math.xp = overrides.mathXP;
    if (overrides.clockHealth !== undefined) state.adventures.clock.health = overrides.clockHealth;
    if (overrides.mathHealth !== undefined) state.adventures.math.health = overrides.mathHealth;
    state.xp = state.adventures.clock.xp + state.adventures.math.xp;
    localStorage.setItem('astrea.save', JSON.stringify(state));
    localStorage.setItem('test-seeded', '1');
  }, overrides);
  await page.goto(base);
  await expect(page.getByRole('heading', { name: 'Magic Learning Quest' })).toBeVisible();
}
async function ready(page, mode = 'clock') {
  await page
    .getByRole('button', {
      name: mode === 'clock' ? /Horloge magique/ : /Maths magiques/,
    })
    .click();
  await landscape(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'countdown');
  await page.clock.runFor(5100);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'active');
}
async function landscape(page) {
  await page.setViewportSize(battleSizes.get(page) ?? { width: 844, height: 390 });
  // Deliver WebKit's resize frame while the test clock is paused.
  await page.clock.runFor(100);
  await expect(page.locator('.rotate-notice')).toBeHidden();
}
async function digits(page, n) {
  for (const digit of String(n)) await page.getByRole('button', { name: digit, exact: true }).tap();
}
async function solveClock(page) {
  await digits(page, '01');
  await digits(page, '00');
  await page.getByRole('button', { name: /Lancer mon sort/ }).click();
}
async function solveMath(page) {
  const [a, op, b] = await page.locator('.math-problem span').allTextContents();
  await digits(page, op === '+' ? +a + +b : op === '−' ? +a - +b : +a * +b);
  await page.getByRole('button', { name: /Lancer mon sort/ }).click();
}
async function finish(page) {
  await page.clock.runFor(1850);
}
async function menu(page) {
  await page.getByRole('button', { name: 'Retour au menu', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.home-rotate')).toBeHidden();
}
async function state(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('astrea.save')));
}
async function settings(page) {
  await page.locator('#home-settings').click();
}

export {
  boot,
  ready,
  digits,
  solveClock,
  solveMath,
  finish,
  menu,
  state,
  settings,
  landscape,
  base,
};
