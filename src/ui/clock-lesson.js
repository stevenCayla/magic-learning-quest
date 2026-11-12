import { clockSVG } from './clock.js';
export function openClockLesson({ onClose = () => {} } = {}) {
  if (document.querySelector('.clock-lesson')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'clock-lesson';
  dialog.setAttribute('aria-labelledby', 'lesson-title');
  dialog.innerHTML = `<header><div><p class="eyebrow">LE GRIMOIRE DU TEMPS</p><h2 id="lesson-title">Lire l’heure</h2></div><button class="secondary" id="close-lesson" aria-label="Fermer la leçon">✕ Fermer</button></header><div class="lesson-body"><p class="lesson-intro">Tu peux prendre tout ton temps. Pendant la leçon, le combat et le chrono sont en pause.</p><section><h3>1. Les aiguilles</h3><ul><li><strong>La petite aiguille indique les heures.</strong> Elle avance doucement entre deux nombres.</li><li><strong>La grande aiguille indique les minutes.</strong> Elle fait un tour complet en une heure.</li><li>La fine aiguille, appelée <strong>trotteuse</strong>, indique les secondes. Le jeu te demande seulement les heures et les minutes.</li></ul><p class="lesson-facts">1 jour = 24 heures · 1 heure = 60 minutes · 1 minute = 60 secondes</p></section><section><h3>2. Compter les minutes</h3><p>Un petit trait vaut <strong>1 minute</strong>. Entre deux nombres, il y a <strong>5 minutes</strong>. Multiplie le nombre pointé par la grande aiguille par 5.</p><div class="lesson-minute-grid">${Array.from({ length: 12 }, (_, i) => `<span><strong>${i === 0 ? 12 : i}</strong> → ${String(i * 5).padStart(2, '0')} min</span>`).join('')}</div><p>Sur le 3 : 15 minutes. Sur le 6 : 30 minutes. Sur le 9 : 45 minutes.</p></section><section><h3>3. Le matin ou l’après-midi ?</h3><p>Le cadran fait deux tours par jour. Pour les heures de 1 à 11, <strong>ajoute 12 l’après-midi</strong> : 2 h devient 14 h, 7 h devient 19 h.</p><p class="lesson-facts"><strong>Attention au 12 :</strong> à minuit, écris <strong>00 h</strong> ; à midi, écris <strong>12 h</strong>. Après 23 h 59, on revient à 00 h 00.</p><details><summary>Voir le tableau matin / après-midi</summary><table><thead><tr><th>Cadran</th><th>Matin</th><th>Après-midi</th></tr></thead><tbody>${Array.from(
    { length: 12 },
    (_, i) => {
      const h = i + 1;
      return `<tr><td>${h}</td><td>${h === 12 ? '00 h · minuit' : `${h} h`}</td><td>${h === 12 ? '12 h · midi' : `${h + 12} h`}</td></tr>`;
    },
  ).join(
    '',
  )}</tbody></table></details></section><section class="lesson-interactive"><h3>4. Essaie avec cette horloge</h3><div class="lesson-example"><div id="lesson-clock"></div><div><div class="lesson-controls"><button class="secondary" id="lesson-hour-minus" aria-label="Heure précédente">− 1 h</button><button class="secondary" id="lesson-hour-plus" aria-label="Heure suivante">+ 1 h</button></div><div class="lesson-controls">${['morning', 'afternoon'].map((p, i) => `<button class="secondary" data-period="${p}" aria-pressed="${i === 0}">${i ? 'Après-midi' : 'Matin'}</button>`).join('')}</div><div class="lesson-controls lesson-minutes">${[0, 5, 15, 30, 35, 40, 45, 55, 59].map((m) => `<button class="secondary" data-minute="${m}" aria-pressed="${m === 0}">${String(m).padStart(2, '0')} min</button>`).join('')}</div><p id="lesson-answer" aria-live="polite"></p></div></div></section><section><h3>5. La petite aiguille avance aussi !</h3><p>À 10 h 15, elle a déjà quitté le 10. À 10 h 30, elle est à mi-chemin entre 10 et 11. À 10 h 45, elle est proche du 11 : <strong>il n’est pas encore 11 heures</strong>.</p><div class="lesson-clock-row">${[0, 15, 30, 45].map((m) => `<figure>${clockSVG(10, m)}<figcaption>10 h ${String(m).padStart(2, '0')}<small>${m === 0 ? '10 heures pile' : m === 15 ? '10 heures et quart' : m === 30 ? '10 heures et demie' : '11 heures moins le quart'}</small></figcaption></figure>`).join('')}</div></section></div>`;
  let hour = 2,
    minute = 0,
    period = 'morning';
  function render() {
    dialog.querySelector('#lesson-clock').innerHTML = clockSVG(hour, minute);
    const h = (hour % 12) + (period === 'afternoon' ? 12 : 0);
    dialog.querySelector('#lesson-answer').textContent =
      `${String(h).padStart(2, '0')} h ${String(minute).padStart(2, '0')} · ${period === 'morning' ? 'du matin' : 'de l’après-midi'}`;
    dialog
      .querySelectorAll('[data-period]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.period === period)));
    dialog
      .querySelectorAll('[data-minute]')
      .forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.minute) === minute)));
  }
  dialog.querySelector('#lesson-hour-minus').onclick = () => {
    hour = hour === 1 ? 12 : hour - 1;
    render();
  };
  dialog.querySelector('#lesson-hour-plus').onclick = () => {
    hour = hour === 12 ? 1 : hour + 1;
    render();
  };
  dialog.querySelectorAll('[data-period]').forEach(
    (b) =>
      (b.onclick = () => {
        period = b.dataset.period;
        render();
      }),
  );
  dialog.querySelectorAll('[data-minute]').forEach(
    (b) =>
      (b.onclick = () => {
        minute = Number(b.dataset.minute);
        render();
      }),
  );
  dialog.querySelector('#close-lesson').onclick = () => dialog.close();
  dialog.addEventListener(
    'close',
    () => {
      dialog.remove();
      onClose();
    },
    { once: true },
  );
  document.body.append(dialog);
  render();
  dialog.showModal();
}
