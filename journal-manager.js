/* ═══════════════════════════════════════════════════════════════════
   JOURNAL-MANAGER.JS — Journal Universel V.A.L.E.U.R©
   © 2025 Méthode V.A.L.E.U.R© — Céline Bourbon, Psychologue
   Tous droits réservés.
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const LS_KEY = 'valeur_journal_entries';
  const MASQUES = [
    { id:'rouge',  emoji:'🔴', color:'#e53e3e', label:'Rouge',  peur:'Mort / maladie' },
    { id:'orange', emoji:'🟠', color:'#ed8936', label:'Orange', peur:'Souffrance psychique' },
    { id:'jaune',  emoji:'🟡', color:'#d69e2e', label:'Jaune',  peur:'Inconnu / incertitude' },
    { id:'vert',   emoji:'🟢', color:'#38a169', label:'Vert',   peur:'Rejet / abandon' },
    { id:'bleu',   emoji:'🔵', color:'#3182ce', label:'Bleu',   peur:'Impuissance' },
    { id:'indigo', emoji:'🔷', color:'#5a67d8', label:'Indigo', peur:'Échec / inadéquation' },
    { id:'violet', emoji:'💜', color:'#805ad5', label:'Violet', peur:'Perte d\'identité' },
  ];

  const STEPS = [
    { letter:'V', name:'VOIR',       desc:'Quel masque est actif ? Quel est le déclencheur ?' },
    { letter:'A', name:'ACCUEILLIR', desc:'Quelle émotion est présente ? Comment vous sentez-vous ?' },
    { letter:'L', name:'LOCALISER',  desc:'Où le ressentez-vous dans votre corps ?' },
    { letter:'E', name:'EXPLORER',   desc:'Quel conflit intérieur existe ? Une part de moi voudrait... mais une autre...' },
    { letter:'U', name:'UNIFIER',    desc:'Comment réconcilier ces deux parts de vous ?' },
    { letter:'R', name:'RENFORCER',  desc:'Quelle nouvelle action choisissez-vous ? Quelle posture nouvelle ?' },
  ];

  // ── STORAGE ────────────────────────────────────────────────────────
  function getEntries() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { return []; }
  }
  function saveEntry(entry) {
    const entries = getEntries();
    entries.unshift(entry);
    if (entries.length > 50) entries.splice(50);
    try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch(e) {}
    window.dispatchEvent(new CustomEvent('valeur:journal-updated', { detail: { entries } }));
  }
  function getStats() {
    const entries = getEntries();
    const masqueCounts = {};
    MASQUES.forEach(m => masqueCounts[m.id] = 0);
    entries.forEach(e => { if (e.masque) masqueCounts[e.masque] = (masqueCounts[e.masque]||0)+1; });
    return { total: entries.length, masqueCounts, lastEntry: entries[0] || null };
  }

  // ── MODAL BUILD ────────────────────────────────────────────────────
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = 'valeur-journal-modal';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-label','Journal V.A.L.E.U.R©');

    let selectedMasque = null;
    const stepValues = ['','','','','',''];

    overlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div>
            <div class="label-gold" style="margin-bottom:8px;">📓 MON JOURNAL</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:#f7f3ee;">Méthode V.A.L.E.U.R©</div>
          </div>
          <button id="journal-close" style="background:none;border:none;cursor:pointer;color:#64748b;font-size:22px;padding:8px;line-height:1;" aria-label="Fermer">×</button>
        </div>

        <!-- MASQUE SELECTOR -->
        <div class="glass-card" style="margin-bottom:16px;padding:16px;">
          <div style="font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Masque actif (optionnel)</div>
          <div class="masque-grid" id="masque-selector">
            ${MASQUES.map(m => `
              <button class="masque-chip" data-masque="${m.id}" style="color:${m.color};" title="${m.label} — ${m.peur}">
                <span>${m.emoji}</span>
                <div class="masque-chip-dot" style="background:${m.color};"></div>
              </button>
            `).join('')}
          </div>
          <div id="masque-selected-label" style="text-align:center;font-size:12px;color:#64748b;margin-top:8px;height:16px;"></div>
        </div>

        <!-- V.A.L.E.U.R STEPS -->
        <div id="journal-steps">
          ${STEPS.map((s,i) => `
            <div class="journal-step" data-step="${i}">
              <div class="journal-step-header">
                <div class="journal-letter">${s.letter}</div>
                <div>
                  <div class="journal-label">${s.name}</div>
                  <div class="journal-sublabel">${s.desc}</div>
                </div>
              </div>
              <textarea class="journal-textarea" data-index="${i}" placeholder="${s.desc}" rows="3" maxlength="500"></textarea>
            </div>
          `).join('')}
        </div>

        <div style="display:flex;gap:10px;margin-top:20px;">
          <button id="journal-save" class="btn-primary" style="flex:1;">
            ✨ Enregistrer dans mon journal
          </button>
        </div>
        <div style="text-align:center;font-size:10px;color:#475569;margin-top:12px;letter-spacing:0.5px;">
          © 2025 Méthode V.A.L.E.U.R© — Céline Bourbon · Données stockées localement
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close
    overlay.querySelector('#journal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    // Masque selection
    overlay.querySelectorAll('.masque-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        overlay.querySelectorAll('.masque-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedMasque = chip.dataset.masque;
        const m = MASQUES.find(x => x.id === selectedMasque);
        overlay.querySelector('#masque-selected-label').textContent = m ? `${m.label} — ${m.peur}` : '';
        overlay.querySelector('#masque-selected-label').style.color = m ? m.color : '#64748b';
      });
    });

    // Step focus highlight
    overlay.querySelectorAll('.journal-textarea').forEach(ta => {
      ta.addEventListener('focus', () => {
        overlay.querySelectorAll('.journal-step').forEach(s => s.classList.remove('active'));
        ta.closest('.journal-step').classList.add('active');
      });
      ta.addEventListener('input', e => {
        stepValues[parseInt(e.target.dataset.index)] = e.target.value;
      });
    });

    // Save
    overlay.querySelector('#journal-save').addEventListener('click', () => {
      const textareas = overlay.querySelectorAll('.journal-textarea');
      const steps = {};
      let hasContent = false;
      STEPS.forEach((s, i) => {
        const val = textareas[i].value.trim();
        if (val) hasContent = true;
        steps[s.letter] = val;
      });
      if (!hasContent && !selectedMasque) {
        showToast('Remplissez au moins un champ pour enregistrer 🌱');
        return;
      }
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        masque: selectedMasque,
        steps,
      };
      saveEntry(entry);
      closeModal();
      showConfetti();
      showToast('✨ Journal enregistré avec succès');
    });

    return overlay;
  }

  // ── FAB BUILD ──────────────────────────────────────────────────────
  function buildFAB() {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.id = 'valeur-fab';
    fab.setAttribute('aria-label','Ouvrir le journal V.A.L.E.U.R©');
    fab.setAttribute('title','Journal V.A.L.E.U.R©');
    fab.innerHTML = '📓';
    fab.addEventListener('click', openModal);
    document.body.appendChild(fab);
    return fab;
  }

  // ── MODAL CONTROL ──────────────────────────────────────────────────
  let modalEl = null;
  function openModal() {
    if (!modalEl) modalEl = buildModal();
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalEl.querySelectorAll('.journal-textarea')[0]?.focus();
  }
  function closeModal() {
    if (modalEl) {
      modalEl.classList.remove('open');
      document.body.style.overflow = '';
      // Reset form
      modalEl.querySelectorAll('.journal-textarea').forEach(ta => ta.value = '');
      modalEl.querySelectorAll('.masque-chip').forEach(c => c.classList.remove('selected'));
      const lbl = modalEl.querySelector('#masque-selected-label');
      if (lbl) { lbl.textContent = ''; lbl.style.color = '#64748b'; }
      modalEl.querySelectorAll('.journal-step').forEach(s => s.classList.remove('active'));
    }
  }

  // ── TOAST ──────────────────────────────────────────────────────────
  let toastEl = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  // ── CONFETTI ───────────────────────────────────────────────────────
  function showConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const COLORS = ['#c9a84c','#f0d080','#e53e3e','#38a169','#3182ce','#805ad5','#ed8936'];
    const particles = Array.from({length:80},() => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random()-0.5)*4,
      vy: Math.random()*4+2,
      r: Math.random()*5+3,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      rot: Math.random()*360,
      rv: (Math.random()-0.5)*8,
      shape: Math.random()>0.5?'circle':'rect'
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame/120);
        if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill();
        } else {
          ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
        }
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.rot += p.rv; p.vy += 0.1;
      });
      frame++;
      if (frame < 150) requestAnimationFrame(draw);
      else canvas.remove();
    }
    requestAnimationFrame(draw);
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────
  window.VALEUR_JOURNAL = {
    open: openModal,
    close: closeModal,
    getEntries,
    saveEntry,
    getStats,
    showToast,
    showConfetti,
    MASQUES
  };

  // ── INIT ON DOM READY ──────────────────────────────────────────────
  function init() {
    buildFAB();
    // Prevent right-click and text selection globally
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => {
      if (!['INPUT','TEXTAREA'].includes(e.target.tagName)) e.preventDefault();
    });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey||e.metaKey) && ['c','u','s','a'].includes(e.key.toLowerCase())) {
        if (!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) e.preventDefault();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
