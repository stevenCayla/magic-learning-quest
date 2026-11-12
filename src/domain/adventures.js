export const ADVENTURE_MODES = ['clock', 'math'];
export const LEVEL_XP = 100;
export const LEVELS_PER_STAR = 20;
export const XP_PER_STAR = LEVEL_XP * LEVELS_PER_STAR;
export const MAX_STARS = 3;
export const MAX_HEALTH = 100;
export const ENEMY_DAMAGE = 25;
export function freshAdventure() {
  return {
    xp: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    cycleCorrect: 0,
    levelStartCorrect: 0,
    health: MAX_HEALTH,
    defeats: 0,
    rewards: [],
  };
}
export function journeyFor(xp = 0) {
  const total = Math.max(0, Number.isFinite(xp) ? Math.floor(xp) : 0);
  const stars = Math.min(MAX_STARS, Math.floor(total / XP_PER_STAR));
  const complete = stars === MAX_STARS;
  const cycleXP = complete ? XP_PER_STAR : total % XP_PER_STAR;
  return {
    stars,
    targetStar: Math.min(MAX_STARS, stars + 1),
    complete,
    cycleXP,
    stageIndex: complete ? 19 : Math.floor(cycleXP / LEVEL_XP),
    level: complete ? 20 : 1 + Math.floor(cycleXP / LEVEL_XP),
    remaining: LEVEL_XP - (total % LEVEL_XP),
  };
}
export function adventureFor(state, mode) {
  return (
    state.adventures?.[mode] ?? {
      ...freshAdventure(),
      xp: state.xp ?? 0,
      score: state.score ?? 0,
      streak: state.streak ?? 0,
      bestStreak: state.bestStreak ?? 0,
      rewards: state.rewards ?? [],
    }
  );
}
export function difficultyForAdventure(mode, settings, adventure) {
  const journey = journeyFor(adventure.xp),
    star = journey.targetStar,
    mastery = adventure.cycleCorrect;
  let level;
  if (mode === 'clock') {
    const floor = [0, 3, 4][star - 1];
    const auto =
      star === 1
        ? Math.min(3, Math.floor(mastery / 20))
        : star === 2
          ? Math.min(4, 3 + Math.floor(mastery / 20))
          : 4;
    level = settings.clockLevel === 'auto' ? auto : Math.max(floor, Number(settings.clockLevel));
  } else {
    const floor = star - 1;
    const auto =
      star === 1
        ? Math.min(1, Math.floor(mastery / 40))
        : star === 2
          ? Math.min(2, 1 + Math.floor(mastery / 40))
          : 2;
    const selected = { easy: 0, medium: 1, advanced: 2 }[settings.difficulty];
    level = selected === undefined ? auto : Math.max(floor, selected);
  }
  return {
    level,
    star,
    stageIndex: journey.stageIndex,
    timeFactor: [1, 0.8, 0.65][star - 1] * (1 - journey.stageIndex * 0.01),
  };
}
export function resetAdventure(state, mode) {
  if (!ADVENTURE_MODES.includes(mode)) throw new Error('Aventure inconnue');
  const next = structuredClone(state);
  next.unlocksXP = Math.max(state.unlocksXP ?? state.xp, state.xp);
  next.adventures[mode] = freshAdventure();
  next.xp = next.adventures.clock.xp + next.adventures.math.xp;
  next.score = next.adventures.clock.score + next.adventures.math.score;
  next.streak = 0;
  next.bestStreak = Math.max(next.adventures.clock.bestStreak, next.adventures.math.bestStreak);
  next.rewards = [
    ...new Set([
      ...(next.legacyRewards ?? []),
      ...next.adventures.clock.rewards,
      ...next.adventures.math.rewards,
    ]),
  ];
  return next;
}

// A defeat resets only the unfinished level, never a previous level or earned star.
export function restartLevel(state, mode) {
  if (!ADVENTURE_MODES.includes(mode)) throw new Error('Aventure inconnue');
  const previous = adventureFor(state, mode);
  if (previous.health !== 0) throw new Error('Le duel n’est pas perdu');
  const next = structuredClone(state);
  const progress = next.adventures[mode];
  progress.xp -= progress.xp % LEVEL_XP;
  progress.cycleCorrect = progress.levelStartCorrect;
  progress.health = MAX_HEALTH;
  progress.streak = 0;
  next.xp = next.adventures.clock.xp + next.adventures.math.xp;
  next.streak = 0;
  return next;
}
