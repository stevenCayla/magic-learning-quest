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
    'Aélis est libre. Astréa retrouve sa lumière !',
    'Couronne de l’aurore',
  ],
].map(([name, icon, story, reward], index) => ({ name, icon, story, reward, index }));
export const XP_PER_STAGE = 100;
export function position(xp) {
  return Math.min(19, Math.floor(Math.max(0, xp) / XP_PER_STAGE));
}
export function level(xp) {
  return 1 + Math.floor(Math.max(0, xp) / 100);
}
export function unlockedRewards(xp) {
  return STAGES.filter((s) => s.reward && s.index <= position(xp)).map((s) => s.reward);
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
  const result = scoreAnswer({ correct, elapsed, limit, streak: state.streak });
  const next = structuredClone(state);
  next.xp += result.xp;
  next.score += result.score;
  next.streak = result.streak;
  next.bestStreak = Math.max(next.bestStreak, result.streak);
  next.rewards = unlockedRewards(next.xp);
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
  });
  next.history = next.history.slice(-500);
  return {
    state: next,
    result,
    newRewards: next.rewards.filter((r) => !state.rewards.includes(r)),
    newStage: position(next.xp) > position(state.xp),
  };
}
