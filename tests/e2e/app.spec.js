import { test, expect } from '@playwright/test';
import {
  boot,
  ready,
  begin,
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

test('accueil : aucun footer, réglages avec une seule icône en haut à droite', async ({ page }) => {
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
  await expect(page.getByRole('heading', { name: 'Réglages de l’académie.' })).toBeVisible();
});

test('défi : saisie bloquée et aucun temps compté avant COMMENCER LE DUEL', async ({ page }) => {
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
  const shell = page.locator('.battle-shell');
  const panel = page.locator('#duel-panel');
  await expect(shell).toHaveAttribute('data-phase', 'intro');
  await expect(panel).toHaveAttribute('data-panel', 'intro');
  await expect(panel.getByRole('heading')).toHaveText('Brindor te défie !');
  await expect(page.locator('#panel-next')).toHaveText('COMMENCER LE DUEL');
  await expect(page.locator('#countdown-value')).toHaveCount(0);
  for (const blocked of await page.locator('[data-key], .answer-field, #validate').all())
    await expect(blocked).toBeDisabled();
  await page.locator('#main').focus();
  await page.keyboard.type('0100');
  await expect(page.locator('#hour-value')).toHaveText('--');
  await page.clock.runFor(20000);
  await expect(shell).toHaveAttribute('data-phase', 'intro');
  await expect(page.locator('#timer')).toHaveText('40 s');
  await page.locator('#panel-next').click();
  await expect(shell).toHaveAttribute('data-phase', 'active');
  await expect(panel).toBeHidden();
  await expect(page.locator('#timer')).toHaveText('40 s');
  await expect(page.locator('.key').first()).toBeEnabled();
  await expect(page.locator('#validate')).toHaveText('Lancer mon sort ✦');
  await expect(page.locator('#validate')).toBeDisabled();
  await page.clock.runFor(1000);
  await expect(page.locator('#timer')).toHaveText('39 s');
  await page.keyboard.type('0100');
  await expect(page.locator('#validate')).toBeEnabled();
});

test('portrait : invitation à tourner, vraie pause, sortie accessible sans rotation', async ({
  page,
}) => {
  await boot(page, {}, { width: 320, height: 568 });
  await page.getByRole('button', { name: /Horloge magique/ }).click();
  await expect(page.getByRole('heading', { name: 'Tourne ton téléphone' })).toBeVisible();
  await page.clock.runFor(20000);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'intro');
  await expect(page.locator('.battle-shell')).toHaveClass(/battle-paused/);
  await expect(page.locator('#rotate-exit')).toBeFocused();
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.getByRole('heading', { name: 'Magic Learning Quest' })).toBeVisible();
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.rotate-notice')).toBeHidden();
  await page.clock.runFor(5150);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'intro');
  await begin(page);
});

test('rotation pendant une question : aucune seconde perdue en portrait', async ({ page }) => {
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
      .locator('.fighter-player .pose-idle .wand-arm')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('wand-cast');
  await expect(page.locator('.fighter-player .pose-cast')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.fighter-player .pose-idle')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('.fighter-enemy .pose-idle')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('#feedback-next')).toHaveText('CONTINUER');
  await expect(page.locator('#validate')).toHaveText('Lancer mon sort ✦');
  await expect(page.locator('#validate')).toBeDisabled();
  await page.keyboard.type('999');
  await page.clock.runFor(950);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '100');
  await page.clock.runFor(100);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '80');
  await expect(page.locator('.battle-shell')).toHaveClass(/spell-hit/);
  await expect(page.locator('.fighter-enemy .pose-hit')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.fighter-enemy .pose-idle')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('#feedback-wait')).toContainText('Suite dans 2 s');
  await page.clock.runFor(1800);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'success');
  await page.clock.runFor(200);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'active');
  await expect(page.locator('#feedback')).toBeEmpty();
  await expect(page.locator('#duel-panel')).toBeHidden();
  await expect(page.locator('#hour-value')).toHaveText('--');
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '80');
  const saved = await state(page);
  expect(saved.xp).toBe(20);
  expect(saved.stats.clock.correct).toBe(1);
  await expect(page.getByRole('button', { name: 'Sort suivant' })).toHaveCount(0);
});

