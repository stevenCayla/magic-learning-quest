import { test, expect } from '@playwright/test';
import {
  boot,
  ready,
  digits,
  finish,
  menu,
  state,
  landscape,
  solveClock,
  solveMath,
} from './helpers.js';
async function fail(page, mode) {
  await digits(page, mode === 'clock' ? '2359' : '9999');
  await page.locator('#validate').click();
}
for (const mode of ['clock', 'math']) {
  test(`${mode} : quatre ripostes, défaite puis reprise du même niveau à pleine vie`, async ({
    page,
  }) => {
    await boot(
      page,
      mode === 'clock' ? { clockXP: 550, mathXP: 240 } : { mathXP: 550, clockXP: 240 },
    );
    await ready(page, mode);
    for (const hp of [75, 50, 25, 0]) {
      const before = await page.locator('#player-health').getAttribute('value');
      await fail(page, mode);
      await expect(page.locator('#validate')).toBeDisabled();
      await expect(page.locator('#player-health')).toHaveAttribute('value', before);
      await page.clock.runFor(1050);
      await expect(page.locator('#player-health')).toHaveAttribute('value', String(hp));
      await page.clock.runFor(800);
      if (hp) await page.getByRole('button', { name: 'Recommencer ↻', exact: true }).click();
    }
    await expect(page.locator('#feedback')).toContainText('Duel perdu');
    await expect(page.locator('.key').first()).toBeDisabled();
    expect((await state(page)).adventures[mode].xp).toBe(550);
    await page.getByRole('button', { name: 'Recommencer le niveau ↻', exact: true }).click();
    await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'countdown');
    await expect(page.locator('.battle-shell')).toHaveAttribute('data-stage', '5');
    await expect(page.locator('#player-health')).toHaveAttribute('value', '100');
    await expect(page.locator('#enemy-health')).toHaveAttribute('value', '100');
    const saved = await state(page);
    expect(saved.adventures[mode].xp).toBe(500);
    expect(saved.adventures[mode].defeats).toBe(1);
    expect(saved.adventures[mode === 'clock' ? 'math' : 'clock'].xp).toBe(240);
    await page.clock.runFor(5100);
    await (mode === 'clock' ? solveClock(page) : solveMath(page));
    await expect(page.locator('#feedback')).toContainText('Bravo');
  });
}

test('vie persistante après menu et rechargement, autre aventure à pleine vie', async ({
  page,
}) => {
  await boot(page);
  await ready(page);
  await fail(page, 'clock');
  await finish(page);
  await menu(page);
  await page.reload();
  await ready(page, 'math');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '100');
  await menu(page);
  await ready(page);
  await expect(page.locator('#player-health')).toHaveAttribute('value', '75');
});

test('rechargement à zéro PV ne permet pas d’éviter la défaite', async ({ page }) => {
  await boot(page, { clockXP: 275, clockHealth: 25 });
  await ready(page);
  await fail(page, 'clock');
  await page.reload();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#choose-clock').click();
  await landscape(page);
  await expect(page.locator('#player-health')).toHaveAttribute('value', '0');
  await expect(page.locator('#feedback')).toContainText('Duel perdu');
  await expect(page.locator('#validate')).toHaveText('Recommencer le niveau ↻');
  await page.locator('#validate').click();
  expect((await state(page)).adventures.clock.xp).toBe(200);
});

test('vaincre un adversaire restaure la vie pour le niveau suivant', async ({ page }) => {
  await boot(page, { mathXP: 80, mathHealth: 25 });
  await ready(page, 'math');
  await solveMath(page);
  await finish(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-stage', '1');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '100');
});

test('expiration et pause de leçon : un seul impact et aucune vie perdue pendant la pause', async ({
  page,
}) => {
  await boot(page, {
    settings: {
      difficulty: 'easy',
      clockLevel: '0',
      relaxed: false,
      sound: false,
    },
  });
  await ready(page);
  await page.locator('#battle-lesson').click();
  await page.clock.runFor(60000);
  expect((await state(page)).adventures.clock.health).toBe(100);
  await page.locator('#close-lesson').click();
  await page.clock.runFor(40000);
  await finish(page);
  await expect(page.locator('#player-health')).toHaveAttribute('value', '75');
  await page.clock.runFor(60000);
  expect((await state(page)).adventures.clock.health).toBe(75);
});
