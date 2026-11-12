import './style.css';
import { STAGES, position, level } from './domain/progression.js';
import { load, save } from './domain/storage.js';
import { createBattleController } from './ui/battle/controller.js';
import { mountCustomizer } from './ui/customize.js';
import { normalizeAvatar } from './domain/duel.js';
import './ui/battle/battle.css';
import { createSoundPlayer } from './ui/sound.js';
const sounds = createSoundPlayer();

const restored = load();
let state = restored.state;
let warning = restored.warning;
let screen = 'home';
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
const stage = () => STAGES[position(state.xp)];
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
  screen = mode;
  battle.start(mode);
}
function navButton(id, icon, title) {
  return `<button data-nav="${id}" class="nav-item ${screen === id || (id === 'home' && ['clock', 'math'].includes(screen)) ? 'active' : ''}" ${screen === id ? 'aria-current="page"' : ''}><span aria-hidden="true">${icon}</span><span>${title}</span></button>`;
}
function shell(content) {
  if (['clock', 'math'].includes(screen)) {
    app.innerHTML = `<div class="app-shell in-exercise"><main id="main" tabindex="-1">${warning ? `<p class="notice" role="status">${escape(warning)}</p>` : ''}${content}</main><div id="toast" role="status" class="toast"></div></div>`;
    return;
  }
  app.innerHTML = `<div class="app-shell ${screen === 'home' ? 'is-home' : ''}"><header class="topbar"><a class="brand" href="#home" aria-label="Astréa, accueil"><span class="brand-mark" aria-hidden="true">✦</span><span>ASTRÉA<small>MAGIC LEARNING QUEST</small></span></a><div class="top-status"><span class="online-dot ${navigator.onLine ? '' : 'offline'}"></span><span id="connection">${navigator.onLine ? 'Prêt à explorer' : 'Hors connexion'}</span></div><div class="profile" aria-label="Apprenti mage, niveau ${level(state.xp)}"><span aria-hidden="true">🧙</span><div>Apprenti mage<small>Niveau ${level(state.xp)}</small></div></div></header><div class="layout"><aside class="sidebar"><p class="eyebrow">TON ACADÉMIE</p><nav aria-label="Navigation principale">${navButton('home', '✦', 'Entraînement')}${navButton('adventure', '◇', 'Aventure')}${navButton('collection', '♜', 'Grimoire')}${navButton('settings', '⚙', 'Réglages')}</nav><div class="sidebar-quote"><span>☾</span><p>Les plus grands sorts<br>commencent par<br>un petit progrès.</p><small>ACADÉMIE D’ASTRÉA</small></div><button class="install sidebar-install" data-install>＋ Installer l’application</button></aside><main id="main" tabindex="-1">${warning ? `<p class="notice" role="status">${escape(warning)}</p>` : ''}${content}</main></div><nav class="mobile-nav" aria-label="Navigation mobile">${navButton('home', '✦', 'S’entraîner')}${navButton('adventure', '◇', 'Aventure')}${navButton('collection', '♜', 'Grimoire')}${navButton('settings', '⚙', 'Réglages')}</nav><div id="toast" role="status" class="toast"></div></div>`;
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
  shell(`<section class="arcade-home" aria-label="Accueil de l’académie d’Astréa">
    <button class="home-settings" id="home-settings" aria-label="Réglages" title="Réglages"><span aria-hidden="true">⚙</span></button><header class="arcade-brand"><p>L’ACADÉMIE D’ASTRÉA</p><h1 aria-label="Magic Learning Quest"><span>MAGIC</span><span>QUEST</span></h1><p class="arcade-subtitle">De petits défis. De grands pouvoirs !</p></header>
    <div class="arcade-heroes" role="img" aria-label="Un apprenti mage, une chouette et un petit dragon devant l’académie magique"></div>
    <div class="arcade-home-bottom"><div class="arcade-home-progress"><span>🧙 Niveau ${level(state.xp)}</span><strong data-testid="xp">${state.xp} XP</strong><span>◈ ${state.rewards.length} trésors</span></div>
    <div class="arcade-menu" aria-label="Choisis ton entraînement">
      <button class="arcade-menu-button clock-button" id="choose-clock"><span aria-hidden="true">◷</span><span>Horloge magique<small>Maîtrise le temps !</small></span><span aria-hidden="true">➜</span></button>
      <button class="arcade-menu-button math-button" id="choose-math"><span aria-hidden="true">✦</span><span>Maths magiques<small>Fais parler les nombres !</small></span><span aria-hidden="true">➜</span></button>
      <button class="arcade-menu-button adventure-button" id="explore" aria-label="Explorer mon aventure"><span aria-hidden="true">♜</span><span>Mon aventure<small>Direction le château !</small></span><span aria-hidden="true">➜</span></button>
    </div><p class="arcade-current-stage">${position(state.xp) === 19 ? '<strong>👑 Aélis est libre !</strong>' : ''}${stage().icon} ${stage().name} · Étape ${position(state.xp) + 1} / 20</p></div>
  </section>`);
  document.querySelector('#home-settings').onclick = () => navigate('settings');
  document.querySelector('#explore').onclick = () => navigate('adventure');
  document.querySelector('#choose-clock').onclick = () => start('clock');
  document.querySelector('#choose-math').onclick = () => start('math');
}
function adventure() {
  const pos = position(state.xp);
  shell(
    `<div class="page-heading"><div><p class="eyebrow">LE VOYAGE D’ASTRÉA</p><h1>Une aventure, deux pouvoirs<span class="gold">.</span></h1><p>L’heure et les maths te font avancer sur le même chemin.</p></div><div class="adventure-links"><button class="secondary" id="open-grimoire">♜ Grimoire</button><button class="secondary" id="open-mage">✦ Mon mage</button></div></div><section class="quest-summary glass"><span class="quest-icon">${stage().icon}</span><div><span class="eyebrow">ÉTAPE ${pos + 1} / 20</span><h2>${stage().name}</h2><p>${stage().story}</p><progress aria-label="Progression vers le château" max="1900" value="${Math.min(1900, state.xp)}"></progress><p>${pos === 19 ? 'Princesse Aélis délivrée ! Tu peux continuer à t’entraîner.' : `${100 - (state.xp % 100)} XP avant la prochaine étape · 20 à 25 XP par bonne réponse`}</p>${pos === 18 ? `<p>🐉 Ombre du dragon : ${100 - (state.xp % 100)} / 100. Tes bonnes réponses lancent des sorts de lumière !</p>` : ''}</div><div class="quest-actions"><button class="primary" data-train="clock">◷ Horloge</button><button class="secondary" data-train="math">✧ Maths</button></div></section><ol class="journey">${STAGES.map((s, i) => `<li class="journey-stop ${i < pos ? 'complete' : i === pos ? 'current' : 'locked'}" ${i === pos ? 'aria-current="step"' : ''}><span class="stop-number">${i < pos ? '✓' : i + 1}</span><span class="stop-icon" aria-hidden="true">${s.icon}</span><div><small>${i < pos ? 'EXPLORÉ' : i === pos ? 'TU ES ICI' : `${i * 100} XP`}</small><h3>${s.name}</h3><p>${s.story}</p>${s.reward ? `<span class="reward-label">${i <= pos ? '✦ Reçu : ' : '🎁 '}${s.reward}</span>` : ''}</div></li>`).join('')}</ol>`,
  );
  document.querySelector('#open-grimoire').onclick = () => navigate('collection');
  document.querySelector('#open-mage').onclick = () => navigate('settings');
  app.querySelectorAll('[data-train]').forEach((b) => (b.onclick = () => start(b.dataset.train)));
}
function collection() {
  shell(
    `<div class="page-heading"><div><p class="eyebrow">TES POUVOIRS GRANDISSENT</p><h1>Le grimoire des trésors<span class="gold">.</span></h1><p>${state.rewards.length} récompenses découvertes · Record : ${state.bestStreak} bonnes réponses à la suite</p></div></div><div class="collection-grid">${STAGES.filter(
      (s) => s.reward,
    )
      .map(
        (s) =>
          `<article class="glass treasure ${s.index <= position(state.xp) ? '' : 'undiscovered'}"><span aria-hidden="true">${s.index <= position(state.xp) ? s.icon : '♧'}</span><small>${s.index <= position(state.xp) ? 'DÉBLOQUÉ' : `${s.index * 100} XP`}</small><h2>${s.reward}</h2><p>${s.name}</p></article>`,
      )
      .join(
        '',
      )}</div><p class="footnote">Les coffres s’ouvrent automatiquement quand tu arrives à leur étape.</p>`,
  );
}
function settings() {
  const math = state.stats.math,
    clock = state.stats.clock;
  const errors = Object.entries(clock.buckets)
    .filter(([, v]) => v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 5);
  shell(
    `<div class="page-heading"><div><p class="eyebrow">À TON RYTHME</p><h1>Réglages de l’académie<span class="gold">.</span></h1><p>Choisis un défi confortable. Tu peux changer à tout moment.</p></div></div><div class="settings-grid"><section class="glass settings-panel mage-customizer" id="mage-customizer"></section><section class="glass settings-panel"><h2>✧ Difficulté des maths</h2><fieldset><legend>Choisis ton niveau</legend>${[
      [
        'auto',
        'Progression automatique',
        'Le niveau augmente après 20 puis 40 bonnes réponses en maths.',
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
      )}</fieldset><p class="footnote">En automatique, un palier s’ouvre toutes les 10 bonnes réponses d’horloge.</p><label class="choice"><input type="checkbox" id="relaxed" ${state.settings.relaxed ? 'checked' : ''}><span><strong>Mode découverte · Sans chrono</strong><small>Tout le temps pour apprendre. Mêmes XP de base.</small></span></label></section><section class="glass settings-panel"><h2>Tes progrès</h2><div class="learning-stats">${[
      ['Horloge', clock],
      ['Maths', math],
    ]
      .map(
        ([n, s]) =>
          `<div><h3>${n}</h3><p>${s.correct} réussites · ${s.wrong} essais à revoir</p><p>Temps moyen : ${s.correct + s.wrong ? (s.totalMs / (s.correct + s.wrong) / 1000).toFixed(1) : '0'} s</p></div>`,
      )
      .join(
        '',
      )}</div><p>Score total : ${state.score} · Meilleure série : ${state.bestStreak}</p><h3>Minutes à apprivoiser</h3><p>${errors.length ? errors.map(([k, v]) => `:${k.split(':')[1]} (${v.wrong} essai${v.wrong > 1 ? 's' : ''} à revoir)`).join(' · ') : 'Les difficultés apparaîtront ici après tes premiers essais.'}</p><button class="secondary" id="export">Exporter la sauvegarde</button></section><section class="glass settings-panel"><h2>Emporte ta magie</h2><label class="choice"><input type="checkbox" id="sound-enabled" ${state.settings.sound ? 'checked' : ''}><span><strong>Sons magiques</strong><small>Carillons de victoire et sons doux pour réessayer.</small></span></label><p>Installe Astréa sur ton écran d’accueil. Après une première ouverture en ligne, l’aventure fonctionne hors connexion.</p><button class="primary" data-install>＋ Installer l’application</button><p class="footnote">Sur iPhone ou iPad : dans Safari, touche Partager, puis « Sur l’écran d’accueil ». Sur Android ou ordinateur : utilise le bouton d’installation du navigateur.</p><p class="footnote">Ta progression reste sur cet appareil et ce navigateur. Aucune donnée n’est envoyée à un serveur.</p></section></div><p id="settings-status" class="footnote" role="status">Réglages enregistrés automatiquement.</p>`,
  );
  mountCustomizer(document.querySelector('#mage-customizer'), {
    getState: () => state,
    onChange: (key, value) => {
      state.avatar = normalizeAvatar({ ...state.avatar, [key]: value }, state.xp);
      persist();
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
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        const toast = document.querySelector('#toast');
        toast.textContent =
          'Le mode hors connexion n’a pas pu être préparé. Réessaie avec une connexion.';
        toast.classList.add('visible');
      }),
  );
}
home();
