/* ═══════════════════════════════════════════════════════════════════
   CARTE-MASQUES.JS — SVG Animé 7 Cercles Concentriques
   © 2025 Méthode V.A.L.E.U.R© — Céline Bourbon, Psychologue
   Tous droits réservés.
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const MASQUES = [
    { id:'rouge',  color:'#e53e3e', label:'Rouge',  peur:'Mort / maladie',          emoji:'🔴', module:'module1' },
    { id:'orange', color:'#ed8936', label:'Orange', peur:'Souffrance psychique',     emoji:'🟠', module:'module2' },
    { id:'jaune',  color:'#d69e2e', label:'Jaune',  peur:'Inconnu / incertitude',   emoji:'🟡', module:'module3' },
    { id:'vert',   color:'#38a169', label:'Vert',   peur:'Rejet / abandon',          emoji:'🟢', module:'module4' },
    { id:'bleu',   color:'#3182ce', label:'Bleu',   peur:'Impuissance',              emoji:'🔵', module:'module5' },
    { id:'indigo', color:'#5a67d8', label:'Indigo', peur:'Échec / inadéquation',    emoji:'🔷', module:'module6' },
    { id:'violet', color:'#805ad5', label:'Violet', peur:'Perte d\'identité',        emoji:'💜', module:'module7' },
  ];

  function getMasqueScore(masqueId) {
    try {
      const entries = JSON.parse(localStorage.getItem('valeur_journal_entries') || '[]');
      const total = entries.filter(e => e.masque === masqueId).length;
      return Math.min(total, 10);
    } catch(e) { return 0; }
  }

  function buildCarte(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = Math.min(container.clientWidth || 360, 360);
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.46;
    const coreR = size * 0.10;

    let hoveredMasque = null;

    // Build SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', '100%');
    svg.style.cssText = 'display:block;overflow:visible;';

    // Defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'carte-glow');
    filter.setAttribute('x', '-30%'); filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%'); filter.setAttribute('height', '160%');
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'blur');
    const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite.setAttribute('in', 'SourceGraphic');
    feComposite.setAttribute('in2', 'blur');
    feComposite.setAttribute('operator', 'over');
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feComposite);
    defs.appendChild(filter);

    // Radial gradient for center
    const radGrad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    radGrad.setAttribute('id', 'center-glow');
    radGrad.setAttribute('cx','50%'); radGrad.setAttribute('cy','50%');
    radGrad.setAttribute('r','50%');
    [['0%','rgba(255,255,255,0.95)'],['40%','rgba(255,240,200,0.7)'],['100%','rgba(201,168,76,0)']].forEach(([o,c]) => {
      const stop = document.createElementNS('http://www.w3.org/2000/svg','stop');
      stop.setAttribute('offset',o); stop.setAttribute('stop-color',c);
      radGrad.appendChild(stop);
    });
    defs.appendChild(radGrad);

    svg.appendChild(defs);

    // Rotation group
    const rotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rotGroup.setAttribute('id', 'carte-rot-group');
    svg.appendChild(rotGroup);

    // Static group (center + labels)
    const staticGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(staticGroup);

    // Draw concentric rings (outermost = masque[0] = rouge)
    const rings = [];
    MASQUES.forEach((masque, i) => {
      const idx = MASQUES.length - 1 - i; // reverse: violet outermost visually but we want rouge outermost
      const r = coreR + (maxR - coreR) * (i + 1) / MASQUES.length;
      const score = getMasqueScore(masque.id);
      const libRatio = score / 10; // 0=opaque, 1=transparent (libéré)
      const baseOpacity = 0.75 - (i * 0.06); // outer rings slightly more visible
      const opacity = Math.max(0.15, baseOpacity - libRatio * 0.5);

      // Ring fill (semi-transparent)
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', masque.color);
      circle.setAttribute('fill-opacity', opacity);
      circle.setAttribute('stroke', masque.color);
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('stroke-opacity', '0.6');
      circle.style.cssText = `cursor:pointer;transition:all 0.3s ease;`;
      circle.dataset.masque = masque.id;
      circle.dataset.idx = i;

      // Hover
      circle.addEventListener('mouseenter', () => {
        hoveredMasque = masque.id;
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('fill-opacity', Math.min(1, opacity + 0.2));
        updateTooltip(masque);
      });
      circle.addEventListener('mouseleave', () => {
        hoveredMasque = null;
        circle.setAttribute('stroke-width', '1.5');
        circle.setAttribute('fill-opacity', opacity);
        hideTooltip();
      });
      circle.addEventListener('click', () => {
        // Navigate to corresponding module
        if (window.MODULE_URLS && window.MODULE_URLS[masque.module]) {
          window.location.href = window.MODULE_URLS[masque.module];
        }
      });

      rotGroup.appendChild(circle);
      rings.push({ circle, r, opacity, masque, score });
    });

    // Center light — Nature Authentique
    const centerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerGlow.setAttribute('cx', cx); centerGlow.setAttribute('cy', cy);
    centerGlow.setAttribute('r', coreR * 1.8);
    centerGlow.setAttribute('fill', 'url(#center-glow)');
    centerGlow.setAttribute('opacity', '0.7');
    staticGroup.appendChild(centerGlow);

    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', cx); centerCircle.setAttribute('cy', cy);
    centerCircle.setAttribute('r', coreR);
    centerCircle.setAttribute('fill', 'rgba(255,255,255,0.92)');
    centerCircle.setAttribute('stroke', '#c9a84c');
    centerCircle.setAttribute('stroke-width', '2');
    staticGroup.appendChild(centerCircle);

    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', cx); centerText.setAttribute('y', cy + 4);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('dominant-baseline', 'middle');
    centerText.setAttribute('font-size', '11');
    centerText.setAttribute('font-weight', '700');
    centerText.setAttribute('fill', '#0a0f1a');
    centerText.setAttribute('font-family', 'Jost, sans-serif');
    centerText.setAttribute('letter-spacing', '0.5');
    centerText.textContent = 'SOI';
    staticGroup.appendChild(centerText);

    // Label positions at 45° intervals
    const labelRadius = maxR * 1.12;
    MASQUES.forEach((masque, i) => {
      const angle = ((i / MASQUES.length) * 360 - 90) * Math.PI / 180;
      const lx = cx + labelRadius * Math.cos(angle);
      const ly = cy + labelRadius * Math.sin(angle);

      const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelG.style.cssText = 'cursor:pointer;';
      labelG.addEventListener('click', () => {
        if (window.MODULE_URLS && window.MODULE_URLS[masque.module]) {
          window.location.href = window.MODULE_URLS[masque.module];
        }
      });

      const labelCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      labelCircle.setAttribute('cx', lx); labelCircle.setAttribute('cy', ly);
      labelCircle.setAttribute('r', 10);
      labelCircle.setAttribute('fill', masque.color);
      labelCircle.setAttribute('fill-opacity', '0.25');
      labelCircle.setAttribute('stroke', masque.color);
      labelCircle.setAttribute('stroke-width', '1.5');
      labelG.appendChild(labelCircle);

      const labelEmoji = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelEmoji.setAttribute('x', lx); labelEmoji.setAttribute('y', ly + 4);
      labelEmoji.setAttribute('text-anchor', 'middle');
      labelEmoji.setAttribute('dominant-baseline', 'middle');
      labelEmoji.setAttribute('font-size', '10');
      labelEmoji.textContent = masque.emoji;
      labelG.appendChild(labelEmoji);

      staticGroup.appendChild(labelG);
    });

    container.appendChild(svg);

    // Animate rotation
    let rotation = 0;
    let lastTime = performance.now();
    function animate(now) {
      const dt = now - lastTime;
      lastTime = now;
      rotation += dt * 0.003; // ~0.003 deg/ms = 18 deg/s → 20s full rotation
      rotGroup.setAttribute('transform', `rotate(${rotation} ${cx} ${cy})`);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Tooltip
    function updateTooltip(masque) {
      let tip = document.getElementById('carte-tooltip');
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'carte-tooltip';
        tip.style.cssText = `
          position:absolute; pointer-events:none; z-index:50;
          background:rgba(15,22,38,0.95);
          border:1px solid ${masque.color}44;
          border-radius:12px; padding:10px 14px;
          font-family:'Jost',sans-serif; font-size:12px;
          color:#e2e8f0; max-width:180px; text-align:center;
          backdrop-filter:blur(12px);
          transition:opacity 0.2s;
        `;
        container.style.position = 'relative';
        container.appendChild(tip);
      }
      tip.style.borderColor = masque.color + '55';
      tip.innerHTML = `<strong style="color:${masque.color}">${masque.emoji} Masque ${masque.label}</strong><br><span style="color:#94a3b8;font-size:11px;">${masque.peur}</span>`;
      tip.style.opacity = '1';
      // Center tip
      tip.style.left = '50%';
      tip.style.top = '50%';
      tip.style.transform = 'translate(-50%, calc(-50% + 80px))';
    }
    function hideTooltip() {
      const tip = document.getElementById('carte-tooltip');
      if (tip) tip.style.opacity = '0';
    }

    // Update rings when journal changes
    window.addEventListener('valeur:journal-updated', () => {
      MASQUES.forEach((masque, i) => {
        const score = getMasqueScore(masque.id);
        const libRatio = score / 10;
        const baseOpacity = 0.75 - (i * 0.06);
        const newOpacity = Math.max(0.15, baseOpacity - libRatio * 0.5);
        rings[i].circle.setAttribute('fill-opacity', newOpacity);
      });
    });
  }

  // ── PUBLIC ─────────────────────────────────────────────────────────
  window.VALEUR_CARTE = { build: buildCarte, MASQUES };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => buildCarte('carte-masques'));
  } else {
    // Use rAF to ensure layout is computed
    requestAnimationFrame(() => buildCarte('carte-masques'));
  }
})();
