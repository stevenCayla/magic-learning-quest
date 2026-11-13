import './style.css';
import { STAGES } from './domain/progression.js';
import { adventureFor, journeyFor, resetAdventure } from './domain/adventures.js';
import { mountAdventureReset } from './ui/adventure-settings.js';
import { openClockLesson } from './ui/clock-lesson.js';
import { installZoomGuard } from './ui/zoom-guard.js';
import { load, save } from './domain/storage.js';
import { createBattleController } from './ui/battle/controller.js';
import { mountCustomizer } from './ui/customize.js';
import { normalizeAvatar } from './domain/duel.js';
import './ui/battle/battle.css';
import './ui/adventures.css';
import './ui/onboarding.css';
import { mountOnboarding, installCreationViewport } from './ui/onboarding.js';
import { updateCreation, completeCreation } from './domain/onboarding.js';
import { versionMarkup } from './ui/version.js';
import { createSoundPlayer } from './ui/sound.js';
const sounds = createSoundPlayer();

const restored = load();
let state = restored.state;
let warning = restored.warning;
let screen = 'home';
let selectedAdventure = 'clock';
installZoomGuard();
installCreationViewport();
let installPrompt = null;
const app = document.querySelector('#app');
const escape = (str) =>
  String(str).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const persist = () => {
  if (!save(state)) {
    warning = 'La sauvegarde est indisponible. Garde cette page ouverte pour conserver ta partie.';
    const main = document.querySelector('#main');
    if (main && !main.querySelector('.notice')) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.role = 'status';
      notice.textContent = warning;
      main.prepend(notice);
    }
  }
};
const modeLabel = (mode) => (mode === 'clock' ? 'Horloge' : 'Maths');
const starsMarkup = (stars) =>
  `<span class="journey-stars" aria-label="${stars} étoiles sur 3">${'★'.repeat(stars)}<span>${'☆'.repeat(3 - stars)}</span></span>`;