test('erreur : contresort, correction détaillée puis nouvelle question', async ({ page }) => {
  await boot(page);
  await ready(page, 'math');
  const before = await page.locator('.math-problem').textContent();
  await digits(page, '999');
  await page.getByRole('button', { name: /Lancer mon sort/ }).click();
  await expect(page.locator('#feedback')).toContainText('Oups, c’est raté !');
  await expect(page.locator('#feedback')).toContainText('Brindor riposte : −25 PV');
  await expect(page.locator('#feedback-next')).toHaveText(/^VOIR LA\s*CORRECTION$/);
  await expect(page.locator('.battle-shell')).toHaveClass(/spell-blocked/);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'failure-cast');
  await expect(page.locator('#validate')).toBeDisabled();
  const [from, to] = await page
    .locator('.battle-shell')
    .evaluate((el) => ['--from-x', '--to-x'].map((k) => parseFloat(el.style.getPropertyValue(k))));
  expect(from).toBeGreaterThan(to);
  await page.clock.runFor(1050);
  await expect(page.locator('.battle-shell')).toHaveClass(/spell-hit/);
  await expect(page.locator('.fighter-enemy .pose-cast')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.fighter-player .pose-hit')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '75');
  await expect(page.locator('#validate')).toBeDisabled();
  await page.clock.runFor(800);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'failure');
  await expect(page.getByTestId('xp')).toHaveText('0 XP');
  await page.evaluate(() => {
    Math.random = () => 0.9999;
  });
  await page.locator('#feedback-next').click();
  const panel = page.locator('#duel-panel');
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'correction');
  await expect(panel).toHaveAttribute('data-panel', 'correction');
  await expect(panel.getByRole('heading')).toHaveText('Regardons ensemble');
  await expect(panel.locator('.correction-answers div').first()).toContainText('Ta réponse');
  await expect(panel.locator('.is-wrong s')).toHaveText('999');
  await expect(panel.locator('.correction-answers div').last()).toContainText('Il fallait');
  await expect(panel.locator('.is-right')).toHaveText('2');
  await expect(panel.locator('.correction-steps li')).toHaveCount(3);
  await expect(panel.locator('.correction-steps li').last()).toContainText('1 + 1 = 2.');
  await expect(page.locator('#feedback')).toBeEmpty();
  await expect(page.locator('.key').first()).toBeDisabled();
  await expect(page.locator('#panel-next')).toHaveText('ESSAYER UN AUTRE CALCUL');
  await page.locator('#panel-next').click();
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'active');
  await expect(panel).toBeHidden();
  await expect(page.locator('.math-problem')).not.toHaveText(before);
  await expect(page.locator('#math-answer')).toHaveText('?');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '75');
  await solveMath(page);
  await expect(page.getByTestId('xp')).toHaveText('20 XP');
});

