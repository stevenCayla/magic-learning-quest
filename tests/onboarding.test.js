import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, restore } from '../src/domain/storage.js';
import {
  characterPreset,
  updateCreation,
  completeCreation,
  cleanMageName,
  restoreOnboarding,
} from '../src/domain/onboarding.js';
import { buildVersion, validateReleaseMetadata } from '../src/build/version.js';

test('première ouverture : personnage non validé et aucune progression attribuée', () => {
  const s = freshState();
  assert.equal(s.onboarding.completed, false);
  assert.equal(s.onboarding.step, 'welcome');
  assert.equal(s.onboarding.selected, null);
  assert.equal(s.xp, 0);
  assert.equal(restore(null).state.onboarding.completed, false);
});
test('garçon et fille : deux modèles personnalisables, choix requis', () => {
  assert.equal(characterPreset('boy').kind, 'boy');
  assert.equal(characterPreset('girl').kind, 'girl');
  assert.notEqual(characterPreset('boy').style, characterPreset('girl').style);
  assert.notEqual(characterPreset('boy').robe, characterPreset('girl').robe);
  assert.throws(() => characterPreset('unknown'));
  assert.throws(() => updateCreation(freshState(), { step: 'customize' }));
  assert.throws(() => completeCreation(freshState()));
});
test('brouillon et retour entre étapes préservent les choix sans toucher au personnage validé', () => {
  const s = freshState(),
    original = structuredClone(s);
  let next = updateCreation(s, { step: 'choice' });
  assert.equal(next.onboarding.selected, 'boy');
  assert.equal(next.onboarding.avatar.robe, characterPreset('boy').robe);
  next = updateCreation(next, { kind: 'girl' });
  next = updateCreation(next, { step: 'customize' });
  next = updateCreation(next, { key: 'robe', value: 'blue' });
  next = updateCreation(next, { key: 'name', value: '  Lina  ' });
  assert.deepEqual(s, original);
  assert.equal(next.onboarding.avatar.robe, 'blue');
  assert.equal(next.onboarding.avatar.name, 'Lina');
  assert.deepEqual(next.avatar, s.avatar);
  assert.equal(next.onboarding.completed, false);
  next = updateCreation(next, { step: 'choice' });
  next = updateCreation(next, { kind: 'girl' });
  assert.equal(next.onboarding.avatar.robe, 'blue');
  assert.deepEqual(restore(JSON.stringify(next)).state, next);
});
test('validation finale unique, nom obligatoire et aventures préservées', () => {
  let s = updateCreation(freshState(), { kind: 'girl' });
  assert.throws(() => completeCreation(s));
  s = updateCreation(s, { key: 'name', value: 'Lina' });
  s.adventures.clock.xp = 25;
  s.xp = 25;
  const next = completeCreation(s);
  assert.equal(next.avatar.kind, 'girl');
  assert.equal(next.avatar.name, 'Lina');
  assert.equal(next.onboarding.completed, true);
  assert.deepEqual(next.adventures, s.adventures);
  assert.equal(next.xp, 25);
  assert.equal(s.onboarding.completed, false);
  assert.throws(() => completeCreation(next));
  assert.throws(() => updateCreation(next, { step: 'choice' }));
});
test('sauvegardes existantes sans initialisation : personnage et progression directement disponibles', () => {
  for (const version of [1, 2]) {
    const old = freshState();
    old.version = version;
    delete old.onboarding;
    if (version === 1) delete old.adventures;
    old.avatar.name = 'Mira';
    const r = restore(JSON.stringify(old));
    assert.equal(r.warning, '');
    assert.equal(r.state.onboarding.completed, true);
    assert.equal(r.state.avatar.name, 'Mira');
  }
});
test('noms, brouillons inconnus et accessoires verrouillés sont normalisés', () => {
  assert.equal(cleanMageName(' \n  '), '');
  assert.equal(cleanMageName('  E\u0301lia\0 '), 'Élia');
  assert.equal(cleanMageName('a'.repeat(30)).length, 18);
  assert.equal(cleanMageName(null), '');
  assert.throws(() => restoreOnboarding({ completed: 'yes' }));
  assert.equal(
    restoreOnboarding({ completed: false, step: 'customize', selected: null }).step,
    'choice',
  );
  let s = updateCreation(freshState(), { kind: 'boy' });
  s = updateCreation(s, { key: 'hat', value: 'crown' });
  assert.equal(s.onboarding.avatar.hat, 'pointed');
});
test('version publiée injectée depuis le tag, prévisualisations explicitement distinctes', () => {
  for (const tag of ['v1.1.0', 'v2.3.4', 'v1.2.0-rc.1']) {
    const v = buildVersion(tag, '0.0.0');
    assert.equal(v.version, tag);
    assert.equal(v.release, true);
    assert.ok(v.url.endsWith('/' + tag));
  }
  const dev = buildVersion('', '1.1.0');
  assert.equal(dev.version, 'v1.1.0-dev');
  assert.equal(dev.release, false);
  assert.equal(dev.url, '');
  for (const tag of ['1.1.0', 'v1', 'v1.2', '<script>', 'v1.2.3/../main'])
    assert.throws(() => buildVersion(tag, '1.1.0'));
});

test('publication refusée si le build ne correspond pas exactement au tag et au commit', () => {
  const commit = '1234567890abcdef1234567890abcdef12345678';
  const info = { ...buildVersion('v1.1.0', '0.0.0'), commit };
  assert.deepEqual(validateReleaseMetadata(info, 'v1.1.0', commit), info);
  for (const bad of [
    null,
    { ...info, version: 'v1.0.0' },
    { ...info, commit: 'other' },
    { ...info, release: false },
    { ...info, url: '' },
  ])
    assert.throws(() => validateReleaseMetadata(bad, 'v1.1.0', commit));
});
