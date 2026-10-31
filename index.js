// Saut stellaire : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoBase sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoBase.
// Elle demande l'accès complet pour utiliser les outils d'interface de NeoBase. NeoBase ne l'ouvre que si elle est signée.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Saut stellaire</span><span class=\"hint\" id=\"rnInfo\"></span></div>\n      <div class=\"gameBox\"><canvas id=\"rnCanvas\" width=\"384\" height=\"144\"></canvas></div>\n      <div class=\"hint\">Espace, flèche du haut ou clic : sauter (maintenir pour sauter plus haut) · P ou Échap : pause. Saute par-dessus les cristaux, reste au sol sous les météores, attrape les étoiles.</div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;box-shadow:0 0 0 3px var(--line2)}
.gameBox canvas{width:min(100%,1152px);aspect-ratio:384/144;image-rendering:pixelated;cursor:var(--cp,pointer)}
.gameBox.tall canvas{width:auto;height:min(720px,72vh);aspect-ratio:240/320}
`;  // le style de ce plugin (il utilise les variables du thème de NeoBase)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoBase pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "runnerApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  const LEGACY_GAMES = {"top":[],"best":"^runner$"};
  let games = await doc('games');
  if (games == null) {  // première ouverture : tu retrouves tes records et tes parties d'avant
    const old = legacy.api ? await legacy.api('games').catch(() => null) : null; games = { best: {} };
    if (old) { const re = new RegExp(LEGACY_GAMES.best); for (const [k, v] of Object.entries(old.best || {})) if (re.test(k)) games.best[k] = v; for (const k of LEGACY_GAMES.top) if (old[k] !== undefined) games[k] = old[k]; await folder.write('games', games); }
  }
  games = { best: {}, ...games };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v, higher = true) => { const b = games.best[k]; if (b == null || (higher ? v > b : v < b)) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);  // la section d'un jeu
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // centred pixel-font lines over a dark band
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  g.textAlign = 'center';
  lines.forEach(([text, color, size], i) => { g.fillStyle = color; g.font = (size || 8) + 'px "Press Start 2P", monospace'; g.fillText(text, w / 2, y0 + i * 14); });
  g.textAlign = 'left';
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
  // ---- ton code d'origine ----
/* ---------- jeu "Saut stellaire": endless runner. Hold to jump higher; crystals on the ground, meteors overhead (do NOT jump into them), stars to collect ---------- */
const RN = {
  run1: ['...oooo...', '..opppro..', '.opwkpwko.', '.oppppppo.', '.oppppppo.', '..oyyyyo..', '.oppppppo.', 'opopppopo.', '..op..po..', '..oo..oo..', '..........', '..........'],
  run2: ['...oooo...', '..opppro..', '.opwkpwko.', '.oppppppo.', '.oppppppo.', '..oyyyyo..', '.oppppppo.', '.opopppopo', '...op.op..', '...oo.oo..', '..........', '..........'],
  jump: ['...oooo...', '..opppro..', '.opwkpwko.', '.oppppppo.', 'ooppppppoo', 'p.oyyyyo.p', '.oppppppo.', '..opppo...', '..op.op...', '.oo...oo..', '..........', '..........'],
  pal: {o: '#3e0f4a', p: '#ff5ad9', r: '#ffd0f4', w: '#ffffff', k: '#130a20', y: '#ffd07a'},
  W: 384, H: 144, GROUND: 122,
};
let rn = null;
function rnStart() {
  const cv = $('rnCanvas');
  rn = rn || {raf: 0};
  Object.assign(rn, {g: cv.getContext('2d'), mode: 'ready', tick: 0, t: 0, y: 0, vy: 0, onGround: true, coyote: 0, buffer: 0, hold: 0, holding: false,
    speed: 2, dist: 0, coins: 0, obs: [], stars: [], parts: [], gap: 120, shake: 0, overAt: 0,
    sky: Array.from({length: 70}, () => [Math.random() * RN.W, Math.random() * 95, Math.random()]),
    hills: Array.from({length: 12}, (_, i) => [i * 48 + Math.random() * 20, 14 + Math.random() * 22])});
  $('rnInfo').textContent = 'Record : ' + (games?.best.runner ?? 0);
  gameLoop(rn, 'neodyme:runner', rnUpdate, rnDraw);
}
const rnScore = () => Math.floor(rn.dist / 10) + rn.coins * 25;
function rnPress(down) {
  if (!rn) return;
  rn.holding = down;
  if (!down) return;
  if (rn.mode === 'ready' || rn.mode === 'pause') { rn.mode = 'play'; return; }
  if (rn.mode === 'over') { if (Date.now() - rn.overAt > 600) rnStart(), rn.mode = 'play'; return; }
  rn.buffer = 7;  // jump buffer: a press just before landing still counts
}
function rnUpdate() {
  rn.t++;
  rn.speed = Math.min(4.6, 2 + rn.t / 2400);  // +1 px a tick every 40 s, capped
  rn.dist += rn.speed;
  // jump: coyote time (a few ticks after leaving the ground), buffer, and a higher jump while held
  if (rn.onGround) rn.coyote = 6; else rn.coyote--;
  if (rn.buffer > 0) { rn.buffer--; if (rn.coyote > 0) { rn.vy = 4.6; rn.onGround = false; rn.coyote = 0; rn.buffer = 0; rn.hold = 12; sfx('click'); for (let k = 0; k < 5; k++) rn.parts.push({x: 34, y: RN.GROUND, vx: -Math.random() * 1.5, vy: -Math.random(), life: 14, c: '#5e4d85'}); } }
  const g = rn.holding && rn.hold > 0 && rn.vy > 0 ? .16 : .34; if (rn.hold > 0) rn.hold--;
  if (!rn.onGround) { rn.vy -= g; rn.y += rn.vy; if (rn.y <= 0) { rn.y = 0; rn.vy = 0; rn.onGround = true; for (let k = 0; k < 4; k++) rn.parts.push({x: 32 + k * 2, y: RN.GROUND, vx: (Math.random() - .5) * 1.2, vy: -Math.random() * .6, life: 12, c: '#8f7bb8'}); } }
  // obstacles, with gaps always wide enough for a jump at the current speed
  rn.gap -= rn.speed;
  if (rn.gap <= 0) {
    const level = Math.min(1, rn.t / 7200), r = Math.random(), x = RN.W + 10;
    if (rn.t > 1500 && r < .22 + level * .1) rn.obs.push({kind: 'meteor', x, y: RN.GROUND - 25 - Math.floor(Math.random() * 6), w: 12, h: 6});  // flies over a standing hero
    else if (r < .55) rn.obs.push({kind: 'crystal', x, w: 6, h: 9 + Math.floor(Math.random() * 4)});
    else if (r < .8) rn.obs.push({kind: 'crystal', x, w: 7, h: 14 + Math.floor(Math.random() * 4)});
    else rn.obs.push({kind: 'crystal', x, w: 14, h: 9}, {kind: 'crystal', x: x + 8, w: 7, h: 14});
    if (Math.random() < .35) rn.stars.push({x: x + 30 + Math.random() * 40, y: RN.GROUND - 30 - Math.random() * 24, got: false});
    const air = 2 * 4.6 / .34;  // ticks in the air for a plain jump
    rn.gap = rn.speed * (air + 14) + Math.random() * (160 - level * 70);
  }
  for (const o of rn.obs) o.x -= rn.speed; for (const s of rn.stars) s.x -= rn.speed;
  rn.obs = rn.obs.filter(o => o.x > -30); rn.stars = rn.stars.filter(s => s.x > -10 && !s.got);
  const hx = 31, hy = RN.GROUND - 10 - rn.y, hit = (x, y, w, h) => hx + 1 < x + w && hx + 8 > x && hy + 1 < y + h && hy + 10 > y;  // forgiving box, 1 px inside the sprite
  for (const s of rn.stars) if (hit(s.x - 3, s.y - 3, 7, 7)) { s.got = true; rn.coins++; sfx('notify'); for (let k = 0; k < 8; k++) rn.parts.push({x: s.x, y: s.y, vx: Math.cos(k) * 1.4, vy: Math.sin(k) * 1.4, life: 16, c: '#ffd07a'}); }
  if (rn.obs.some(o => o.kind === 'meteor' ? hit(o.x, o.y, o.w, o.h) : hit(o.x, RN.GROUND - o.h, o.w, o.h))) {
    rn.mode = 'over'; rn.overAt = Date.now(); rn.shake = 10; sfx('error');
    for (let k = 0; k < 18; k++) rn.parts.push({x: hx + 5, y: hy + 5, vx: (Math.random() - .5) * 4, vy: (Math.random() - .7) * 4, life: 30, c: ['#ff5ad9', '#ffd0f4', '#ffffff'][k % 3]});
    const sc = rnScore(), rec = best('runner', sc);
    $('rnInfo').textContent = 'Score ' + sc + (rec ? ' · NOUVEAU RECORD !' : ' · record ' + games.best.runner);
  }
  for (const p of rn.parts) { p.x += p.vx; p.y += p.vy; p.vy += .08; p.life--; }
  rn.parts = rn.parts.filter(p => p.life > 0);
}
const RN2 = {  // décor
  sky: ['#080318', '#0c0422', '#11062c', '#180837', '#200b42', '#2b0e4e', '#3a1160', '#4d1470', '#661a7c'],
  ridge: (x, k) => 10 + 12 * Math.abs(Math.sin(x * .031 * k)) + 7 * Math.sin(x * .09 * k + 1.7) * Math.sin(x * .013) + 5 * Math.abs(Math.sin(x * .17)),
};
function rnPoly(g, c, pts) { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
function rnDraw() {
  const g = rn.g, W = RN.W, H = RN.H, G = RN.GROUND, sh = rn.shake > 0 ? (rn.shake--, (Math.random() - .5) * 4) : 0, tk = rn.tick;
  g.save(); g.translate(Math.round(sh), 0);
  RN2.sky.forEach((c, i) => px(g, c, -4, i * 14, W + 8, 14 + (i === 8 ? 30 : 0)));  // sky, nine bands darker at the top
  for (let x = -4; x < W + 4; x += 4) px(g, 'rgba(255,120,200,.10)', x, 98 + (x >> 2) % 2 * 2, 4, 2);  // dithered glow on the horizon
  for (const s of rn.sky) { if (rn.mode === 'play') s[0] = (s[0] - rn.speed * (.05 + s[2] * .1) + W) % W; const tw = s[2] > .8 && (tk + Math.floor(s[0])) % 50 < 6; px(g, tw ? '#ffffff' : s[2] > .8 ? '#e8d8ff' : s[2] > .5 ? '#b9a4e8' : '#5e4d85', s[0], s[1], tw ? 2 : 1, tw ? 2 : 1); }
  { const k = (tk % 460) / 460; if (k < .16) { const x = 340 - k * 6 * 250, y = 6 + k * 6 * 55; for (let n = 0; n < 10; n++) px(g, 'rgba(255,255,255,' + (1 - n / 10) + ')', x + n * 3, y - n * .75, 2, 1); } }  // shooting star
  px(g, '#8a7ad0', 56, 24, 7, 7); px(g, '#b8a8f0', 57, 24, 4, 3); px(g, '#5a4aa0', 61, 28, 2, 3);  // small moon
  { const cx = 300, cy = 44;  // the ringed planet : back of the ring, globe, shade, front of the ring
    g.strokeStyle = 'rgba(200,170,255,.55)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 30, 7, -.28, Math.PI, Math.PI * 2); g.stroke();
    g.fillStyle = '#4a3492'; g.beginPath(); g.arc(cx, cy, 17, 0, 7); g.fill();
    g.fillStyle = '#6a50c0'; g.beginPath(); g.arc(cx - 3, cy - 3, 14, 0, 7); g.fill();
    g.fillStyle = '#8a70e0'; g.beginPath(); g.arc(cx - 6, cy - 6, 8, 0, 7); g.fill();
    px(g, 'rgba(40,20,90,.55)', cx - 14, cy + 2, 28, 3); px(g, 'rgba(40,20,90,.4)', cx - 10, cy + 8, 20, 2);
    g.strokeStyle = 'rgba(230,205,255,.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 30, 7, -.28, 0, Math.PI); g.stroke(); g.lineWidth = 1; }
  const o1 = rn.dist * .12, o2 = rn.dist * .35;  // two ridges in parallax
  rnPoly(g, '#2a1066', [[-4, G], ...Array.from({length: 100}, (_, i) => [i * 4 - 4, G - 6 - RN2.ridge(i * 4 + o1, 1) * 1.5]), [W + 4, G]]);
  rnPoly(g, '#1c0a4a', [[-4, G], ...Array.from({length: 100}, (_, i) => [i * 4 - 4, G - 2 - RN2.ridge(i * 4 + o2 + 90, 1.4)]), [W + 4, G]]);
  for (let i = 0; i < 6; i++) { const x = ((i * 73 - o2 * 1.2) % (W + 60) + W + 60) % (W + 60) - 30, h = 10 + (i * 5) % 9; rnPoly(g, '#3c9ab8', [[x, G - 2], [x + 3, G - 2 - h], [x + 6, G - 2]]); px(g, '#aef0ff', x + 3, G - 2 - h, 1, 3); }  // far crystals
  px(g, '#2a1d52', -4, G, W + 8, H - G); px(g, '#d0a8ff', -4, G, W + 8, 1); px(g, '#8a5cf0', -4, G + 1, W + 8, 2); px(g, '#3c2a78', -4, G + 3, W + 8, 3);
  const off = rn.dist % 24;
  for (let x = -off; x < W; x += 24) { px(g, '#1b1038', x, G + 6, 1, H - G - 6); px(g, '#33236a', x + 1, G + 6, 1, H - G - 6); px(g, '#1b1038', x + 12, G + 14, 1, H - G - 14); px(g, '#33236a', x + 13, G + 14, 1, H - G - 14); }
  px(g, '#1b1038', -4, G + 14, W + 8, 1); px(g, '#140a2c', -4, H - 4, W + 8, 4);
  for (const s of rn.stars) { const tw = (tk >> 3) % 2, y = s.y + Math.round(Math.sin(tk / 14 + s.x) * 1.5); px(g, 'rgba(255,208,122,.18)', s.x - 5, y - 5, 11, 11); px(g, '#ffd07a', s.x - 1, y - 4, 3, 9); px(g, '#ffd07a', s.x - 4, y - 1, 9, 3); px(g, '#ffe9b0', s.x - 2, y - 2, 5, 5); px(g, tw ? '#ffffff' : '#fff6d8', s.x - 1, y - 1, 3, 3); }
  for (const o of rn.obs) {
    if (o.kind === 'meteor') {
      for (let k = 0; k < 16; k++) { const c = k < 3 ? '#ffe27a' : k < 7 ? '#ff9a3c' : k < 11 ? '#c8461c' : '#6a2a2a'; px(g, c, o.x + o.w + k * 2, o.y + 1 + (k + (tk >> 2)) % 3, 3 - (k >> 3), 3 - (k >> 3)); }
      rnPoly(g, '#7a3a14', [[o.x + 1, o.y + 1], [o.x + o.w - 2, o.y - 1], [o.x + o.w + 1, o.y + 3], [o.x + o.w - 2, o.y + o.h + 1], [o.x + 2, o.y + o.h + 1], [o.x - 1, o.y + 3]]);
      px(g, '#c8641c', o.x + 1, o.y, o.w - 3, 2); px(g, '#ffb04a', o.x + 2, o.y + 1, 4, 2); px(g, '#ffe27a', o.x + 3, o.y + 1, 2, 1); px(g, '#4a1e0a', o.x + 6, o.y + 3, 3, 2);
    } else {
      const y = G - o.h, w = o.w, h = o.h, x = o.x;
      g.fillStyle = 'rgba(127,224,238,.13)'; g.fillRect(Math.round(x - 3), y - 3, w + 6, h + 3); px(g, 'rgba(0,0,0,.35)', x - 1, G, w + 3, 2);
      rnPoly(g, '#1f8098', [[x, G], [x + w * .12, y + h * .35], [x + w * .5, y], [x + w * .5, G]]);       // lit face
      rnPoly(g, '#134f6c', [[x + w * .5, G], [x + w * .5, y], [x + w * .88, y + h * .35], [x + w, G]]);   // shaded face
      rnPoly(g, '#7fe0ee', [[x + w * .18, G - 1], [x + w * .22, y + h * .4], [x + w * .5, y + 1], [x + w * .42, G - 1]]);
      px(g, '#e8ffff', x + w * .4, y + 1, 1, Math.max(2, h * .35)); px(g, '#e8ffff', x + w * .22, y + h * .45, 1, 2);
      if ((tk + Math.floor(x)) % 90 < 5) px(g, '#ffffff', x + w * .5 - 1, y - 2, 3, 3);
    }
  }
  const frame = !rn.onGround ? RN.jump : (rn.mode === 'play' && (rn.t >> 3) % 2) ? RN.run2 : RN.run1;
  px(g, 'rgba(0,0,0,.4)', 30 + rn.y / 10, G + 1, Math.max(4, 10 - rn.y / 8), 2);
  if (rn.mode === 'play') for (let k = 1; k <= 5; k++) px(g, 'rgba(255,90,217,' + (.30 - k * .05) + ')', 30 - k * 4, G - 8 - rn.y + (k % 2) * 2, 3, 3);  // speed trail
  if (rn.mode !== 'over' || (tk >> 2) % 2) sprite(g, frame, 30, G - 10 - rn.y, RN.pal);
  for (const p of rn.parts) px(g, p.c, p.x, p.y, 2, 2);
  g.restore();
  px(g, 'rgba(8,3,24,.65)', 4, 4, 52, 15); px(g, '#ffd07a', 9, 8, 3, 7); px(g, '#ffd07a', 7, 10, 7, 3);
  g.font = '8px "Press Start 2P", monospace'; g.fillStyle = '#ffd07a'; g.fillText('x ' + rn.coins, 19, 15);
  px(g, 'rgba(8,3,24,.65)', W - 112, 4, 108, 27); g.fillStyle = '#ffffff'; g.textAlign = 'right';
  g.fillText(String(rnScore()).padStart(6, '0'), W - 8, 15); g.font = '6px "Press Start 2P", monospace'; g.fillStyle = '#8f7bb8'; g.fillText('RECORD ' + String(games?.best.runner ?? 0).padStart(6, '0'), W - 8, 26); g.textAlign = 'left';
  px(g, 'rgba(8,3,24,.65)', 4, 22, 52, 5); px(g, '#3a2a6e', 6, 23, 48, 3); px(g, '#ff5ad9', 6, 23, Math.round(48 * (rn.speed - 2) / 2.6), 3);  // speed bar
  if (rn.mode === 'ready') gameText(g, W, [['SAUT STELLAIRE', '#ff5ad9', 10], ['ESPACE OU CLIC : SAUTER', '#d9c6ff', 7], ['MAINTENIR = PLUS HAUT', '#d9c6ff', 7], ['CRISTAUX : SAUTE · MÉTÉORES : RESTE AU SOL', '#8f7bb8', 6], ['APPUIE POUR COMMENCER', '#ffffff', 7]], 40);
  if (rn.mode === 'pause') gameText(g, W, [['PAUSE', '#ff5ad9', 10], ['ESPACE POUR REPRENDRE', '#ffffff']], 62);
  if (rn.mode === 'over') gameText(g, W, [['PERDU', '#ff5ad9', 10], ['SCORE ' + rnScore() + ' · ' + rn.coins + ' ÉTOILES', '#ffffff'], ['ESPACE POUR REJOUER', '#d9c6ff']], 56);
}
document.addEventListener('keydown', e => {  // le cœur ne transmet plus les touches : le plugin les écoute lui-même
  if (!view.classList.contains('on') || !rn || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if ([' ', 'ArrowUp', 'w', 'z'].includes(k)) { e.preventDefault(); if (!e.repeat) rnPress(true); }
  if ((k === 'p' || k === 'Escape') && rn.mode === 'play') rn.mode = 'pause';
});
document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (rn && [' ', 'ArrowUp', 'w', 'z'].includes(k)) rnPress(false); });
$('rnCanvas').onpointerdown = () => rnPress(true);
$('rnCanvas').onpointerup = $('rnCanvas').onpointerleave = () => rnPress(false);  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onOpen(() => { rn ? gameLoop(rn, 'neodyme:runner', rnUpdate, rnDraw) : rnStart(); });
}
