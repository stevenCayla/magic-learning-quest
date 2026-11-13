import { test, expect } from '@playwright/test';
import {
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
} from './helpers.js';

test('accueil : aucun footer, réglages avec une seule icône en haut à droite', async ({
  page,
}) => {
  await boot(page, {}, { width: 390, height: 844 });
  await expect(page.locator('.is-home .mobile-nav')).toHaveCount(0);
  const button = page.getByRole('button', { name: 'Réglages', exact: true });
  await expect(button).toBeVisible();
  expect(await button.textContent()).toBe('⚙');
  const box = await button.boundingBox();
  expect(box.x).toBeGreaterThan(300);
  expect(box.y).toBeLessThan(40);
  expect(box.width).toBeGreaterThanOrEqual(44);
  await button.click();
  await expect(
    page.getByRole('heading', { name: 'Réglages de l’académie.' }),
  ).toBeVisible();
});

test('décompte 5,4,3,2,1 : champs bloqués et chrono pédagogique intact', async ({
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
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await landscape(page);
  for (const number of [5, 4, 3, 2, 1]) {
    await expect(page.locator('#countdown-value')).toHaveText(String(number));
    await expect(page.locator('#validate')).toBeDisabled();
    await expect(page.locator('#timer')).toHaveText('40 s');
    if (number > 1) await page.clock.runFor(1000);
  }
  await page.clock.runFor(1000);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'active',
  );
  await expect(page.locator('#timer')).toHaveText('40 s');
  await page.clock.runFor(1000);
  await expect(page.locator('#timer')).toHaveText('39 s');
});

test('portrait : invitation à tourner, vraie pause, sortie accessible sans rotation', async ({
  page,
}) => {
  await boot(page, {}, { width: 320, height: 568 });
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Tourne ton téléphone' }),
  ).toBeVisible();
  await page.clock.runFor(20000);
  await expect(page.locator('#countdown-value')).toHaveText('5');
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(
    page.getByRole('heading', { name: 'Magic Learning Quest' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.rotate-notice')).toBeHidden();
  await page.clock.runFor(5150);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'active',
  );
});

test('rotation pendant une question : aucune seconde perdue en portrait', async ({
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
  await page.clock.runFor(2000);
  const before = await page.locator('#timer').textContent();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.rotate-notice')).toBeVisible();
  await page.clock.runFor(20000);
  await expect(page.locator('#timer')).toHaveText(before);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.rotate-notice')).toBeHidden();
  await page.clock.runFor(100);
  await expect(page.locator('#timer')).toHaveText(before);
  await page.clock.runFor(1000);
  expect(Number.parseInt(await page.locator('#timer').textContent())).toBe(
    Number.parseInt(before) - 1,
  );
});

test('horloge et maths : aventures, énergie, XP et restauration indépendantes', async ({
  page,
}) => {
  await boot(page);
  await ready(page);
  await solveClock(page);
  await finish(page);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '80');
  await menu(page);
  expect((await state(page)).adventures.clock.xp).toBe(20);
  expect((await state(page)).adventures.math.xp).toBe(0);
  await ready(page, 'math');
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '100');
  await solveMath(page);
  await finish(page);
  await menu(page);
  await page.reload();
  const saved = await state(page);
  expect(saved.adventures.clock.xp).toBe(20);
  expect(saved.adventures.math.xp).toBe(20);
  await ready(page);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '80');
});