test('victoire d’étape : panneau de victoire, puis ennemi et décor changent avec un nouveau défi', async ({
  page,
}) => {
  await boot(page, { mathXP: 80 });
  await ready(page, 'math');
  await solveMath(page);
  await page.clock.runFor(1050);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '0');
  await expect(page.locator('.battle-shell')).toHaveClass(/enemy-defeated/);
  await expect(page.locator('#feedback-wait')).toHaveCount(0);
  await page.clock.runFor(10000);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'success');
  await page.locator('#feedback-next').click();
  const shell = page.locator('.battle-shell');
  const panel = page.locator('#duel-panel');
  await expect(shell).toHaveAttribute('data-phase', 'victory');
  await expect(panel).toHaveAttribute('data-panel', 'victory');
  await expect(panel.getByRole('heading')).toHaveText('Victoire !');
  await expect(panel).toContainText('Brindor est vaincu.');
  await expect(panel.locator('.panel-goals li')).toHaveCount(3);
  await expect(panel.locator('.panel-goals li.is-done')).toHaveText([
    'Duel gagné',
    'Une erreur au plus',
  ]);
  await expect(panel.locator('.panel-pill')).toContainText('+20 XP');
  await expect(panel.locator('.panel-pill')).toContainText('Baguette de noisetier');
  await expect(page.locator('#panel-stage')).toContainText('Prochaine étape : ');
  await expect(page.locator('#panel-home')).toBeVisible();
  await expect(page.locator('#panel-next')).toHaveText('NIVEAU SUIVANT');
  await expect(page.locator('#toast')).toBeEmpty();
  await expect(shell).toHaveAttribute('data-stage', '0');
  await page.locator('#panel-next').click();
  await expect(shell).toHaveAttribute('data-stage', '1');
  await expect(shell).toHaveAttribute('data-phase', 'intro');
  await expect(page.locator('.battle-scenery')).toHaveAttribute('data-scene', 'forest');
  await expect(page.locator('.fighter-enemy figcaption')).toContainText('Roncielle');
  await expect(panel.getByRole('heading')).toHaveText('Roncielle te défie !');
  await expect(page.locator('#panel-next')).toBeFocused();
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '100');
  await begin(page);
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
    await expect(page.locator('.fighter-enemy .dragon-art')).toHaveCount(3);
    await expect(page.locator('.fighter-enemy .pose-idle.dragon-art')).toBeVisible();
    await solveMath(page);
    await finish(page);
    await expect(page.locator('.rescue-celebration h2')).toContainText(`Étoile ${star}/3`);
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
    await expect(page.locator('.rescue-celebration')).toBeHidden();
    await expect(page.locator('#duel-panel')).toHaveAttribute('data-panel', 'intro');
    await begin(page);
    await menu(page);
    await page.reload();
    await expect(page.getByTestId('math-progress').locator('.journey-stars')).toHaveAttribute(
      'aria-label',
      `${star} étoiles sur 3`,
    );
    await expect(page.locator('.arcade-home')).not.toContainText('Aélis est libre');
    await expect(page.locator('.arcade-home')).not.toContainText('Château de l’aurore');
  });
}

