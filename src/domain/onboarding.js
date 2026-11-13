import { DEFAULT_AVATAR, normalizeAvatar } from './duel.js';
export const CHARACTER_KINDS = ['boy', 'girl'];
export function characterPreset(kind, name = '') {
  if (!CHARACTER_KINDS.includes(kind)) throw new Error('Choisis un personnage');
  return {
    ...DEFAULT_AVATAR,
    kind,
    name,
    style: kind === 'girl' ? 'braids' : 'short',
    robe: kind === 'girl' ? 'emerald' : 'violet',
  };
}
export function freshOnboarding() {
  return {
    completed: false,
    step: 'welcome',
    selected: null,
    avatar: { ...DEFAULT_AVATAR, name: '' },
  };
}
export function cleanMageName(value) {
  return typeof value === 'string'
    ? Array.from(value.normalize('NFC'))
        .filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
        .join('')
        .trim()
        .slice(0, 18)
    : '';
}
export function restoreOnboarding(value, xp = 0) {
  // An existing save predates creation: its mage and progress remain ready to play.
  if (value === undefined) return { ...freshOnboarding(), completed: true };
  if (!value || typeof value.completed !== 'boolean') throw new Error('Initialisation invalide');
  const selected = CHARACTER_KINDS.includes(value.selected) ? value.selected : null;
  const step = ['welcome', 'choice', 'customize'].includes(value.step) ? value.step : 'welcome';
  return {
    completed: value.completed,
    selected,
    step: step === 'customize' && !selected ? 'choice' : step,
    avatar: { ...normalizeAvatar(value.avatar, xp), name: cleanMageName(value.avatar?.name) },
  };
}
export function updateCreation(state, change) {
  if (state.onboarding.completed) throw new Error('Ton personnage est déjà créé');
  const next = structuredClone(state),
    creation = next.onboarding;
  if (change.step) {
    if (!['welcome', 'choice', 'customize'].includes(change.step))
      throw new Error('Étape inconnue');
    if (change.step === 'customize' && !creation.selected) throw new Error('Choisis ton mage');
    creation.step = change.step;
  }
  if (change.kind && change.kind !== creation.selected) {
    creation.selected = change.kind;
    creation.avatar = characterPreset(change.kind, creation.avatar.name);
  }
  if (change.key) {
    creation.avatar = {
      ...normalizeAvatar({ ...creation.avatar, [change.key]: change.value }, state.unlocksXP),
      name: change.key === 'name' ? cleanMageName(change.value) : creation.avatar.name,
    };
  }
  return next;
}
export function completeCreation(state) {
  const creation = state.onboarding;
  if (creation.completed || !creation.selected || !cleanMageName(creation.avatar.name))
    throw new Error('Choisis un personnage et indique ton nom de mage');
  const next = structuredClone(state);
  next.avatar = normalizeAvatar(creation.avatar, state.unlocksXP);
  next.onboarding = {
    ...freshOnboarding(),
    completed: true,
    selected: creation.selected,
    avatar: { ...next.avatar },
  };
  return next;
}
