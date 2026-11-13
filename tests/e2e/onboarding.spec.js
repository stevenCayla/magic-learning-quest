import { test, expect } from '@playwright/test';
import { base, ready, solveMath, finish, state } from './helpers.js';
async function fresh(page, viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  const fixed = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: fixed });
  await page.clock.pauseAt(new Date(+fixed + 1000));
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto(base);
}
async function choose(page, kind = 'girl') {
  await page.getByRole('button', { name: 'Commencer', exact: true }).click();
  await page.locator(`[data-kind=${kind}]`).click();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
}
for (const kind of ['boy', 'girl']) {
  test(`${kind} : création, personnalisation, validation, trois aventures et retour en réglages`, async ({
    page,
  }) => {
    await fresh(page);
    await expect(page.locator('.arcade-home button')).toHaveCount(1);
    await expect(page.locator('#home-settings')).toHaveCount(0);
    await expect(page.locator('.mobile-nav')).toHaveCount(0);
    await choose(page, kind);
    await expect(page.locator('#creation-continue')).toBeDisabled();
    await page.getByLabel('Ton nom de mage').fill('Lina');
    await page.getByRole('radio', { name: 'Azur', exact: true }).check();
    await page.locator('[data-tab=appearance]').click();
    await page.getByRole('radio', { name: 'Boucles', exact: true }).check();
    await page.locator('[data-tab=wand]').click();
    await page.getByRole('radio', { name: 'Cristal', exact: true }).check();
    await page.locator('#creation-continue').click();
    await expect(page.locator('#choose-clock')).toBeVisible();
    await expect(page.locator('#choose-math')).toBeVisible();
    await expect(page.locator('#explore')).toBeVisible();
    await expect(page.locator('#begin-creation')).toHaveCount(0);
    const saved = await state(page);
    expect(saved.onboarding.completed).toBe(true);
    expect(saved.avatar).toMatchObject({
      kind,
      name: 'Lina',
      robe: 'blue',
      style: 'curls',
      wand: 'crystal',
    });
    await page.reload();
    await expect(page.locator('#begin-creation')).toHaveCount(0);
    await page.locator('#home-settings').click();
    await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Lina');
    await expect(
      page.getByRole('radio', { name: kind === 'boy' ? 'Garçon' : 'Fille', exact: true }),
    ).toBeChecked();
    await page
      .getByRole('navigation', { name: 'Navigation mobile', exact: true })
      .getByRole('button', { name: 'S’entraîner' })
      .click();
    await ready(page, 'math');
    await expect(page.locator('.fighter-player figcaption')).toContainText('Lina');
    await solveMath(page);
    await finish(page);
    expect((await state(page)).adventures.math.xp).toBeGreaterThan(0);
  });
}

test('création interrompue : reprise du brouillon après rechargement et retours sans perte', async ({
  page,
}) => {
  await fresh(page);
  await choose(page);
  await page.getByLabel('Ton nom de mage').fill('Élia');
  await page.getByRole('radio', { name: 'Azur', exact: true }).check();
  await page.reload();
  await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Élia');
  await expect(page.locator('#choose-math')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retour au choix du personnage' }).click();
  await expect(page.locator('[data-kind=girl]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-kind=girl]').click();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Élia');
  await expect(page.getByRole('radio', { name: 'Azur', exact: true })).toBeChecked();
  expect((await state(page)).onboarding.completed).toBe(false);
});

test('création entièrement hors connexion après préparation, version et décor précachés', async ({
  page,
  context,
}) => {
  await fresh(page);
  const info = await (await page.request.get(base + 'version.json')).json();
  await expect(page.getByTestId('app-version')).toHaveText(info.version);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await choose(page);
  await page.getByLabel('Ton nom de mage').fill('Lina');
  await page.locator('#creation-continue').click();
  await page.reload();
  await expect(page.locator('#choose-clock')).toBeVisible();
  await expect(page.getByTestId('app-version')).toHaveText(info.version);
  expect(
    await page.evaluate(async () => {
      const base = document.querySelector('link[rel=manifest]').href;
      return (await fetch(new URL('creation-sky.webp', base))).ok;
    }),
  ).toBe(true);
});

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1280, 800],
]) {
  test(`création responsive ${width}×${height}`, async ({ page }, testInfo) => {
    await fresh(page, { width, height });
    await choose(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const button = await page.locator('#creation-continue').boundingBox();
    expect(button.height).toBeGreaterThanOrEqual(44);
    expect(button.y + button.height).toBeLessThanOrEqual(height);
    const input = await page.getByLabel('Ton nom de mage').boundingBox();
    expect(input.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath('creation.png') });
    await page.getByLabel('Ton nom de mage').fill('Lina');
    await page.locator('#creation-continue').click();
    await expect(page.locator('#choose-math')).toBeVisible();
    if (width <= 430) {
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(
        true,
      );
      await expect(page.getByTestId('app-version')).toBeVisible();
    }
  });
}

test('nom vide refusé, caractères HTML affichés comme texte', async ({ page }) => {
  await fresh(page);
  await choose(page);
  await page.getByLabel('Ton nom de mage').fill('   ');
  await expect(page.locator('#creation-continue')).toBeDisabled();
  await page.getByLabel('Ton nom de mage').fill('<b>Lina</b>');
  await page.locator('#creation-continue').click();
  await expect(page.locator('.arcade-home-progress')).toContainText('<b>Lina</b>');
  await expect(page.locator('.arcade-home-progress b')).toHaveCount(0);
});

test('clavier iPhone : champ et validation restent visibles, navigation clavier des onglets', async ({
  page,
}) => {
  await fresh(page);
  await choose(page);
  await page.locator('[data-tab=appearance]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-tab=outfit]')).toHaveAttribute('aria-selected', 'true');
  await page.getByLabel('Ton nom de mage').fill('Lina');
  await page.evaluate(() => {
    Object.defineProperty(visualViewport, 'height', { configurable: true, value: 400 });
    visualViewport.dispatchEvent(new Event('resize'));
  });
  await expect(page.locator('.creation-preview')).toBeHidden();
  const button = await page.locator('#creation-continue').boundingBox();
  expect(button.y + button.height).toBeLessThanOrEqual(400);
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Ton nom de mage')).not.toBeFocused();
});

test('encoche iPhone et rotation : commandes visibles et brouillon conservé', async ({ page }) => {
  await fresh(page);
  await choose(page);
  await page.getByLabel('Ton nom de mage').fill('Lina');
  await page.getByLabel('Ton nom de mage').blur();
  await page.addStyleTag({
    content: '.creation-screen { padding-top:59px !important; padding-bottom:34px !important; }',
  });
  const button = await page.locator('#creation-continue').boundingBox();
  expect(button.y + button.height).toBeLessThanOrEqual(844 - 34);
  const title = await page.locator('.creation-header h1').boundingBox();
  expect(title.y).toBeGreaterThanOrEqual(59);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.creation-rotate')).toBeVisible();
  await expect(page.locator('.creation-screen')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.creation-rotate')).toBeHidden();
  await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Lina');
  await page.locator('#creation-continue').click();
  await expect(page.locator('#choose-clock')).toBeVisible();
});
