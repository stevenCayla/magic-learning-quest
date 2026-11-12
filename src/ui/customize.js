import { AVATAR_OPTIONS } from '../domain/duel.js';
import { wizardSVG, escapeHTML } from './battle/characters.js';
const labels = {
  skin: 'Visage · Teint',
  hair: 'Couleur des cheveux',
  style: 'Coiffure',
  face: 'Expression',
  robe: 'Tenue',
  hat: 'Chapeau',
  wand: 'Baguette',
};
export function mountCustomizer(container, { getState, onChange }) {
  const { avatar, xp } = getState();
  container.innerHTML = `<h2>✦ Personnalise ton mage</h2><div class="customizer-layout"><div class="mage-preview" aria-label="Aperçu de ton personnage">${wizardSVG({ avatar, prefix: 'preview' })}<strong id="preview-name">${escapeHTML(avatar.name)}</strong></div><div class="mage-options"><label class="mage-name">Ton nom de mage<input id="mage-name" maxlength="18" autocomplete="off" value="${escapeHTML(avatar.name)}"></label>${Object.entries(
    AVATAR_OPTIONS,
  )
    .map(
      ([key, options]) =>
        `<fieldset><legend>${labels[key]}</legend><div class="avatar-choices">${options.map(([id, label, color, required = 0]) => `<label class="avatar-choice ${xp < required ? 'avatar-locked' : ''}"><input type="radio" name="avatar-${key}" value="${id}" ${avatar[key] === id ? 'checked' : ''} ${xp < required ? 'disabled' : ''}><span ${color ? `style="--swatch:${color}"` : ''}>${color ? '<i aria-hidden="true"></i>' : ''}${label}${xp < required ? `<small>${required} XP</small>` : ''}</span></label>`).join('')}</div></fieldset>`,
    )
    .join(
      '',
    )}<p class="footnote">Tes choix sont enregistrés automatiquement. Les accessoires spéciaux se débloquent avec l’aventure.</p></div></div>`;
  const update = () => {
    container.querySelector('.mage-preview').innerHTML =
      `${wizardSVG({ avatar: getState().avatar, prefix: 'preview' })}<strong id="preview-name">${escapeHTML(getState().avatar.name)}</strong>`;
  };
  container.querySelector('#mage-name').addEventListener('input', (e) => {
    onChange('name', e.target.value);
    update();
  });
  container.querySelectorAll('input[type=radio]').forEach((input) =>
    input.addEventListener('change', () => {
      onChange(input.name.slice(7), input.value);
      update();
    }),
  );
}
