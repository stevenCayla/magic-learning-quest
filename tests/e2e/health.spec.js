import { test, expect } from '@playwright/test';
import {
  boot,
  ready,
  begin,
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
  test(`${mode} : quatre ripostes corrigées, défaite puis REJOUER à pleine vie sans perdre d’XP`, async ({
    page,
  }) => {
    await boot(
      page,
      mode === 'clock' ? { clockXP: 550, mathXP: 240 } : { mathXP: 550, clockXP: 240 },
    );
    await ready(page, mode);
    const shell = page.locator('.battle-shell');
    const panel = page.locator('#duel-panel');
    for (const hp of [75, 50, 25, 0]) {
      const before = await page.locator('#player-health').getAttribute('value');
      await fail(page, mode);
      await expect(page.locator('#validate')).toBeDisabled();
      await expect(page.locator('#feedback')).toContainText('Sélénore riposte : −25 PV');
      await expect(page.locator('#player-health')).toHaveAttribute('value', before);
      // The second correction is opened at once: the riposte still costs its 25 PV.
      if (hp !== 50) {
        await page.clock.runFor(1050);
        await expect(page.locator('#player-health')).toHaveAttribute('value', String(hp));
      }
      await page.locator('#feedback-next').click();
      await expect(shell).toHaveAttribute('data-phase', 'correction');
      await expect(page.locator('#player-health')).toHaveAttribute('value', String(hp));
      await expect(page.locator('#player-health-text')).toHaveText(`${hp} / 100 PV`);
      await expect(panel.locator('.is-wrong s')).toHaveText(mode === 'clock' ? '23:59' : '9999');
      await expect(panel.locator('.correction-steps li')).toHaveCount(3);
      await expect(page.locator('#panel-next')).toHaveText(
        hp === 0
          ? 'CONTINUER'
          : mode === 'clock'
            ? 'ESSAYER UNE AUTRE HEURE'
            : 'ESSAYER UN AUTRE CALCUL',
      );
      await page.locator('#panel-next').click();
      if (hp) await expect(shell).toHaveAttribute('data-phase', 'active');
    }
    await expect(shell).toHaveAttribute('data-phase', 'defeat');
    await expect(panel).toHaveAttribute('data-panel', 'defeat');
    await expect(panel.getByRole('heading')).toHaveText('Sélénore a gagné… cette fois !');
    await expect(panel.locator('.panel-pill')).toHaveText('Tu gardes tes 50 XP');
    await expect(page.locator(mode === 'clock' ? '#panel-lesson' : '#panel-home')).toBeVisible();
    await expect(page.locator(mode === 'clock' ? '#panel-home' : '#panel-lesson')).toHaveCount(0);
    await expect(page.locator('#feedback')).toBeEmpty();
    await expect(page.locator('.key').first()).toBeDisabled();
    await expect(page.locator('#validate')).toBeDisabled();
    expect((await state(page)).adventures[mode].xp).toBe(550);
    expect((await state(page)).adventures[mode].health).toBe(0);
    await expect(page.locator('#panel-next')).toHaveText('REJOUER');
    await page.locator('#panel-next').click();
    await expect(shell).toHaveAttribute('data-phase', 'intro');
    await expect(shell).toHaveAttribute('data-stage', '5');
    await expect(page.locator('#player-health')).toHaveAttribute('value', '100');
    await expect(page.locator('#enemy-health')).toHaveAttribute('value', '50');
    await expect(page.getByTestId('xp')).toHaveText('550 XP');
    const saved = await state(page);
    expect(saved.adventures[mode].xp).toBe(550);
    expect(saved.adventures[mode].health).toBe(100);
    expect(saved.adventures[mode].defeats).toBe(1);
    expect(saved.adventures[mode === 'clock' ? 'math' : 'clock'].xp).toBe(240);
    await begin(page);
    await (mode === 'clock' ? solveClock(page) : solveMath(page));
    await expect(page.locator('#feedback')).toContainText('Bravo');
    expect((await state(page)).adventures[mode].xp).toBe(570);
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
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'defeat');
  const panel = page.locator('#duel-panel');
  await expect(panel).toHaveAttribute('data-panel', 'defeat');
  await expect(panel.getByRole('heading')).toHaveText('Brumel a gagné… cette fois !');
  await expect(panel.locator('.panel-pill')).toHaveText('Tu gardes tes 75 XP');
  await expect(page.locator('#panel-lesson')).toBeVisible();
  await expect(page.locator('.key').first()).toBeDisabled();
  await expect(page.locator('#validate')).toBeDisabled();
  await page.keyboard.type('0100');
  await expect(page.locator('#hour-value')).toHaveText('--');
  await page.getByRole('button', { name: 'REJOUER' }).click();
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'intro');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '100');
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '25');
  const saved = await state(page);
  expect(saved.adventures.clock.xp).toBe(275);
  expect(saved.adventures.clock.health).toBe(100);
});

test('vaincre un adversaire : panneau de victoire puis vie restaurée au niveau suivant', async ({
  page,
}) => {
  await boot(page, { mathXP: 80, mathHealth: 25 });
  await ready(page, 'math');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '25');
  await solveMath(page);
  await finish(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'victory');
  await expect(page.locator('#duel-panel')).toHaveAttribute('data-panel', 'victory');
  expect((await state(page)).adventures.math.health).toBe(100);
  await page.getByRole('button', { name: 'NIVEAU SUIVANT' }).click();
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-stage', '1');
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'intro');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '100');
  await begin(page);
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