function adventureTabs() {
  return `<nav class="adventure-tabs" aria-label="Choisir l’aventure">${['clock', 'math'].map((mode) => `<button class="secondary" data-adventure="${mode}" aria-pressed="${selectedAdventure === mode}">${mode === 'clock' ? '◷' : '✦'} Aventure ${modeLabel(mode)} ${starsMarkup(journeyFor(adventureFor(state, mode).xp).stars)}</button>`).join('')}</nav>`;
}
function bindAdventureTabs(renderPage) {
  app.querySelectorAll('[data-adventure]').forEach(
    (b) =>
      (b.onclick = () => {
        selectedAdventure = b.dataset.adventure;
        renderPage();
      }),
  );
}
const battle = createBattleController({
  getState: () => state,
  setState: (value) => {
    state = value;
    persist();
  },
  render: (content) => shell(content),
  onNavigate: navigate,
  sounds,
});
function start(mode) {
  if (!state.onboarding.completed) return home();
  selectedAdventure = mode;
  screen = mode;
  battle.start(mode);
}
function navButton(id, icon, title) {
  return `<button data-nav="${id}" class="nav-item ${screen === id || (id === 'home' && ['clock', 'math'].includes(screen)) ? 'active' : ''}" ${screen === id ? 'aria-current="page"' : ''}><span aria-hidden="true">${icon}</span><span>${title}</span></button>`;
}
function shell(content) {
  document.documentElement.classList.toggle('home-screen', screen === 'home');
  if (!state.onboarding.completed) {
    app.innerHTML = `<div class="app-shell is-home onboarding-welcome"><main id="main" tabindex="-1">${warning ? `<p class="notice" role="status">${escape(warning)}</p>` : ''}${content}</main><div id="toast" role="status" class="toast"></div></div>`;
    return;
  }
  if (['clock', 'math'].includes(screen)) {
    app.innerHTML = `<div class="app-shell in-exercise"><main id="main" tabindex="-1">${warning ? `<p class="notice" role="status">${escape(warning)}</p>` : ''}${content}</main><div id="toast" role="status" class="toast"></div></div>`;
    return;
  }
  app.innerHTML = `<div class="app-shell ${screen === 'home' ? 'is-home' : ''}"><header class="topbar"><a class="brand" href="#home" aria-label="Astréa, accueil"><span class="brand-mark" aria-hidden="true">✦</span><span>ASTRÉA<small>MAGIC LEARNING QUEST</small></span></a><div class="top-status"><span class="online-dot ${navigator.onLine ? '' : 'offline'}"></span><span id="connection">${navigator.onLine ? 'Prêt à explorer' : 'Hors connexion'}</span></div><div class="profile" aria-label="Ton mage"><span aria-hidden="true">🧙</span><div>${escape(state.avatar.name)}<small>Académie d’Astréa</small></div></div></header><div class="layout"><aside class="sidebar"><p class="eyebrow">TON ACADÉMIE</p><nav aria-label="Navigation principale">${navButton('home', '✦', 'Entraînement')}${navButton('adventure', '◇', 'Aventure')}${navButton('collection', '♜', 'Grimoire')}${navButton('settings', '⚙', 'Réglages')}</nav><div class="sidebar-quote"><span>☾</span><p>Les plus grands sorts<br>commencent par<br>un petit progrès.</p><small>ACADÉMIE D’ASTRÉA</small></div><button class="install sidebar-install" data-install>＋ Installer l’application</button></aside><main id="main" tabindex="-1">${warning ? `<p class="notice" role="status">${escape(warning)}</p>` : ''}${content}</main></div><nav class="mobile-nav" aria-label="Navigation mobile">${navButton('home', '✦', 'S’entraîner')}${navButton('adventure', '◇', 'Aventure')}${navButton('collection', '♜', 'Grimoire')}${navButton('settings', '⚙', 'Réglages')}</nav><div id="toast" role="status" class="toast"></div></div>`;
  if (screen === 'home') app.querySelector('.mobile-nav')?.remove();
  app
    .querySelectorAll('[data-nav]')
    .forEach((b) => b.addEventListener('click', () => navigate(b.dataset.nav)));
  app.querySelector('.brand').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('home');
  });
  app.querySelectorAll('[data-install]').forEach((b) => b.addEventListener('click', install));
}
function home() {
  const firstLaunch = !state.onboarding.completed;
  if (firstLaunch && state.onboarding.step !== 'welcome') {
    shell('<div id="creation-root"></div>');
    mountOnboarding(document.querySelector('#creation-root'), {
      getState: () => state,
      change: (value) => {
        state = updateCreation(state, value);
        persist();
      },
      complete: () => {
        state = completeCreation(state);
        persist();
        home();
        document.querySelector('#main').focus({ preventScroll: true });
      },
      backHome: () => {
        state = updateCreation(state, { step: 'welcome' });
        persist();
        home();
      },
    });
    return;
  }
  const card = (mode) => {
    const p = adventureFor(state, mode),
      j = journeyFor(p.xp);
    return `<button class="arcade-menu-button ${mode === 'clock' ? 'clock' : 'math'}-button" id="choose-${mode}"><span aria-hidden="true">${mode === 'clock' ? '◷' : '✦'}</span><span>${mode === 'clock' ? 'Horloge magique' : 'Maths magiques'}<small data-testid="${mode}-progress">${starsMarkup(j.stars)} · Niveau ${j.level}/20${j.complete ? ' · Maîtrise !' : ''}</small></span><span aria-hidden="true">➜</span></button>`;
  };
  shell(
    `<section class="arcade-home" aria-label="Accueil de l’académie d’Astréa">${firstLaunch ? '' : '<button class="home-settings" id="home-settings" aria-label="Réglages" title="Réglages"><span aria-hidden="true">⚙</span></button>'}<header class="arcade-brand"><p>L’ACADÉMIE D’ASTRÉA</p><h1 aria-label="Magic Learning Quest"><span>MAGIC</span><span>QUEST</span></h1><p class="arcade-subtitle">Deux aventures. Trois étoiles chacune !</p></header><div class="arcade-heroes" role="img" aria-label="Un apprenti mage, une chouette et un petit dragon"></div><div class="arcade-home-bottom">${firstLaunch ? '<p class="welcome-promise">Ton aventure commence ici !</p><button class="arcade-menu-button clock-button welcome-start" id="begin-creation"><span aria-hidden="true">✦</span> Commencer</button>' : `<div class="arcade-home-progress"><span>🧙 ${escape(state.avatar.name)}</span><strong>À toi de jouer !</strong></div><div class="arcade-menu" aria-label="Choisis ton entraînement">${card('clock')}${card('math')}<button class="arcade-menu-button adventure-button" id="explore" aria-label="Explorer mes aventures"><span aria-hidden="true">♜</span><span>Mes aventures<small>Horloge et Maths : chacune son chemin</small></span><span aria-hidden="true">➜</span></button></div>`}${versionMarkup()}</div></section><section class="home-rotate" aria-label="Accueil en portrait"><div aria-hidden="true">▭ ↻ ▯</div><h2>Tourne ton téléphone à la verticale</h2><p>L’accueil se consulte en portrait.<br>Les duels se jouent en paysage.</p></section>`,
  );
  if (firstLaunch) {
    document.querySelector('#begin-creation').onclick = () => {
      state = updateCreation(state, { step: 'choice' });
      persist();
      home();
    };
    return;
  }
  document.querySelector('#home-settings').onclick = () => navigate('settings');
  document.querySelector('#explore').onclick = () => navigate('adventure');
  document.querySelector('#choose-clock').onclick = () => start('clock');
  document.querySelector('#choose-math').onclick = () => start('math');
}
function adventure() {
  const progress = adventureFor(state, selectedAdventure),
    j = journeyFor(progress.xp),
    current = STAGES[j.stageIndex];
  shell(
    `<div class="page-heading"><div><p class="eyebrow">DEUX AVENTURES INDÉPENDANTES</p><h1>Mes aventures<span class="gold">.</span></h1><p>20 niveaux pour chaque étoile. Trois étoiles à gagner par aventure.</p></div><div class="adventure-links"><button class="secondary" id="open-grimoire">♜ Grimoire</button><button class="secondary" id="open-mage">✦ Mon mage</button></div></div>${adventureTabs()}<section class="quest-summary glass"><span class="quest-icon">${current.icon}</span><div><span class="eyebrow">AVENTURE ${modeLabel(selectedAdventure).toUpperCase()} · ÉTOILE ${j.targetStar}/3</span><h2>${current.name}</h2><p>${starsMarkup(j.stars)} · Niveau ${j.level}/20 · ${progress.xp} XP</p><progress aria-label="Progression de l’étoile en cours" max="2000" value="${j.cycleXP}"></progress><p>${j.complete ? 'Trois étoiles maîtrisées ! Continue à t’entraîner.' : `${j.remaining} XP avant le prochain niveau · ${2000 - j.cycleXP} XP avant la prochaine étoile`}</p><p>${selectedAdventure === 'clock' ? 'Lis l’horloge et réponds au format 24 h, en suivant Matin ou Après-midi.' : 'Additionne, soustrais et multiplie. Chaque étoile augmente la difficulté.'}</p></div><div class="quest-actions"><button class="primary" id="train-adventure">Jouer · ${modeLabel(selectedAdventure)}</button>${selectedAdventure === 'clock' ? '<button class="secondary" id="read-lesson">📖 Relire la leçon</button>' : ''}</div></section><ol class="journey">${STAGES.map((s, i) => `<li class="journey-stop ${i < j.stageIndex || j.complete ? 'complete' : i === j.stageIndex ? 'current' : 'locked'}" ${i === j.stageIndex ? 'aria-current="step"' : ''}><span class="stop-number">${i < j.stageIndex ? '✓' : i + 1}</span><span class="stop-icon" aria-hidden="true">${s.icon}</span><div><small>${i === j.stageIndex ? 'TU ES ICI' : `NIVEAU ${i + 1}`}</small><h3>${s.name}</h3><p>${s.story}</p>${s.reward ? `<span class="reward-label">🎁 ${s.reward}</span>` : ''}</div></li>`).join('')}</ol>`,
  );
  bindAdventureTabs(adventure);
  document.querySelector('#open-grimoire').onclick = () => navigate('collection');
  document.querySelector('#open-mage').onclick = () => navigate('settings');
  document.querySelector('#train-adventure').onclick = () => start(selectedAdventure);
  document.querySelector('#read-lesson')?.addEventListener('click', () => openClockLesson());
}
function collection() {
  const p = adventureFor(state, selectedAdventure);
  shell(
    `<div class="page-heading"><div><p class="eyebrow">TES TRÉSORS</p><h1>Le grimoire des trésors<span class="gold">.</span></h1><p>Chaque aventure garde ses propres récompenses.</p></div></div>${adventureTabs()}${state.legacyRewards.length ? `<p class="collection-summary glass">Trésors conservés de ta première aventure : ${state.legacyRewards.map(escape).join(' · ')}</p>` : ''}<p class="collection-summary">${p.rewards.length} trésors · Record : ${p.bestStreak} bonnes réponses à la suite</p><div class="collection-grid">${STAGES.filter(
      (s) => s.reward,
    )
      .map(
        (s) =>
          `<article class="glass treasure ${p.rewards.includes(s.reward) ? '' : 'undiscovered'}"><span aria-hidden="true">${p.rewards.includes(s.reward) ? s.icon : '♧'}</span><small>${p.rewards.includes(s.reward) ? 'DÉBLOQUÉ' : `NIVEAU ${s.index + 1}`}</small><h2>${s.reward}</h2><p>${s.name}</p></article>`,
      )
      .join('')}</div>`,
  );
  bindAdventureTabs(collection);
}
function settings() {
  const math = state.stats.math,
    clock = state.stats.clock;
  const errors = Object.entries(clock.buckets)
    .filter(([, v]) => v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 5);
  shell(
    `<div class="page-heading"><div><p class="eyebrow">À TON RYTHME</p><h1>Réglages de l’académie<span class="gold">.</span></h1><p>Choisis un défi confortable. Tu peux changer à tout moment.</p></div></div><div class="settings-grid"><section class="glass settings-panel mage-customizer" id="mage-customizer"></section><section class="glass settings-panel" id="reset-adventures"></section><section class="glass settings-panel"><h2>✧ Difficulté des maths</h2><fieldset><legend>Choisis ton niveau</legend>${[
      [
        'auto',
        'Progression automatique',
        'Chaque étoile augmente les nombres, les tables et la rapidité.',
      ],
      [
        'easy',
        'Initié · Facile',
        'Additions jusqu’à 20, soustractions positives, tables de 2, 5 et 10.',
      ],
      [
        'medium',
        'Enchanteur · Intermédiaire',
        'Calculs jusqu’à 100, tables de 2, 3, 4, 5, 6, 8 et 10.',
      ],
      ['advanced', 'Grand mage · Avancé', 'Calculs jusqu’à 500, toutes les tables de 2 à 12.'],
    ]
      .map(
        ([v, t, d]) =>
          `<label class="choice"><input type="radio" name="difficulty" value="${v}" ${state.settings.difficulty === v ? 'checked' : ''}><span><strong>${t}</strong><small>${d}</small></span></label>`,
      )
      .join(
        '',
      )}</fieldset></section><section class="glass settings-panel"><h2>◷ Maîtrise de l’heure</h2><fieldset><legend>Choisis un palier</legend>${[
      ['auto', 'Progression automatique'],
      ['0', '1 · Heures pleines'],
      ['1', '2 · Demi-heures'],
      ['2', '3 · Quarts d’heure'],
      ['3', '4 · De 5 en 5 minutes'],
      ['4', '5 · Toutes les minutes'],
    ]
      .map(
        ([v, t]) =>
          `<label class="choice compact"><input type="radio" name="clockLevel" value="${v}" ${String(state.settings.clockLevel) === v ? 'checked' : ''}><span>${t}</span></label>`,
      )
      .join(
        '',
      )}</fieldset><p class="footnote">Étoile 1 : heures et pas de 5 minutes ; étoile 2 : toutes les minutes ; étoile 3 : rapidité. Matin/après-midi dès le début.</p><label class="choice"><input type="checkbox" id="relaxed" ${state.settings.relaxed ? 'checked' : ''}><span><strong>Mode découverte · Sans chrono</strong><small>Tout le temps pour apprendre. Mêmes XP de base.</small></span></label></section><section class="glass settings-panel"><h2>Tes progrès</h2><div class="learning-stats">${[
      ['Horloge', clock],
      ['Maths', math],
    ]
      .map(
        ([n, s]) =>
          `<div><h3>${n}</h3><p>${s.correct} réussites · ${s.wrong} essais à revoir</p><p>Temps moyen : ${s.correct + s.wrong ? (s.totalMs / (s.correct + s.wrong) / 1000).toFixed(1) : '0'} s</p></div>`,
      )
      .join(
        '',
      )}</div><p id="clock-stat-progression">Horloge : ${state.adventures.clock.xp} XP · ${journeyFor(state.adventures.clock.xp).stars}/3 étoiles · ${state.adventures.clock.score} points</p><p id="math-stat-progression">Maths : ${state.adventures.math.xp} XP · ${journeyFor(state.adventures.math.xp).stars}/3 étoiles · ${state.adventures.math.score} points</p><h3>Minutes à apprivoiser</h3><p>${errors.length ? errors.map(([k, v]) => `:${k.split(':')[1]} (${v.wrong} essai${v.wrong > 1 ? 's' : ''} à revoir)`).join(' · ') : 'Les difficultés apparaîtront ici après tes premiers essais.'}</p><button class="secondary" id="export">Exporter la sauvegarde</button></section><section class="glass settings-panel"><h2>Emporte ta magie</h2><label class="choice"><input type="checkbox" id="sound-enabled" ${state.settings.sound ? 'checked' : ''}><span><strong>Sons magiques</strong><small>Carillons de victoire et sons doux pour réessayer.</small></span></label><p>Installe Astréa sur ton écran d’accueil. Après une première ouverture en ligne, l’aventure fonctionne hors connexion.</p><button class="primary" data-install>＋ Installer l’application</button><p class="footnote">Sur iPhone ou iPad : dans Safari, touche Partager, puis « Sur l’écran d’accueil ». Sur Android ou ordinateur : utilise le bouton d’installation du navigateur.</p><p class="footnote">Ta progression reste sur cet appareil et ce navigateur. Aucune donnée n’est envoyée à un serveur.</p></section></div><p id="settings-status" class="footnote" role="status">Réglages enregistrés automatiquement.</p>`,
  );
  mountCustomizer(document.querySelector('#mage-customizer'), {
    getState: () => ({ ...state, xp: state.unlocksXP ?? state.xp }),
    onChange: (key, value) => {
      state.avatar = normalizeAvatar(
        { ...state.avatar, [key]: value },
        state.unlocksXP ?? state.xp,
      );
      persist();
    },
  });
  mountAdventureReset(document.querySelector('#reset-adventures'), {
    getState: () => state,
    onReset: (mode) => {
      state = resetAdventure(state, mode);
      persist();
      document.querySelector(`#${mode}-stat-progression`).textContent =
        `${modeLabel(mode)} : 0 XP · 0/3 étoiles · 0 points`;
    },
  });
  app.querySelectorAll('input[name=difficulty], input[name=clockLevel]').forEach(
    (input) =>
      (input.onchange = () => {
        state.settings[input.name] = input.value;
        persist();
        document.querySelector('#settings-status').textContent = 'Nouveaux réglages enregistrés.';
      }),
  );
  document.querySelector('#relaxed').onchange = (e) => {
    state.settings.relaxed = e.target.checked;
    persist();
  };
  document.querySelector('#sound-enabled').onchange = (e) => {
    state.settings.sound = e.target.checked;
    if (state.settings.sound) void sounds.unlock();
    else sounds.stop();
    persist();
  };
  document.querySelector('#export').onclick = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrea-sauvegarde.json';
    a.click();
    URL.revokeObjectURL(url);
  };
}
function navigate(next) {
  battle.stop();
  if (!state.onboarding.completed) {
    screen = 'home';
    home();
    return;
  }
  screen = next;
  (({ home, adventure, settings, collection })[next] ?? home)();
  window.scrollTo(0, 0);
  document.querySelector('#main').focus({ preventScroll: true });
}
async function install() {
  if (installPrompt) {
    await installPrompt.prompt();
    installPrompt = null;
  } else {
    const toast = document.querySelector('#toast');
    toast.textContent =
      'iPhone/iPad : Safari → Partager → Sur l’écran d’accueil. Android/PC : menu du navigateur → Installer l’application.';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 12000);
  }
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});
for (const event of ['online', 'offline'])
  window.addEventListener(event, () => {
    const connection = document.querySelector('#connection');
    if (!connection) return;
    connection.textContent = navigator.onLine ? 'Prêt à explorer' : 'Hors connexion';
    document.querySelector('.online-dot').classList.toggle('offline', !navigator.onLine);
  });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      })
      .catch(() => {
        const toast = document.querySelector('#toast');
        toast.textContent =
          'Le mode hors connexion n’a pas pu être préparé. Réessaie avec une connexion.';
        toast.classList.add('visible');
      }),
  );
}
home();
