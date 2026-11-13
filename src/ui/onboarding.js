import { AVATAR_OPTIONS } from '../domain/duel.js';
import { characterPreset } from '../domain/onboarding.js';
import { wizardSVG, escapeHTML } from './battle/characters.js';
import { versionMarkup } from './version.js';
export function mountOnboarding(container, { getState, change, complete, backHome }) {
  let creation = getState().onboarding;
  let tab = 'appearance';
  const logo =
    '<div class="creation-logo" aria-label="Magic Learning Quest"><span>MAGIC</span><span>QUEST</span></div>';
  const options = (key, legend) =>
    `<fieldset class="creation-options"><legend>${legend}</legend><div>${AVATAR_OPTIONS[key]
      .filter((o) => getState().unlocksXP >= (o[3] ?? 0))
      .map(
        ([id, label, color]) =>
          `<label class="creation-choice"><input type="radio" name="creation-${key}" value="${id}" ${creation.avatar[key] === id ? 'checked' : ''}><span ${color ? `style="--choice-color:${color}"` : ''}>${color ? '<i aria-hidden="true"></i>' : ''}${label}<b aria-hidden="true">✓</b></span></label>`,
      )
      .join('')}</div></fieldset>`;
  function render() {
    const choosing = creation.step === 'choice';
    container.innerHTML = `<section class="creation-screen ${choosing ? 'creation-select' : 'creation-custom'}" aria-label="Création du personnage"><header class="creation-header"><button id="creation-back" class="creation-back" aria-label="${choosing ? 'Retour à l’accueil' : 'Retour au choix du personnage'}">←</button><p class="creation-academy">L’ACADÉMIE D’ASTRÉA</p>${logo}<p class="creation-step">${choosing ? '1' : '2'} / 2</p><h1>${choosing ? 'Choisis ton mage' : 'Crée ton personnage'}</h1></header>${
      choosing
        ? `<div class="character-cards" role="group" aria-label="Choisis ton personnage">${[
            ['boy', 'Garçon'],
            ['girl', 'Fille'],
          ]
            .map(
              ([kind, label]) =>
                `<button class="character-card ${creation.selected === kind ? 'selected' : ''}" data-kind="${kind}" aria-pressed="${creation.selected === kind}"><span class="character-check" aria-hidden="true">✓</span>${wizardSVG({ avatar: characterPreset(kind), prefix: `choose-${kind}` })}<strong>${label}</strong></button>`,
            )
            .join('')}</div><p class="creation-help">Tu pourras changer ton style plus tard.</p>`
        : `<div class="creation-workshop"><div class="creation-preview" aria-label="Aperçu de ton personnage">${wizardSVG({ avatar: creation.avatar, prefix: 'creation' })}</div><div class="creation-controls"><label class="creation-name">Ton nom de mage<input id="creation-name" maxlength="18" autocomplete="off" autocapitalize="words" enterkeyhint="done" value="${escapeHTML(creation.avatar.name)}" placeholder="Écris ton nom" aria-describedby="creation-error"></label><div class="creation-tabs" role="tablist" aria-label="Personnalisation">${[
            ['appearance', 'Apparence'],
            ['outfit', 'Tenue'],
            ['wand', 'Baguette'],
          ]
            .map(
              ([id, label]) =>
                `<button role="tab" id="tab-${id}" aria-controls="creation-panel" aria-selected="${tab === id}" data-tab="${id}">${label}</button>`,
            )
            .join(
              '',
            )}</div><div id="creation-panel" role="tabpanel" aria-labelledby="tab-${tab}">${tab === 'appearance' ? options('skin', 'Teint') + options('hair', 'Cheveux') + options('style', 'Coiffure') + options('face', 'Expression') : tab === 'outfit' ? options('robe', 'Tenue') + options('hat', 'Chapeau') : options('wand', 'Baguette')}</div></div></div>`
    }<footer class="creation-footer"><p id="creation-error" role="status"></p><button id="creation-continue" class="arcade-menu-button clock-button">${choosing ? 'Continuer' : 'Commencer mon aventure'}</button>${versionMarkup()}</footer></section><section class="home-rotate creation-rotate" aria-label="Création en portrait"><div aria-hidden="true">▭ ↻ ▯</div><h2>Tourne ton téléphone à la verticale</h2><p>Crée ton mage en portrait.<br>Tes choix sont conservés.</p></section>`;
    container.querySelector('#creation-back').onclick = () => {
      if (choosing) backHome();
      else {
        change({ step: 'choice' });
        render();
      }
    };
    container.querySelectorAll('[data-kind]').forEach(
      (button) =>
        (button.onclick = () => {
          change({ kind: button.dataset.kind });
          render();
          container.querySelector(`[data-kind="${button.dataset.kind}"]`).focus();
        }),
    );
    const forward = container.querySelector('#creation-continue');
    forward.disabled = choosing ? !creation.selected : !creation.avatar.name.trim();
    forward.onclick = () => {
      if (choosing) {
        change({ step: 'customize' });
        tab = 'outfit';
        render();
      } else {
        try {
          complete();
        } catch (error) {
          container.querySelector('#creation-error').textContent = error.message;
        }
      }
    };
    container.querySelector('#creation-name')?.addEventListener('input', (e) => {
      change({ key: 'name', value: e.target.value });
      forward.disabled = !creation.avatar.name.trim();
    });
    container.querySelector('#creation-name')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
      }
    });
    container.querySelector('.creation-tabs')?.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...container.querySelectorAll('[data-tab]')];
      const index = tabs.indexOf(event.target.closest('[data-tab]'));
      tabs[(index + (event.key === 'ArrowRight' ? 1 : 2)) % tabs.length].click();
    });
    container.querySelectorAll('[data-tab]').forEach(
      (button) =>
        (button.onclick = () => {
          tab = button.dataset.tab;
          render();
          container.querySelector(`[data-tab="${tab}"]`).focus();
        }),
    );
    container.querySelectorAll('.creation-choice input').forEach(
      (input) =>
        (input.onchange = () => {
          change({ key: input.name.slice(9), value: input.value });
          const key = input.name,
            value = input.value;
          render();
          container.querySelector(`input[name="${key}"][value="${value}"]`).focus();
        }),
    );
  }
  // Refresh the view after each immutable, saved draft update.
  const update = change;
  change = (value) => {
    update(value);
    creation = getState().onboarding;
  };
  render();
}

export function installCreationViewport() {
  const viewport = window.visualViewport;
  if (!viewport) return;
  const sync = () => {
    const root = document.querySelector('.creation-screen');
    if (!root) return;
    root.style.height = `${viewport.height}px`;
    root.classList.toggle(
      'keyboard-open',
      document.activeElement?.id === 'creation-name' && viewport.height < window.innerHeight - 100,
    );
  };
  viewport.addEventListener('resize', sync);
  document.addEventListener('focusin', sync);
  document.addEventListener('focusout', sync);
}