test('personnalisation : visage, coiffure, tenue, baguette et nom conservés dans le combat', async ({
  page,
}) => {
  await boot(page);
  await settings(page);
  await page.locator('#edit-mage').click();
  await page.getByLabel('Ton nom de mage').fill('Mira');
  await page.getByRole('radio', { name: 'Ébène', exact: true }).check();
  await page.getByRole('radio', { name: 'Tresses', exact: true }).check();
  await page.locator('[data-tab=outfit]').click();
  await page.getByRole('radio', { name: 'Émeraude', exact: true }).check();
  await page.locator('[data-tab=wand]').click();
  await page.getByRole('radio', { name: 'Cristal', exact: true }).check();
  await page.reload();
  await settings(page);
  await page.locator('#edit-mage').click();
  await expect(page.getByLabel('Ton nom de mage')).toHaveValue('Mira');
  await expect(page.getByRole('radio', { name: 'Tresses', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Enregistrer mon mage' }).click();
  await page
    .getByRole('navigation', { name: 'Navigation mobile', exact: true })
    .getByRole('button', { name: 'S’entraîner' })
    .click();
  await ready(page);
  await expect(page.locator('.fighter-player figcaption')).toContainText('Mira');
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
  await page.locator('#edit-mage').click();
  await page.locator('[data-tab=outfit]').click();
  await expect(page.getByRole('radio', { name: /Couronne/ })).toBeDisabled();
  await page.locator('[data-tab=wand]').click();
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
  await page.locator('#edit-mage').click();
  await page.locator('[data-tab=outfit]').click();
  await page.getByRole('radio', { name: 'Couronne', exact: true }).check();
  await page.locator('[data-tab=wand]').click();
  await page.getByRole('radio', { name: 'Soleil', exact: true }).check();
  expect((await state(page)).avatar.hat).toBe('crown');
});

test('nom personnalisé affiché comme texte et non comme HTML', async ({ page }) => {
  await boot(page);
  await settings(page);
  await page.locator('#edit-mage').click();
  await page.getByLabel('Ton nom de mage').fill('<b>Mira</b>');
  await page.getByRole('button', { name: 'Enregistrer mon mage' }).click();
  await expect(page.locator('#mage-card-name')).toHaveText('<b>Mira</b>');
  await expect(page.locator('#mage-card-name b')).toHaveCount(0);
});

test('navigation : aventure, grimoire, personnalisation et niveaux manuels', async ({ page }) => {
  await boot(page);
  await page.getByRole('button', { name: 'Explorer mes aventures' }).click();
  await page.getByRole('button', { name: '♜ Grimoire' }).click();
  await expect(page.getByRole('heading', { name: 'Le grimoire des trésors.' })).toBeVisible();
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

test('clavier et lecture 12 h 59 : édition, focus et validation', async ({ page }) => {
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
  await expect(page.locator('#feedback')).toContainText('Temps écoulé !');
  await expect(page.locator('#feedback')).toContainText('Brindor en profite : −25 PV');
  await expect(page.getByTestId('xp')).toHaveText('45 XP');
  expect((await state(page)).history.at(-1).timedOut).toBe(true);
  await page.locator('#feedback-next').click();
  const panel = page.locator('#duel-panel');
  await expect(panel).toHaveAttribute('data-panel', 'correction');
  await expect(panel.locator('.is-wrong s')).toHaveText('pas de réponse');
  await expect(panel.locator('.is-right')).toHaveText('2');
  await expect(page.locator('#player-health')).toHaveAttribute('value', '75');
  await page.locator('#panel-next').click();
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'active');
  await expect(page.locator('#timer')).toHaveText('30 s');
  await expect(page.getByTestId('xp')).toHaveText('45 XP');
});

test('arrière-plan : défi, chrono et sort suspendus sans double gain', async ({ page }) => {
  await boot(page, {
    settings: {
      difficulty: 'easy',
      clockLevel: '0',
      relaxed: false,
      sound: false,
    },
  });
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await landscape(page);
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
  await page.locator('#panel-next').click();
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'intro');
  await show();
  await begin(page);
  await page.clock.runFor(1500);
  await expect(page.locator('#timer')).toHaveText('29 s');
  await hide();
  await page.clock.runFor(12000);
  await expect(page.locator('#timer')).toHaveText('29 s');
  await show();
  await page.clock.runFor(1000);
  await expect(page.locator('#timer')).toHaveText('28 s');
  await solveMath(page);
  await hide();
  await page.clock.runFor(12000);
  await expect(page.locator('#feedback')).toContainText('Bravo !');
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'success');
  await expect(page.locator('.battle-shell')).not.toHaveClass(/spell-hit/);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '100');
  await show();
  await finish(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'active');
  expect((await state(page)).stats.math.correct).toBe(1);
});

test('quitter annule le sort et les transitions', async ({ page }) => {
  await boot(page);
  await ready(page, 'math');
  await solveMath(page);
  await menu(page);
  await page.clock.runFor(12000);
  await expect(page.getByRole('heading', { name: 'Magic Learning Quest' })).toBeVisible();
  await expect(page.locator('.battle-shell')).toHaveCount(0);
});

test('pause : chrono et sort figés, reprise par bouton ou Échap, quitter garde la progression', async ({
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
  const shell = page.locator('.battle-shell');
  const pause = page.locator('.duel-pause');
  await expect(pause).toBeHidden();
  await expect(page.getByRole('button', { name: /Retour au menu/ })).toHaveCount(0);
  await page.clock.runFor(2500);
  await expect(page.locator('#timer')).toHaveText('38 s');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Pause' })).toBeVisible();
  await expect(pause).toContainText('Le chrono est arrêté.');
  await expect(page.locator('#pause-resume')).toBeFocused();
  await expect(shell).toHaveClass(/battle-paused/);
  await expect(page.locator('.key').first()).toBeDisabled();
  await page.keyboard.type('0100');
  await page.clock.runFor(20000);
  await expect(page.locator('#timer')).toHaveText('38 s');
  await page.getByRole('button', { name: 'REPRENDRE' }).click();
  await expect(pause).toBeHidden();
  await expect(shell).not.toHaveClass(/battle-paused/);
  await expect(page.locator('#hour-value')).toHaveText('--');
  await page.clock.runFor(1000);
  await expect(page.locator('#timer')).toHaveText('37 s');
  await page.keyboard.press('Escape');
  await expect(pause).toBeVisible();
  await page.clock.runFor(20000);
  await page.keyboard.press('Escape');
  await expect(pause).toBeHidden();
  await expect(page.locator('#timer')).toHaveText('37 s');
  await page.clock.runFor(1000);
  await expect(page.locator('#timer')).toHaveText('36 s');
  await solveClock(page);
  await expect(page.locator('#feedback')).toContainText('Bravo !');
  await page.keyboard.press('Escape');
  await expect(pause).toBeVisible();
  await page.clock.runFor(12000);
  await expect(shell).toHaveAttribute('data-phase', 'success');
  await expect(shell).not.toHaveClass(/spell-hit/);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '100');
  await page.locator('#pause-resume').click();
  await page.clock.runFor(1050);
  await expect(shell).toHaveClass(/spell-hit/);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '75');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(pause).toContainText('Ta progression est enregistrée.');
  await page.getByRole('button', { name: 'Quitter le duel' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Magic Learning Quest' })).toBeVisible();
  await expect(shell).toHaveCount(0);
  expect((await state(page)).adventures.clock.xp).toBe(25);
  await ready(page);
  await expect(page.locator('#enemy-health')).toHaveAttribute('value', '75');
  await expect(page.getByTestId('xp')).toHaveText('25 XP');
});

test('sons : départ par geste, signal au début du duel, lancer, impact et mute sauvegardé', async ({
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
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await landscape(page);
  await page.clock.runFor(6000);
  await expect.poll(() => page.evaluate(() => !!window.testAudio)).toBe(true);
  expect(await page.evaluate(() => window.notes.length)).toBe(0);
  await begin(page);
  await expect.poll(() => page.evaluate(() => window.notes.length)).toBe(3);
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
  await expect(page.getByRole('checkbox', { name: /Sons magiques/ })).not.toBeChecked();
});

test('audio indisponible ne bloque ni défi ni réponses', async ({ page }) => {
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

test('réduction des mouvements : défi et impact lisibles sans animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page);
  await page.getByRole('button', { name: /Maths magiques/ }).click();
  await landscape(page);
  await expect(page.locator('#duel-panel')).toBeVisible();
  await expect(page.locator('#duel-panel')).toHaveCSS('opacity', '1');
  await begin(page);
  await solveMath(page);
  expect(
    await page
      .locator('.fighter-player .pose-idle .wand-arm')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(await page.locator('.spell-impact').evaluate((el) => getComputedStyle(el).opacity)).toBe(
    '0.8',
  );
  await finish(page);
  await expect(page.locator('.battle-shell')).toHaveAttribute('data-phase', 'active');
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
    fetch(document.querySelector('link[rel=manifest]').href).then((r) => r.json()),
  );
  expect(manifest.scope).toBe(base);
  expect(manifest.start_url).toBe(base);
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons)
    expect((await page.request.get(base + icon.src)).status()).toBe(200);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
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
  await page.locator('#edit-mage').click();
  await page.getByLabel('Ton nom de mage').fill('Mira');
  await page.reload();
  await settings(page);
  await expect(page.locator('#mage-card-name')).toHaveText('Mira');
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test('sauvegarde corrompue signalée, nouvelle partie disponible', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => localStorage.setItem('astrea.save', 'not-json'));
  await page.reload();
  await expect(
    page.getByRole('status').filter({ hasText: /sauvegarde est illisible/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Commencer', exact: true }).click();
  await page.locator('[data-kind=boy]').click();
  await page.locator('#creation-continue').click();
  await page.getByLabel('Ton nom de mage').fill('Mira');
  await page.locator('#creation-continue').click();
  await ready(page, 'math');
  await solveMath(page);
  expect((await state(page)).xp).toBeGreaterThanOrEqual(20);
});

test('stockage plein : avertissement visible, duel encore jouable', async ({ page }) => {
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