test('sort : geste de baguette, trajectoire ancrée, impact et récompense unique', async ({
  page,
}) => {
  await boot(page);
  await ready(page);
  await solveClock(page);
  await expect(page.locator('#feedback')).toContainText('Bravo !');
  await expect(page.locator('.battle-shell')).toHaveClass(/is-casting/);
  const geometry = await page
    .locator('.battle-shell')
    .evaluate((el) =>
      ['--from-x', '--to-x', '--from-y', '--to-y'].map((n) =>
        parseFloat(el.style.getPropertyValue(n)),
      ),
    );
  expect(geometry.every(Number.isFinite)).toBe(true);
  expect(geometry[0]).toBeLessThan(geometry[1]);
  expect(
    await page
      .locator('.fighter-player .wand-arm')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('wand-cast');
  await page.keyboard.press('Enter');
  await page.keyboard.type('999');
  await page.clock.runFor(1050);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '80');
  await expect(page.locator('.battle-shell')).toHaveClass(/spell-hit/);
  await page.clock.runFor(800);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'active',
  );
  await expect(page.locator('#feedback')).toBeEmpty();
  await expect(page.locator('.battle-go')).toHaveCount(0);
  const saved = await state(page);
  expect(saved.xp).toBe(20);
  expect(saved.stats.clock.correct).toBe(1);
  await expect(page.getByRole('button', { name: 'Sort suivant' })).toHaveCount(
    0,
  );
});

test('erreur : correction conservée, contresort et même question au réessai', async ({
  page,
}) => {
  await boot(page);
  await ready(page, 'math');
  const before = await page.locator('.math-problem').textContent();
  await digits(page, '999');
  await page.getByRole('button', { name: /Lancer mon sort/ }).click();
  await expect(page.locator('#feedback')).toContainText('1 + 1 = 2');
  await expect(page.locator('.battle-shell')).toHaveClass(/spell-blocked/);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'failure-cast',
  );
  await expect(page.locator('#validate')).toBeDisabled();
  const [from, to] = await page
    .locator('.battle-shell')
    .evaluate((el) =>
      ['--from-x', '--to-x'].map((k) =>
        parseFloat(el.style.getPropertyValue(k)),
      ),
    );
  expect(from).toBeGreaterThan(to);
  await page.clock.runFor(1050);
  await expect(page.locator('.battle-shell')).toHaveClass(/spell-hit/);
  await expect(page.locator('#validate')).toBeDisabled();
  await page.clock.runFor(800);
  await expect(page.getByTestId('xp')).toHaveText('0 XP');
  await page.evaluate(() => {
    Math.random = () => 0.9999;
  });
  await page.getByRole('button', { name: /Recommencer/ }).click();
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'active',
  );
  await expect(page.locator('.math-problem')).toHaveText(before);
  await solveMath(page);
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
});

test('victoire d’étape : ennemi et décor changent, coffre et nouveau décompte', async ({
  page,
}) => {
  await boot(page, { mathXP: 80 });
  await ready(page, 'math');
  await solveMath(page);
  await page.clock.runFor(1050);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '0');
  await page.clock.runFor(800);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-stage',
    '1',
  );
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'countdown',
  );
  await expect(page.locator('.battle-scenery')).toHaveAttribute(
    'data-scene',
    'forest',
  );
  await expect(page.locator('.fighter-enemy figcaption')).toContainText(
    'Roncielle',
  );
  await expect(page.locator('#toast')).toContainText('Baguette de noisetier');
  await expect(page.locator('#toast')).toHaveCSS('pointer-events', 'none');
  await page.clock.runFor(5100);
  await solveMath(page);
  await expect(page.getByTestId('xp')).toHaveText('120 XP');
});

for (const star of [1, 2, 3]) {
  test(`dragon final : étoile ${star}, redémarrage plus difficile et sauvegarde`, async ({
    page,
  }) => {
    await boot(page, {
      mathXP: star * 2000 - 25,
      settings: {
        difficulty: 'easy',
        clockLevel: '0',
        relaxed: false,
        sound: false,
      },
    });
    await ready(page, 'math');
    await expect(page.locator('.fighter-enemy .dragon-art')).toBeVisible();
    await solveMath(page);
    await finish(page);
    await expect(page.locator('.rescue-celebration h2')).toContainText(
      `Étoile ${star}/3`,
    );
    expect((await state(page)).adventures.math.xp).toBe(star * 2000);
    expect((await state(page)).adventures.clock.xp).toBe(0);
    await page.locator('#rescue-continue').click();
    await expect(page.locator('.battle-shell')).toHaveAttribute(
      'data-star',
      String(Math.min(3, star + 1)),
    );
    await expect(page.locator('.battle-shell')).toHaveAttribute(
      'data-stage',
      star === 3 ? '19' : '0',
    );
    await menu(page);
    await page.reload();
    await expect(
      page.getByTestId('math-progress').locator('.journey-stars'),
    ).toHaveAttribute('aria-label', `${star} étoiles sur 3`);
    await expect(page.locator('.arcade-home')).not.toContainText(
      'Aélis est libre',
    );
    await expect(page.locator('.arcade-home')).not.toContainText(
      'Château de l’aurore',
    );
  });
}

