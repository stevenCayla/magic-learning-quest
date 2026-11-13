import { AVATAR_OPTIONS } from '../domain/duel.js';
import { characterPreset, CHARACTER_KINDS } from '../domain/onboarding.js';
import { wizardSVG, escapeHTML } from './battle/characters.js';
import { versionMarkup } from './version.js';

const KIND_LABELS = { boy: 'Garçon', girl: 'Fille' };
const star =
  '<svg aria-hidden="true" viewBox="0 0 52 50"><polygon points="26,2 31.9,17.9 48.8,18.6 35.5,29.1 40.1,45.4 26,36 11.9,45.4 16.5,29.1 3.2,18.6 20.1,17.9"/></svg>';
const backIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 12H5"/><path d="M11 5.5L4.5 12l6.5 6.5"/></svg>';
const clearIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

// The same screen creates the first mage and, in edit mode, changes the validated one.
export function mountOnboarding(container, { getState, change, complete, edit }) {
  let creation = edit ? { step: 'customize', avatar: edit.avatar() } : getState().onboarding;
  let tab = edit ? 'appearance' : 'outfit';
  const refresh = () => {
    creation = edit ? { step: 'customize', avatar: edit.avatar() } : getState().onboarding;
  };
  const set = (key, value) => {
    if (edit) edit.set(key, value);
    else change({ key, value });
    refresh();
  };
  const xp = () => getState().unlocksXP ?? getState().xp ?? 0;
  // Colours read best as discs; shapes are shown on the mage itself.
  const options = (key, legend) =>
    `<fieldset class="creation-options"><legend>${legend}</legend><div>${AVATAR_OPTIONS[key]
      .filter((o) => edit || xp() >= (o[3] ?? 0))
      .map(([id, label, color, required = 0]) => {
        const locked = xp() < required;
        const disc = color && key !== 'robe';
        const picture = disc
          ? `<i aria-hidden="true" style="--choice-color:${color}"></i>`
          : `<span class="creation-thumb" aria-hidden="true">${wizardSVG({ avatar: { ...creation.avatar, [key]: id }, prefix: `opt-${key}-${id}` })}</span>`;
        return `<label class="creation-choice ${disc ? 'is-colour' : 'is-shape'} ${locked ? 'is-locked' : ''}"><input type="radio" name="creation-${key}" value="${id}" ${creation.avatar[key] === id ? 'checked' : ''} ${locked ? 'disabled' : ''}><span>${picture}<em>${label}</em>${locked ? `<small>${required} XP</small>` : ''}<b aria-hidden="true">✓</b></span></label>`;
      })
      .join('')}</div></fieldset>`;
  const kinds = () =>
    `<fieldset class="creation-options creation-kinds"><legend>Personnage</legend><div>${CHARACTER_KINDS.map(
      (id) =>
        `<label class="creation-choice is-shape"><input type="radio" name="creation-kind" value="${id}" ${creation.avatar.kind === id ? 'checked' : ''}><span><span class="creation-thumb" aria-hidden="true">${wizardSVG({ avatar: { ...creation.avatar, kind: id }, prefix: `opt-kind-${id}` })}</span><em>${KIND_LABELS[id]}</em><b aria-hidden="true">✓</b></span></label>`,
    ).join('')}</div></fieldset>`;
  const panel = () =>
    tab === 'appearance'
      ? (edit ? kinds() : '') +
        options('skin', 'Teint') +
        options('hair', 'Cheveux') +
        options('style', 'Coiffure') +
        options('face', 'Expression')
      : tab === 'outfit'
        ? options('robe', 'Tenue') + options('hat', 'Chapeau')
        : options('wand', 'Baguette');
  function render() {
    const choosing = creation.step === 'choice';
    const title = choosing ? 'Choisis ton mage' : edit ? 'Modifie ton mage' : 'Crée ton personnage';
    const step = edit
      ? '<span class="creation-step-spacer" aria-hidden="true"></span>'
      : `<p class="creation-step" aria-label="Étape ${choosing ? 1 : 2} sur 2">${choosing ? '1' : '2'} / 2</p>`;
    const header = choosing
      ? `<header class="creation-header">${step}<div class="creation-title">${star}<h1>${title}</h1>${star}</div></header>`
      : `<header class="creation-header creation-bar"><button id="creation-back" class="creation-back" aria-label="${edit ? 'Retour aux réglages' : 'Retour au choix du personnage'}">${backIcon}</button><h1>${title}</h1>${step}</header>`;
    container.innerHTML = `<section class="creation-screen ${choosing ? 'creation-select' : 'creation-custom'}" aria-label="${edit ? 'Modification du personnage' : 'Création du personnage'}">${header}${
      choosing
        ? `<div class="character-cards" role="group" aria-label="Choisis ton personnage">${CHARACTER_KINDS.map(
            (kind) =>
              `<button class="character-card ${creation.selected === kind ? 'selected' : ''}" data-kind="${kind}" aria-pressed="${creation.selected === kind}"><span class="character-check" aria-hidden="true">✓</span>${wizardSVG({ avatar: characterPreset(kind), prefix: `choose-${kind}` })}<strong>${KIND_LABELS[kind]}</strong></button>`,
          ).join('')}</div><p class="creation-help">Tu pourras changer ton style plus tard.</p>`
        : `<div class="creation-workshop"><div class="creation-preview" aria-label="Aperçu de ton personnage">${wizardSVG({ avatar: creation.avatar, prefix: 'creation' })}</div><div class="creation-controls"><div class="creation-name-box"><label class="creation-name">Ton nom de mage<input id="creation-name" maxlength="18" autocomplete="off" autocapitalize="words" enterkeyhint="done" value="${escapeHTML(creation.avatar.name)}" placeholder="Écris ton nom" aria-describedby="creation-error"></label><button type="button" id="creation-name-clear" class="creation-name-clear" aria-label="Effacer le nom" title="Effacer le nom">${clearIcon}</button></div><div class="creation-tabs" role="tablist" aria-label="Personnalisation">${[
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
            )}</div><div id="creation-panel" role="tabpanel" aria-labelledby="tab-${tab}">${panel()}</div></div></div>`
    }<footer class="creation-footer"><p id="creation-error" role="status"></p><button id="creation-continue" class="arcade-menu-button clock-button">${choosing ? 'Continuer' : edit ? 'Enregistrer mon mage' : 'Commencer mon aventure'}</button>${versionMarkup()}</footer></section><section class="home-rotate creation-rotate" aria-label="Création en portrait"><div aria-hidden="true">▭ ↻ ▯</div><h2>Tourne ton téléphone à la verticale</h2><p>Crée ton mage en portrait.<br>Tes choix sont conservés.</p></section>`;
    const back = container.querySelector('#creation-back');
    if (back)
      back.onclick = () => {
        if (edit) edit.done();
        else {
          change({ step: 'choice' });
          refresh();
          render();
        }
      };
    container.querySelectorAll('[data-kind]').forEach(
      (button) =>
        (button.onclick = () => {
          change({ kind: button.dataset.kind });
          refresh();
          render();
          container.querySelector(`[data-kind="${button.dataset.kind}"]`).focus();
        }),
    );
    const forward = container.querySelector('#creation-continue');
    const named = () => !!creation.avatar.name.trim();
    forward.disabled = choosing ? !creation.selected : !named();
    forward.onclick = () => {
      if (choosing) {
        change({ step: 'customize' });
        refresh();
        tab = 'outfit';
        render();
      } else if (edit) edit.done();
      else {
        try {
          complete();
        } catch (error) {
          container.querySelector('#creation-error').textContent = error.message;
        }
      }
    };
    const name = container.querySelector('#creation-name');
    name?.addEventListener('input', (e) => {
      set('name', e.target.value);
      forward.disabled = !named();
    });
    name?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
      }
    });
    const clear = container.querySelector('#creation-name-clear');
    if (clear)
      clear.onclick = () => {
        name.value = '';
        set('name', '');
        forward.disabled = true;
        name.focus();
      };
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
          const key = input.name,
            value = input.value,
            top = container.querySelector('#creation-panel').scrollTop;
          set(key.slice(9), value);
          render();
          container.querySelector('#creation-panel').scrollTop = top;
          container.querySelector(`input[name="${key}"][value="${value}"]`).focus();
        }),
    );
  }
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
