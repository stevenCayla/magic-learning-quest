export const MODES = ['clock', 'math'];
export const DIFFICULTIES = ['auto', 'easy', 'medium', 'advanced'];
export function integer(min, max, random = Math.random) {
  return min + Math.min(max - min, Math.max(0, Math.floor(random() * (max - min + 1))));
}
export function generateMath(tier = 0, random = Math.random, operation, star = 1) {
  tier = Math.max(0, Math.min(2, Math.trunc(tier) || 0));
  const op = operation ?? ['+', '−', '×'][integer(0, 2, random)];
  if (!['+', '−', '×'].includes(op)) throw new Error('Opération inconnue');
  let a, b;
  const max = Math.floor([20, 100, 500][tier] * [1, 1.5, 2][Math.min(2, Math.max(0, star - 1))]);
  if (op === '×') {
    const tables =
      tier === 0
        ? [2, 5, 10]
        : tier === 1
          ? star >= 2
            ? [2, 3, 4, 5, 6, 7, 8, 9, 10]
            : [2, 3, 4, 5, 6, 8, 10]
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
export function generateClock(level = 0, random = Math.random, withPeriod = false) {
  level = Math.max(0, Math.min(4, Math.trunc(level) || 0));
  const step = [60, 30, 15, 5, 1][level];
  const hour = integer(1, 12, random);
  const minute = integer(0, 60 / step - 1, random) * step;
  const period = withPeriod ? (integer(0, 1, random) ? 'afternoon' : 'morning') : undefined;
  return {
    mode: 'clock',
    hour,
    minute,
    level,
    ...(period ? { period, answerHour: (hour % 12) + (period === 'afternoon' ? 12 : 0) } : {}),
    key: `minute:${String(minute).padStart(2, '0')}`,
  };
}
export function validateAnswer(exercise, input) {
  if (exercise.mode === 'math')
    return /^\d{1,4}$/.test(String(input)) && Number(input) === exercise.answer;
  if (typeof input !== 'object' || input === null) return false;
  const { hour, minute } = input;
  return (
    /^\d{1,2}$/.test(String(hour)) &&
    /^\d{1,2}$/.test(String(minute)) &&
    Number(hour) >= (exercise.period ? 0 : 1) &&
    Number(hour) <= (exercise.period ? 23 : 12) &&
    Number(minute) >= 0 &&
    Number(minute) <= 59 &&
    Number(hour) === (exercise.period ? exercise.answerHour : exercise.hour) &&
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
  if (ex.period)
    return `Il est ${String(ex.answerHour).padStart(2, '0')} h ${String(ex.minute).padStart(2, '0')} ${ex.period === 'morning' ? 'du matin' : 'de l’après-midi'}. ${ex.period === 'afternoon' && ex.hour !== 12 ? 'Ajoute 12 aux heures de l’horloge.' : ex.hour === 12 && ex.period === 'morning' ? 'À minuit, on écrit 00 h.' : ex.hour === 12 ? 'À midi, on écrit 12 h.' : 'Le matin, garde l’heure indiquée.'}`;
  return `Il est ${ex.hour} h ${String(ex.minute).padStart(2, '0')}. La petite aiguille indique les heures, la grande les minutes. Chaque grand trait vaut 5 minutes.`;
}
const two = (n) => String(n).padStart(2, '0');
export function expectedAnswer(ex) {
  if (ex.mode === 'math') return String(ex.answer);
  return `${ex.period ? ex.answerHour : ex.hour}:${two(ex.minute)}`;
}
// The correction walks through the reading in the order a child does it.
export function correctionSteps(ex) {
  if (ex.mode === 'math')
    return [
      `On cherche ${ex.a} ${ex.op} ${ex.b}.`,
      ex.op === '×'
        ? `Compte ${ex.b} fois ${ex.a}.`
        : ex.op === '−'
          ? `Pars de ${ex.a} et recule de ${ex.b}.`
          : `Pars de ${Math.max(ex.a, ex.b)} et ajoute ${Math.min(ex.a, ex.b)}.`,
      `${ex.a} ${ex.op} ${ex.b} = ${ex.answer}.`,
    ];
  const mark = Math.floor(ex.minute / 5) || 12;
  const minutes =
    ex.minute === 0
      ? 'La grande aiguille est sur le 12 : c’est l’heure pile.'
      : ex.minute % 5 === 0
        ? `La grande aiguille est sur le ${mark} : ${ex.minute} minutes.`
        : `La grande aiguille est entre le ${mark} et le ${(mark % 12) + 1} : ${ex.minute} minutes.`;
  const hours =
    ex.minute === 0
      ? `La petite aiguille est sur le ${ex.hour} : ${ex.hour} heure${ex.hour > 1 ? 's' : ''}.`
      : `La petite aiguille a dépassé le ${ex.hour} : ${ex.hour} heure${ex.hour > 1 ? 's' : ''}.`;
  if (!ex.period) return [minutes, hours];
  const period =
    ex.period === 'afternoon'
      ? ex.hour === 12
        ? 'C’est midi : on écrit 12 heures.'
        : `C’est l’après-midi : ${ex.hour} + 12 = ${ex.answerHour} heures.`
      : ex.hour === 12
        ? 'C’est minuit : on écrit 0 heure.'
        : `C’est le matin : on garde ${ex.hour} heure${ex.hour > 1 ? 's' : ''}.`;
  return [minutes, hours, period];
}