test('personnalisation : visage, coiffure, tenue, baguette et nom conservés dans le combat', async ({
  page,
}) => {
  await boot(page);
  await settings(page);
  await page.getByLabel('Ton nom de mage').fill('Mira');
  await page.getByRole('radio', { name: 'Ébène', exact: true }).check();
  await page.getByRole('radio', { name: 'Tresses', exact: true }).check();
  await page.getByRole('radio', { name: 'Émeraude', exact: true }).check();
  await page.getByRole('radio', { name: 'Cristal', exact: true }).check();
  await page.reload();
  await settings(page);
  await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Mira');
  await expect(
    page.getByRole('radio', { name: 'Tresses', exact: true }),
  ).toBeChecked();
  await page
    .getByRole('navigation', { name: 'Navigation mobile', exact: true })
    .getByRole('button', { name: 'S’entraîner' })
    .click();
  await ready(page);
  await expect(page.locator('.fighter-player figcaption')).toContainText(
    'Mira',
  );
  expect(
    await page
      .locator('.battle-shell')
      .evaluate((el) => el.style.getPropertyValue('--spell-color')),
  ).toBe('#8aeaff');
});

test('accessoires spéciaux : verrouillés sans XP et disponibles après progression', async ({
  page,
}) => {
  await boot(page);
  await settings(page);
  await expect(page.getByRole('radio', { name: /Couronne/ })).toBeDisabled();
  await expect(page.getByRole('radio', { name: /Soleil/ })).toBeDisabled();
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('astrea.save'));
    s.xp = 1900;
    s.unlocksXP = 1900;
    s.adventures.clock.xp = 1900;
    localStorage.setItem('astrea.save', JSON.stringify(s));
  });
  await page.reload();
  await settings(page);
  await page.getByRole('radio', { name: 'Couronne', exact: true }).check();
  await page.getByRole('radio', { name: 'Soleil', exact: true }).check();
  expect((await state(page)).avatar.hat).toBe('crown');
});

test('nom personnalisé affiché comme texte et non comme HTML', async ({
  page,
}) => {
  await boot(page);
  await settings(page);
  await page.getByLabel('Ton nom de mage').fill('<b>Mira</b>');
  await expect(page.locator('#preview-name')).toHaveText('<b>Mira</b>');
  await expect(page.locator('#preview-name b')).toHaveCount(0);
});

