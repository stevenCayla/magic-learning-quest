import { adventureFor, journeyFor } from '../domain/adventures.js';
export function mountAdventureReset(container, { getState, onReset }) {
  container.innerHTML = `<h2>Recommencer une aventure</h2><p>Choisis l’aventure à remettre à zéro. L’autre aventure, ton mage, tes réglages et l’historique d’apprentissage seront conservés.</p><div class="reset-adventures">${[
    'clock',
    'math',
  ]
    .map((mode) => {
      const p = adventureFor(getState(), mode),
        j = journeyFor(p.xp);
      return `<button class="secondary" data-reset="${mode}">Réinitialiser ${mode === 'clock' ? 'Horloge' : 'Maths'}<small>${p.xp} XP · ${j.stars}/3 étoiles</small></button>`;
    })
    .join(
      '',
    )}</div><dialog class="reset-dialog" aria-labelledby="reset-title"><h2 id="reset-title"></h2><p>Les XP, étoiles, niveaux, coffres et score de cette aventure seront remis à zéro. L’autre aventure, ton personnage et tes statistiques d’apprentissage seront conservés.</p><div><button class="secondary" id="cancel-reset" autofocus>Annuler</button><button class="primary" id="confirm-reset">Oui, remettre à zéro</button></div></dialog><p id="reset-status" role="status"></p>`;
  const dialog = container.querySelector('dialog');
  let selected = null;
  container.querySelectorAll('[data-reset]').forEach(
    (button) =>
      (button.onclick = () => {
        selected = button.dataset.reset;
        container.querySelector('#reset-title').textContent =
          `Recommencer l’aventure ${selected === 'clock' ? 'Horloge' : 'Maths'} ?`;
        dialog.showModal();
      }),
  );
  container.querySelector('#cancel-reset').onclick = () => dialog.close();
  container.querySelector('#confirm-reset').onclick = () => {
    const mode = selected;
    dialog.close();
    onReset(mode);
    mountAdventureReset(container, { getState, onReset });
    container.querySelector(`[data-reset="${mode}"]`).focus();
    container.querySelector('#reset-status').textContent =
      `L’aventure ${mode === 'clock' ? 'Horloge' : 'Maths'} repart à zéro.`;
  };
}
