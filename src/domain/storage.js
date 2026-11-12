import { DIFFICULTIES } from './exercises.js';
import { unlockedRewards } from './progression.js';
export const SAVE_KEY = 'astrea.save';
export const SAVE_VERSION = 1;
const stats = () => ({ correct: 0, wrong: 0, totalMs: 0, buckets: {} });
export function freshState() {
  return {
    version: SAVE_VERSION,
    xp: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    rewards: [],
    settings: { difficulty: 'auto', clockLevel: 'auto', relaxed: false },
    stats: { clock: stats(), math: stats() },
    history: [],
  };
}
const natural = (x) => Number.isSafeInteger(x) && x >= 0;
export function restore(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== SAVE_VERSION)
      return {
        state: freshState(),
        warning: raw ? 'Sauvegarde incompatible. Une nouvelle aventure est prête.' : '',
      };
    const base = freshState();
    for (const key of ['xp', 'score', 'streak', 'bestStreak'])
      if (!natural(data[key])) throw new Error('Invalid save');
      else base[key] = data[key];
    if (
      !DIFFICULTIES.includes(data.settings?.difficulty) ||
      !['auto', '0', '1', '2', '3', '4'].includes(String(data.settings?.clockLevel)) ||
      typeof data.settings?.relaxed !== 'boolean'
    )
      throw new Error('Invalid settings');
    base.settings = {
      difficulty: data.settings.difficulty,
      clockLevel: String(data.settings.clockLevel),
      relaxed: data.settings.relaxed,
    };
    for (const mode of ['math', 'clock']) {
      const source = data.stats?.[mode];
      if (
        !source ||
        !['correct', 'wrong', 'totalMs'].every((k) => natural(source[k])) ||
        !source.buckets ||
        typeof source.buckets !== 'object' ||
        Array.isArray(source.buckets)
      )
        throw new Error('Invalid stats');
      const buckets = {};
      for (const [key, value] of Object.entries(source.buckets)) {
        if (
          !/^(minute:\d{2}|[+−×]:[0-2])$/.test(key) ||
          !value ||
          !['correct', 'wrong', 'totalMs'].every((k) => natural(value[k]))
        )
          throw new Error('Invalid bucket');
        buckets[key] = { correct: value.correct, wrong: value.wrong, totalMs: value.totalMs };
      }
      base.stats[mode] = {
        correct: source.correct,
        wrong: source.wrong,
        totalMs: source.totalMs,
        buckets,
      };
    }
    base.rewards = unlockedRewards(base.xp);
    base.history = Array.isArray(data.history)
      ? data.history
          .filter(
            (h) =>
              h &&
              ['clock', 'math'].includes(h.mode) &&
              typeof h.correct === 'boolean' &&
              natural(h.elapsed) &&
              natural(h.at),
          )
          .slice(-500)
      : [];
    return { state: base, warning: '' };
  } catch {
    return {
      state: freshState(),
      warning: 'La sauvegarde est illisible. Une nouvelle aventure est prête.',
    };
  }
}
export function load(storage) {
  try {
    return restore((storage ?? localStorage).getItem(SAVE_KEY));
  } catch {
    return {
      state: freshState(),
      warning: 'Le stockage est indisponible. Garde cette page ouverte pour conserver ta partie.',
    };
  }
}
export function save(state, storage) {
  try {
    (storage ?? localStorage).setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