test('navigation : aventure, grimoire, personnalisation et niveaux manuels', async ({
  page,
}) => {
  await boot(page);
  await page.getByRole('button', { name: 'Explorer mes aventures' }).click();
  await page.getByRole('button', { name: '♜ Grimoire' }).click();
  await expect(
    page.getByRole('heading', { name: 'Le grimoire des trésors.' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navigation mobile', exact: true })
    .getByRole('button', { name: 'Réglages' })
    .click();
  await page.getByRole('radio', { name: /Grand mage/ }).check();
  await page.getByRole('radio', { name: '5 · Toutes les minutes' }).check();
  await page.reload();
  await settings(page);
  await expect(page.getByRole('radio', { name: /Grand mage/ })).toBeChecked();
  await page
    .getByRole('navigation', { name: 'Navigation mobile', exact: true })
    .getByRole('button', { name: 'S’entraîner' })
    .click();
  await ready(page, 'math');
  await expect(page.locator('.exercise-meta')).toContainText('Grand mage');
});

test('clavier et lecture 12 h 59 : édition, focus et validation', async ({
  page,
}) => {
  await boot(page, {
    settings: {
      difficulty: 'auto',
      clockLevel: '4',
      relaxed: true,
      sound: false,
    },
  });
  await page.evaluate(() => {
    Math.random = () => 0.9999;
  });
  await ready(page);
  await page.locator('#hour').focus();
  await page.keyboard.type('12');
  await page.locator('#minute').focus();
  await page.keyboard.type('58');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('9');
  await page.locator('#validate').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#feedback')).toContainText('Bravo !');
  await finish(page);
  await expect(page.locator('#main')).toBeFocused();
});

test('expiration : correction et XP acquis conservés', async ({ page }) => {
  await boot(page, {
    mathXP: 45,
    settings: {
      difficulty: 'easy',
      clockLevel: '0',
      relaxed: false,
      sound: false,
    },
  });
  await ready(page, 'math');
  await page.clock.runFor(30000);
  await expect(page.locator('#feedback')).toContainText(
    'Le temps s’est envolé !',
  );
  await expect(page.getByTestId('xp')).toHaveText('45 XP');
  expect((await state(page)).history.at(-1).timedOut).toBe(true);
});

test('arrière-plan : décompte et sort suspendus sans double gain', async ({
  page,
}) => {
  await boot(page);
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await landscape(page);
  await page.clock.runFor(1000);
  const hide = () =>
    page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  const show = () =>
    page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  await hide();
  await page.clock.runFor(12000);
  await expect(page.locator('#countdown-value')).toHaveText('4');
  await show();
  await page.clock.runFor(4150);
  await solveMath(page);
  await hide();
  await page.clock.runFor(12000);
  await expect(page.locator('#feedback')).toContainText('Bravo !');
  await show();
  await finish(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'active',
  );
  expect((await state(page)).stats.math.correct).toBe(1);
});

test('quitter annule le sort et les transitions', async ({ page }) => {
  await boot(page);
  await ready(page, 'math');
  await solveMath(page);
  await menu(page);
  await page.clock.runFor(12000);
  await expect(
    page.getByRole('heading', { name: 'Magic Learning Quest' }),
  ).toBeVisible();
  await expect(page.locator('.battle-shell')).toHaveCount(0);
});

test('sons : départ par geste, décompte, lancer, impact et mute sauvegardé', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.notes = [];
    const Audio = window.AudioContext;
    window.AudioContext = class extends Audio {
      constructor(...args) {
        super(...args);
        window.testAudio = this;
      }
      createOscillator() {
        const o = super.createOscillator();
        const start = o.start.bind(o);
        o.start = (...args) => {
          window.notes.push(o.type);
          start(...args);
        };
        return o;
      }
    };
  });
  await boot(page);
  expect(await page.evaluate(() => !!window.testAudio)).toBe(false);
  await ready(page, 'math');
  await expect
    .poll(() => page.evaluate(() => window.notes.length))
    .toBeGreaterThanOrEqual(8);
  const before = await page.evaluate(() => window.notes.length);
  await solveMath(page);
  await page.clock.runFor(1050);
  await expect
    .poll(() => page.evaluate(() => window.notes.length))
    .toBeGreaterThanOrEqual(before + 7);
  await page.getByRole('button', { name: 'Couper les sons' }).click();
  await finish(page);
  const muted = await page.evaluate(() => window.notes.length);
  await solveMath(page);
  await finish(page);
  expect(await page.evaluate(() => window.notes.length)).toBe(muted);
  await menu(page);
  await settings(page);
  await expect(
    page.getByRole('checkbox', { name: /Sons magiques/ }),
  ).not.toBeChecked();
});

test('audio indisponible ne bloque ni décompte ni réponses', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        throw Error('Unavailable');
      }
    };
  });
  await boot(page);
  await ready(page, 'math');
  await solveMath(page);
  await finish(page);
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
});

