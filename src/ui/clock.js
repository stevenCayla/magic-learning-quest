export function clockSVG(hour, minute) {
  const marks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * Math.PI) / 30;
    const radius = i % 5 ? 91 : 87;
    return `<line x1="${100 + Math.sin(angle) * radius}" y1="${100 - Math.cos(angle) * radius}" x2="${100 + Math.sin(angle) * 95}" y2="${100 - Math.cos(angle) * 95}" stroke-width="${i % 5 ? 1 : 2}"/>`;
  }).join('');
  const nums = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1,
      angle = (n * Math.PI) / 6;
    return `<text x="${100 + Math.sin(angle) * 75}" y="${100 - Math.cos(angle) * 75}" dy=".35em">${n}</text>`;
  }).join('');
  return `<svg class="clock" viewBox="-5 -5 210 210" role="img" aria-label="Horloge à lire : petite aiguille pour les heures, grande aiguille pour les minutes"><circle class="clock-rim" cx="100" cy="100" r="103"/><circle class="clock-face" cx="100" cy="100" r="98"/><g class="clock-marks">${marks}</g><g class="clock-numbers">${nums}</g><g transform="rotate(${(hour % 12) * 30 + minute / 2} 100 100)"><path d="M100 109V48" class="hour-hand"/></g><g transform="rotate(${minute * 6} 100 100)"><path d="M100 113V20" class="minute-hand"/></g><circle cx="100" cy="100" r="5" fill="#b38751"/></svg>`;
}
