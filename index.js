// Saut stellaire : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Saut stellaire</span><span class=\"hint\" id=\"rnInfo\"></span></div>\n      <div class=\"gameBox\"><canvas id=\"rnCanvas\" width=\"384\" height=\"144\"></canvas></div>\n      <div class=\"hint\">Espace, flèche du haut ou clic : sauter (maintenir pour sauter plus haut, rappuyer en l'air pour un double saut) · bas : retomber vite · P ou Échap : pause. Saute par-dessus les cristaux, reste au sol sous les météores, attrape les étoiles à la suite pour multiplier les points, et le bouclier pour encaisser un choc.</div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;box-shadow:0 0 0 3px var(--line2)}
.gameBox canvas{width:min(100%,1152px);aspect-ratio:384/144;image-rendering:pixelated;cursor:var(--cp,pointer)}
.gameBox.tall canvas{width:auto;height:min(720px,72vh);aspect-ratio:240/320}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
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
/* ---------- jeu "Saut stellaire" : course sans fin, tout en pixels dessinés un à un. Saut (maintenir = plus haut), double saut
   en l'air, chute rapide (bas), bouclier à ramasser, série d'étoiles qui multiplie les points ---------- */
const RN = {
  // le petit astronaute (o : contour, p : combinaison, r : reflet, w : visière claire, k : visière, y : ceinture, b : sac à dos)
  run1: ['....oooo....', '...oppppo...', '..oprwwkpo..', '..opwkkkpo..', '..oppppppo..', '.boppyypo...', '.bopppppo...', '..oppppppo..', '...op..po...', '...oo..oo...', '............', '............'],
  run2: ['....oooo....', '...oppppo...', '..oprwwkpo..', '..opwkkkpo..', '..oppppppo..', '.boppyypo...', '.bopppppo...', '..oppppppo..', '..op....op..', '..oo....oo..', '............', '............'],
  jump: ['....oooo....', '...oppppo...', '..oprwwkpo..', '..opwkkkpo..', '.ooppppppoo.', 'op.oppyypo.o', '.b.oppppo...', '...oppppo...', '..op...op...', '..oo....oo..', '............', '............'],
  pal: {o: '#3e0f4a', p: '#ff5ad9', r: '#ffd0f4', w: '#bff4ff', k: '#130a20', y: '#ffd07a', b: '#8a5cf0'},
  // les cristaux, dessinés à la main (trois tailles) ; c : clair, m : moyen, d : ombre, h : reflet
  crys: [
    ['..h..', '.hcm.', '.ccm.', 'hcmmd', 'ccmmd', 'cmmdd', 'cmmdd', 'cmmdd', 'cmddd'],
    ['...h...', '..hcm..', '..ccm..', '.hccmd.', '.ccmmd.', '.ccmmd.', 'hccmmdd', 'ccmmmdd', 'ccmmddd', 'cmmmddd', 'cmmmddd', 'cmmdddd', 'cmmdddd', 'cmmdddd'],
    ['..h.........', '.hcm....h...', '.ccm...hcm..', 'hcmmd..ccm..', 'ccmmd.hcmmd.', 'cmmdd.ccmmd.', 'cmmddhccmmdd', 'cmmddccmmmdd', 'cmddd ccmmddd'.replace(' ', '')],
  ],
  cpal: {h: '#e8ffff', c: '#7fe0ee', m: '#1f8098', d: '#134f6c'},
  meteor: ['...yyoo.....', '.yyyooor....', 'yyyooorrr...', 'yoooorrrrb..', '.ooorrrbbb..', '..rrrbbb....'],
  mpal: {y: '#ffe27a', o: '#ffb04a', r: '#c8641c', b: '#7a3a14'},
  shield: ['..cccc..', '.c....c.', 'c..ww..c', 'c.w....c', 'c......c', 'c......c', '.c....c.', '..cccc..'],
  W: 384, H: 144, GROUND: 122,
};
let rn = null;
function rnStart() {
  const cv = $('rnCanvas');
  rn = rn || {raf: 0};
  Object.assign(rn, {g: cv.getContext('2d'), mode: 'ready', tick: 0, t: 0, y: 0, vy: 0, onGround: true, coyote: 0, buffer: 0, hold: 0, holding: false, air: 0, dive: false,
    speed: 2, dist: 0, coins: 0, streak: 0, mult: 1, shield: false, obs: [], stars: [], items: [], parts: [], gap: 120, shake: 0, overAt: 0, banner: null,
    sky: Array.from({length: 70}, () => [Math.floor(Math.random() * RN.W), Math.floor(Math.random() * 95), Math.random()])});
  rn.g.imageSmoothingEnabled = false;
  $('rnInfo').textContent = 'Record : ' + (games?.best.runner ?? 0);
  gameLoop(rn, 'neodex:runner', rnUpdate, rnDraw);
}
const rnScore = () => Math.floor(rn.dist / 10) + rn.coins * 25;
function rnPress(down) {
  if (!rn) return;
  rn.holding = down;
  if (!down) return;
  if (rn.mode === 'ready' || rn.mode === 'pause') { rn.mode = 'play'; return; }
  if (rn.mode === 'over') { if (Date.now() - rn.overAt > 600) rnStart(), rn.mode = 'play'; return; }
  if (!rn.onGround && rn.coyote <= 0 && rn.air === 1) { rn.vy = 3.8; rn.air = 2; rn.hold = 8; sfx('click'); for (let k = 0; k < 8; k++) rn.parts.push({x: 34, y: RN.GROUND - rn.y, vx: Math.cos(k * .8) * 1.2, vy: Math.sin(k * .8) * 1.2, life: 12, c: '#bff4ff'}); return; }  // double saut
  rn.buffer = 7;  // un appui juste avant d'atterrir compte encore
}
function rnBurst(x, y, n, c, sp = 1.4, life = 16) { for (let k = 0; k < n; k++) rn.parts.push({x, y, vx: Math.cos(k * 6.283 / n) * sp, vy: Math.sin(k * 6.283 / n) * sp, life, c}); }
function rnUpdate() {
  rn.t++;
  rn.speed = Math.min(4.8, 2 + rn.t / 2400);
  rn.dist += rn.speed;
  if (rn.onGround) rn.coyote = 6; else rn.coyote--;
  if (rn.buffer > 0) { rn.buffer--; if (rn.coyote > 0) { rn.vy = 4.6; rn.onGround = false; rn.coyote = 0; rn.buffer = 0; rn.hold = 12; rn.air = 1; sfx('click'); for (let k = 0; k < 5; k++) rn.parts.push({x: 34, y: RN.GROUND, vx: -Math.random() * 1.5, vy: -Math.random(), life: 14, c: '#5e4d85'}); } }
  const grav = rn.dive ? .9 : rn.holding && rn.hold > 0 && rn.vy > 0 ? .16 : .34; if (rn.hold > 0) rn.hold--;
  if (!rn.onGround) { rn.vy -= grav; rn.y += rn.vy; if (rn.y <= 0) { rn.y = 0; rn.vy = 0; rn.onGround = true; rn.air = 0; for (let k = 0; k < 4; k++) rn.parts.push({x: 32 + k * 2, y: RN.GROUND, vx: (Math.random() - .5) * 1.2, vy: -Math.random() * .6, life: 12, c: '#8f7bb8'}); if (rn.dive) rn.shake = 3; } }
  // obstacles : l'écart laisse toujours le temps d'un saut à la vitesse du moment
  rn.gap -= rn.speed;
  if (rn.gap <= 0) {
    const level = Math.min(1, rn.t / 7200), r = Math.random(), x = RN.W + 10;
    if (rn.t > 1500 && r < .22 + level * .1) rn.obs.push({kind: 'meteor', x, y: RN.GROUND - 26 - Math.floor(Math.random() * 6), w: 12, h: 6});  // passe au-dessus d'un héros au sol
    else if (r < .55) rn.obs.push({kind: 'crystal', s: 0, x, w: 5, h: 9});
    else if (r < .8) rn.obs.push({kind: 'crystal', s: 1, x, w: 7, h: 14});
    else rn.obs.push({kind: 'crystal', s: 2, x, w: 12, h: 9});
    if (Math.random() < .4) { const sx = x + 30 + Math.random() * 40, sy = RN.GROUND - 30 - Math.random() * 30; for (let k = 0; k < (Math.random() < .4 ? 3 : 1); k++) rn.stars.push({x: sx + k * 14, y: sy - k * 4, got: false}); }  // parfois une petite file d'étoiles
    if (!rn.shield && !rn.items.length && Math.random() < .06) rn.items.push({x: x + 60, y: RN.GROUND - 34});
    const air = 2 * 4.6 / .34;
    rn.gap = rn.speed * (air + 14) + Math.random() * (160 - level * 70);
  }
  for (const o of rn.obs) o.x -= rn.speed; for (const s of rn.stars) s.x -= rn.speed; for (const i of rn.items) i.x -= rn.speed;
  if (rn.stars.some(s => s.x < 20 && !s.got)) { rn.streak = 0; rn.mult = 1; }  // une étoile laissée derrière : la série s'arrête
  rn.obs = rn.obs.filter(o => o.x > -30); rn.stars = rn.stars.filter(s => s.x > 20 && !s.got); rn.items = rn.items.filter(i => i.x > -10 && !i.got);
  const hx = 31, hy = RN.GROUND - 10 - rn.y, hit = (x, y, w, h) => hx + 2 < x + w && hx + 9 > x && hy + 1 < y + h && hy + 10 > y;  // boîte indulgente, 1 px dans le dessin
  for (const s of rn.stars) if (hit(s.x - 3, s.y - 3, 7, 7)) {
    s.got = true; rn.streak++; rn.mult = Math.min(4, 1 + Math.floor(rn.streak / 5)); rn.coins += rn.mult; sfx('notify'); rnBurst(s.x, s.y, 8, '#ffd07a');
    if (rn.streak % 5 === 0) rn.banner = {text: 'SÉRIE ×' + rn.mult, t: 60};
  }
  for (const i of rn.items) if (hit(i.x - 4, i.y - 4, 8, 8)) { i.got = true; rn.shield = true; sfx('launch'); rnBurst(i.x, i.y, 10, '#7fe0ee'); rn.banner = {text: 'BOUCLIER', t: 60}; }
  const bad = rn.obs.find(o => !o.gone && (o.kind === 'meteor' ? hit(o.x, o.y, o.w, o.h) : hit(o.x, RN.GROUND - o.h, o.w, o.h)));
  if (bad && rn.shield) { rn.shield = false; bad.gone = true; rn.shake = 6; sfx('error'); rnBurst(bad.x + 4, bad.kind === 'meteor' ? bad.y : RN.GROUND - 6, 14, '#7fe0ee', 2, 20); }
  else if (bad) {
    rn.mode = 'over'; rn.overAt = Date.now(); rn.shake = 10; sfx('error');
    for (let k = 0; k < 18; k++) rn.parts.push({x: hx + 5, y: hy + 5, vx: (Math.random() - .5) * 4, vy: (Math.random() - .7) * 4, life: 30, c: ['#ff5ad9', '#ffd0f4', '#ffffff'][k % 3]});
    const sc = rnScore(), rec = best('runner', sc);
    $('rnInfo').textContent = 'Score ' + sc + (rec ? ' · NOUVEAU RECORD !' : ' · record ' + games.best.runner);
  }
  rn.obs = rn.obs.filter(o => !o.gone);
  if (rn.banner && --rn.banner.t <= 0) rn.banner = null;
  const m = Math.floor(rn.dist / 10); if (m && m % 1000 === 0 && Math.floor((rn.dist - rn.speed) / 10) % 1000 !== 0) rn.banner = {text: m + ' M', t: 70};
  for (const p of rn.parts) { p.x += p.vx; p.y += p.vy; p.vy += .08; p.life--; }
  rn.parts = rn.parts.filter(p => p.life > 0);
}
const RN2 = {  // décor
  sky: ['#080318', '#0c0422', '#11062c', '#180837', '#200b42', '#2b0e4e', '#3a1160', '#4d1470', '#661a7c'],
  ridge: (x, k) => 10 + 12 * Math.abs(Math.sin(x * .031 * k)) + 7 * Math.sin(x * .09 * k + 1.7) * Math.sin(x * .013) + 5 * Math.abs(Math.sin(x * .17)),
};
let rnPlanet = null;
function rnPlanetSprite() {  // la planète à anneau, pixel par pixel (une fois) : arrière de l'anneau, globe ombré, avant de l'anneau
  const c = document.createElement('canvas'); c.width = 72; c.height = 40; const g = c.getContext('2d'), cx = 36, cy = 20;
  const ring = (front, col) => { for (let a = 0; a < 360; a += 1.5) { const t = a * Math.PI / 180, x = Math.round(cx + Math.cos(t) * 33), y = Math.round(cy + Math.sin(t) * 7 + Math.cos(t) * -9 * .28); if ((Math.sin(t) > 0) === front) px(g, col, x, y, 2, 1); } };
  ring(false, '#9a86d8');
  for (let y = -17; y <= 17; y++) for (let x = -17; x <= 17; x++) { const d = x * x + y * y; if (d > 17 * 17) continue; const l = (x + 6) * (x + 6) + (y + 6) * (y + 6); px(g, l < 64 ? '#8a70e0' : l < 250 ? '#6a50c0' : '#4a3492', cx + x, cy + y); if ((y === 3 || y === 9) && d < 15 * 15) px(g, '#3a2878', cx + x, cy + y); }
  ring(true, '#e6cdff');
  return c;
}
function rnSprite(g, rows, x, y, pal) { sprite(g, rows, Math.round(x), Math.round(y), pal); }
function rnDraw() {
  const g = rn.g, W = RN.W, H = RN.H, G = RN.GROUND, sh = rn.shake > 0 ? (rn.shake--, Math.round((Math.random() - .5) * 4)) : 0, tk = rn.tick;
  g.save(); g.translate(sh, 0); g.imageSmoothingEnabled = false;
  RN2.sky.forEach((c, i) => px(g, c, -4, i * 14, W + 8, 14 + (i === 8 ? 30 : 0)));
  for (let i = 0; i < 8; i++) for (let x = -4 + (i & 1) * 2; x < W + 4; x += 4) px(g, RN2.sky[i + 1], x, i * 14 + 12, 2, 2);  // tramage entre les bandes du ciel
  for (let x = -4; x < W + 4; x += 4) px(g, 'rgba(255,120,200,.10)', x, 98 + (x >> 2) % 2 * 2, 4, 2);
  for (const s of rn.sky) { if (rn.mode === 'play') s[0] = (s[0] - rn.speed * (.05 + s[2] * .1) + W) % W; const tw = s[2] > .8 && (tk + Math.floor(s[0])) % 50 < 6; px(g, tw ? '#ffffff' : s[2] > .8 ? '#e8d8ff' : s[2] > .5 ? '#b9a4e8' : '#5e4d85', Math.floor(s[0]), s[1]); if (tw) { px(g, '#b9a4e8', Math.floor(s[0]) - 1, s[1]); px(g, '#b9a4e8', Math.floor(s[0]) + 1, s[1]); px(g, '#b9a4e8', Math.floor(s[0]), s[1] - 1); px(g, '#b9a4e8', Math.floor(s[0]), s[1] + 1); } }
  { const k = (tk % 460) / 460; if (k < .16) { const x = Math.round(340 - k * 6 * 250), y = Math.round(6 + k * 6 * 55); for (let n = 0; n < 10; n++) px(g, n < 3 ? '#ffffff' : n < 6 ? '#d9c6ff' : '#8f7bb8', x + n * 3, y - Math.floor(n * .75), 2, 1); } }  // étoile filante
  sprite(g, ['..ccc..', '.cdccc.', 'cddcccb', 'ccccccb', 'cccccbb', '.ccbbb.', '..bbb..'], 56, 22, {c: '#b8a8f0', d: '#8a7ad0', b: '#5a4aa0'});  // petite lune
  g.drawImage(rnPlanet ||= rnPlanetSprite(), 264, 24);
  const o1 = rn.dist * .12, o2 = rn.dist * .35;  // deux crêtes en parallaxe, colonne par colonne
  for (let x = -4; x < W + 4; x += 2) { const h1 = Math.round(6 + RN2.ridge(x + o1, 1) * 1.5); px(g, '#2a1066', x, G - h1, 2, h1); px(g, '#3a1a80', x, G - h1, 2, 1); }
  for (let x = -4; x < W + 4; x += 2) { const h2 = Math.round(2 + RN2.ridge(x + o2 + 90, 1.4)); px(g, '#1c0a4a', x, G - h2, 2, h2); }
  for (let i = 0; i < 6; i++) { const x = Math.round(((i * 73 - o2 * 1.2) % (W + 60) + W + 60) % (W + 60) - 30), h = 10 + (i * 5) % 9; for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round((k + 1) / h * 3)); px(g, '#3c9ab8', x + 3 - w, G - 2 - h + k, w * 2, 1); } px(g, '#aef0ff', x + 3, G - 2 - h, 1, 3); }  // cristaux lointains
  px(g, '#2a1d52', -4, G, W + 8, H - G); px(g, '#d0a8ff', -4, G, W + 8, 1); px(g, '#8a5cf0', -4, G + 1, W + 8, 2); px(g, '#3c2a78', -4, G + 3, W + 8, 3);
  const off = Math.round(rn.dist % 24);
  for (let x = -off; x < W; x += 24) { px(g, '#1b1038', x, G + 6, 1, H - G - 6); px(g, '#33236a', x + 1, G + 6, 1, H - G - 6); px(g, '#1b1038', x + 12, G + 14, 1, H - G - 14); px(g, '#33236a', x + 13, G + 14, 1, H - G - 14); }
  px(g, '#1b1038', -4, G + 14, W + 8, 1); px(g, '#140a2c', -4, H - 4, W + 8, 4);
  for (const s of rn.stars) { const tw = (tk >> 3) % 2, x = Math.round(s.x), y = Math.round(s.y + Math.sin(tk / 14 + s.x) * 1.5); sprite(g, ['...y...', '...y...', '..yhy..', 'yyhwhyy', '..yhy..', '...y...', '...y...'], x - 3, y - 3, {y: '#ffd07a', h: '#ffe9b0', w: tw ? '#ffffff' : '#fff6d8'}); }
  for (const i of rn.items) { const y = Math.round(i.y + Math.sin(tk / 10) * 2); sprite(g, RN.shield, Math.round(i.x) - 4, y - 4, {c: (tk >> 3) % 2 ? '#7fe0ee' : '#bff4ff', w: '#ffffff'}); }
  for (const o of rn.obs) {
    if (o.kind === 'meteor') {
      for (let k = 0; k < 14; k++) { const c = k < 3 ? '#ffe27a' : k < 7 ? '#ff9a3c' : k < 11 ? '#c8461c' : '#6a2a2a'; px(g, c, Math.round(o.x) + o.w + k * 2, o.y + 1 + (k + (tk >> 2)) % 3, k < 7 ? 2 : 1, k < 7 ? 2 : 1); }  // la traînée
      rnSprite(g, RN.meteor, o.x, o.y, RN.mpal);
    } else {
      const rows = RN.crys[o.s], x = Math.round(o.x);
      px(g, 'rgba(0,0,0,.35)', x - 1, G, o.w + 3, 2);
      sprite(g, rows, x, G - rows.length, RN.cpal);
      if ((tk + x) % 90 < 5) px(g, '#ffffff', x + (o.w >> 1), G - rows.length - 2, 1, 1);
    }
  }
  const frame = !rn.onGround ? RN.jump : (rn.mode === 'play' && (rn.t >> 3) % 2) ? RN.run2 : RN.run1, hy = Math.round(G - 10 - rn.y);
  px(g, 'rgba(0,0,0,.4)', 30 + Math.round(rn.y / 10), G + 1, Math.max(4, 10 - Math.round(rn.y / 8)), 2);
  if (rn.mode === 'play') for (let k = 1; k <= 5; k++) px(g, k < 3 ? '#c84aa8' : '#6a2a78', 30 - k * 4, hy + 2 + (k % 2) * 2, 2, 2);  // traînée de vitesse
  if (rn.mode !== 'over' || (tk >> 2) % 2) sprite(g, frame, 29, hy, RN.pal);
  if (rn.shield) { const c = (tk >> 2) % 2 ? '#7fe0ee' : '#bff4ff'; for (let a = 0; a < 24; a++) { const t = a / 24 * 6.283; px(g, c, 35 + Math.round(Math.cos(t) * 9), hy + 5 + Math.round(Math.sin(t) * 9)); } }
  for (const p of rn.parts) px(g, p.c, p.x, p.y, 2, 2);
  g.restore();
  px(g, 'rgba(8,3,24,.65)', 4, 4, 60, 15); sprite(g, ['..y..', '.yhy.', 'yhwhy', '.yhy.', '..y..'], 7, 9, {y: '#ffd07a', h: '#ffe9b0', w: '#ffffff'});
  g.font = '8px "Press Start 2P", monospace'; g.fillStyle = '#ffd07a'; g.fillText('x ' + rn.coins, 16, 15);
  if (rn.mult > 1) { g.fillStyle = '#ff5ad9'; g.fillText('×' + rn.mult, 66, 15); }
  px(g, 'rgba(8,3,24,.65)', W - 112, 4, 108, 27); g.fillStyle = '#ffffff'; g.textAlign = 'right';
  g.fillText(String(rnScore()).padStart(6, '0'), W - 8, 15); g.font = '6px "Press Start 2P", monospace'; g.fillStyle = '#8f7bb8'; g.fillText('RECORD ' + String(games?.best.runner ?? 0).padStart(6, '0'), W - 8, 26); g.textAlign = 'left';
  px(g, 'rgba(8,3,24,.65)', 4, 22, 52, 5); px(g, '#3a2a6e', 6, 23, 48, 3); px(g, '#ff5ad9', 6, 23, Math.round(48 * (rn.speed - 2) / 2.8), 3);
  if (rn.banner && rn.mode === 'play') gameText(g, W, [[rn.banner.text, '#ffd07a', 10]], 52);
  if (rn.mode === 'ready') gameText(g, W, [['SAUT STELLAIRE', '#ff5ad9', 10], ['ESPACE : SAUTER · EN L\'AIR : DOUBLE SAUT', '#d9c6ff', 6], ['BAS : RETOMBER VITE', '#d9c6ff', 6], ['CRISTAUX : SAUTE · MÉTÉORES : RESTE AU SOL', '#8f7bb8', 6], ['APPUIE POUR COMMENCER', '#ffffff', 7]], 40);
  if (rn.mode === 'pause') gameText(g, W, [['PAUSE', '#ff5ad9', 10], ['ESPACE POUR REPRENDRE', '#ffffff']], 62);
  if (rn.mode === 'over') gameText(g, W, [['PERDU', '#ff5ad9', 10], ['SCORE ' + rnScore() + ' · ' + rn.coins + ' ÉTOILES', '#ffffff'], ['ESPACE POUR REJOUER', '#d9c6ff']], 56);
}
document.addEventListener('keydown', e => {  // le cœur ne transmet plus les touches : le plugin les écoute lui-même
  if (!view.classList.contains('on') || !rn || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if ([' ', 'ArrowUp', 'w', 'z'].includes(k)) { e.preventDefault(); if (!e.repeat) rnPress(true); }
  if (['ArrowDown', 's'].includes(k)) { e.preventDefault(); rn.dive = true; }
  if ((k === 'p' || k === 'Escape') && rn.mode === 'play') rn.mode = 'pause';
});
document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (rn && [' ', 'ArrowUp', 'w', 'z'].includes(k)) rnPress(false); if (rn && ['ArrowDown', 's'].includes(k)) rn.dive = false; });
$('rnCanvas').onpointerdown = () => rnPress(true);
$('rnCanvas').onpointerup = $('rnCanvas').onpointerleave = () => rnPress(false);  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onOpen(() => { rn ? gameLoop(rn, 'neodex:runner', rnUpdate, rnDraw) : rnStart(); });
}