test('réduction des mouvements : décompte et impact lisibles sans animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page);
  await ready(page, 'math');
  await solveMath(page);
  expect(
    await page
      .locator('.fighter-player .wand-arm')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(
    await page
      .locator('.spell-impact')
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe('0.8');
  await finish(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute(
    'data-phase',
    'active',
  );
});

for (const [name, width, height] of [
  ['petit téléphone paysage', 568, 320],
  ['iPhone paysage', 844, 390],
  ['iPad', 1024, 768],
  ['laptop', 1280, 800],
  ['desktop', 1920, 1080],
]) {
  test(`responsive combat : ${name}`, async ({ page }, testInfo) => {
    await boot(page, {}, { width, height });
    await ready(page);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
    for (const element of await page
      .locator('.key,#validate,.answer-field,.battle-toolbar .battle-tool')
      .all()) {
      const b = await element.boundingBox();
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
      expect(b.y + b.height).toBeLessThanOrEqual(height);
    }
    const clock = await page.locator('.clock').boundingBox();
    expect(clock.width).toBeGreaterThanOrEqual(150);
    const player = await page.locator('.fighter-player').boundingBox(),
      enemy = await page.locator('.fighter-enemy').boundingBox();
    expect(player.x).toBeLessThan(enemy.x);
    await page.screenshot({ path: testInfo.outputPath('duel.png') });
    await solveClock(page);
    await finish(page);
    await menu(page);
    await ready(page, 'math');
    await solveMath(page);
    await finish(page);
    expect((await state(page)).adventures.clock.xp).toBe(20);
    await expect(page.getByTestId('xp')).toHaveText('20 XP');
  });
}

test('PWA : manifest, périmètre, précache des scènes et combats offline après rechargement', async ({
  page,
  context,
}) => {
  const missing = [],
    errors = [];
  page.on('response', (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page);
  const manifest = await page.evaluate(async () =>
    fetch(document.querySelector('link[rel=manifest]').href).then((r) =>
      r.json(),
    ),
  );
  expect(manifest.scope).toBe(base);
  expect(manifest.start_url).toBe(base);
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons)
    expect((await page.request.get(base + icon.src)).status()).toBe(200);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  expect(
    await page.evaluate(async () => {
      const names = await caches.keys();
      return names.some((n) => /^astrea-[a-f0-9]{12}$/.test(n));
    }),
  ).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await ready(page);
  await solveClock(page);
  await finish(page);
  await menu(page);
  await ready(page, 'math');
  await solveMath(page);
  await finish(page);
  await menu(page);
  await page.reload();
  expect((await state(page)).adventures.clock.xp).toBe(20);
  expect((await state(page)).adventures.math.xp).toBe(20);
  await settings(page);
  await page.getByLabel('Ton nom de mage').fill('Mira');
  await page.reload();
  await settings(page);
  await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Mira');
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test('sauvegarde corrompue signalée, nouvelle partie disponible', async ({
  page,
}) => {
  await boot(page);
  await page.evaluate(() => localStorage.setItem('astrea.save', 'not-json'));
  await page.reload();
  await expect(
    page.getByRole('status').filter({ hasText: /sauvegarde est illisible/ }),
  ).toBeVisible();
  await page.getByRole('button', {name:'Commencer', exact:true}).click();
  await page.locator('[data-kind=boy]').click();
  await page.locator('#creation-continue').click();
  await page.getByLabel('Ton nom de mage').fill('Mira');
  await page.locator('#creation-continue').click();
  await ready(page, 'math');
  await solveMath(page);
  expect((await state(page)).xp).toBeGreaterThanOrEqual(20);
});

test('stockage plein : avertissement visible, duel encore jouable', async ({
  page,
}) => {
  await boot(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await ready(page, 'math');
  await solveMath(page);
  await expect(
    page.getByRole('status').filter({ hasText: /sauvegarde est indisponible/ }),
  ).toBeVisible();
  await finish(page);
  await solveMath(page);
  await expect(page.getByTestId('xp')).toHaveText('40 XP');
});
