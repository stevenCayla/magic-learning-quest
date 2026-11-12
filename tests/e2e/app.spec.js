import { test, expect } from '@playwright/test';
const base = '/magic-learning-quest/';
async function seed(page, overrides = {}) {
  await page.addInitScript(async (overrides) => {
    Math.random = () => 0;
    if (localStorage.getItem('test-seeded')) return;
    const s = {
      version: 1,
      xp: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      rewards: [],
      settings: { difficulty: 'auto', clockLevel: 'auto', relaxed: true },
      stats: {
        clock: { correct: 0, wrong: 0, totalMs: 0, buckets: {} },
        math: { correct: 0, wrong: 0, totalMs: 0, buckets: {} },
      },
      history: [],
      ...overrides,
    };
    localStorage.setItem('astrea.save', JSON.stringify(s));
    localStorage.setItem('test-seeded', '1');
    Math.random = () => 0;
  }, overrides);
}
async function digits(page, n) {
  for (const d of String(n)) await page.getByRole('button', { name: d, exact: true }).tap();
}
async function solveClock(page) {
  // Deterministic first exercise: 1 h 00, drawn on the real SVG.
  await digits(page, '01');
  await digits(page, '00');
  await page.getByRole('button', { name: 'Lancer mon sort' }).click();
}
async function solveMath(page) {
  const problem = page.locator('.math-problem');
  const numbers = await problem.locator('span').allTextContents();
  const a = Number(numbers[0]),
    b = Number(numbers[2]);
  await digits(page, numbers[1] === '+' ? a + b : numbers[1] === '−' ? a - b : a * b);
  await page.getByRole('button', { name: 'Lancer mon sort' }).click();
}
function nav(page, name) {
  return page
    .getByRole('navigation', { name: 'Navigation principale', exact: true })
    .getByRole('button', { name });
}

test('parcours complet horloge → XP → maths → sauvegarde → réglages et navigation', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await seed(page);
  await page.goto(base);
  await expect(page.getByRole('heading', { name: /À toi de jouer/ })).toBeVisible();
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await expect(page.getByRole('img', { name: /Horloge à lire/ })).toBeVisible();
  await solveClock(page);
  await expect(page.locator('#feedback').getByText('+20 XP', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '← Menu' }).click();
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await solveMath(page);
  await expect(page.getByTestId('xp')).toHaveText('40 XP');
  await page.reload();
  await expect(page.getByTestId('xp')).toHaveText('40 XP');
  await nav(page, 'Aventure').click();
  await expect(
    page.getByRole('heading', { name: 'Village des apprentis', level: 2 }),
  ).toBeVisible();
  await nav(page, 'Grimoire').click();
  await expect(page.getByRole('heading', { name: 'Le grimoire des trésors.' })).toBeVisible();
  await nav(page, 'Réglages').click();
  await page.getByRole('radio', { name: /Grand mage/ }).check();
  await page.getByRole('radio', { name: '5 · Toutes les minutes' }).check();
  await page.reload();
  await nav(page, 'Réglages').click();
  await expect(page.getByRole('radio', { name: /Grand mage/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: '5 · Toutes les minutes' })).toBeChecked();
  await nav(page, 'Entraînement').click();
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await expect(page.locator('.exercise-meta')).toContainText('Grand mage');
  expect(errors).toEqual([]);
});

test('erreur encourageante, correction et absence de double récompense', async ({ page }) => {
  await seed(page);
  await page.goto(base);
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await digits(page, '02');
  await digits(page, '30');
  await page.getByRole('button', { name: 'Lancer mon sort' }).click();
  await expect(page.getByText(/Il est 1 h 00/)).toBeVisible();
  await expect(page.getByTestId('xp')).toHaveText('0 XP');
  await page.getByRole('button', { name: 'Je continue' }).click();
  await solveClock(page);
  await page.keyboard.press('Enter');
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('astrea.save')));
  expect(s.xp).toBe(20);
  expect(s.stats.clock.wrong).toBe(1);
  expect(s.stats.clock.correct).toBe(1);
});

