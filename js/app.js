(function () {
  'use strict';

  /* —— Custom cursor (characterful dual-ring) —— */
  const cursorRing = document.createElement('div');
  cursorRing.id = 'cursor';
  const cursorCore = document.createElement('div');
  cursorCore.id = 'cursor';
  cursorCore.className = 'core';
  document.body.appendChild(cursorRing);
  document.body.appendChild(cursorCore);

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorRing.style.left = mouseX + 'px';
    cursorRing.style.top = mouseY + 'px';
    cursorCore.style.left = mouseX + 'px';
    cursorCore.style.top = mouseY + 'px';
  });
  document.addEventListener('mousedown', () => cursorRing.classList.add('active'));
  document.addEventListener('mouseup', () => cursorRing.classList.remove('active'));

  /* —— FX canvas —— */
  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, t0 = performance.now();
  const beams = [], phosphor = [];
  // Practical colorful live theme is the site-wide default.

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();


  function seedPractical() {
    beams.length = 0;
    phosphor.length = 0;
    for (let i = 0; i < 5; i++) {
      beams.push({
        y: (0.12 + Math.random() * 0.76) * H,
        amp: 18 + Math.random() * 48,
        freq: 0.008 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        color: ['#7ec8a8', '#5ac8aa', '#6a9ec8', '#d4b06a'][i % 4],
        alpha: 0.08 + Math.random() * 0.12,
        width: 1.2 + Math.random() * 1.8
      });
    }
    for (let i = 0; i < 90; i++) {
      phosphor.push({
        x: Math.random() * W,
        y: Math.random() * H,
        life: Math.random(),
        decay: 0.002 + Math.random() * 0.006,
        r: 0.6 + Math.random() * 1.8,
        color: Math.random() > 0.55 ? '#7ec8a8' : '#d4b06a'
      });
    }
  }

  seedPractical();

  function drawPractical(now) {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.9);
    g.addColorStop(0, 'rgba(18, 36, 40, 0.55)');
    g.addColorStop(1, 'rgba(8, 14, 18, 0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Soft scanlines (not orbs)
    ctx.globalAlpha = 0.035;
    ctx.strokeStyle = '#7ec8a8';
    ctx.lineWidth = 1;
    const scanOff = ((now * 0.04) % 8);
    for (let y = -8; y < H + 8; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y + scanOff);
      ctx.lineTo(W, y + scanOff);
      ctx.stroke();
    }

    // Faint CRO graticule wash
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#5c7a9e';
    const gs = 48;
    for (let x = (now * 0.01) % gs; x < W; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Drifting waveform beams
    beams.forEach(b => {
      b.phase += 0.012 * b.speed;
      ctx.beginPath();
      ctx.lineWidth = b.width;
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = b.alpha;
      const steps = Math.ceil(W / 6);
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W;
        const y = b.y + Math.sin(x * b.freq + b.phase) * b.amp
          + Math.sin(x * b.freq * 2.3 + b.phase * 1.4) * (b.amp * 0.22);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Phosphor motes along traces (not pulsing orbs)
    phosphor.forEach(p => {
      p.life -= p.decay;
      if (p.life <= 0) {
        p.life = 1;
        p.x = Math.random() * W;
        p.y = Math.random() * H;
      }
      p.x += Math.sin(now * 0.001 + p.y) * 0.15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.08 + p.life * 0.28;
      ctx.fill();
    });

    // Sweeping beam highlight
    const sweepX = ((now * 0.08) % (W + 120)) - 60;
    const sg = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
    sg.addColorStop(0, 'rgba(126,200,168,0)');
    sg.addColorStop(0.5, 'rgba(126,200,168,0.07)');
    sg.addColorStop(1, 'rgba(126,200,168,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = sg;
    ctx.fillRect(sweepX - 40, 0, 80, H);
  }

  function drawFx(ts) {
    const now = ts || performance.now();
    ctx.clearRect(0, 0, W, H);
    drawPractical(now);
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawFx);
  }
  requestAnimationFrame(drawFx);

  /* —— Navigation (no page numbers) —— */
  const VIEWS = [
    { id: 'aim', label: 'Aim & outcomes' },
    { id: 'basics', label: 'What is a CRO?' },
    { id: 'medical', label: 'Medical' },
    { id: 'method', label: 'Method' },
    { id: 'formulas', label: 'Formulas & results' },
    { id: 'trace', label: 'Trace' },
    { id: 'mcqs', label: 'MCQs' },
    { id: 'practical', label: 'Practical' }
  ];

  const nav = document.getElementById('nav');
  const progressFill = document.getElementById('progress-fill');
  const whereEl = document.getElementById('where');
  const btnPrev = document.getElementById('btn-page-prev');
  let viewIndex = 0;
  const visited = new Set();

  VIEWS.forEach((v) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item';
    btn.dataset.view = v.id;
    btn.innerHTML = '<span class="label">' + v.label + '</span>';
    btn.addEventListener('click', () => goTo(VIEWS.indexOf(v)));
    nav.appendChild(btn);
  });

  function goTo(i, pushHash) {
    if (i < 0 || i >= VIEWS.length) return;
    viewIndex = i;
    visited.add(VIEWS[i].id);
    document.querySelectorAll('.view').forEach(el => {
      el.classList.toggle('active', el.id === 'view-' + VIEWS[i].id);
    });
    document.querySelectorAll('.nav-item').forEach((el, idx) => {
      el.classList.toggle('active', idx === i);
      el.classList.toggle('done', visited.has(VIEWS[idx].id) && idx !== i);
    });
    progressFill.style.width = Math.round(((i + 1) / VIEWS.length) * 100) + '%';
    whereEl.textContent = VIEWS[i].label;
    btnPrev.disabled = i === 0;
    document.body.classList.add('mode-practical');

    if (pushHash !== false) history.replaceState(null, '', '#' + VIEWS[i].id);
    tryRenderMath();
    const active = document.querySelector('.view.active');
    if (active) active.scrollTop = 0;
  }

  function tryRenderMath() {
    if (typeof renderMathInElement === 'function') {
      const active = document.querySelector('.view.active');
      if (active) renderMathInElement(active, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  btnPrev.addEventListener('click', () => goTo(viewIndex - 1));
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goTo(viewIndex + 1));
  });

  function hashToIndex() {
    let h = (location.hash || '#aim').replace('#', '');
    if (h === 'results') h = 'formulas'; // merged into Formulas & results
    const idx = VIEWS.findIndex(v => v.id === h);
    return idx >= 0 ? idx : 0;
  }
  window.addEventListener('hashchange', () => goTo(hashToIndex(), false));
  goTo(hashToIndex(), false);

  document.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') goTo(viewIndex + 1);
    if (e.key === 'ArrowLeft') goTo(viewIndex - 1);
  });

  /* —— Method step → illustration panel —— */
  const METHOD_STEPS = [
    { img: 'assets/step-01.png', cap: 'Power on the CRO and wait for a stable horizontal trace.' },
    { img: 'assets/step-02.png', cap: 'Route the function-generator output into a CRO channel (e.g. CH1).' },
    {
      img: 'assets/step-03-before.png',
      imgB: 'assets/step-03-after.png',
      labelA: 'Before',
      labelB: 'After',
      cap: 'Trim Intensity, then Focus, until the line is bright and sharp.'
    },
    { img: 'assets/step-04.png', cap: 'Pick a triangular wave and set volts/div so the wave fills the screen cleanly.' },
    { img: 'assets/step-05.png', cap: 'Set time/div until the sweep locks and the wave stands still.' },
    { img: 'assets/step-06.png', cap: 'Count Y (peak-to-peak divisions). Vpp = Y × volts/div; A = Vpp / 2.' },
    { img: 'assets/step-07.png', cap: 'Count X (one full cycle). T = X × time/div; f = 1 / T.' },
    { img: 'assets/step-08.png', cap: 'Repeat for square and sinusoidal waves; trace all three in the workbook.' }
  ];

  const methodSplit = document.getElementById('method-split');
  const methodPanel = document.getElementById('method-panel');
  const methodImgs = document.getElementById('method-imgs');
  const methodImg = document.getElementById('method-img');
  const methodImgB = document.getElementById('method-img-b');
  const methodShotB = document.getElementById('method-shot-b');
  const methodLabelA = document.getElementById('method-label-a');
  const methodLabelB = document.getElementById('method-label-b');
  const methodCap = document.getElementById('method-cap');

  document.querySelectorAll('.method-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-step'), 10);
      const step = METHOD_STEPS[idx];
      if (!step || !methodSplit) return;
      document.querySelectorAll('.method-step').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      methodSplit.classList.add('open');
      methodImg.src = step.img;
      methodImg.alt = step.cap;
      const isPair = Boolean(step.imgB);
      if (methodImgs) methodImgs.classList.toggle('pair', isPair);
      if (methodShotB) methodShotB.hidden = !isPair;
      if (isPair) {
        methodImgB.src = step.imgB;
        methodImgB.alt = step.labelB ? (step.labelB + ' — ' + step.cap) : step.cap;
        if (methodLabelA) {
          methodLabelA.hidden = true;
          methodLabelA.textContent = '';
        }
        if (methodLabelB) {
          methodLabelB.hidden = true;
          methodLabelB.textContent = '';
        }
      } else {
        if (methodImgB) methodImgB.removeAttribute('src');
        if (methodLabelA) {
          methodLabelA.hidden = true;
          methodLabelA.textContent = '';
        }
        if (methodLabelB) {
          methodLabelB.hidden = true;
          methodLabelB.textContent = '';
        }
      }
      methodCap.textContent = step.cap;
    });
  });

  /* —— Basics chart: regions + live x/y readout —— */
  const REGION_COPY = {
    vaxis: {
      title: 'Voltage axis',
      text: 'Vertical axis. Each numbered square is one division of volts (set by volts/div).'
    },
    taxis: {
      title: 'Time axis',
      text: 'Horizontal axis. Each numbered square is one division of time (set by time/div).'
    },
    peak: {
      title: 'Peak-to-peak',
      text: 'Distance from the lowest point of the wave to the highest. Count those vertical divisions for Y.'
    },
    period: {
      title: 'One period (T)',
      text: 'Width of one complete cycle — crest to next matching crest. Count those horizontal divisions for X.'
    },
    division: {
      title: 'One division',
      text: 'A single graticule square. Scale it with volts/div (vertical) or time/div (horizontal).'
    }
  };
  const explainEl = document.getElementById('basics-explain');
  const basicsDefault = explainEl ? explainEl.textContent : '';
  const basicsChart = document.getElementById('basics-chart');
  const basicsXy = document.getElementById('basics-xy');
  // Graticule mapping for basics SVG viewBox 0 0 720 280
  // Origin at (60, 130); 70 px/div horizontal; 40 px/div vertical; 1 V/div & 1 ms/div demo
  const BASICS_MAP = {
    ox: 60, oy: 130, divx: 70, divy: 40,
    vPerDiv: 1, tPerDiv: 1, vUnit: 'V', tUnit: 'ms'
  };

  function svgPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  if (basicsChart) {
    const svg = basicsChart.querySelector('svg');
    basicsChart.addEventListener('mousemove', e => {
      if (!svg || !basicsXy) return;
      const p = svgPoint(svg, e.clientX, e.clientY);
      if (!p) return;
      const tDiv = (p.x - BASICS_MAP.ox) / BASICS_MAP.divx;
      const vDiv = (BASICS_MAP.oy - p.y) / BASICS_MAP.divy;
      const t = tDiv * BASICS_MAP.tPerDiv;
      const v = vDiv * BASICS_MAP.vPerDiv;
      if (p.x < 50 || p.x > 680 || p.y < 25 || p.y > 230) {
        basicsXy.classList.remove('on');
        return;
      }
      basicsXy.textContent = 't ' + t.toFixed(2) + ' ' + BASICS_MAP.tUnit + '  ·  V ' + v.toFixed(2) + ' ' + BASICS_MAP.vUnit;
      const rect = basicsChart.getBoundingClientRect();
      basicsXy.style.left = (e.clientX - rect.left) + 'px';
      basicsXy.style.top = (e.clientY - rect.top) + 'px';
      basicsXy.classList.add('on');
    });
    basicsChart.addEventListener('mouseleave', () => {
      if (basicsXy) basicsXy.classList.remove('on');
    });

    document.querySelectorAll('#basics-chart .region-hit').forEach(hit => {
      const key = hit.getAttribute('data-region');
      hit.addEventListener('mouseenter', () => {
        document.querySelectorAll('#basics-chart .region-mark').forEach(m => {
          m.classList.toggle('on', m.getAttribute('data-mark') === key);
        });
        const c = REGION_COPY[key];
        if (c && explainEl) {
          explainEl.innerHTML = '<strong>' + c.title + '</strong> — ' + c.text;
        }
      });
      hit.addEventListener('mouseleave', () => {
        document.querySelectorAll('#basics-chart .region-mark').forEach(m => m.classList.remove('on'));
        if (explainEl) explainEl.textContent = basicsDefault;
      });
    });
  }

  /* —— Practical — live CRO: generator + front-panel knobs + inspection + calc —— */
  const SCR = { x0: 56, x1: 616, y0: 50, y1: 306, cx: 336, cy: 178, divx: 56, divy: 32 };
  const VDIV_STEPS = [0.1, 0.2, 0.5, 1, 2, 5];
  const TDIV_STEPS = [0.05, 0.1, 0.2, 0.5, 1, 2];
  const LAB = { wave: 'tri', vpp: 1.85, freq: 1000 / 0.66, vdiv: 0.5, tdiv: 0.2, xpos: 0, ypos: 0 };
  const S = Object.assign({}, LAB);
  const TRIG_DIV = -4;            // trigger point sits on the −4 gridline when X-POS = 0
  const vdivSteps = VDIV_STEPS.slice();
  const tdivSteps = TDIV_STEPS.slice();

  function trimNum(x, d) {
    if (!isFinite(x)) return '—';
    let s = Number(x).toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }
  function round2(x) { return Math.round(x * 100) / 100; }
  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(x) {
    if (!x || !isFinite(x)) return String(x);
    let e = Math.floor(Math.log10(Math.abs(x)));
    let m = x / Math.pow(10, e);
    m = parseFloat(m.toPrecision(3));
    if (m >= 10) { m /= 10; e += 1; }
    if (e === 0) return trimNum(m, 3);
    return trimNum(m, 3) + ' × 10' + String(e).split('').map(c => SUP[c] || c).join('');
  }
  function fmtV(v) { return trimNum(v, v < 1 ? 3 : 2); }
  function fmtF(f) { return f >= 100 ? trimNum(f, 2) : trimNum(f, 3); }
  function fmtFshort(f) { return f >= 100 ? String(Math.round(f)) : trimNum(f, 2); }
  function periodMs() { return 1000 / S.freq; }
  function readY() { return S.vpp / S.vdiv; }
  function readX() { return periodMs() / S.tdiv; }
  function waveName(w) { return w === 'sine' ? 'sine' : w === 'square' ? 'square' : 'triangular'; }

  // normalised wave shape, phase p in [0,1)
  function shape(p) {
    p = p - Math.floor(p);
    if (S.wave === 'sine') return Math.sin(2 * Math.PI * p);
    if (S.wave === 'square') return p < 0.5 ? 1 : -1;
    if (p < 0.25) return 4 * p;
    if (p < 0.75) return 2 - 4 * p;
    return 4 * p - 4;
  }
  function geom() {
    const Pdiv = readX();
    const Ppx = Pdiv * SCR.divx;
    const trigX = SCR.cx + (TRIG_DIV + S.xpos) * SCR.divx;
    const midY = SCR.cy - S.ypos * SCR.divy;
    const ampPx = (readY() / 2) * SCR.divy;
    return { Pdiv, Ppx, trigX, midY, ampPx };
  }
  function yAt(x, g) {
    const p = (x - g.trigX) / g.Ppx;
    return g.midY - g.ampPx * shape(p);
  }
  // Points of the trace over [xa, xb]; square edges drawn as vertical jumps
  function tracePoints(xa, xb, g) {
    const pts = [];
    const step = Math.max(0.5, Math.min(2, g.Ppx / 60));
    for (let x = xa; x <= xb + 0.001; x += step) {
      const y = yAt(x, g);
      if (S.wave === 'square' && pts.length) {
        const prev = pts[pts.length - 1];
        if (Math.abs(prev[1] - y) > g.ampPx) pts.push([x, prev[1]]);
      }
      pts.push([x, y]);
    }
    return pts;
  }
  function ptsToD(pts) {
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      const y = Math.max(-2000, Math.min(2000, pts[i][1]));
      d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  // —— live SVG trace (redrawn every animation frame) ——
  const NS = 'http://www.w3.org/2000/svg';
  const dynTrace = document.getElementById('dyn-trace');
  const dynGuides = document.getElementById('dyn-guides');
  const dynMarks = document.getElementById('dyn-marks');
  const dynHits = document.getElementById('dyn-hits');
  let traceBase = null, traceGlow = null, traceBeam = null, beamDot = null;
  if (dynTrace) {
    traceGlow = document.createElementNS(NS, 'path');
    traceGlow.setAttribute('id', 'trace-glow');
    traceGlow.setAttribute('fill', 'none');
    traceGlow.setAttribute('stroke', '#7ec8a8');
    traceGlow.setAttribute('stroke-width', '6');
    traceGlow.setAttribute('stroke-linejoin', 'round');
    traceGlow.setAttribute('opacity', '0.16');
    traceBase = document.createElementNS(NS, 'path');
    traceBase.setAttribute('id', 'wave-trace');
    traceBase.setAttribute('fill', 'none');
    traceBase.setAttribute('stroke', '#7ec8a8');
    traceBase.setAttribute('stroke-width', '2.2');
    traceBase.setAttribute('stroke-linejoin', 'round');
    traceBase.setAttribute('filter', 'url(#glow)');
    traceBeam = document.createElementNS(NS, 'path');
    traceBeam.setAttribute('id', 'trace-beam');
    traceBeam.setAttribute('fill', 'none');
    traceBeam.setAttribute('stroke', '#c8ffe6');
    traceBeam.setAttribute('stroke-width', '2.8');
    traceBeam.setAttribute('stroke-linejoin', 'round');
    traceBeam.setAttribute('filter', 'url(#glow)');
    beamDot = document.createElementNS(NS, 'circle');
    beamDot.setAttribute('r', '3.2');
    beamDot.setAttribute('fill', '#eafff5');
    beamDot.setAttribute('filter', 'url(#glow)');
    dynTrace.append(traceGlow, traceBase, traceBeam, beamDot);
  }
  const SWEEP_MS = 1400;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastFrameKey = '';
  function frame(now) {
    if (traceBase) {
      const g = geom();
      const key = [S.wave, S.vpp, S.freq, S.vdiv, S.tdiv, S.xpos, S.ypos].join('|');
      if (key !== lastFrameKey) {
        const d = ptsToD(tracePoints(SCR.x0, SCR.x1, g));
        traceBase.setAttribute('d', d);
        traceGlow.setAttribute('d', d);
        lastFrameKey = key;
      }
      // Sweep: beam runs left → right; the trail behind it is brighter (phosphor afterglow)
      const u = reduceMotion ? 1 : (now % SWEEP_MS) / SWEEP_MS;
      const head = SCR.x0 + u * (SCR.x1 - SCR.x0);
      const tail = Math.max(SCR.x0, head - 150);
      traceBeam.setAttribute('d', head - tail > 1 ? ptsToD(tracePoints(tail, head, g)) : '');
      traceBeam.setAttribute('opacity', reduceMotion ? '0' : '0.95');
      beamDot.setAttribute('cx', head.toFixed(1));
      beamDot.setAttribute('cy', Math.max(-50, Math.min(410, yAt(head, g))).toFixed(1));
      beamDot.setAttribute('opacity', reduceMotion ? '0' : '1');
      // persistence: base trace fades slightly just ahead of the beam
      traceBase.setAttribute('opacity', (0.62 + 0.18 * Math.cos(u * Math.PI * 2)).toFixed(2));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // —— brackets, peak marks and hit areas (rebuilt whenever a setting changes) ——
  const MONO = 'IBM Plex Mono, monospace';
  function svgLabel(x, y, text, anchor) {
    const w = text.length * 7.9 + 10;
    const rx = anchor === 'end' ? x - w + 5 : anchor === 'middle' ? x - w / 2 : x - 5;
    return '<rect x="' + rx.toFixed(1) + '" y="' + (y - 14) + '" width="' + w.toFixed(1) + '" height="19" rx="3" fill="rgba(15,20,25,0.88)"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '" fill="#d4b06a" font-family="' + MONO + '" font-size="13" font-weight="600">' + text + '</text>';
  }
  let markState = { peakX: 0, peakY: 0, troughX: 0, troughY: 0, cycA: 0, cycB: 0, overflowV: false, overflowX: false };
  function renderMarks() {
    if (!dynMarks) return;
    const g = geom();
    // first full cycle starting on screen
    let k = Math.ceil((SCR.x0 - g.trigX) / g.Ppx - 1e-9);
    let cycA = g.trigX + k * g.Ppx;
    const cycB = cycA + g.Ppx;
    const peakX = S.wave === 'square' ? cycA + g.Ppx * 0.22 : cycA + g.Ppx * 0.25;
    const troughX = S.wave === 'square' ? cycA + g.Ppx * 0.72 : cycA + g.Ppx * 0.75;
    const peakY = g.midY - g.ampPx, troughY = g.midY + g.ampPx;
    const overflowV = peakY < SCR.y0 - 0.5 || troughY > SCR.y1 + 0.5;
    const overflowX = cycB > SCR.x1 + 0.5;
    markState = { peakX, peakY, troughX, troughY, cycA, cycB, overflowV, overflowX };
    const Y = readY(), X = readX();
    const cpy = v => Math.max(SCR.y0, Math.min(SCR.y1, v));
    const cpx = v => Math.max(SCR.x0, Math.min(SCR.x1, v));
    const bx = cpx(peakX);
    // X bracket: below the trough if room, else above the crest
    let xb = troughY + 20;
    if (xb > SCR.y1 - 6) xb = peakY - 14;
    xb = Math.max(SCR.y0 + 18, Math.min(SCR.y1 - 6, xb));
    // labels sit outside the wave envelope so they never cross the trace
    const xLabelY = (xb > troughY && xb + 20 <= SCR.y1 - 2) ? xb + 20 : (xb < peakY && xb - 10 >= SCR.y0 + 14 ? xb - 10 : xb + (xb > SCR.cy ? -8 : 20));
    const yLabelX = bx + 12;
    let yLabelY = peakY - 12;
    if (yLabelY < SCR.y0 + 16) yLabelY = troughY + 22;
    if (Math.abs(yLabelY - xLabelY) < 20 || Math.abs(yLabelY - xb) < 12 || yLabelY > SCR.y1 - 2) yLabelY = cpy(g.midY) + 5;
    yLabelY = Math.round(Math.max(SCR.y0 + 16, Math.min(SCR.y1 - 4, yLabelY)));
    let html = '';
    html += '<g class="inspect-mark" data-mark="ydiv" opacity="0">' +
      '<line x1="' + bx.toFixed(1) + '" y1="' + cpy(peakY).toFixed(1) + '" x2="' + bx.toFixed(1) + '" y2="' + cpy(troughY).toFixed(1) + '" stroke="#d4b06a" stroke-width="2" stroke-dasharray="5 3"/>' +
      '<line x1="' + (bx - 8).toFixed(1) + '" y1="' + cpy(peakY).toFixed(1) + '" x2="' + (bx + 8).toFixed(1) + '" y2="' + cpy(peakY).toFixed(1) + '" stroke="#d4b06a" stroke-width="2"/>' +
      '<line x1="' + (bx - 8).toFixed(1) + '" y1="' + cpy(troughY).toFixed(1) + '" x2="' + (bx + 8).toFixed(1) + '" y2="' + cpy(troughY).toFixed(1) + '" stroke="#d4b06a" stroke-width="2"/>' +
      svgLabel(yLabelX, yLabelY, 'Y = ' + trimNum(round2(Y), 2) + ' div', 'start') + '</g>';
    html += '<g class="inspect-mark" data-mark="xdiv" opacity="0">' +
      '<line x1="' + cpx(cycA).toFixed(1) + '" y1="' + xb.toFixed(1) + '" x2="' + cpx(cycB).toFixed(1) + '" y2="' + xb.toFixed(1) + '" stroke="#d4b06a" stroke-width="2"/>' +
      '<line x1="' + cpx(cycA).toFixed(1) + '" y1="' + (xb - 6).toFixed(1) + '" x2="' + cpx(cycA).toFixed(1) + '" y2="' + (xb + 6).toFixed(1) + '" stroke="#d4b06a" stroke-width="2"/>' +
      (cycB <= SCR.x1 ? '<line x1="' + cycB.toFixed(1) + '" y1="' + (xb - 6).toFixed(1) + '" x2="' + cycB.toFixed(1) + '" y2="' + (xb + 6).toFixed(1) + '" stroke="#d4b06a" stroke-width="2"/>' : '') +
      svgLabel(cpx((cpx(cycA) + cpx(cycB)) / 2), Math.round(xLabelY), 'X = ' + trimNum(round2(X), 2) + ' div', 'middle') + '</g>';
    html += '<g class="inspect-mark" data-mark="peak" opacity="0">' +
      (peakY >= SCR.y0 && peakX <= SCR.x1 ? '<circle cx="' + peakX.toFixed(1) + '" cy="' + peakY.toFixed(1) + '" r="7" fill="none" stroke="#c8ffe6" stroke-width="2"/>' : '') +
      (troughY <= SCR.y1 && troughX <= SCR.x1 ? '<circle cx="' + troughX.toFixed(1) + '" cy="' + troughY.toFixed(1) + '" r="7" fill="none" stroke="#c8ffe6" stroke-width="2"/>' : '') + '</g>';
    html += '<g class="inspect-mark" data-mark="wave" opacity="0"><use href="#wave-trace" stroke="#a8e8c8" stroke-width="5" opacity="0.35"/></g>';
    dynMarks.innerHTML = html;
    // faint level guides at crest and trough while Y is inspected
    if (dynGuides) {
      dynGuides.innerHTML = '<g class="inspect-mark" data-mark="ydiv-guides" opacity="0">' +
        '<line x1="56" x2="616" y1="' + peakY.toFixed(1) + '" y2="' + peakY.toFixed(1) + '" stroke="#d4b06a" stroke-width="1" stroke-dasharray="2 4" opacity="0.6"/>' +
        '<line x1="56" x2="616" y1="' + troughY.toFixed(1) + '" y2="' + troughY.toFixed(1) + '" stroke="#d4b06a" stroke-width="1" stroke-dasharray="2 4" opacity="0.6"/></g>';
    }
    if (dynHits) {
      const ht = cpy(peakY) - 10, hb = cpy(troughY) + 10;
      dynHits.innerHTML =
        '<path class="chart-hit" data-inspect="wave" d="' + ptsToD(tracePoints(SCR.x0, SCR.x1, g)) + '" fill="none" stroke="transparent" stroke-width="18"/>' +
        '<rect class="chart-hit" data-inspect="ydiv" x="' + (bx - 22).toFixed(1) + '" y="' + ht.toFixed(1) + '" width="44" height="' + Math.max(20, hb - ht).toFixed(1) + '" fill="transparent"/>' +
        '<rect class="chart-hit" data-inspect="xdiv" x="' + (cpx(cycA) - 8).toFixed(1) + '" y="' + (Math.min(xb, xLabelY) - 16).toFixed(1) + '" width="' + (cpx(cycB) - cpx(cycA) + 16).toFixed(1) + '" height="' + (Math.abs(xb - xLabelY) + 26).toFixed(1) + '" fill="transparent"/>' +
        (peakY >= SCR.y0 ? '<rect class="chart-hit" data-inspect="peak" x="' + (peakX - 14).toFixed(1) + '" y="' + (peakY - 14).toFixed(1) + '" width="28" height="28" fill="transparent"/>' : '');
    }
    // readouts on/around the screen
    const vText = trimNum(S.vdiv, 3) + ' V/div', tText = trimNum(S.tdiv, 3) + ' ms/div';
    setText('mark-vdiv-text', vText);
    setText('mark-tdiv-text', 'TIME/DIV = ' + tText);
    setText('scope-status', 'CH1 ' + trimNum(S.vdiv, 3) + ' V · M ' + trimNum(S.tdiv, 3) + ' ms');
    setText('eq-vdiv-val', vText);
    setText('eq-tdiv-val', tText);
    const hint = document.getElementById('offscreen-hint');
    if (hint) {
      let msg = '';
      if (overflowV) msg = 'Trace off-screen · turn VOLTS/DIV up (or recentre Y-POS)';
      else if (overflowX) msg = 'Full period off-screen · turn TIME/DIV up (or move X-POS)';
      hint.textContent = msg;
      hint.setAttribute('visibility', msg ? 'visible' : 'hidden');
    }
    reapplyMarks();
  }
  function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }

  let activeMarks = [];
  function setMarks(list) {
    activeMarks = list || [];
    reapplyMarks();
  }
  function reapplyMarks() {
    document.querySelectorAll('#cro-stage .inspect-mark').forEach(m => {
      const mk = m.getAttribute('data-mark');
      const on = activeMarks.indexOf(mk) >= 0 || (mk === 'ydiv-guides' && activeMarks.indexOf('ydiv') >= 0);
      m.classList.toggle('on', on);
    });
  }

  /* —— inspection copy (computed from the live settings) —— */
  function inspectInfo(key) {
    const Y = round2(readY()), X = round2(readX());
    const vpp = Y * S.vdiv, tms = X * S.tdiv;
    const map = {
      vdiv: { title: 'Volts / div', body: 'Vertical scale. Each vertical square is worth this many volts. Turn the VOLTS/DIV knob to change it.',
        formula: 'volts/div = ' + trimNum(S.vdiv, 3) + ' V/div', mark: 'vdiv', highlightField: 'vpp', teach: 'vdiv', pop: 'volts/div = ' + trimNum(S.vdiv, 3) + ' V/div' },
      tdiv: { title: 'Time / div', body: 'Horizontal scale. Each horizontal square is worth this much time. Turn the TIME/DIV knob to change it.',
        formula: 'time/div = ' + trimNum(S.tdiv, 3) + ' ms/div', mark: 'tdiv', highlightField: 'tms', teach: 'tdiv', pop: 'time/div = ' + trimNum(S.tdiv, 3) + ' ms/div' },
      ydiv: { title: 'Y divisions (peak-to-peak)', body: 'Count vertical squares from trough to crest. That count is Y.',
        formula: 'Y = ' + trimNum(Y, 2) + ' div → Vpp = ' + trimNum(Y, 2) + ' × ' + trimNum(S.vdiv, 3) + ' = ' + fmtV(vpp) + ' V', mark: 'ydiv', highlightField: 'vpp', teach: 'vpp', pop: 'Y = ' + trimNum(Y, 2) + ' div', plug: 'y' },
      xdiv: { title: 'X divisions (one period)', body: 'Count horizontal squares spanning one full cycle. That count is X.',
        formula: 'X = ' + trimNum(X, 2) + ' div → T = ' + trimNum(X, 2) + ' × ' + trimNum(S.tdiv, 3) + ' ms = ' + trimNum(tms, 4) + ' ms', mark: 'xdiv', highlightField: 'tms', teach: 't', pop: 'X = ' + trimNum(X, 2) + ' div', plug: 'x' },
      peak: { title: 'Peak', body: 'Highest (or lowest) point of the trace. Peak-to-peak spans both extremes.',
        formula: 'A = Vpp / 2 = ' + fmtV(vpp / 2) + ' V', mark: 'peak', highlightField: 'a', teach: 'a', pop: 'A = Vpp / 2' },
      wave: { title: 'Waveform', body: 'Voltage versus time. Use Y for amplitude and X for period.',
        formula: 'f = 1/T = 1/(' + sci(tms / 1000) + ' s) ≈ ' + fmtFshort(1000 / tms) + ' Hz', mark: 'wave', highlightField: 'f', teach: 'f', pop: 'f = 1/T' },
      div: { title: 'One division', body: 'A single graticule square — the unit you count. Vertical divs × volts/div → volts; horizontal divs × time/div → time.',
        formula: '1 div = one grid square', mark: 'div', highlightField: null, teach: null, pop: '1 div = 1 grid square' }
    };
    return map[key];
  }

  const vrTitle = document.getElementById('vr-title');
  const vrBody = document.getElementById('vr-body');
  const vrFormula = document.getElementById('vr-formula');
  const bubble = document.getElementById('inspect-bubble');
  const formulaPop = document.getElementById('formula-pop');
  const teachHint = document.getElementById('teach-hint');
  const slotY = document.getElementById('slot-y');
  const slotX = document.getElementById('slot-x');
  const TEACH_DEFAULT = 'Hover the chart — a matching quantity lights its formula. Hover Y or X to plug the live count into the equation.';

  function resetSlots() {
    if (slotY) { slotY.textContent = 'Y'; slotY.classList.remove('live'); }
    if (slotX) { slotX.textContent = 'X'; slotX.classList.remove('live'); }
  }
  function clearTeach() {
    document.querySelectorAll('.teach-row').forEach(r => r.classList.remove('active', 'hot'));
    resetSlots();
    if (teachHint) teachHint.textContent = TEACH_DEFAULT;
  }
  function clearInspect() {
    setMarks([]);
    document.querySelectorAll('.calc-field').forEach(f => f.classList.remove('awake'));
    if (vrTitle) vrTitle.textContent = 'CRO screen';
    if (vrBody) vrBody.textContent = 'Move over the wave, peaks, Y/X brackets, a single division, or the volts/div and time/div regions.';
    if (vrFormula) vrFormula.textContent = '';
    if (formulaPop) formulaPop.hidden = true;
    clearTeach();
  }
  function lightTeach(teach, plug) {
    document.querySelectorAll('.teach-row').forEach(r => {
      const match = teach && r.getAttribute('data-formula') === teach;
      r.classList.toggle('active', !!match);
      r.classList.toggle('hot', !!match && !!plug);
    });
    if (teach === 'vpp') { const r = document.querySelector('.teach-row[data-formula="vdiv"]'); if (r) r.classList.add('active'); }
    if (teach === 't') { const r = document.querySelector('.teach-row[data-formula="tdiv"]'); if (r) r.classList.add('active'); }
    resetSlots();
    if (plug === 'y' && slotY) { slotY.textContent = trimNum(round2(readY()), 2); slotY.classList.add('live'); }
    if (plug === 'x' && slotX) { slotX.textContent = trimNum(round2(readX()), 2); slotX.classList.add('live'); }
  }

  let lastInspectKey = null;
  function showInspect(key, clientX, clientY) {
    const info = inspectInfo(key);
    if (!info) return;
    lastInspectKey = key;
    setMarks([info.mark]);
    if (vrTitle) vrTitle.textContent = info.title;
    if (vrBody) vrBody.textContent = info.body;
    if (vrFormula) vrFormula.textContent = info.formula;
    document.querySelectorAll('.calc-field').forEach(f => {
      f.classList.toggle('awake', !!info.highlightField && f.getAttribute('data-key') === info.highlightField);
    });
    lightTeach(info.teach, info.plug);
    const Y = round2(readY()), X = round2(readX());
    if (teachHint) {
      if (info.plug === 'y') teachHint.textContent = 'Y is live in the formula → Vpp = ' + trimNum(Y, 2) + ' × ' + trimNum(S.vdiv, 3) + ' = ' + fmtV(Y * S.vdiv) + ' V.';
      else if (info.plug === 'x') teachHint.textContent = 'X is live in the formula → T = ' + trimNum(X, 2) + ' × ' + trimNum(S.tdiv, 3) + ' ms = ' + trimNum(X * S.tdiv, 4) + ' ms = ' + sci(X * S.tdiv / 1000) + ' s.';
      else if (key === 'div') teachHint.textContent = 'A division is one grid square. Count them: vertical for Y (voltage), horizontal for X (time).';
      else if (info.teach === 'vdiv') teachHint.textContent = 'volts/div tells you what each vertical square is worth. Here every vertical div = ' + trimNum(S.vdiv, 3) + ' V.';
      else if (info.teach === 'tdiv') teachHint.textContent = 'time/div tells you what each horizontal square is worth. Here every horizontal div = ' + trimNum(S.tdiv, 3) + ' ms.';
      else teachHint.textContent = info.body;
    }
    if (formulaPop && info.pop && clientX != null) {
      formulaPop.hidden = false;
      formulaPop.textContent = info.pop;
      const r = document.getElementById('cro-stage').getBoundingClientRect();
      formulaPop.style.left = (clientX - r.left) + 'px';
      formulaPop.style.top = (clientY - r.top) + 'px';
    }
  }

  const croStage = document.getElementById('cro-stage');
  if (croStage) {
    const svg = croStage.querySelector('svg');
    croStage.addEventListener('mousemove', e => {
      const hit = e.target.closest('[data-inspect]');
      if (hit) showInspect(hit.getAttribute('data-inspect'), e.clientX, e.clientY);
      else if (guideIndex < 0) {
        lastInspectKey = null;
        clearInspect();
      } else if (formulaPop) formulaPop.hidden = true;
      if (bubble && svg) {
        const p = svgPoint(svg, e.clientX, e.clientY);
        if (!p || p.x < SCR.x0 || p.x > SCR.x1 || p.y < SCR.y0 || p.y > SCR.y1) { bubble.hidden = true; return; }
        const t = ((p.x - SCR.cx) / SCR.divx) * S.tdiv;
        const v = ((SCR.cy - p.y) / SCR.divy - S.ypos) * S.vdiv;
        bubble.hidden = false;
        bubble.textContent = 't ' + t.toFixed(2) + ' ms  ·  V ' + v.toFixed(2) + ' V';
        const r = croStage.getBoundingClientRect();
        bubble.style.left = (e.clientX - r.left) + 'px';
        bubble.style.top = (e.clientY - r.top) + 'px';
        if (hit && formulaPop && !formulaPop.hidden) {
          formulaPop.style.top = (e.clientY - r.top - 18) + 'px';
          bubble.style.top = (e.clientY - r.top + 10) + 'px';
        }
      }
    });
    croStage.addEventListener('mouseleave', () => {
      if (guideIndex < 0) clearInspect();
      lastInspectKey = null;
      if (bubble) bubble.hidden = true;
      if (formulaPop) formulaPop.hidden = true;
    });
  }

  /* —— Rotary knobs (drag to rotate · wheel · arrow keys) —— */
  const KNOB_SWEEP = 270;   // degrees, −135 … +135
  const knobs = {};
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function makeKnob(host, cfg) {
    // cfg: { id, name, stepped:[...] | null, min, max, log, get(), set(v), fmt(v), fine, coarse }
    const el = document.createElement('div');
    el.className = 'knob';
    el.tabIndex = 0;
    el.setAttribute('role', 'slider');
    el.setAttribute('aria-label', cfg.name);
    el.dataset.knob = cfg.id;
    const ticks = [];
    const nT = cfg.stepped ? cfg.stepped().length : 11;
    for (let i = 0; i < nT; i++) {
      const a = (-135 + KNOB_SWEEP * i / (nT - 1)) * Math.PI / 180;
      const r1 = 44, r2 = cfg.stepped ? 49 : 47.5;
      ticks.push('<line x1="' + (50 + r1 * Math.sin(a)).toFixed(2) + '" y1="' + (50 - r1 * Math.cos(a)).toFixed(2) +
        '" x2="' + (50 + r2 * Math.sin(a)).toFixed(2) + '" y2="' + (50 - r2 * Math.cos(a)).toFixed(2) + '"/>');
    }
    let ridges = '';
    for (let i = 0; i < 24; i++) {
      const a = i * 15 * Math.PI / 180;
      ridges += '<line x1="' + (50 + 30 * Math.sin(a)).toFixed(2) + '" y1="' + (50 - 30 * Math.cos(a)).toFixed(2) +
        '" x2="' + (50 + 34 * Math.sin(a)).toFixed(2) + '" y2="' + (50 - 34 * Math.cos(a)).toFixed(2) + '"/>';
    }
    el.innerHTML =
      '<span class="knob-name">' + cfg.name + '</span>' +
      '<svg class="knob-svg" viewBox="0 0 100 100" aria-hidden="true">' +
        '<g class="knob-ticks" stroke="#5c7a9e" stroke-width="1.6" stroke-linecap="round">' + ticks.join('') + '</g>' +
        '<circle cx="50" cy="50" r="38" fill="#0b1015" stroke="#26343e" stroke-width="1.5"/>' +
        '<g class="knob-rot">' +
          '<circle cx="50" cy="50" r="34" fill="url(#knobGrad-' + cfg.id + ')" stroke="#3a4a56" stroke-width="1"/>' +
          '<g stroke="#1c262e" stroke-width="1.4">' + ridges + '</g>' +
          '<circle cx="50" cy="50" r="24" fill="url(#knobCap-' + cfg.id + ')"/>' +
          '<line x1="50" y1="30" x2="50" y2="18" stroke="#d4b06a" stroke-width="3.2" stroke-linecap="round"/>' +
        '</g>' +
        '<defs>' +
          '<radialGradient id="knobGrad-' + cfg.id + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#4b5b67"/><stop offset="1" stop-color="#1a232b"/></radialGradient>' +
          '<radialGradient id="knobCap-' + cfg.id + '" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#5d6e7a"/><stop offset="1" stop-color="#26323b"/></radialGradient>' +
        '</defs>' +
      '</svg>' +
      '<span class="knob-val"></span>';
    host.appendChild(el);
    const rot = el.querySelector('.knob-rot');
    const valEl = el.querySelector('.knob-val');

    function valueToFrac(v) {
      if (cfg.stepped) {
        const arr = cfg.stepped();
        let idx = arr.indexOf(v);
        if (idx < 0) idx = arr.reduce((b, x, i) => Math.abs(x - v) < Math.abs(arr[b] - v) ? i : b, 0);
        return arr.length > 1 ? idx / (arr.length - 1) : 0;
      }
      if (cfg.log) return (Math.log(v) - Math.log(cfg.min)) / (Math.log(cfg.max) - Math.log(cfg.min));
      return (v - cfg.min) / (cfg.max - cfg.min);
    }
    function fracToValue(fr) {
      fr = clamp(fr, 0, 1);
      if (cfg.stepped) { const arr = cfg.stepped(); return arr[Math.round(fr * (arr.length - 1))]; }
      let v = cfg.log ? Math.exp(Math.log(cfg.min) + fr * (Math.log(cfg.max) - Math.log(cfg.min))) : cfg.min + fr * (cfg.max - cfg.min);
      return cfg.snap ? cfg.snap(v) : v;
    }
    function paint() {
      const v = cfg.get();
      const ang = -135 + KNOB_SWEEP * clamp(valueToFrac(v), 0, 1);
      rot.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' 50 50)');
      valEl.textContent = cfg.fmt(v);
      el.setAttribute('aria-valuetext', cfg.fmt(v));
    }
    function commit(v) {
      if (v === cfg.get()) return;
      cfg.set(v);
      onSettingsChanged();
    }
    function nudge(dir, big) {
      if (cfg.stepped) {
        const arr = cfg.stepped();
        let idx = arr.indexOf(cfg.get());
        if (idx < 0) idx = Math.round(valueToFrac(cfg.get()) * (arr.length - 1));
        commit(arr[clamp(idx + dir, 0, arr.length - 1)]);
      } else {
        commit(cfg.nudge(cfg.get(), dir, big));
      }
    }
    // drag: rotate around the knob centre
    let drag = null;
    function angleAt(e) {
      const r = el.querySelector('.knob-svg').getBoundingClientRect();
      return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
    }
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      el.focus({ preventScroll: true });
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      drag = { last: angleAt(e), frac: clamp(valueToFrac(cfg.get()), 0, 1), y: e.clientY };
      el.classList.add('dragging');
      document.body.classList.add('knob-grabbing');
    });
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      const a = angleAt(e);
      let d = a - drag.last;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      // vertical drag also works (up = clockwise) for users who drag straight
      const dy = drag.y - e.clientY;
      drag.y = e.clientY;
      drag.last = a;
      const gain = e.shiftKey ? 0.25 : 1;
      const deltaDeg = Math.abs(d) > 0.01 && Math.abs(d) < 90 ? d : 0;
      drag.frac = clamp(drag.frac + (deltaDeg + dy * 0.6) * gain / KNOB_SWEEP, 0, 1);
      commit(fracToValue(drag.frac));
    });
    function endDrag(e) {
      if (!drag) return;
      drag = null;
      el.classList.remove('dragging');
      document.body.classList.remove('knob-grabbing');
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('wheel', e => {
      e.preventDefault();
      nudge(e.deltaY < 0 ? 1 : -1, e.shiftKey);
    }, { passive: false });
    el.addEventListener('keydown', e => {
      const up = e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'PageUp';
      const dn = e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'PageDown';
      if (!up && !dn) return;
      e.preventDefault();
      nudge(up ? 1 : -1, e.shiftKey || e.key.indexOf('Page') === 0);
    });
    el.addEventListener('pointerenter', () => document.body.classList.add('knob-hover'));
    el.addEventListener('pointerleave', () => document.body.classList.remove('knob-hover'));
    knobs[cfg.id] = { el, paint, cfg };
    paint();
  }

  const knobsScope = document.getElementById('knobs-scope');
  const knobsGen = document.getElementById('knobs-gen');
  if (knobsScope) {
    makeKnob(knobsScope, { id: 'vdiv', name: 'VOLTS/DIV', stepped: () => vdivSteps,
      get: () => S.vdiv, set: v => { S.vdiv = v; }, fmt: v => trimNum(v, 3) + ' V/div' });
    makeKnob(knobsScope, { id: 'tdiv', name: 'TIME/DIV', stepped: () => tdivSteps,
      get: () => S.tdiv, set: v => { S.tdiv = v; }, fmt: v => trimNum(v, 3) + ' ms/div' });
    makeKnob(knobsScope, { id: 'xpos', name: 'X-POSITION', min: -5, max: 5,
      snap: v => Math.round(v * 50) / 50, nudge: (v, d, big) => clamp(Math.round((v + d * (big ? 0.5 : 0.1)) * 50) / 50, -5, 5),
      get: () => S.xpos, set: v => { S.xpos = v; }, fmt: v => (v > 0 ? '+' : '') + trimNum(v, 2) + ' div' });
    makeKnob(knobsScope, { id: 'ypos', name: 'Y-POSITION', min: -4, max: 4,
      snap: v => Math.round(v * 50) / 50, nudge: (v, d, big) => clamp(Math.round((v + d * (big ? 0.5 : 0.1)) * 50) / 50, -4, 4),
      get: () => S.ypos, set: v => { S.ypos = v; }, fmt: v => (v > 0 ? '+' : '') + trimNum(v, 2) + ' div' });
  }
  const waveSelect = document.getElementById('wave-select');
  if (knobsGen) {
    const before = waveSelect || null;
    const holder = document.createElement('div');
    holder.className = 'knob-pair';
    knobsGen.insertBefore(holder, before);
    makeKnob(holder, { id: 'amp', name: 'AMPLITUDE', min: 0.1, max: 10,
      snap: v => Math.round(v * 100) / 100,
      nudge: (v, d, big) => clamp(Math.round((v + d * (big ? 0.5 : 0.05)) * 100) / 100, 0.1, 10),
      get: () => S.vpp, set: v => { S.vpp = v; }, fmt: v => fmtV(v) + ' Vpp' });
    makeKnob(holder, { id: 'freq', name: 'FREQUENCY', min: 20, max: 20000, log: true,
      snap: v => parseFloat(v.toPrecision(4)),
      nudge: (v, d, big) => clamp(parseFloat((v * Math.pow(big ? 1.05 : 1.005, d)).toPrecision(4)), 20, 20000),
      get: () => S.freq, set: v => { S.freq = v; }, fmt: v => fmtFshort(v) + ' Hz' });
  }
  if (waveSelect) {
    waveSelect.querySelectorAll('.wave-btn').forEach(b => {
      b.addEventListener('click', () => {
        S.wave = b.getAttribute('data-wave');
        onSettingsChanged();
      });
    });
  }
  function paintWaveSelect() {
    if (!waveSelect) return;
    waveSelect.querySelectorAll('.wave-btn').forEach(b => {
      const on = b.getAttribute('data-wave') === S.wave;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('on', on);
    });
  }

  function onSettingsChanged() {
    Object.keys(knobs).forEach(k => knobs[k].paint());
    paintWaveSelect();
    renderMarks();
    fillReadingsForm();
    if (guideIndex >= 0) applyGuideBeat(buildBeats()[guideIndex]);
    else if (lastInspectKey) showInspect(lastInspectKey);
    const fb = document.getElementById('fb-calc');
    const anyInput = [...document.querySelectorAll('#calc-panel input')].some(i => i.value !== '');
    if (anyInput && fb && fb.textContent) check();
  }

  function resetScope() {
    S.vdiv = LAB.vdiv; S.tdiv = LAB.tdiv; S.xpos = 0; S.ypos = 0;
  }
  const btnLabScale = document.getElementById('btn-lab-scale');
  if (btnLabScale) btnLabScale.addEventListener('click', () => { resetScope(); onSettingsChanged(); });
  const btnMyLab = document.getElementById('btn-my-lab');
  if (btnMyLab) btnMyLab.addEventListener('click', () => {
    S.wave = LAB.wave; S.vpp = LAB.vpp; S.freq = LAB.freq;
    resetScope();
    onSettingsChanged();
  });

  /* —— Enter my readings —— */
  const reY = document.getElementById('re-y'), reV = document.getElementById('re-vdiv');
  const reX = document.getElementById('re-x'), reT = document.getElementById('re-tdiv');
  const reMsg = document.getElementById('re-msg');
  function fillReadingsForm() {
    const active = document.activeElement;
    [[reY, trimNum(round2(readY()), 2)], [reV, trimNum(S.vdiv, 3)], [reX, trimNum(round2(readX()), 2)], [reT, trimNum(S.tdiv, 3)]].forEach(([el, v]) => {
      if (el && el !== active) el.value = v;
    });
  }
  function ensureStep(arr, v) {
    if (arr.indexOf(v) < 0) { arr.push(v); arr.sort((a, b) => a - b); }
  }
  const reApply = document.getElementById('re-apply');
  if (reApply) reApply.addEventListener('click', () => {
    const y = parseFloat(reY.value), vd = parseFloat(reV.value), x = parseFloat(reX.value), td = parseFloat(reT.value);
    if (![y, vd, x, td].every(n => isFinite(n) && n > 0)) {
      if (reMsg) { reMsg.className = 're-msg bad'; reMsg.textContent = 'Enter four positive numbers.'; }
      return;
    }
    ensureStep(vdivSteps, vd);
    ensureStep(tdivSteps, td);
    S.vdiv = vd; S.tdiv = td;
    S.vpp = y * vd;
    S.freq = 1000 / (x * td);
    S.xpos = 0; S.ypos = 0;
    onSettingsChanged();
    if (reMsg) { reMsg.className = 're-msg ok'; reMsg.textContent = 'Screen redrawn: Y = ' + trimNum(y, 3) + ' div, X = ' + trimNum(x, 3) + ' div.'; }
  });

  /* —— Answer checking: graded live against the current signal (±2%) —— */
  const tUnitSel = document.getElementById('in-tunit');
  function within(v, target, rel) {
    return typeof v === 'number' && isFinite(v) && Math.abs(v - target) <= Math.abs(target) * rel + 1e-12;
  }
  function check() {
    const T = periodMs();
    const target = { vpp: S.vpp, a: S.vpp / 2, f: S.freq };
    const unit = tUnitSel ? tUnitSel.value : 'ms';
    const nudges = [];
    let ok = 0, total = 0;
    ['vpp', 'a', 'tms', 'f'].forEach(key => {
      total++;
      const field = document.querySelector('.calc-field[data-key="' + key + '"]');
      if (!field) return;
      const input = field.querySelector('input');
      const v = parseFloat(input.value);
      let good = false;
      if (key === 'tms') {
        const want = unit === 's' ? T / 1000 : T;
        good = within(v, want, 0.02);
        if (!good && unit === 'ms' && within(v, T / 1000, 0.02)) nudges.push('T looks like it is in seconds — switch the unit box to “s” (or enter ' + trimNum(T, 4) + ' ms).');
        if (!good && unit === 's' && within(v, T, 0.02)) nudges.push('T = ' + trimNum(v, 4) + ' is the millisecond value. In seconds it is ' + sci(T / 1000) + ' s (switch the unit box to “ms” to enter ms).');
      } else {
        good = within(v, target[key], 0.02);
        if (key === 'f' && !good && within(v, S.freq / 1000, 0.03)) {
          nudges.push('f ≈ ' + trimNum(v, 3) + ' means you divided 1 by T in milliseconds. Convert first: ' + trimNum(T, 4) + ' ms = ' + sci(T / 1000) + ' s, so f = 1 / (' + sci(T / 1000) + ' s) ≈ ' + fmtFshort(S.freq) + ' Hz.');
        }
        if (key === 'a' && !good && within(v, S.vpp, 0.02)) nudges.push('That is Vpp. Amplitude is half of it: A = Vpp / 2.');
      }
      field.classList.toggle('ok', good);
      field.classList.toggle('bad', input.value !== '' && !good);
      if (good) ok++;
    });
    const fb = document.getElementById('fb-calc');
    if (!fb) return;
    if (ok === total) {
      fb.className = 'calc-feedback ok';
      fb.textContent = 'Match · Vpp = ' + fmtV(S.vpp) + ' V, A = ' + fmtV(S.vpp / 2) + ' V, T = ' + trimNum(T, 4) + ' ms = ' + sci(T / 1000) + ' s, f ≈ ' + fmtFshort(S.freq) + ' Hz.';
    } else {
      fb.className = 'calc-feedback bad';
      fb.textContent = ok + ' of ' + total + ' correct.' + (nudges.length ? ' ' + nudges.join(' ') : '');
    }
  }
  const btnCheck = document.getElementById('btn-check');
  if (btnCheck) btnCheck.addEventListener('click', check);
  document.querySelectorAll('#calc-panel input, #calc-panel select').forEach(inp => {
    inp.addEventListener('change', () => {
      const filled = [...document.querySelectorAll('#calc-panel input')].filter(i => i.value !== '').length;
      if (filled >= 2) check();
    });
  });

  /* —— Guided calc — numbers come from the current knob + generator settings —— */
  function buildBeats() {
    const Y = round2(readY()), X = round2(readX());
    const vd = trimNum(S.vdiv, 3), td = trimNum(S.tdiv, 3);
    const vpp = Y * S.vdiv, a = vpp / 2, tms = X * S.tdiv, ts = tms / 1000, f = 1 / ts;
    const Ys = trimNum(Y, 2), Xs = trimNum(X, 2), tmsS = trimNum(tms, 4);
    return [
      { text: 'First, read these numbers from the chart: Y (peak-to-peak divisions), X (one-period divisions), volts/div, and time/div.',
        teach: null, marks: ['ydiv', 'xdiv', 'vdiv', 'tdiv'], plug: null, fill: null, field: null },
      { text: 'Here: Y = ' + Ys + ' div, X = ' + Xs + ' div, volts/div = ' + vd + ' V/div, time/div = ' + td + ' ms/div. Keep those four numbers handy.',
        teach: 'vdiv', marks: ['ydiv', 'xdiv', 'vdiv', 'tdiv'], plug: null, fill: null, field: null },
      { text: 'Peak-to-peak — plug into the formula: Vpp = Y × volts/div = ' + Ys + ' × ' + vd + '.',
        teach: 'vpp', marks: ['ydiv'], plug: 'y', fill: null, field: 'vpp' },
      { text: 'Calculated: Vpp = ' + fmtV(vpp) + ' V. That is the full crest-to-trough height in volts.',
        teach: 'vpp', marks: ['ydiv'], plug: 'y', fill: { vpp: fmtV(vpp) }, field: 'vpp' },
      { text: 'Amplitude — plug in: A = Vpp / 2 = ' + fmtV(vpp) + ' / 2.',
        teach: 'a', marks: ['peak'], plug: null, fill: null, field: 'a' },
      { text: 'Calculated: A = ' + fmtV(a) + ' V. Amplitude is half of peak-to-peak.',
        teach: 'a', marks: ['peak'], plug: null, fill: { a: fmtV(a) }, field: 'a' },
      { text: 'Period — plug into the formula: T = X × time/div = ' + Xs + ' × ' + td + ' ms.',
        teach: 't', marks: ['xdiv'], plug: 'x', fill: null, field: 'tms' },
      { text: 'Calculated: T = ' + tmsS + ' ms. That is one full cycle — but it is still in milliseconds.',
        teach: 't', marks: ['xdiv'], plug: 'x', fill: { tms: tmsS, tunit: 'ms' }, field: 'tms' },
      { text: 'Convert to seconds BEFORE 1/T: T = ' + tmsS + ' ms = ' + tmsS + ' × 10⁻³ s = ' + sci(ts) + ' s.',
        teach: 't', marks: ['xdiv'], plug: null, fill: null, field: 'tms', convert: true },
      { text: 'Common slip: 1 / ' + tmsS + ' = ' + trimNum(Math.floor(100 / tms) / 100, 2) + ' Hz is wrong — that divides by milliseconds. T must be in seconds.',
        teach: 'f', marks: ['wave'], plug: null, fill: null, field: 'f', slip: true },
      { text: 'Frequency — f = 1 / T = 1 / (' + sci(ts) + ' s) = ' + fmtF(f) + ' Hz ≈ ' + fmtFshort(f) + ' Hz. Done: Vpp, A, T and f — turn a knob and the numbers follow.',
        teach: 'f', marks: ['wave'], plug: null, fill: { f: fmtF(f) }, field: 'f', done: true }
    ];
  }

  const guideBeatEl = document.getElementById('guide-beat');
  const guideBox = document.getElementById('guide-box');
  const btnGuide = document.getElementById('btn-guide');
  let guideIndex = -1;
  const GUIDE_IDLE = 'We will read the chart together — Y, X, volts/div, time/div — then walk each formula one beat at a time.';

  function applyGuideBeat(beat) {
    if (!beat) return;
    if (guideBeatEl) guideBeatEl.textContent = beat.text;
    if (guideBox) {
      guideBox.classList.toggle('convert', !!beat.convert);
      guideBox.classList.toggle('slip', !!beat.slip);
    }
    lightTeach(beat.teach, beat.plug);
    setMarks(beat.marks || []);
    document.querySelectorAll('.calc-field').forEach(f => {
      f.classList.toggle('awake', !!beat.field && f.getAttribute('data-key') === beat.field);
    });
    if (beat.fill) {
      Object.keys(beat.fill).forEach(key => {
        const el = document.getElementById('in-' + key);
        if (el) el.value = beat.fill[key];
      });
    }
    if (vrTitle) vrTitle.textContent = beat.done ? 'Guided calc complete' : 'Guided calc';
    if (vrBody) vrBody.textContent = beat.text;
    if (vrFormula) vrFormula.textContent = '';
    if (teachHint) teachHint.textContent = beat.text;
  }

  function clearCalc() {
    document.querySelectorAll('#calc-panel input').forEach(inp => { inp.value = ''; });
    if (tUnitSel) tUnitSel.value = 'ms';
    document.querySelectorAll('.calc-field').forEach(f => f.classList.remove('ok', 'bad', 'awake'));
    const fbCalc = document.getElementById('fb-calc');
    if (fbCalc) { fbCalc.className = 'calc-feedback'; fbCalc.textContent = ''; }
  }
  function stopGuide() {
    guideIndex = -1;
    clearInspect();
    resetSlots();
    if (guideBox) guideBox.classList.remove('convert', 'slip');
    if (guideBeatEl) guideBeatEl.textContent = GUIDE_IDLE;
    if (btnGuide) btnGuide.textContent = 'Start guided calc';
  }

  function advanceGuide() {
    if (!btnGuide) return;
    const beats = buildBeats();
    if (guideIndex < 0) {
      guideIndex = 0;
    } else if (guideIndex >= beats.length - 1) {
      // Start over: clear answers and return the CRO knobs to lab settings
      clearCalc();
      resetScope();
      stopGuide();
      onSettingsChanged();
      return;
    } else {
      guideIndex++;
    }
    const beat = buildBeats()[guideIndex];
    applyGuideBeat(beat);
    btnGuide.textContent = beat.done ? 'Start over' : 'Next →';
    tryRenderMath();
  }
  if (btnGuide) btnGuide.addEventListener('click', advanceGuide);
  const btnResetLab = document.getElementById('btn-reset-lab');
  if (btnResetLab) btnResetLab.addEventListener('click', () => {
    resetScope();
    onSettingsChanged();
  });

  renderMarks();
  paintWaveSelect();
  fillReadingsForm();

  /* Optional extras — hover open, auto-close ~500ms after leave */
  const extras = document.getElementById('end-extras');
  const extrasToggle = document.getElementById('end-extras-toggle');
  let extrasTimer = null;
  function openExtras() {
    if (!extras) return;
    clearTimeout(extrasTimer);
    extras.classList.add('open');
    if (extrasToggle) extrasToggle.setAttribute('aria-expanded', 'true');
  }
  function scheduleCloseExtras() {
    clearTimeout(extrasTimer);
    extrasTimer = setTimeout(() => {
      if (!extras) return;
      extras.classList.remove('open');
      if (extrasToggle) extrasToggle.setAttribute('aria-expanded', 'false');
    }, 500);
  }
  if (extras && extrasToggle) {
    extras.addEventListener('mouseenter', openExtras);
    extras.addEventListener('mouseleave', scheduleCloseExtras);
    extrasToggle.addEventListener('focus', openExtras);
    extrasToggle.addEventListener('click', e => {
      e.preventDefault();
      if (extras.classList.contains('open')) scheduleCloseExtras();
      else openExtras();
    });
  }


  /* —— MCQs: scrollable full bank (skeleton select / feedback logic) —— */
  const mcqList = document.getElementById('mcq-list');
  const mcqProgress = document.getElementById('mcq-progress');
  const mcqResetBtn = document.getElementById('mcq-reset');
  let mcqRaw = [];
  let mcqBank = [];
  let mcqAnswers = [];
  const MCQ_KEYS = ['A', 'B', 'C', 'D'];

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function prepareMcqBank(raw) {
    const sorted = raw.slice().sort((a, b) => {
      const na = parseInt(String(a.id || '').replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(String(b.id || '').replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });
    return sorted.map(q => {
      const opts = (q.options || []).map((text, i) => ({ text, i }));
      shuffleInPlace(opts);
      return {
        id: q.id,
        cat: q.cat,
        q: q.q,
        explain: q.explain,
        options: opts.map(o => o.text),
        correct: opts.findIndex(o => o.i === q.correct)
      };
    });
  }

  function updateMcqProgress() {
    if (!mcqProgress) return;
    const done = mcqAnswers.filter(a => a != null).length;
    mcqProgress.textContent = done + ' / ' + mcqBank.length + ' answered';
  }

  function renderMcqList() {
    if (!mcqList) return;
    mcqList.innerHTML = '';
    if (!mcqBank.length) {
      mcqList.innerHTML = '<p class="mcq-loading">No questions loaded.</p>';
      updateMcqProgress();
      return;
    }
    mcqBank.forEach((q, qi) => {
      const card = document.createElement('article');
      card.className = 'mcq-card';
      card.dataset.qi = String(qi);
      const answered = mcqAnswers[qi];
      const locked = answered != null;
      card.innerHTML =
        '<div class="mcq-card-top">' +
          '<span class="mcq-num">' + (qi + 1) + '</span>' +
        '</div>' +
        '<div class="mcq-q">' + escapeHtml(q.q) + '</div>' +
        '<div class="mcq-options"></div>' +
        '<div class="mcq-feedback idle" data-fb></div>';
      const optsHost = card.querySelector('.mcq-options');
      const fb = card.querySelector('[data-fb]');
      (q.options || []).forEach((opt, oi) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mcq-opt';
        btn.dataset.key = MCQ_KEYS[oi] || String(oi + 1);
        btn.textContent = opt;
        if (locked) {
          btn.disabled = true;
          if (oi === q.correct) btn.classList.add('correct');
        }
        btn.addEventListener('click', () => selectMcqAnswer(qi, oi, card));
        optsHost.appendChild(btn);
      });
      if (locked) {
        fb.className = 'mcq-feedback good';
        fb.textContent = '✓ ' + (q.explain || '');
      }
      mcqList.appendChild(card);
    });
    updateMcqProgress();
  }

  function selectMcqAnswer(qi, oi, card) {
    const q = mcqBank[qi];
    if (!q || mcqAnswers[qi] != null) return;
    const fb = card.querySelector('[data-fb]');
    const opts = card.querySelectorAll('.mcq-opt');
    if (oi !== q.correct) {
      fb.className = 'mcq-feedback soft';
      fb.textContent = 'not that one · try again';
      const bad = opts[oi];
      if (bad) {
        bad.classList.add('soft-wrong');
        setTimeout(() => bad.classList.remove('soft-wrong'), 420);
      }
      clearTimeout(selectMcqAnswer._t);
      selectMcqAnswer._t = setTimeout(() => {
        if (mcqAnswers[qi] == null) {
          fb.className = 'mcq-feedback idle';
          fb.textContent = '';
        }
      }, 900);
      return;
    }
    mcqAnswers[qi] = oi;
    opts.forEach((o, i) => {
      o.disabled = true;
      if (i === oi) o.classList.add('correct');
    });
    fb.className = 'mcq-feedback good';
    fb.textContent = '✓ ' + (q.explain || '');
    card.classList.add('correct-pulse');
    setTimeout(() => card.classList.remove('correct-pulse'), 650);
    updateMcqProgress();
  }

  function resetMcqAnswers() {
    mcqBank = prepareMcqBank(mcqRaw);
    mcqAnswers = new Array(mcqBank.length).fill(null);
    renderMcqList();
  }

  if (mcqResetBtn) mcqResetBtn.addEventListener('click', resetMcqAnswers);

  fetch('data/mcq-bank.json')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      const form = (data.forms && data.forms[0]) || 'A';
      mcqRaw = (data.bank && data.bank[form]) ? data.bank[form].slice() : [];
      mcqBank = prepareMcqBank(mcqRaw);
      mcqAnswers = new Array(mcqBank.length).fill(null);
      renderMcqList();
    })
    .catch(err => {
      if (mcqList) {
        mcqList.innerHTML = '<p class="mcq-loading">Could not load data/mcq-bank.json (' + escapeHtml(err.message) + ').</p>';
      }
    });

  /* —— Practical: draw-graph MCQ (one stroke at a time) —— */
  const DRAW_QS = [
    {
      q: 'First stroke: from the origin, which path starts the triangular wave rising to the first peak?',
      prior: [],
      choices: [
        { label: 'Rising diagonal to first peak', path: 'M110 320 L160 230' },
        { label: 'Flat baseline to the right', path: 'M110 320 L210 320' },
        { label: 'Falling diagonal downward', path: 'M110 320 L160 400' },
        { label: 'Vertical spike only', path: 'M110 320 L110 200' }
      ],
      correct: 0,
      explain: 'A triangular wave begins with a straight rising edge from the baseline to the first peak.'
    },
    {
      q: 'Next stroke: from the first peak, which path continues the triangle correctly?',
      prior: ['M110 320 L160 230'],
      choices: [
        { label: 'Falling diagonal to the baseline', path: 'M160 230 L210 320' },
        { label: 'Continue rising higher', path: 'M160 230 L210 160' },
        { label: 'Horizontal flat top', path: 'M160 230 L220 230' },
        { label: 'Drop vertically then stop', path: 'M160 230 L160 320' }
      ],
      correct: 0,
      explain: 'After each peak the triangle falls in a straight line back to the baseline (zero crossing / trough line used here).'
    },
    {
      q: 'Next stroke: from that valley, which segment climbs to the second peak?',
      prior: ['M110 320 L160 230', 'M160 230 L210 320'],
      choices: [
        { label: 'Rising diagonal to second peak', path: 'M210 320 L262 228' },
        { label: 'Stay on the baseline', path: 'M210 320 L310 320' },
        { label: 'Curve upward like a sine', path: 'M210 320 Q236 200, 262 320' },
        { label: 'Square step up then flat', path: 'M210 320 L210 230 L262 230' }
      ],
      correct: 0,
      explain: 'The next half-cycle rises again in a straight line — that is what makes the wave triangular, not sinusoidal or square.'
    },
    {
      q: 'Final stroke for this segment: complete the second tooth of the triangle.',
      prior: ['M110 320 L160 230', 'M160 230 L210 320', 'M210 320 L262 228'],
      choices: [
        { label: 'Falling diagonal back to baseline', path: 'M262 228 L310 322' },
        { label: 'Rise to a third higher peak', path: 'M262 228 L310 150' },
        { label: 'Arc over to the right', path: 'M262 228 Q286 280, 310 228' },
        { label: 'Jump left back to the origin', path: 'M262 228 L110 320' }
      ],
      correct: 0,
      explain: 'Close the second peak with another falling edge to the baseline. Repeating rise–fall builds the full triangular trace.'
    }
  ];

  let drawIndex = 0;
  let drawLocked = false;
  let drawAnswers = new Array(DRAW_QS.length).fill(null);
  const drawCommitted = document.getElementById('draw-committed');
  const drawPreview = document.getElementById('draw-preview');
  const drawOptions = document.getElementById('draw-options');
  const drawFeedback = document.getElementById('draw-feedback');
  const drawQ = document.getElementById('draw-q');
  const drawStep = document.getElementById('draw-step');
  const drawNext = document.getElementById('draw-next');
  const drawBack = document.getElementById('draw-back');
  const drawRestart = document.getElementById('draw-restart');

  function miniSvg(pathD) {
    return '<svg viewBox="90 180 250 180" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100%" height="100%" fill="#f8fafc"/>' +
      '<path d="M100 320 L320 320" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>' +
      '<path d="' + pathD + '" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  function paintDrawCanvas(q, previewPath) {
    if (!drawCommitted) return;
    drawCommitted.innerHTML = '';
    (q.prior || []).forEach(d => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('class', 'dink');
      p.setAttribute('d', d);
      drawCommitted.appendChild(p);
    });
    if (drawPreview) {
      drawPreview.innerHTML = '';
      if (previewPath) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('class', 'dink');
        p.setAttribute('d', previewPath);
        drawPreview.appendChild(p);
      }
    }
  }

  function renderDrawQuestion() {
    if (!drawOptions || !DRAW_QS.length) return;
    const q = DRAW_QS[drawIndex];
    drawLocked = drawAnswers[drawIndex] != null;
    if (drawStep) drawStep.textContent = 'Stroke ' + (drawIndex + 1) + ' / ' + DRAW_QS.length;
    if (drawQ) drawQ.textContent = q.q;
    const preview = drawLocked ? q.choices[q.correct].path : null;
    paintDrawCanvas(q, preview);
    drawOptions.innerHTML = '';
    q.choices.forEach((ch, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'draw-opt';
      btn.innerHTML =
        '<span class="draw-opt-key">' + MCQ_KEYS[i] + '</span>' +
        '<span class="draw-opt-mini">' + miniSvg(ch.path) + '</span>' +
        '<span class="draw-opt-label">' + escapeHtml(ch.label) + '</span>';
      if (drawLocked) {
        btn.disabled = true;
        if (i === q.correct) btn.classList.add('correct');
      }
      btn.addEventListener('click', () => selectDrawAnswer(i));
      drawOptions.appendChild(btn);
    });
    if (drawFeedback) {
      if (drawLocked) {
        drawFeedback.className = 'draw-feedback good';
        drawFeedback.textContent = '✓ ' + (q.explain || '');
      } else {
        drawFeedback.className = 'draw-feedback idle';
        drawFeedback.textContent = 'Pick the next stroke · A–D';
      }
    }
    if (drawNext) drawNext.disabled = !drawLocked || drawIndex >= DRAW_QS.length - 1;
    if (drawBack) drawBack.disabled = drawIndex <= 0;
    // On last solved question, allow Next to stay disabled (or show complete)
    if (drawNext && drawLocked && drawIndex >= DRAW_QS.length - 1) {
      drawNext.disabled = true;
      drawNext.textContent = 'Done';
    } else if (drawNext) {
      drawNext.textContent = 'Next →';
    }
  }

  function selectDrawAnswer(i) {
    const q = DRAW_QS[drawIndex];
    if (!q || drawLocked) return;
    if (i !== q.correct) {
      if (drawFeedback) {
        drawFeedback.className = 'draw-feedback soft';
        drawFeedback.textContent = 'not that one · try again';
      }
      const bad = drawOptions && drawOptions.children[i];
      if (bad) {
        bad.classList.add('soft-wrong');
        setTimeout(() => bad.classList.remove('soft-wrong'), 420);
      }
      clearTimeout(selectDrawAnswer._t);
      selectDrawAnswer._t = setTimeout(() => {
        if (!drawLocked && drawFeedback) {
          drawFeedback.className = 'draw-feedback idle';
          drawFeedback.textContent = 'Pick the next stroke · A–D';
        }
      }, 900);
      return;
    }
    drawAnswers[drawIndex] = i;
    drawLocked = true;
    paintDrawCanvas(q, q.choices[q.correct].path);
    Array.from(drawOptions.children).forEach((btn, bi) => {
      btn.disabled = true;
      if (bi === i) btn.classList.add('correct');
    });
    if (drawFeedback) {
      drawFeedback.className = 'draw-feedback good';
      drawFeedback.textContent = '✓ ' + (q.explain || '');
    }
    if (drawNext) {
      drawNext.disabled = drawIndex >= DRAW_QS.length - 1;
      drawNext.textContent = drawIndex >= DRAW_QS.length - 1 ? 'Done' : 'Next →';
    }
  }

  if (drawNext) drawNext.addEventListener('click', () => {
    if (!drawLocked || drawIndex >= DRAW_QS.length - 1) return;
    drawIndex++;
    renderDrawQuestion();
  });
  if (drawBack) drawBack.addEventListener('click', () => {
    if (drawIndex <= 0) return;
    drawIndex--;
    renderDrawQuestion();
  });
  if (drawRestart) drawRestart.addEventListener('click', () => {
    drawIndex = 0;
    drawAnswers = new Array(DRAW_QS.length).fill(null);
    renderDrawQuestion();
  });
  renderDrawQuestion();


})();
