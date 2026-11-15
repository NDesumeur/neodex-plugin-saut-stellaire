// Saut stellaire : course sans fin de planète en planète. Saute par-dessus les cristaux, reste au sol sous les météores, attrape les étoiles.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Saut stellaire</span><span class="hint" id="rnInfo"></span></div>
  <div class="gMain"><div class="gameBox"><canvas id="rnCanvas" width="384" height="144"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="rnStats"></div></div>
      <div class="row"><button class="btn main" id="rnNew">NOUVELLE PARTIE</button><button class="btn" id="rnFs">PLEIN ÉCRAN</button></div>
      <div class="hint">Espace, flèche du haut ou clic : sauter (maintenir pour sauter plus haut, rappuyer en l'air pour un double saut) · bas : retomber vite · P ou Échap : pause. Saute par-dessus les cristaux, reste au sol sous les météores, attrape les étoiles à la suite pour multiplier les points, et le bouclier pour encaisser un choc.</div><div class="hint">Tous les 1000 m, une nouvelle planète : glace, lave, puis une géante gazeuse.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:1 1 100%;min-width:min(100%,320px);position:relative}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 384 / 144));max-width:none}
.gameBox canvas{image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-wrap:wrap;gap:14px;flex:1 1 100%;align-items:flex-start}
.gSide>*{flex:1 1 260px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{width:min(100%,max(280px,calc((100vh - 200px) * 384 / 144)));height:auto;aspect-ratio:384/144}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "SAUT STELLAIRE", T: {"k": "#0a0418", "k2": "#140828", "fill": "#1e0c3a", "fillOn": "#2a1050", "hl": "#3a1a66", "line": "#6a3aa8", "acc": "#ff5ad9", "accL": "#ffd0f4", "accS": "#c03aa8", "accD": "#3e0f4a", "rivet": "#ffd0f4", "btn": "#3a1a66", "btnHi": "#8a5cf0", "btnLo": "#140828", "btnHov": "#4a2280", "btnHovHi": "#b08af8", "text": "#f4ecff", "muted": "#b9a4e8", "acc2": "#7fe0ee", "gold": "#ffd07a", "orange": "#ffb04a", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#080318", "bgDot": "#1e0c3a", "bgDot2": "#140828", "spark": "#6a3aa8", "spark2": "#ff5ad9", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["....kkkk....", "...kaaaak...", "..kawbbkak..", "..kabkkkak..", "..kaaaaaak..", ".mkaaggak...", ".mkaaaaak...", "..kaaaaaak..", "...ka..ak...", "...kk..kk..."],
  icons: [[/^NOUVELLE/, "play"], [/^RECORDS/, "crown"], [/^PLEIN/, "full"]] });
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
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel (taille 16 = double), sur une bande sombre
  const hs = lines.map(([, , size]) => PXK.H * PXK.scale(size) + 3), tot = hs.reduce((a, b) => a + b, 0);
  g.fillStyle = 'rgba(11,3,28,.78)'; g.fillRect(0, y0 - 6, w, tot + 10);
  let y = y0; lines.forEach(([text, color, size], i) => { const s = PXK.scale(size); PXK.fill(g, text, w / 2 + s, y + 9 * s + s, '#05010b', s, 'center'); PXK.fill(g, text, w / 2, y + 9 * s, color, s, 'center'); y += hs[i]; });
}
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };
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
  $('rnInfo').textContent = 'Espace : sauter · bas : retomber vite · P : pause'; rnStats();
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
  const hx = 26, hy = RN.GROUND - 20 - rn.y, hit = (x, y, w, h) => hx + 5 < x + w && hx + 19 > x && hy + 3 < y + h && hy + 20 > y;  // le héros est dessiné en double : boîte indulgente, 2 px dans le dessin
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
    const sc = rnScore(), rec = best('runner', sc); best('runnerM', Math.floor(rn.dist / 10)); rnStats();
    $('rnInfo').textContent = 'Score ' + sc + (rec ? ' · NOUVEAU RECORD !' : ' · record ' + games.best.runner);
  }
  rn.obs = rn.obs.filter(o => !o.gone);
  if (rn.banner && --rn.banner.t <= 0) rn.banner = null;
  const m = Math.floor(rn.dist / 10); if (m && m % 1000 === 0 && Math.floor((rn.dist - rn.speed) / 10) % 1000 !== 0) { rn.banner = {text: m + ' M · ' + rnWorld().name, t: 110}; sfx('launch'); }
  for (const p of rn.parts) { p.x += p.vx; p.y += p.vy; p.vy += .08; p.life--; }
  rn.parts = rn.parts.filter(p => p.life > 0);
}
const RN_WORLDS = [
  {name: 'PLANÈTE VIOLETTE', hue: 0, sky: ['#080318', '#0c0422', '#11062c', '#180837', '#200b42', '#2b0e4e', '#3a1160', '#4d1470', '#661a7c'], r1: ['#2a1066', '#3a1a80'], r2: '#1c0a4a', gr: ['#2a1d52', '#d0a8ff', '#8a5cf0', '#3c2a78'], ln: ['#1b1038', '#33236a', '#140a2c'], cr: '#3c9ab8'},
  {name: 'PLANÈTE DE GLACE', hue: -60, sky: ['#020818', '#04102a', '#06183a', '#0a2248', '#0e2e58', '#143c6a', '#1a4c7c', '#22608e', '#2c76a0'], r1: ['#3a6a9a', '#8ac8e8'], r2: '#20406a', gr: ['#5a8ab8', '#f0faff', '#b8e4f8', '#7aaad0'], ln: ['#3a6a98', '#8ab8d8', '#2a4a70'], cr: '#e8f6ff'},
  {name: 'PLANÈTE DE LAVE', hue: 100, sky: ['#0c0204', '#160406', '#220608', '#30080a', '#400c0a', '#54120a', '#6a1a0a', '#82260c', '#a0380e'], r1: ['#3a0e0a', '#ff6a1a'], r2: '#240806', gr: ['#2a0e08', '#ffb03a', '#ff5a1a', '#6a1a0a'], ln: ['#140604', '#4a1408', '#0a0302'], cr: '#ff8a2a'},
  {name: 'GÉANTE GAZEUSE', hue: 160, sky: ['#0a0a04', '#12140a', '#1a1e0e', '#242a12', '#303816', '#3e481a', '#4e5a1e', '#606c24', '#76822a'], r1: ['#4a5a20', '#c8d870'], r2: '#2e3a14', gr: ['#5a5a28', '#f0e890', '#c8b850', '#7a7232'], ln: ['#3a3a18', '#6a6a30', '#24240e'], cr: '#d8e880'},
];
const rnWorld = () => RN_WORLDS[Math.floor(Math.floor((rn?.dist || 0) / 10) / 1000) % RN_WORLDS.length];
function rows2(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i * 2, y + j * 2, 2, 2); } }); }  // un sprite en double
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
  const Wd = rnWorld();
  Wd.sky.forEach((c, i) => px(g, c, -4, i * 14, W + 8, 14 + (i === 8 ? 30 : 0)));
  for (let i = 0; i < 8; i++) for (let x = -4 + (i & 1) * 2; x < W + 4; x += 4) px(g, Wd.sky[i + 1], x, i * 14 + 12, 2, 2);  // tramage entre les bandes du ciel
  for (let x = -4; x < W + 4; x += 4) px(g, 'rgba(255,120,200,.10)', x, 98 + (x >> 2) % 2 * 2, 4, 2);
  for (const s of rn.sky) { if (rn.mode === 'play') s[0] = (s[0] - rn.speed * (.05 + s[2] * .1) + W) % W; const tw = s[2] > .8 && (tk + Math.floor(s[0])) % 50 < 6; px(g, tw ? '#ffffff' : s[2] > .8 ? '#e8d8ff' : s[2] > .5 ? '#b9a4e8' : '#5e4d85', Math.floor(s[0]), s[1]); if (tw) { px(g, '#b9a4e8', Math.floor(s[0]) - 1, s[1]); px(g, '#b9a4e8', Math.floor(s[0]) + 1, s[1]); px(g, '#b9a4e8', Math.floor(s[0]), s[1] - 1); px(g, '#b9a4e8', Math.floor(s[0]), s[1] + 1); } }
  { const k = (tk % 460) / 460; if (k < .16) { const x = Math.round(340 - k * 6 * 250), y = Math.round(6 + k * 6 * 55); for (let n = 0; n < 10; n++) px(g, n < 3 ? '#ffffff' : n < 6 ? '#d9c6ff' : '#8f7bb8', x + n * 3, y - Math.floor(n * .75), 2, 1); } }  // étoile filante
  sprite(g, ['..ccc..', '.cdccc.', 'cddcccb', 'ccccccb', 'cccccbb', '.ccbbb.', '..bbb..'], 56, 22, {c: '#b8a8f0', d: '#8a7ad0', b: '#5a4aa0'});  // petite lune
  g.filter = Wd.hue ? `hue-rotate(${Wd.hue}deg)` : 'none'; g.drawImage(rnPlanet ||= rnPlanetSprite(), 264, 24); g.filter = 'none';
  const o1 = rn.dist * .12, o2 = rn.dist * .35;  // deux crêtes en parallaxe, colonne par colonne
  for (let x = -4; x < W + 4; x += 2) { const h1 = Math.round(6 + RN2.ridge(x + o1, 1) * 1.5); px(g, Wd.r1[0], x, G - h1, 2, h1); px(g, Wd.r1[1], x, G - h1, 2, 1); }
  for (let x = -4; x < W + 4; x += 2) { const h2 = Math.round(2 + RN2.ridge(x + o2 + 90, 1.4)); px(g, Wd.r2, x, G - h2, 2, h2); }
  for (let i = 0; i < 6; i++) { const x = Math.round(((i * 73 - o2 * 1.2) % (W + 60) + W + 60) % (W + 60) - 30), h = 10 + (i * 5) % 9; for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round((k + 1) / h * 3)); px(g, Wd.cr, x + 3 - w, G - 2 - h + k, w * 2, 1); } px(g, '#aef0ff', x + 3, G - 2 - h, 1, 3); }  // cristaux lointains
  px(g, Wd.gr[0], -4, G, W + 8, H - G); px(g, Wd.gr[1], -4, G, W + 8, 1); px(g, Wd.gr[2], -4, G + 1, W + 8, 2); px(g, Wd.gr[3], -4, G + 3, W + 8, 3);
  const off = Math.round(rn.dist % 24);
  for (let x = -off; x < W; x += 24) { px(g, Wd.ln[0], x, G + 6, 1, H - G - 6); px(g, Wd.ln[1], x + 1, G + 6, 1, H - G - 6); px(g, Wd.ln[0], x + 12, G + 14, 1, H - G - 14); px(g, Wd.ln[1], x + 13, G + 14, 1, H - G - 14); }
  px(g, Wd.ln[0], -4, G + 14, W + 8, 1); px(g, Wd.ln[2], -4, H - 4, W + 8, 4);
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
  const frame = !rn.onGround ? RN.jump : (rn.mode === 'play' && (rn.t >> 3) % 2) ? RN.run2 : RN.run1, hy = Math.round(G - 20 - rn.y);
  px(g, 'rgba(0,0,0,.4)', 30 + Math.round(rn.y / 10), G + 1, Math.max(6, 18 - Math.round(rn.y / 6)), 2);
  if (rn.mode === 'play') for (let k = 1; k <= 5; k++) px(g, k < 3 ? '#c84aa8' : '#6a2a78', 28 - k * 5, hy + 6 + (k % 2) * 4, 3, 3);  // traînée de vitesse
  if (rn.mode !== 'over' || (tk >> 2) % 2) rows2(g, frame, 26, hy, RN.pal);
  if (rn.shield) { const c = (tk >> 2) % 2 ? '#7fe0ee' : '#bff4ff'; for (let a = 0; a < 24; a++) { const t = a / 24 * 6.283; px(g, c, 38 + Math.round(Math.cos(t) * 15), hy + 10 + Math.round(Math.sin(t) * 15), 2, 2); } }
  for (const p of rn.parts) px(g, p.c, p.x, p.y, 2, 2);
  g.restore();
  px(g, 'rgba(8,3,24,.7)', 3, 3, 78, 18); sprite(g, ['..y..', '.yhy.', 'yhwhy', '.yhy.', '..y..'], 7, 8, {y: '#ffd07a', h: '#ffe9b0', w: '#ffffff'});
  pxFont(g, 'x ' + rn.coins, 16, 16, '#ffd07a'); if (rn.mult > 1) pxFont(g, '×' + rn.mult, 56, 16, '#ff5ad9');
  px(g, 'rgba(8,3,24,.7)', W - 104, 3, 101, 31);
  pxFont(g, String(rnScore()).padStart(6, '0'), W - 8, 16, '#ffffff', 8, 'right'); pxFont(g, 'RECORD ' + String(games?.best.runner ?? 0).padStart(6, '0'), W - 8, 29, '#b9a4e8', 8, 'right');
  px(g, 'rgba(8,3,24,.7)', 3, 23, 78, 7); px(g, '#3a2a6e', 5, 25, 74, 3); px(g, '#ff5ad9', 5, 25, Math.round(74 * (rn.speed - 2) / 2.8), 3);
  if (rn.banner && rn.mode === 'play') gameText(g, W, [[rn.banner.text, '#ffd07a', 16]], 44);
  if (rn.mode === 'ready') gameText(g, W, [['SAUT STELLAIRE', '#ff5ad9', 16], ['Espace : sauter · en l\'air : double saut', '#f4ecff'], ['Cristaux : saute · météores : reste au sol', '#b9a4e8'], ['Appuie pour commencer', '#ffd07a']], 30);
  if (rn.mode === 'pause') gameText(g, W, [['PAUSE', '#ff5ad9', 16], ['Espace pour reprendre', '#ffffff']], 44);
  if (rn.mode === 'over') gameText(g, W, [['PERDU', '#ff5ad9', 16], ['Score ' + rnScore() + ' · ' + rn.coins + ' étoiles · ' + Math.floor(rn.dist / 10) + ' m', '#ffffff'], ['Espace pour rejouer', '#d9c6ff']], 36);
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
function rnStats() { $('rnStats').innerHTML = ''; for (const [k, v] of [['Record', games.best.runner ?? 0], ['Plus loin', (games.best.runnerM ?? 0) + ' m'], ['Planète atteinte', RN_WORLDS[Math.floor((games.best.runnerM ?? 0) / 1000) % RN_WORLDS.length].name.toLowerCase()]]) { $('rnStats').append(el('span', '', k), el('b', '', String(v))); } }
$('rnNew').onclick = () => { $('rnNew').blur(); rnStart(); };
$('rnFs').onclick = () => { $('rnFs').blur(); try { document.fullscreenElement ? document.exitFullscreen() : $('rnCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
console.assert(RN_WORLDS.every(w => w.sky.length === 9 && w.gr.length === 4 && w.ln.length === 3) && (rn = {dist: 25000}, rnWorld().name === 'PLANÈTE DE LAVE') && (rn = null, true), 'saut stellaire planètes');
$('rnCanvas').__rn = {st: () => rn, go: m => { rn.dist = m * 10; }, world: () => rnWorld().name};
  // ---- fin ----
  ctx.onOpen(() => { rn ? gameLoop(rn, 'neodex:runner', rnUpdate, rnDraw) : rnStart(); });
}