test('clavier, focus visible et champs heures/minutes', async ({ page }) => {
  await seed(page);
  await page.goto(base);
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await page.getByRole('button', { name: 'Heures', exact: true }).focus();
  await page.keyboard.type('01');
  await page.getByRole('button', { name: 'Minutes', exact: true }).focus();
  await page.keyboard.type('00');
  await page.getByRole('button', { name: 'Lancer mon sort' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
  await expect(page.getByRole('button', { name: 'Sort suivant' })).toBeFocused();
});

test('coffre partagé, dragon et délivrance de la princesse', async ({ page }) => {
  await seed(page, { xp: 1875, settings: { difficulty: 'easy', clockLevel: '0', relaxed: false } });
  await page.goto(base);
  await page.getByRole('button', { name: 'Explorer mon aventure' }).click();
  await expect(page.getByText(/Ombre du dragon/)).toBeVisible();
  await page.getByRole('button', { name: '✧ Maths', exact: true }).click();
  await solveMath(page);
  await expect(page.getByText(/Aélis est délivrée/)).toBeVisible();
  await expect(page.getByText(/Couronne de l’aurore/)).toBeVisible();
  await page.getByRole('button', { name: '← Menu' }).click();
  await expect(page.getByRole('heading', { name: 'La lumière est de retour.' })).toBeVisible();
});

for (const [name, width, height] of [
  ['petit iPhone', 320, 568],
  ['iPhone moderne', 390, 844],
  ['tablette', 768, 1024],
  ['laptop', 1280, 800],
  ['desktop', 1920, 1080],
]) {
  test(`responsive et tactile : ${name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await seed(page);
    await page.goto(base);
    const noOverflow = async () =>
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    await noOverflow();
    for (const mode of ['Horloge magique', 'Maths magiques']) {
      await page.getByRole('button', { name: new RegExp(mode) }).click();
      await noOverflow();
      if (mode.startsWith('Horloge')) {
        const box = await page.locator('.clock').boundingBox();
        expect(box.width).toBeGreaterThan(185);
        expect(box.width).toBeLessThan(width);
      }
      for (const b of await page.locator('.key, #validate, .answer-field').all()) {
        const box = await b.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
      if (name === 'iPhone moderne') {
        const submit = await page.locator('#validate').boundingBox();
        expect(submit.y + submit.height).toBeLessThan(height - 72);
        await expect(page.locator('.skip')).not.toBeFocused();
      }
      if (mode.startsWith('Horloge')) await solveClock(page);
      else await solveMath(page);
      await expect(page.getByRole('button', { name: 'Sort suivant' })).toBeVisible();
      await page.getByRole('button', { name: '← Menu' }).click();
    }
    const navigation = page.getByRole('navigation', {
      name: width <= 850 ? 'Navigation mobile' : 'Navigation principale',
      exact: true,
    });
    for (const title of ['Aventure', 'Grimoire', 'Réglages']) {
      await navigation.getByRole('button', { name: title }).click();
      await noOverflow();
    }
    await page.screenshot({
      path: testInfo.outputPath(`${name.replaceAll(' ', '-')}.png`),
      fullPage: true,
    });
  });
}

test('manifest, assets sans 404, cache versionné, service worker, rechargement hors connexion', async ({
  page,
  context,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const failed = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  await seed(page);
  await page.goto(base);
  const manifest = await page.evaluate(async () =>
    fetch(document.querySelector('link[rel=manifest]').href).then((r) => r.json()),
  );
  expect(manifest.start_url).toBe(base);
  expect(manifest.scope).toBe(base);
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) {
    const r = await page.request.get(base + icon.src);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('image/png');
  }
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const caches = await page.evaluate(async () => {
    const names = await window.caches.keys();
    const c = await window.caches.open(names.find((n) => n.startsWith('astrea-')));
    return { names, urls: (await c.keys()).map((r) => r.url) };
  });
  expect(caches.names.some((n) => /^astrea-[a-f0-9]{12}$/.test(n))).toBe(true);
  expect(caches.urls.some((u) => u.includes('/assets/') && u.endsWith('.js'))).toBe(true);
  expect(caches.urls.some((u) => u.endsWith('/castle.svg'))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: /À toi de jouer/ }),
    JSON.stringify(errors),
  ).toBeVisible();
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await solveMath(page);
  await page.reload();
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await solveClock(page);
  await context.setOffline(false);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});

test('sauvegarde corrompue, récupération et mode reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('astrea.save', 'not-json'));
  await page.goto(base);
  await expect(
    page.getByRole('status').filter({ hasText: /sauvegarde est illisible/ }),
  ).toBeVisible();
  expect(
    await page
      .locator('.training-card')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
});

test('expiration du chrono et conservation des XP', async ({ page }) => {
  await page.clock.install();
  await seed(page, { xp: 80, settings: { difficulty: 'easy', clockLevel: '0', relaxed: false } });
  await page.goto(base);
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await page.clock.runFor(31000);
  await expect(page.getByText('☾ Le temps s’est envolé.')).toBeVisible();
  await expect(page.getByTestId('xp')).toHaveText('80 XP');
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('astrea.save')));
  expect(s.history.at(-1).timedOut).toBe(true);
  expect(s.stats.math.wrong).toBe(1);
});

test('heure de 12 h 59 et correction de saisie au doigt', async ({ page }) => {
  await seed(page, { settings: { difficulty: 'auto', clockLevel: '4', relaxed: true } });
  await page.addInitScript(() => {
    Math.random = () => 0.9999;
  });
  await page.goto(base);
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await digits(page, '12');
  await digits(page, '58');
  await page.getByRole('button', { name: 'Effacer le dernier chiffre' }).tap();
  await digits(page, '9');
  await page.getByRole('button', { name: 'Lancer mon sort' }).tap();
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
});

test('stockage plein : message explicite et partie encore jouable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page.goto(base);
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await solveMath(page);
  await expect(
    page.getByRole('status').filter({ hasText: /sauvegarde est indisponible/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sort suivant' }).click();
  await expect(page.getByRole('heading', { name: 'Maths magiques' })).toBeVisible();
});
