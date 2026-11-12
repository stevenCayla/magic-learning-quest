export const MODES = ['clock', 'math'];
export const DIFFICULTIES = ['auto', 'easy', 'medium', 'advanced'];
export function tierFor(settings, mastery = 0) {
  return settings.difficulty === 'easy'
    ? 0
    : settings.difficulty === 'medium'
      ? 1
      : settings.difficulty === 'advanced'
        ? 2
        : Math.min(2, Math.floor(mastery / 20));
}
export function clockLevel(settings, mastery = 0) {
  return settings.clockLevel === 'auto'
    ? Math.min(4, Math.floor(mastery / 10))
    : Number(settings.clockLevel);
}
export function integer(min, max, random = Math.random) {
  return min + Math.min(max - min, Math.max(0, Math.floor(random() * (max - min + 1))));
}
export function generateMath(tier = 0, random = Math.random, operation) {
  tier = Math.max(0, Math.min(2, Math.trunc(tier) || 0));
  const op = operation ?? ['+', '−', '×'][integer(0, 2, random)];
  if (!['+', '−', '×'].includes(op)) throw new Error('Opération inconnue');
  let a, b;
  const max = [20, 100, 500][tier];
  if (op === '×') {
    const tables =
      tier === 0
        ? [2, 5, 10]
        : tier === 1
          ? [2, 3, 4, 5, 6, 8, 10]
          : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    a = tables[integer(0, tables.length - 1, random)];
    b = integer(1, tier === 2 ? 12 : 10, random);
  } else if (op === '+') {
    a = integer(1, max - 1, random);
    b = integer(1, max - a, random);
  } else {
    a = integer(2, max, random);
    b = integer(1, a, random);
  }
  const answer = op === '+' ? a + b : op === '−' ? a - b : a * b;
  return { mode: 'math', a, b, op, answer, tier, key: `${op}:${tier}` };
}
export function generateClock(level = 0, random = Math.random) {
  level = Math.max(0, Math.min(4, Math.trunc(level) || 0));
  const step = [60, 30, 15, 5, 1][level];
  const hour = integer(1, 12, random);
  const minute = integer(0, 60 / step - 1, random) * step;
  return { mode: 'clock', hour, minute, level, key: `minute:${String(minute).padStart(2, '0')}` };
}
export function validateAnswer(exercise, input) {
  if (exercise.mode === 'math')
    return /^\d{1,4}$/.test(String(input)) && Number(input) === exercise.answer;
  if (typeof input !== 'object' || input === null) return false;
  const { hour, minute } = input;
  return (
    /^\d{1,2}$/.test(String(hour)) &&
    /^\d{1,2}$/.test(String(minute)) &&
    Number(hour) >= 1 &&
    Number(hour) <= 12 &&
    Number(minute) >= 0 &&
    Number(minute) <= 59 &&
    Number(hour) === exercise.hour &&
    Number(minute) === exercise.minute
  );
}
export function timeLimit(mode, level, relaxed = false) {
  return relaxed
    ? 0
    : mode === 'clock'
      ? [40, 35, 30, 25, 20][Math.min(4, Math.max(0, level))]
      : [30, 24, 18][Math.min(2, Math.max(0, level))];
}
export function explanation(ex) {
  if (ex.mode === 'math')
    return `${ex.a} ${ex.op} ${ex.b} = ${ex.answer}. ${ex.op === '×' ? `Tu peux compter ${ex.b} fois ${ex.a}.` : ex.op === '−' ? `Pars de ${ex.a} et recule de ${ex.b}.` : `Pars de ${Math.max(ex.a, ex.b)} et ajoute ${Math.min(ex.a, ex.b)}.`}`;
  return `Il est ${ex.hour} h ${String(ex.minute).padStart(2, '0')}. La petite aiguille indique les heures, la grande les minutes. Chaque grand trait vaut 5 minutes.`;
}
