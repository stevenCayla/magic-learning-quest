import {
  adventureFor,
  journeyFor,
  freshAdventure,
  MAX_HEALTH,
  ENEMY_DAMAGE,
} from './adventures.js';
export const STAGES = [
  ['Village des apprentis', '🏡', 'Ton premier pas vers la magie.', null],
  ['Forêt des lucioles', '🌲', 'Les lucioles éclairent ton chemin.', 'Baguette de noisetier'],
  ['Pont des brumes', '🌉', 'Un pont apparaît à chaque bon sort.', null],
  ['Clairière du griffon', '🦅', 'Gagne la confiance du griffon gardien.', 'Plume de griffon'],
  ['Bibliothèque des murmures', '📚', 'Les livres révèlent leurs secrets.', 'Sort de lumière'],
  ['Jardin lunaire', '🌙', 'Cueille les fleurs sous les étoiles.', null],
  ['Atelier des potions', '⚗️', 'Mélange précision et concentration.', 'Potion de lucidité'],
  ['Porte du golem', '🗿', 'Tes connaissances éveillent le gardien.', 'Rune de pierre'],
  ['Lac des miroirs', '💎', 'Suis le reflet de la tour.', null],
  ['Tour de l’horloge', '🕰️', 'Le maître du temps te met au défi.', 'Sablier astral'],
  ['Escalier des nuages', '☁️', 'Chaque réponse crée une marche.', null],
  ['Refuge des phénix', '🔥', 'Une flamme nouvelle t’accompagne.', 'Plume de phénix'],
  ['Galerie des étoiles', '🌌', 'Trace un chemin parmi les astres.', 'Carte céleste'],
  ['Souterrains de cristal', '🔮', 'Fais briller les cristaux endormis.', null],
  ['Crypte de la sentinelle', '🛡️', 'Traverse le bouclier de la sentinelle.', 'Bouclier d’aurore'],
  ['Coffre des anciens', '🧰', 'Un trésor attend les mages persévérants.', 'Baguette d’Astréa'],
  ['Vallée des dragons', '🏔️', 'Le château est tout proche.', null],
  ['Remparts d’Astréa', '🏰', 'La princesse Aélis compte sur toi.', 'Sort de courage'],
  ['Le dragon d’ombre', '🐉', 'Chaque bonne réponse dissipe son ombre.', 'Cœur de dragon'],
  [
    'Château de l’aurore',
    '👑',
    'Le dernier dragon garde Aélis. Libère la princesse !',
    'Couronne de l’aurore',
  ],
].map(([name, icon, story, reward], index) => ({
  name,
  icon,
  story,
  reward,
  index,
}));
export const XP_PER_STAGE = 100;
export function position(xp) {
  return journeyFor(xp).stageIndex;
}
export function level(xp) {
  return journeyFor(xp).level;
}
export function unlockedRewards(xp) {
  return STAGES.filter((s) => s.reward && (xp >= 2000 || s.index <= position(xp))).map(
    (s) => s.reward,
  );
}
export function scoreAnswer({ correct, elapsed, limit, streak }) {
  if (!correct) return { xp: 0, score: 0, streak: 0, fast: false };
  const fast = limit > 0 && Math.max(0, elapsed) <= limit / 2;
  const nextStreak = streak + 1;
  const bonus = Math.min(10, Math.floor(nextStreak / 3) * 2);
  return {
    xp: 20 + (fast ? 5 : 0),
    score: 100 + (fast ? 50 : 0) + bonus * 10,
    streak: nextStreak,
    fast,
  };
}
export function recordAnswer(
  state,
  exercise,
  { correct, elapsed, limit, timedOut = false },
  now = Date.now(),
) {
  const previous = adventureFor(state, exercise.mode);
  if (previous.health === 0) throw new Error('Recommence le niveau avant de répondre');
  const before = journeyFor(previous.xp);
  const result = scoreAnswer({
    correct,
    elapsed,
    limit,
    streak: previous.streak,
  });
  const next = structuredClone(state);
  next.adventures ??= { clock: freshAdventure(), math: freshAdventure() };
  const progress = next.adventures[exercise.mode];
  progress.xp = previous.xp + result.xp;
  progress.score = previous.score + result.score;
  progress.streak = result.streak;
  progress.bestStreak = Math.max(previous.bestStreak, result.streak);
  const after = journeyFor(progress.xp);
  const starEarned = after.stars > before.stars;

  const newStage = starEarned || after.stageIndex > before.stageIndex;
  const levelWon = Math.floor(progress.xp / XP_PER_STAGE) > Math.floor(previous.xp / XP_PER_STAGE);
  progress.cycleCorrect = starEarned ? 0 : previous.cycleCorrect + Number(correct);
  progress.health = correct
    ? levelWon
      ? MAX_HEALTH
      : (previous.health ?? MAX_HEALTH)
    : Math.max(0, (previous.health ?? MAX_HEALTH) - ENEMY_DAMAGE);
  progress.levelStartCorrect = levelWon
    ? progress.cycleCorrect
    : (previous.levelStartCorrect ?? previous.cycleCorrect);
  const defeated = progress.health === 0;
  progress.defeats = (previous.defeats ?? 0) + Number(defeated);

  progress.rewards = unlockedRewards(progress.xp);
  next.xp = next.adventures.clock.xp + next.adventures.math.xp;
  next.unlocksXP = Math.max(next.unlocksXP ?? 0, next.xp);
  next.score = next.adventures.clock.score + next.adventures.math.score;
  next.streak = progress.streak;
  next.bestStreak = Math.max(next.adventures.clock.bestStreak, next.adventures.math.bestStreak);
  next.rewards = [
    ...new Set([
      ...(next.legacyRewards ?? []),
      ...next.adventures.clock.rewards,
      ...next.adventures.math.rewards,
    ]),
  ];
  const stats = next.stats[exercise.mode];
  stats[correct ? 'correct' : 'wrong']++;
  stats.totalMs += Math.round(Math.max(0, elapsed) * 1000);
  stats.buckets[exercise.key] ??= { correct: 0, wrong: 0, totalMs: 0 };
  stats.buckets[exercise.key][correct ? 'correct' : 'wrong']++;
  stats.buckets[exercise.key].totalMs += Math.round(Math.max(0, elapsed) * 1000);
  next.history.push({
    mode: exercise.mode,
    key: exercise.key,
    correct,
    elapsed: Math.round(elapsed * 1000),
    timedOut,
    at: now,
    difficulty: exercise.tier ?? exercise.level,
    star: before.targetStar,
  });
  next.history = next.history.slice(-500);
  return {
    state: next,
    result,
    newRewards: progress.rewards.filter((r) => !previous.rewards.includes(r)),
    newStage,
    defeated,
    health: progress.health,
    starEarned,
    stars: after.stars,
    completed: after.complete,
  };
}
