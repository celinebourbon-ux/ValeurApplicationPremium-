/* ══════════════════════════════════════════════════════════════
   VALEUR-CONFIG.JS — Fichier de configuration partagé
   © 2025 Méthode V.A.L.E.U.R© — Céline Bourbon, Psychologue
   
   ⚠️  CE FICHIER EST INCLUS DANS TOUS LES MODULES.
   Modifiez-le ici une seule fois — tout se met à jour partout.
   ══════════════════════════════════════════════════════════════ */

/* ── URLS ─────────────────────────────────────────────────────── */
const VALEUR_BASE = 'https://celinebourbon-ux.github.io/HomePageAppliValeur/';

const MODULE_URLS = {
  home:    VALEUR_BASE,
  module0: VALEUR_BASE + 'index.html',
  module1: VALEUR_BASE + 'module1.html',
  module2: VALEUR_BASE + 'module2.html',
  module3: VALEUR_BASE + 'module3.html',
  module4: VALEUR_BASE + 'module4.html',
  module5: VALEUR_BASE + 'module5.html',
  module6: VALEUR_BASE + 'module6.html',
};

/* ── DÉFINITION DES MODULES ───────────────────────────────────── */
const MODULES_DEF = [
  { key:'module1', letter:'V', name:'VOIR',       emoji:'👁',  color:'#e53e3e', lsKey:'valeur_module1_complete' },
  { key:'module2', letter:'A', name:'ACCUEILLIR', emoji:'🫁',  color:'#ed8936', lsKey:'valeur_module2_complete' },
  { key:'module3', letter:'L', name:'LOCALISER',  emoji:'📍',  color:'#d69e2e', lsKey:'valeur_module3_complete' },
  { key:'module4', letter:'E', name:'EXPLORER',   emoji:'🔍',  color:'#38a169', lsKey:'valeur_module4_complete' },
  { key:'module5', letter:'U', name:'UNIFIER',    emoji:'🤝',  color:'#3182ce', lsKey:'valeur_module5_complete' },
  { key:'module6', letter:'R', name:'RENFORCER',  emoji:'💪',  color:'#805ad5', lsKey:'valeur_module6_complete' },
];

/* ── PROGRESSION ──────────────────────────────────────────────── */
const VALEUR_PROGRESS = {

  // Lit localStorage et retourne le % global
  getPercent() {
    const done = MODULES_DEF.filter(m => {
      try { return !!localStorage.getItem(m.lsKey); } catch(e) { return false; }
    }).length;
    return Math.round((done / MODULES_DEF.length) * 100);
  },

  // Marque un module comme complété
  complete(moduleKey) {
    const mod = MODULES_DEF.find(m => m.key === moduleKey);
    if (!mod) return;
    try { localStorage.setItem(mod.lsKey, 'true'); } catch(e) {}
  },

  // Vérifie si un module est complété
  isDone(moduleKey) {
    const mod = MODULES_DEF.find(m => m.key === moduleKey);
    if (!mod) return false;
    try { return !!localStorage.getItem(mod.lsKey); } catch(e) { return false; }
  },

  // Dessine la barre de progression dans #valeur-progress-bar
  // currentModule = 'module4' par exemple
  render(currentModule) {
    const bar = document.getElementById('valeur-progress-bar');
    if (!bar) return;

    const pct = this.getPercent();

    bar.innerHTML = `
      <button class="vpb-home" onclick="window.location.href=MODULE_URLS.home" title="Accueil">⌂</button>
      <div class="vpb-steps">
        ${MODULES_DEF.map(m => {
          const isDone = this.isDone(m.key);
          const isCurrent = m.key === currentModule;
          const isUnlocked = isDone || isCurrent || this._isUnlocked(m.key);
          let cls = 'vpb-step';
          if (isDone) cls += ' done';
          else if (isCurrent) cls += ' active';
          const click = isDone && !isCurrent ? `onclick="window.location.href=MODULE_URLS.${m.key}"` : '';
          const cursor = isDone && !isCurrent ? 'pointer' : 'default';
          return `<div class="${cls}" title="${m.letter} · ${m.name}" style="cursor:${cursor}" ${click}>
            <span class="vpb-letter">${m.letter}</span>
          </div>`;
        }).join('')}
      </div>
      <span class="vpb-pct">${pct}%</span>
    `;
  },

  // Un module est débloqué si le précédent est fait
  _isUnlocked(moduleKey) {
    const idx = MODULES_DEF.findIndex(m => m.key === moduleKey);
    if (idx <= 0) return true;
    return this.isDone(MODULES_DEF[idx - 1].key);
  }
};

/* ── CSS DE LA BARRE (injecté automatiquement) ────────────────── */
(function injectProgressCSS() {
  if (document.getElementById('valeur-progress-css')) return;
  const style = document.createElement('style');
  style.id = 'valeur-progress-css';
  style.textContent = `
    #valeur-progress-bar {
      position: fixed; top:0; left:0; right:0; z-index:100;
      background: #0d1526;
      border-bottom: 1px solid #1e2f4a;
      padding: 10px 16px;
      display: flex; align-items: center; gap: 12px;
      font-family: 'Jost', sans-serif;
    }
    .vpb-home {
      background:none; border:none; cursor:pointer;
      color:#6b82a8; font-size:18px; padding:4px;
      transition: color 0.2s; line-height:1;
    }
    .vpb-home:hover { color:#f2ede6; }
    .vpb-steps { display:flex; gap:6px; flex:1; align-items:center; }
    .vpb-step {
      flex:1; height:28px; border-radius:6px;
      background: #1e2f4a;
      display:flex; align-items:center; justify-content:center;
      transition: all 0.4s ease;
      position: relative; overflow: hidden;
    }
    .vpb-step.done {
      background: linear-gradient(135deg, #c9a84c, #f0d080);
      box-shadow: 0 2px 8px rgba(201,168,76,0.3);
    }
    .vpb-step.active {
      background: linear-gradient(135deg, #1e2f4a, #2a3f60);
      border: 1px solid #c9a84c;
      animation: vpb-pulse 2s ease-in-out infinite;
    }
    @keyframes vpb-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
      50% { box-shadow: 0 0 0 4px rgba(201,168,76,0); }
    }
    .vpb-letter {
      font-size: 11px; font-weight: 800; letter-spacing: 1px;
      color: #f2ede6;
    }
    .vpb-step.done .vpb-letter { color: #070d1a; }
    .vpb-pct {
      font-size: 12px; font-weight: 700; color: #c9a84c;
      white-space: nowrap; min-width: 32px; text-align:right;
    }
    @media (max-width: 400px) {
      .vpb-letter { font-size: 9px; }
      .vpb-step { height: 22px; }
    }
  `;
  document.head.appendChild(style);
})();

/* ── COMMENT UTILISER CE FICHIER ──────────────────────────────────

Dans chaque module HTML, ajoutez dans <head> :
  <script src="valeur-config.js"></script>

Dans le <body>, placez ce div là où vous voulez la barre :
  <div id="valeur-progress-bar"></div>

Dans votre JS d'init, appelez :
  VALEUR_PROGRESS.render('module4');   ← remplacez par le bon numéro

Pour valider un module et débloquer le suivant :
  VALEUR_PROGRESS.complete('module4');

Pour naviguer vers un module :
  window.location.href = MODULE_URLS.module5;

─────────────────────────────────────────────────────────────────── */
