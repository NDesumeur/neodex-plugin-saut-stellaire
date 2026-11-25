// Saut stellaire : course sans fin de planète en planète. Saute par-dessus les obstacles, reste au sol sous les météores, attrape les étoiles.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Saut stellaire</span><span class="hint" id="rnInfo"></span></div>
  <div class="gMain"><div class="gameBox"><canvas id="rnCanvas" width="320" height="180"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="rnStats"></div></div>
      <div class="sysCard"><b>POUVOIRS</b><div class="hint" id="rnBank"></div><div class="rnShop" id="rnShop"></div></div>
      <div class="row"><button class="btn main" id="rnNew">NOUVELLE PARTIE</button><button class="btn" id="rnDaily">DÉFI DU JOUR</button><button class="btn" id="rnFs">PLEIN ÉCRAN</button></div>
      <div class="hint">Espace, flèche du haut ou clic : sauter (maintenir pour sauter plus haut, rappuyer en l'air pour un double saut) · bas : retomber vite · P ou Échap : pause. Saute par-dessus les obstacles, reste au sol sous les météores, attrape les étoiles à la suite pour multiplier les points, et le bouclier pour encaisser un choc.</div><div class="hint">Tous les 600 m, un nouveau biome : désert rouge, forêt de cristal, banquise, volcans, jungle alien. À 800 m puis tous les 1500 m, le Dévoreur te poursuit pendant 30 secondes : chaque étoile le repousse. Les étoiles ramassées vont en banque pour acheter des pouvoirs.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:3 1 520px;min-width:min(100%,320px);position:relative}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 320 / 180));max-width:none}
.gameBox canvas{image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1 1 260px;max-width:420px}
.rnShop{display:flex;flex-direction:column;gap:8px}
.rnUp{display:flex;align-items:center;gap:10px}.rnUp>div{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.rnUp em{font-style:normal;font-size:11px;opacity:.8}.rnUp .btn{flex:none}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{width:min(100%,max(280px,calc((100vh - 190px) * 320 / 180)));height:auto;aspect-ratio:320/180}`;
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
  icons: [[/^NOUVELLE/, "play"], [/^RECORDS/, "crown"], [/^PLEIN/, "full"], [/^POUVOIRS/, "star"], [/^DÉFI/, "clock"]] });
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
  // les trophées de NeoDex (3.4.8 et plus) : succès et records déclarés dans plugin.json ; sur un NeoDex plus ancien, rien ne se passe
  const trophy = id => { ctx.games?.unlock(id).catch(() => {}); };
  const trophyRecord = (id, v) => { if (v != null && Number.isFinite(+v)) ctx.games?.record(id, +v).catch(() => {}); };
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
/* ---------- jeu "Saut stellaire" 2.0 : redessiné de zéro. Course sans fin à travers cinq biomes (un nouveau tous les 600 m), tout en pixels.
   Saut (maintenir = plus haut), double saut, chute rapide ; étoiles en série ; pouvoirs achetés avec les étoiles ; le Dévoreur qui poursuit ; défi du jour ---------- */
const RN = {W: 320, H: 180, G: 150, HX: 40, BIOME: 600, BOSS0: 800, BOSSGAP: 1500, BOSSLEN: 1800};
const RN_OBS = [{w: 8, h: 10}, {w: 9, h: 17}, {w: 16, h: 10}];  // petit, haut, large
const rns = gstore('saut', {bank: 0, up: {}, games: 0, bosses: 0, daily: {}}); rns.up ??= {}; rns.daily ??= {};
const RN_UP = [
  {id: 'aimant', name: 'Aimant', txt: 'Attire les étoiles proches', price: [80, 200, 400]},
  {id: 'triple', name: 'Triple saut', txt: "Un troisième saut en l'air", price: [300]},
  {id: 'bouclier', name: 'Bouclier', txt: 'Chaque course commence avec un bouclier', price: [250]},
  {id: 'chance', name: 'Seconde chance', txt: 'Repars une fois après un choc', price: [500]}];
const rnLv = id => rns.up[id] || 0;
const rnSeed = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rh = n => (Math.imul(Math.floor(n) | 0, 2654435761) >>> 0) % 1000 / 1000;  // un hasard fixe pour chaque endroit du décor
const wrap = (v, m) => (v % m + m) % m;
const rnDay = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
let rnMute = false;
const S = n => { if (!rnMute) sfx(n); };
// l'astronaute, 16 × 20 : o contour, w combinaison, s et d ombres, k v V visière, a écusson, b B l sac à dos et sa lampe
const RN_TOP = ['......oooooo....', '.....owwwwwwo...', '....owwwwwwwso..', '...owwwwkkkkkso.', '...owwwkvVVvvko.', '..oowwwkvVvvvko.', '.obboowwkvvvvko.', '.oblbowwwkkkkso.',
  '.obbbowwwwwwsso.', '.oBBBoowwwwsso..', '.oBBBowoooooo...', '..oooowwaawwso..', '....owwwaawwswo.', '....owwwwwwsdwo.', '....owwwwwwsdo..', '....oosssssdoo..'];
const RN_LEGS = {
  run0: ['....owwo.owso...', '...owso...owso..', '..oddo.....oddo.', '..ooo.......ooo.'], run1: ['.....owwsso.....', '.....owsdo......', '.....oddoo......', '.....oooo.......'],
  run2: ['....owso.owwo...', '...owso...owso..', '...oddo....oddo.', '...ooo.....ooo..'], run3: ['......owwso.....', '......owsdo.....', '......oddoo.....', '......oooo......'],
  jump: ['....owwwwsso....', '...owso..osdo...', '...oddo...oddo..', '...ooo.....ooo..'], fall: ['....owso.owso...', '....owso.owso...', '....oddo.oddo...', '....ooo..ooo....']};
const RN_HPAL = {o: '#1a0a2a', w: '#f4f0ff', s: '#b4a8d8', d: '#6a5a98', k: '#123a7a', v: '#3fd0ff', V: '#d8faff', a: '#ff8a3a', b: '#9a8ac8', B: '#5a4a88', l: '#ff4a6a'};
const rnArt = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
const rnHeroC = {};
const rnHero = f => rnHeroC[f] ||= rnArt(16, 20, g => sprite(g, [...RN_TOP, ...RN_LEGS[f]], 0, 0, RN_HPAL));
// les cinq biomes : ciel (du haut vers l'horizon), astre, reliefs lointains et proches, sol, obstacles (contour, ombre, milieu, clair), météore, météo
const RN_BIOMES = [
  {name: 'Désert rouge', sky: ['#1a0a2a', '#2e0f3a', '#4a1446', '#6a1c4a', '#8e2a4a', '#b8404a', '#e0644a', '#ff9a5a'], neb: '#ff7a8a', body: {r: 18, c: ['#fff4d0', '#ffd080', '#f09a50'], glow: '#ffb070', x: 186, y: 48},
    far: '#5a1a3a', farHi: '#a8404a', farK: 'dunes', mid: '#3a1028', midHi: '#7a2a3a', gr: ['#ffb070', '#e07a48', '#b0502e', '#7a3020'], ob: {style: 'rock', pal: ['#2a0e10', '#7a3022', '#c05a36', '#f0946a']},
    air: ['#fff0a0', '#ffb04a', '#e0601c', '#7a2a10'], fx: 'dust', fxc: 'rgba(255,210,160,.55)'},
  {name: 'Forêt de cristal', sky: ['#05031a', '#0a0828', '#120c38', '#1c1048', '#28145a', '#36186a', '#481c78', '#5e2486'], neb: '#3ae0ff', body: {r: 15, c: ['#e0d0ff', '#a088e8', '#6a50b8'], ring: '#f0e4ff', x: 184, y: 44},
    far: '#2a1050', farHi: '#7a5ae0', farK: 'spires', mid: '#180838', midHi: '#4a2a90', gr: ['#b89aff', '#6a4ab8', '#3a2470', '#24144a'], ob: {style: 'shard', pal: ['#0a0420', '#1f8098', '#3fc8e0', '#d0ffff']},
    air: ['#ffffff', '#c8a8ff', '#8a5ae0', '#4a2a90'], fx: 'sparkle', fxc: '#c8f8ff'},
  {name: 'Banquise', sky: ['#020616', '#041026', '#071a38', '#0c2648', '#123458', '#1a4468', '#245878', '#326e8a'], neb: '#5affc8', aurora: true, body: {r: 13, c: ['#f0f8ff', '#b8d0e8', '#7890b0'], craters: true, x: 196, y: 42},
    far: '#1e3e62', farHi: '#a8d8f0', farK: 'cliffs', mid: '#2a5070', midHi: '#e0f4ff', gr: ['#ffffff', '#d8ecfa', '#a8c8e4', '#7aa0c8'], ob: {style: 'shard', pal: ['#0e2a4a', '#5aa0d0', '#a8e0f8', '#ffffff']},
    air: ['#ffffff', '#c8f0ff', '#6ac0f0', '#2a6aa0'], fx: 'snow', fxc: '#ffffff'},
  {name: 'Volcans', sky: ['#0a0204', '#140406', '#200608', '#2e080a', '#3e0c0a', '#52120a', '#6a1c0c', '#8a2c10'], neb: '#ff5a2a', body: {r: 24, c: ['#ffd070', '#ff7a2a', '#c03a1a'], glow: '#ff5a1a', x: 192, y: 46},
    far: '#2a0a0a', farHi: '#ff5a1a', farK: 'volcano', mid: '#180606', midHi: '#6a1a0a', gr: ['#5a2a1a', '#3a1a12', '#22100c', '#ff6a1a'], ob: {style: 'lava', pal: ['#0a0404', '#2a1410', '#4a2418', '#ff7a2a']},
    air: ['#ffffa0', '#ffc04a', '#ff6a1a', '#8a1a0a'], fx: 'ember', fxc: '#ff9a3a'},
  {name: 'Jungle alien', sky: ['#021210', '#04201a', '#082e24', '#0e3e2e', '#164e38', '#206040', '#2e7448', '#408a50'], neb: '#c8ff6a', body: {r: 20, c: ['#e8ffb0', '#a8d860', '#6a9a30'], bands: true, x: 188, y: 46},
    far: '#0e3424', farHi: '#4ab878', farK: 'mush', mid: '#082418', midHi: '#2a8a5a', gr: ['#9aff7a', '#4ab84a', '#2a6a32', '#18401e'], ob: {style: 'pod', pal: ['#0a1a0a', '#6a2a8a', '#b04ad0', '#ffa8ff']},
    air: ['#ffffff', '#c8ffa0', '#7ae04a', '#2a8a2a'], fx: 'spore', fxc: '#c8ff8a'}];
const rnBiomeAt = m => ((rn?.b0 || 0) + Math.floor(m / RN.BIOME)) % RN_BIOMES.length;
function rnFar(k, x) {  // la hauteur des reliefs lointains à l'endroit x
  if (k === 'dunes') return 28 + 12 * Math.sin(x / 61) + 6 * Math.sin(x / 23 + 1);
  if (k === 'spires') { const i = Math.floor(x / 46), p = x - i * 46, H = 30 + rh(i) * 34; return 12 + Math.max(0, H * (1 - Math.abs(p - 23) / 9)) + 4 * Math.sin(x / 17); }
  if (k === 'cliffs') return 30 + 9 * Math.sin(x / 37) + Math.floor(rh(x / 8) * 10);
  if (k === 'volcano') { const i = Math.floor(x / 170), d = Math.abs(x - i * 170 - 85), H = 50 + rh(i + 9) * 14; return d < 8 ? H - 3 : Math.max(10 + 3 * Math.sin(x / 13), H - (d - 8) * .9); }
  return 18 + 6 * Math.sin(x / 29) + 3 * Math.sin(x / 11);
}
function rnBall(r, c, o = {}) {  // un astre ou une boule ombrée : lumière en haut à gauche, tramage entre les teintes ; anneau, bandes, cratères, halo
  const pad = o.ring ? 14 : o.glow ? 7 : 1;
  return rnArt(r * 2 + pad * 2 + 1, r * 2 + (o.glow ? 14 : 2) + 1, g => {
    const cx = r + pad, cy = r + (o.glow ? 7 : 1);
    if (o.glow) { for (let y = -r - 6; y <= r + 6; y++) for (let x = -r - 6; x <= r + 6; x++) { const d = Math.hypot(x, y); if (d > r && d < r + 6 && !((x + y) & 1)) { g.globalAlpha = .5 * (1 - (d - r) / 6); px(g, o.glow, cx + x, cy + y); } } g.globalAlpha = 1; }
    const ring = front => { if (o.ring) for (let a = 0; a < 720; a++) { const t = a / 720 * 6.2832, x = Math.round(cx + Math.cos(t) * (r + 11)), y = Math.round(cy + Math.sin(t) * 3.5 - Math.cos(t) * 2.5); if ((Math.sin(t) > 0) === front) px(g, front ? o.ring : c[2], x, y); } };
    ring(false);
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue;
      const l = Math.hypot(x + r * .45, y + r * .45) / (r * 1.6); let k = l < .42 ? 0 : l < .72 ? 1 : 2;
      if (k < 2 && Math.abs(l - (k ? .72 : .42)) < .04 && (x + y) & 1) k++;
      if (o.bands && Math.floor((y + r) * 4 / r) % 3 === 1 && k < 2) k++;
      px(g, c[k], cx + x, cy + y);
    }
    if (o.craters) for (const [dx, dy, rr] of [[-.35, -.2, .22], [.3, .25, .16], [.1, -.5, .12], [-.15, .45, .14]]) { const X = Math.round(dx * r), Y = Math.round(dy * r), R = Math.max(1, Math.round(rr * r)); for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) if (x * x + y * y <= R * R) px(g, x * x + y * y > (R - 1) * (R - 1) && x + y > 0 ? c[0] : c[2], cx + X + x, cy + Y + y); }
    ring(true);
  });
}
const rnSkyC = [], rnGroundC = [], rnObsC = {}, rnAirC = [];
function rnSky(bi) {  // le ciel d'un biome, une seule fois : bandes tramées, nébuleuse, étoiles fixes, astre
  return rnSkyC[bi] ||= rnArt(RN.W, RN.G, g => {
    const B = RN_BIOMES[bi], n = B.sky.length, bh = RN.G / n, r = rnSeed(bi * 977 + 5);
    B.sky.forEach((col, i) => px(g, col, 0, Math.floor(i * bh), RN.W, Math.ceil(bh) + 1));
    for (let i = 0; i < n - 1; i++) { const y0 = Math.floor((i + 1) * bh) - 2; for (let y = y0; y < y0 + 4; y++) for (let x = (y & 1) * 2; x < RN.W; x += 4) px(g, y < y0 + 2 ? B.sky[i + 1] : B.sky[i], x, y, 2, 1); }
    g.globalAlpha = .22; for (let k = 0; k < 3; k++) { const X = 40 + k * 110 + r() * 40, Y = 30 + r() * 40, R = 26 + r() * 16; for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) { const d = Math.hypot(x, y * 1.6) / R; if (d < 1 && !((x + y) & 1) && r() < (1 - d) * .55) px(g, B.neb, X + x, Y + y); } }
    for (let k = 0; k < 70; k++) { const y = Math.floor(r() * 90); g.globalAlpha = (1 - y / 100) * (.4 + r() * .6); px(g, '#ffffff', Math.floor(r() * RN.W), y); }
    g.globalAlpha = 1; const b = B.body, a = rnBall(b.r, b.c, b); g.drawImage(a, Math.round(b.x - a.width / 2), Math.round(b.y - a.height / 2));
  });
}
function rnGround(bi) {  // un carreau de sol de 32 pixels, répété : bord clair, couches, cailloux (dans les volcans, une fente de lave)
  return rnGroundC[bi] ||= rnArt(32, RN.H - RN.G, g => {
    const c = RN_BIOMES[bi].gr, r = rnSeed(bi * 31 + 1), h = RN.H - RN.G, dk = bi === 3 ? '#160a08' : c[3];  // dans les volcans, la 4e couleur est la lave : les détails restent sombres
    px(g, c[2], 0, 0, 32, h); px(g, c[0], 0, 0, 32, 1); px(g, c[1], 0, 1, 32, 2);
    for (let x = 0; x < 32; x += 4) px(g, dk, x + 1, 3, 2, 1);
    for (const y of [11, 21]) for (let x = (y & 1); x < 32; x += 2) px(g, dk, x, y);
    for (let k = 0; k < 6; k++) { const x = Math.floor(r() * 29), y = 5 + Math.floor(r() * (h - 8)); px(g, dk, x, y, 3, 1); px(g, c[1], x, y - 1, 2, 1); }
  });
}
function rnShape(style, w, h, pal) {  // un obstacle dessiné une fois : sa forme, ses faces (claire à gauche, sombre à droite), son contour
  const spikes = w > 12 ? [[w * .3, h * .8, w * .3], [w * .66, h, w * .36]] : [[w / 2, h, w / 2]];
  const inside = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false; const X = x + .5, Y = y + .5;
    if (style === 'shard') return spikes.some(([cx, sh, hw]) => Y >= h - sh * (1 - Math.abs(X - cx) / hw));
    if (style === 'pod') return ((X - w / 2) / (w / 2)) ** 2 + ((Y - h * .64) / (h * .36)) ** 2 <= 1 || (y < h * .45 && [w * .3, w * .5, w * .7].some(cx => Math.abs(X - cx) <= Y / (h * .45) * 1.4));
    if (w > 12) return ((X - w * .35) / (w * .35)) ** 2 + ((Y - h) / h) ** 2 <= 1 || ((X - w * .7) / (w * .3)) ** 2 + ((Y - h) / (h * .78)) ** 2 <= 1;
    return ((X - w / 2) / (w / 2)) ** 2 + ((Y - h) / h) ** 2 <= 1;
  };
  const shade = (x, y) => {
    const X = x + .5, Y = y + .5;
    if (style === 'shard') { const s = spikes.filter(([cx, sh, hw]) => Y >= h - sh * (1 - Math.abs(X - cx) / hw)).at(-1); return X < s[0] - .5 ? 3 : X < s[0] + s[2] * .35 ? 2 : 1; }
    if (style === 'pod' && y < h * .3) return 3;
    if (style === 'lava' && (x * 3 + y * 5) % 11 === 0 && inside(x - 1, y) && inside(x + 1, y) && inside(x, y - 1)) return 3;
    const v = X / w * .8 + Y / h * .6; return v < .55 ? (style === 'lava' ? 2 : 3) : v < .95 ? 2 : 1;
  };
  return rnArt(w + 2, h + 1, g => {
    for (let y = -1; y < h; y++) for (let x = -1; x <= w; x++) {
      if (inside(x, y)) px(g, pal[shade(x, y)], x + 1, y + 1);
      else if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1)) px(g, pal[0], x + 1, y + 1);
    }
  });
}
const rnObs = (bi, s) => rnObsC[bi + '-' + s] ||= rnShape(RN_BIOMES[bi].ob.style, RN_OBS[s].w, RN_OBS[s].h, RN_BIOMES[bi].ob.pal);
const rnAir = bi => rnAirC[bi] ||= rnBall(4, RN_BIOMES[bi].air.slice(0, 3));
const RN_STAR = ['...y...', '...y...', '..yhy..', 'yyhwhyy', '..yhy..', '...y...', '...y...'];
const RN_SHIELD = ['..cccc..', '.c....c.', 'c..ww..c', 'c.w....c', 'c......c', 'c......c', '.c....c.', '..cccc..'];
// le Dévoreur : une grosse bête en anneaux, la tête et quatre anneaux de plus en plus petits (dessinés une fois)
const RN_BOSS = {c: ['#a868d8', '#6a2a98', '#3a1258'], head: null, seg: []};
let rn = null;
function rnReset(daily) {
  const cv = $('rnCanvas'); rn = rn || {raf: 0}; const day = rnDay();
  Object.assign(rn, {g: cv.getContext('2d'), mode: 'ready', tick: 0, t: 0, y: 0, vy: 0, onGround: true, coyote: 0, buffer: 0, hold: 0, holding: false, air: 0, dive: false,
    speed: 2, dist: 0, coins: 0, streak: 0, mult: 1, bonus: 0, shield: rnLv('bouclier') > 0, obs: [], stars: [], items: [], parts: [], gap: 120, shake: 0, overAt: 0, banner: null,
    inv: 0, flash: 0, used: false, boss: null, nextBoss: RN.BOSS0, bosses: 0, daily: !!daily, day, rnd: daily ? rnSeed(day) : Math.random, b0: daily ? day % RN_BIOMES.length : 0,
    goal: daily ? {m: [800, 1000, 1200, 1500][day % 4], s: [30, 45, 60][Math.floor(day / 4) % 3]} : null, done: false, lastBiome: -1});
  rn.g.imageSmoothingEnabled = false;
}
function rnStart(daily) {
  rnReset(daily); $('rnInfo').textContent = 'Espace : sauter · bas : retomber vite · P : pause'; rnStats();
  gameLoop(rn, 'neodex:runner', rnUpdate, rnDraw);
}
const rnScore = () => Math.floor(rn.dist / 10) + rn.coins * 25 + rn.bonus;
function rnPress(down) {
  if (!rn) return;
  rn.holding = down;
  if (!down) return;
  if (rn.mode === 'ready' || rn.mode === 'pause') { rn.mode = 'play'; rnStats(); return; }
  if (rn.mode === 'over') { if (Date.now() - rn.overAt > 600) { rnReset(rn.daily); rn.mode = 'play'; rnStats(); } return; }
  if (!rn.onGround && rn.coyote <= 0 && rn.air >= 1 && rn.air < (rnLv('triple') ? 3 : 2)) {  // double saut (triple avec le pouvoir)
    rn.vy = 3.8; rn.air++; rn.hold = 8; S('click'); rnBurst(RN.HX + 4, RN.G - rn.y - 4, 8, '#bff4ff', 1.2, 12); return;
  }
  rn.buffer = 7;  // un appui juste avant d'atterrir compte encore
}
function rnBurst(x, y, n, c, sp = 1.4, life = 16) { for (let k = 0; k < n; k++) rn.parts.push({x, y, vx: Math.cos(k * 6.283 / n) * sp, vy: Math.sin(k * 6.283 / n) * sp, life, c}); }
function rnOver() {
  rn.mode = 'over'; rn.overAt = Date.now(); rn.shake = 10; S('error');
  for (let k = 0; k < 18; k++) rn.parts.push({x: RN.HX + 8, y: RN.G - 10 - rn.y, vx: (Math.random() - .5) * 4, vy: (Math.random() - .7) * 4, life: 30, c: ['#f4f0ff', '#3fd0ff', '#ff8a3a'][k % 3]});
  const sc = rnScore(), m = Math.floor(rn.dist / 10), rec = best('runner', sc); best('runnerM', m);
  rns.bank += rn.coins; rns.games++;
  if (rn.daily) { const d = rns.daily.day === rn.day ? rns.daily : {day: rn.day, best: 0, done: false}; rns.daily = {day: rn.day, best: Math.max(d.best, m), done: d.done || rn.done}; }
  saveGames(); rnStats();
  $('rnInfo').textContent = 'Score ' + sc + (rec ? ' · NOUVEAU RECORD !' : ' · record ' + games.best.runner);
}
function rnHurt(byBoss, o) {  // un choc : le bouclier l'encaisse, sinon la seconde chance, sinon c'est fini (le Dévoreur ne se laisse pas arrêter par le bouclier)
  if (!byBoss && rn.inv > 0) return;
  if (!byBoss && rn.shield) { rn.shield = false; o.gone = true; rn.shake = 6; S('error'); rnBurst(o.x + 4, o.kind === 'a' ? o.y : RN.G - 6, 14, '#7fe0ee', 2, 20); if (rn.boss?.in) rn.boss.x += 12; return; }
  if (rnLv('chance') && !rn.used) { rn.used = true; rn.inv = 120; rn.obs = rn.obs.filter(q => q.x > RN.HX + 90); if (rn.boss) rn.boss.x = Math.min(rn.boss.x, -64); rn.banner = {text: 'SECONDE CHANCE', t: 80}; rn.shake = 6; S('launch'); return; }
  rnOver();
}
function rnUpdate() {
  rn.t++; const R = rn.rnd, G = RN.G, HX = RN.HX;
  rn.speed = Math.min(4.8, 2 + rn.t / 2400);
  rn.dist += rn.speed; if (rn.inv > 0) rn.inv--; if (rn.flash > 0) rn.flash--;
  if (rn.onGround) rn.coyote = 6; else rn.coyote--;
  if (rn.buffer > 0) { rn.buffer--; if (rn.coyote > 0) { rn.vy = 4.6; rn.onGround = false; rn.coyote = 0; rn.buffer = 0; rn.hold = 12; rn.air = 1; S('click'); for (let k = 0; k < 5; k++) rn.parts.push({x: HX + 6, y: G, vx: -Math.random() * 1.5, vy: -Math.random(), life: 14, c: RN_BIOMES[rnBiomeAt(Math.floor(rn.dist / 10))].gr[1]}); } }
  const grav = rn.dive ? .9 : rn.holding && rn.hold > 0 && rn.vy > 0 ? .16 : .34; if (rn.hold > 0) rn.hold--;
  if (!rn.onGround) { rn.vy -= grav; rn.y += rn.vy; if (rn.y <= 0) { rn.y = 0; rn.vy = 0; rn.onGround = true; rn.air = 0; for (let k = 0; k < 4; k++) rn.parts.push({x: HX + 4 + k * 2, y: G, vx: (Math.random() - .5) * 1.2, vy: -Math.random() * .6, life: 12, c: '#e8dcff'}); if (rn.dive) rn.shake = 3; } }
  const m = Math.floor(rn.dist / 10), bi = rnBiomeAt(m), chase = rn.boss && rn.boss.t <= RN.BOSSLEN;
  // obstacles : l'écart laisse toujours le temps d'un saut à la vitesse du moment ; pendant la poursuite, plus d'étoiles
  rn.gap -= rn.speed;
  if (rn.gap <= 0) {
    const level = Math.min(1, rn.t / 7200), r = R(), x = RN.W + 10;
    if (rn.t > 1500 && r < .22 + level * .1) rn.obs.push({kind: 'a', b: bi, x, y: G - 36 + Math.floor(R() * 3), w: 9, h: 8});  // passe au-dessus d'un héros resté au sol
    else { const s = r < .55 ? 0 : r < .8 ? 1 : 2; rn.obs.push({kind: 'g', b: bi, s, x, w: RN_OBS[s].w, h: RN_OBS[s].h}); }
    if (R() < (chase ? .8 : .4)) { const sx = x + 30 + R() * 40, sy = G - 30 - R() * 30, n = chase ? 3 + Math.floor(R() * 3) : R() < .4 ? 3 : 1; for (let k = 0; k < n; k++) rn.stars.push({x: sx + k * 14, y: sy - (k % 3) * 4}); }
    if (!rn.shield && !rn.items.length && R() < .06) rn.items.push({x: x + 60, y: G - 34});
    rn.gap = rn.speed * (2 * 4.6 / .34 + 14) + R() * (160 - level * 70);
  }
  for (const o of rn.obs) o.x -= rn.speed; for (const s of rn.stars) s.x -= rn.speed; for (const i of rn.items) i.x -= rn.speed;
  const mag = [0, 26, 40, 56][rnLv('aimant')], cx = HX + 8, cy = G - 10 - rn.y;
  if (mag) for (const s of rn.stars) if (Math.hypot(s.x - cx, s.y - cy) < mag) { s.x += (cx - s.x) * .25; s.y += (cy - s.y) * .25; }
  if (rn.stars.some(s => s.x < 20)) { rn.streak = 0; rn.mult = 1; }  // une étoile laissée derrière : la série s'arrête
  rn.obs = rn.obs.filter(o => o.x > -30); rn.stars = rn.stars.filter(s => s.x > 20); rn.items = rn.items.filter(i => i.x > -10);
  const top = G - 20 - rn.y, hit = (x, y, w, h) => HX + 4 < x + w && HX + 12 > x && top + 3 < y + h && G - rn.y > y;  // une boîte un peu plus petite que le dessin
  for (const s of rn.stars) if (hit(s.x - 3, s.y - 3, 7, 7)) {
    s.got = true; rn.streak++; rn.mult = Math.min(4, 1 + Math.floor(rn.streak / 5)); rn.coins += rn.mult; S('notify'); rnBurst(s.x, s.y, 8, '#ffd07a');
    if (rn.boss?.in && rn.boss.t <= RN.BOSSLEN) rn.boss.x = Math.max(-60, rn.boss.x - 4);  // chaque étoile repousse le Dévoreur
    if (rn.streak % 5 === 0) rn.banner = {text: 'SÉRIE ×' + rn.mult, t: 60};
  }
  rn.stars = rn.stars.filter(s => !s.got);
  for (const i of rn.items) if (hit(i.x - 4, i.y - 4, 8, 8)) { i.got = true; rn.shield = true; S('launch'); rnBurst(i.x, i.y, 10, '#7fe0ee'); rn.banner = {text: 'BOUCLIER', t: 60}; }
  rn.items = rn.items.filter(i => !i.got);
  const bad = rn.obs.find(o => !o.gone && (o.kind === 'a' ? hit(o.x, o.y, o.w, o.h) : hit(o.x + 1, G - o.h + 1, o.w - 2, o.h - 1)));
  if (bad) rnHurt(false, bad);
  if (rn.mode !== 'play') return;
  rn.obs = rn.obs.filter(o => !o.gone);
  // le Dévoreur : il arrive à 800 m puis tous les 1500 m, avance doucement ; s'il touche le héros, c'est fini ; après 30 s il abandonne
  if (!rn.boss && m >= rn.nextBoss) { rn.boss = {x: -120, t: 0, in: false}; rn.banner = {text: 'LE DÉVOREUR ARRIVE !', t: 100}; rn.shake = 8; S('error'); }
  if (rn.boss) {
    const b = rn.boss; b.t++;
    if (b.t > RN.BOSSLEN) { b.x -= 2.5; if (b.x < -130) { rn.boss = null; rn.bonus += 300; rn.bosses++; rns.bosses = (rns.bosses || 0) + 1; rn.nextBoss = m + RN.BOSSGAP; rn.banner = {text: 'DÉVOREUR SEMÉ ! +300', t: 90}; S('launch'); } }
    else if (!b.in) { b.x += 1.2; if (b.x >= -34) { b.x = -34; b.in = true; } }
    else { b.x += .025; if (b.x + 56 >= HX + 4) { rnHurt(true); if (rn.mode !== 'play') return; } }
  }
  if (rn.banner && --rn.banner.t <= 0) rn.banner = null;
  if (bi !== rn.lastBiome) { if (rn.lastBiome >= 0) { rn.banner = {text: m + ' M · ' + RN_BIOMES[bi].name, t: 110}; rn.flash = 16; S('launch'); } rn.lastBiome = bi; }
  if (rn.daily && !rn.done && m >= rn.goal.m && rn.coins >= rn.goal.s) {  // le défi du jour réussi : 100 étoiles, une fois par jour
    rn.done = true; rn.banner = {text: 'DÉFI RÉUSSI ! +100', t: 120}; S('launch');
    if (!(rns.daily.day === rn.day && rns.daily.done)) rns.bank += 100;
    rns.daily = {day: rn.day, best: Math.max(rns.daily.day === rn.day ? rns.daily.best || 0 : 0, m), done: true}; saveGames();
  }
  for (const p of rn.parts) { p.x += p.vx; p.y += p.vy; p.vy += .08; p.life--; }
  rn.parts = rn.parts.filter(p => p.life > 0);
}
function rnBossDraw(g, bx, t) {  // la tête à droite (gueule qui s'ouvre et se ferme, yeux jaunes), les anneaux derrière qui ondulent
  const C = RN_BOSS.c, G = RN.G; RN_BOSS.head ||= rnBall(24, C); if (!RN_BOSS.seg.length) for (const r of [21, 18, 15, 12]) RN_BOSS.seg.push(rnBall(r, C));
  const hx = Math.round(bx + 30), hy = G - 26;
  for (let k = 4; k >= 1; k--) { const s = RN_BOSS.seg[k - 1], cx = hx - k * 20, cy = hy + 4 + k * 2 + Math.round(Math.sin(t / 9 + k) * 3); g.drawImage(s, cx - (s.width >> 1), cy - (s.height >> 1)); for (let j = -1; j <= 1; j++) px(g, '#1a0628', cx + j * 6 - 1, cy - s.height / 2 - 2 + Math.abs(j), 3, 3); }
  const H = RN_BOSS.head; g.drawImage(H, hx - (H.width >> 1), hy - (H.height >> 1));
  const a = .18 + .3 * (Math.sin(t / 7) + 1) / 2;  // la gueule, côté droit
  for (let y = -24; y <= 24; y++) for (let x = 4; x <= 24; x++) { const d = Math.hypot(x, y); if (d > 24 || d < 6 || Math.abs(Math.atan2(y, x)) > a) continue; px(g, d > 20 ? '#ff3a6a' : '#1a0010', hx + x, hy + y + 4); }
  for (let k = 0; k < 4; k++) { const d = 9 + k * 4; for (const s of [-1, 1]) { const ang = s * a, x = hx + Math.round(Math.cos(ang) * d), y = hy + 4 + Math.round(Math.sin(ang) * d); px(g, '#ffffff', x, y - (s > 0 ? 2 : 0), 2, 2); } }
  for (const [ex, ey] of [[6, -15], [14, -10]]) { px(g, '#1a0628', hx + ex - 1, hy + ey - 1, 5, 5); px(g, (t >> 4) % 9 ? '#ffe24a' : '#1a0628', hx + ex, hy + ey, 3, 3); px(g, '#1a0010', hx + ex + 1, hy + ey + 1, 1, 1); }
}
function rnDraw() {
  const g = rn.g, W = RN.W, H = RN.H, G = RN.G, HX = RN.HX, tk = rn.tick, sh = rn.shake > 0 ? (rn.shake--, Math.round((Math.random() - .5) * 4)) : 0;
  const m = Math.floor(rn.dist / 10), bi = rnBiomeAt(m), B = RN_BIOMES[bi], d = rn.dist;
  g.save(); g.translate(sh, 0); g.imageSmoothingEnabled = false;
  g.drawImage(rnSky(bi), 0, 0);
  for (let i = 0; i < 12; i++) if ((tk + i * 17) % 70 < 8) { const x = (i * 97 + 13) % W, y = (i * 53 + 7) % 80; px(g, '#ffffff', x, y); px(g, 'rgba(255,255,255,.5)', x - 1, y); px(g, 'rgba(255,255,255,.5)', x + 1, y); px(g, 'rgba(255,255,255,.5)', x, y - 1); px(g, 'rgba(255,255,255,.5)', x, y + 1); }
  if (B.aurora) for (let x = 0; x < W; x += 2) { const y = Math.round(22 + 10 * Math.sin((x + tk * .4) / 47) + 4 * Math.sin((x - tk * .2) / 19)); px(g, 'rgba(90,255,176,.22)', x, y, 2, 7); px(g, 'rgba(90,220,255,.14)', x, y + 7, 2, 7); px(g, 'rgba(180,120,255,.08)', x, y + 14, 2, 8); }
  // les reliefs lointains (avec les volcans qui rougeoient et les champignons géants), puis les proches
  const o1 = d * .15, o2 = d * .4;
  for (let x = 0; x < W; x += 2) {
    const X = x + o1, h = Math.round(rnFar(B.farK, X)); px(g, B.far, x, G - h, 2, h); px(g, B.farHi, x, G - h, 2, 1);
    if (B.farK === 'volcano') { const p = X - Math.floor(X / 170) * 170; if (Math.abs(p - 85) < 8) px(g, (tk >> 3) % 2 ? '#ffd040' : '#ff8a1a', x, G - h, 2, 2); if (Math.abs(p - 85) < 1) for (let j = 0; j < 4; j++) px(g, 'rgba(255,150,50,.6)', x + Math.round(Math.sin(tk / 9 + j) * 2), G - h - (tk * .5 + j * 9) % 30, 1, 2); }
  }
  if (B.farK === 'mush') for (let k = Math.floor((o1 - 60) / 90); k * 90 - o1 < W + 60; k++) {
    const X = Math.round(k * 90 + rh(k) * 30 - o1), sh2 = Math.round(34 + rh(k + 7) * 22), cw = Math.round(26 + rh(k + 3) * 14), ch = 9;
    px(g, B.far, X - 3, G - sh2, 6, sh2);
    for (let j = 0; j < ch; j++) { const hw = Math.round(cw / 2 * Math.sqrt(1 - ((ch - j) / ch) ** 2)); px(g, B.far, X - hw, G - sh2 - ch + j, hw * 2, 1); }
    px(g, B.farHi, X - 4, G - sh2 - ch, 8, 1); px(g, B.farHi, X - cw / 4, G - sh2 - 4, 2, 2); px(g, B.farHi, X + cw / 5, G - sh2 - 6, 2, 2);
  }
  if (bi === 0) for (let k = Math.floor((o2 - 80) / 160); k * 160 - o2 < W + 80; k++) { const X = Math.round(k * 160 + rh(k) * 60 - o2), w = Math.round(34 + rh(k + 3) * 20), h = Math.round(24 + rh(k + 5) * 14); for (let j = 0; j < h; j++) { const ins = Math.round(7 * (1 - j / h) ** 2); px(g, B.mid, X + ins, G - h + j, w - ins * 2, 1); px(g, B.midHi, X + ins, G - h + j, 1, 1); } px(g, B.midHi, X + 7, G - h, w - 14, 1); for (let k2 = 1; k2 < 4; k2++) px(g, 'rgba(0,0,0,.18)', X + Math.round(w * k2 / 4), G - h + 3 + k2 % 2 * 2, 1, h - 3); }  // des plateaux
  if (bi === 1) for (let k = Math.floor((o2 - 60) / 120); k * 120 - o2 < W + 60; k++) { const X = Math.round(k * 120 + rh(k) * 50 - o2); for (const [dx, hh] of [[0, 22], [6, 14], [-5, 12]]) for (let j = 0; j < hh; j++) { const hw = Math.ceil((j + 1) / hh * 3); px(g, j < 2 ? '#e0d0ff' : B.midHi, X + dx - hw, G - hh + j, hw, 1); px(g, B.mid, X + dx, G - hh + j, hw, 1); } }  // des grappes de cristaux
  for (let x = 0; x < W; x += 2) { const X = x + o2, h = Math.round(10 + 7 * Math.sin(X / 43 + 2) + 3 * Math.sin(X / 19)); px(g, B.mid, x, G - h, 2, h); px(g, B.midHi, x, G - h, 2, 1); }
  // le sol, et ses petits détails qui défilent avec lui
  const tile = rnGround(bi); for (let x = -Math.round(d % 32); x < W; x += 32) g.drawImage(tile, x, G);
  for (let k = Math.floor(d / 29); k * 29 - d < W; k++) { if (rh(k + 77) > .35) continue; const x = Math.round(k * 29 - d), c = B.gr;
    if (bi === 0) { px(g, c[3], x, G - 2, 4, 2); px(g, c[0], x + 1, G - 2, 2, 1); } else if (bi === 1) { px(g, B.ob.pal[2], x + 1, G - 4, 1, 4); px(g, B.ob.pal[3], x, G - 2, 1, 2); px(g, B.ob.pal[1], x + 2, G - 3, 1, 3); }
    else if (bi === 2) { px(g, '#ffffff', x, G - 2, 5, 2); px(g, c[1], x + 1, G - 3, 3, 1); } else if (bi === 3) { px(g, '#ff6a1a', x - 8, G + 9, 9, 1); px(g, '#ffb03a', x - 5, G + 10, 3, 1); px(g, '#ff6a1a', x + 1, G + 10, 4, 1); px(g, c[1], x, G - 2, 4, 2); if ((tk + k * 7) % 40 < 20) px(g, 'rgba(140,140,140,.5)', x + 1, G - 6 - (tk + k * 7) % 20 / 4, 2, 2); }
    else { px(g, c[0], x, G - 3, 1, 3); px(g, c[0], x + 2, G - 4, 1, 4); px(g, c[1], x + 4, G - 2, 1, 2); } }
  // étoiles, boucliers, obstacles
  for (const s of rn.stars) { const tw = (tk >> 3) % 2, x = Math.round(s.x), y = Math.round(s.y + Math.sin(tk / 14 + s.x) * 1.5); px(g, 'rgba(255,208,122,.25)', x - 4, y - 4, 9, 9); sprite(g, RN_STAR, x - 3, y - 3, {y: '#ffd07a', h: '#ffe9b0', w: tw ? '#ffffff' : '#fff6d8'}); }
  for (const i of rn.items) { const y = Math.round(i.y + Math.sin(tk / 10) * 2); sprite(g, RN_SHIELD, Math.round(i.x) - 4, y - 4, {c: (tk >> 3) % 2 ? '#7fe0ee' : '#bff4ff', w: '#ffffff'}); }
  for (const o of rn.obs) {
    const x = Math.round(o.x);
    if (o.kind === 'a') { const A = RN_BIOMES[o.b].air; for (let k = 0; k < 12; k++) px(g, A[Math.min(3, k >> 2)], x + o.w + k * 2, o.y + 2 + (k + (tk >> 2)) % 3, k < 6 ? 2 : 1, k < 6 ? 2 : 1); g.drawImage(rnAir(o.b), x, o.y - 1); }
    else { px(g, 'rgba(0,0,0,.3)', x - 1, G, o.w + 3, 2); g.drawImage(rnObs(o.b, o.s), x - 1, G - o.h - 1); }
  }
  if (rn.boss) rnBossDraw(g, rn.boss.x, tk);
  // le héros : ombre, flamme du sac au double saut, clignote après la seconde chance
  const top = Math.round(G - 20 - rn.y), f = !rn.onGround ? (rn.vy > 0 ? 'jump' : 'fall') : rn.mode === 'play' ? 'run' + ((rn.t >> 2) % 4) : 'run1';
  px(g, 'rgba(0,0,0,.35)', HX + 3 + Math.round(rn.y / 12), G, Math.max(4, 11 - Math.round(rn.y / 6)), 2);
  if (rn.air >= 2 && rn.vy > 0) { px(g, '#ffd040', HX + 2, top + 11, 2, 3 + (tk & 1)); px(g, '#ff6a1a', HX + 2, top + 14, 2, 2); }
  if (rn.dive && !rn.onGround) for (let k = 0; k < 3; k++) px(g, 'rgba(255,255,255,.5)', HX + 3 + k * 4, top - 4 - k * 2, 1, 4);
  if (rn.mode !== 'over' && !(rn.inv && (tk >> 2) % 2) || rn.mode === 'over' && (tk >> 2) % 2) g.drawImage(rnHero(f), HX, top);
  if (rn.shield) { const c = (tk >> 2) % 2 ? '#7fe0ee' : '#bff4ff'; for (let a = 0; a < 28; a++) { const t = a / 28 * 6.283; px(g, c, HX + 8 + Math.round(Math.cos(t) * 13), top + 10 + Math.round(Math.sin(t) * 13)); } }
  for (const p of rn.parts) px(g, p.c, p.x, p.y, 2, 2);
  // la météo, devant tout
  if (B.fx === 'dust') for (let i = 0; i < 18; i++) px(g, B.fxc, wrap(i * 71 - tk * (3 + i % 3), W + 10) - 5, 60 + (i * 37) % 88, 4 + i % 4, 1);
  if (B.fx === 'sparkle') for (let i = 0; i < 16; i++) if ((tk + i * 11) % 40 < 10) { const x = Math.round(wrap(i * 83 - d * .3, W)), y = 20 + (i * 47) % 120; px(g, B.fxc, x, y); px(g, 'rgba(200,248,255,.5)', x - 1, y, 3, 1); px(g, 'rgba(200,248,255,.5)', x, y - 1, 1, 3); }
  if (B.fx === 'snow') for (let i = 0; i < 50; i++) { const v = .5 + (i % 3) * .35, s = i % 3 === 2 ? 2 : 1; px(g, '#ffffff', wrap(i * 53 - tk * (.6 + v), W), (i * 97 + tk * v) % G, s, s); }
  if (B.fx === 'ember') for (let i = 0; i < 24; i++) px(g, i % 2 ? '#ffb03a' : '#ff5a1a', wrap(i * 67 - tk * 1.2 - d * .2, W), G - (i * 41 + tk * (.4 + (i % 3) * .2)) % G, 1 + (i % 4 === 0), 1 + (i % 4 === 0));
  if (B.fx === 'spore') for (let i = 0; i < 20; i++) { const x = Math.round(wrap(i * 79 - d * .25 + Math.sin(tk / 30 + i) * 6, W)), y = Math.round(30 + wrap(i * 53 + Math.sin(tk / 40 + i) * 10, 110)); px(g, 'rgba(200,255,138,.25)', x - 1, y - 1, 4, 4); px(g, B.fxc, x, y, 2, 2); }
  if (rn.flash) { g.globalAlpha = rn.flash / 16 * .7; px(g, '#ffffff', -4, 0, W + 8, H); g.globalAlpha = 1; }
  g.restore();
  // l'affichage : étoiles et série, score et record, biome et distance jusqu'au suivant, le Dévoreur
  px(g, 'rgba(8,3,24,.65)', 3, 3, 62, 14); sprite(g, RN_STAR, 6, 6, {y: '#ffd07a', h: '#ffe9b0', w: '#ffffff'});
  pxFont(g, String(rn.coins), 16, 13, '#ffd07a'); if (rn.mult > 1) pxFont(g, '×' + rn.mult, 61, 13, '#ff5ad9', 8, 'right');
  px(g, 'rgba(8,3,24,.65)', W - 86, 3, 83, 25); pxFont(g, String(rnScore()).padStart(6, '0'), W - 6, 13, '#ffffff', 8, 'right'); pxFont(g, 'RECORD ' + String(games?.best.runner ?? 0).padStart(6, '0'), W - 6, 24, '#b9a4e8', 8, 'right');
  px(g, 'rgba(8,3,24,.65)', W / 2 - 52, 3, 104, 19); pxFont(g, B.name, W / 2, 12, '#ffffff', 8, 'center'); px(g, '#2a1a4a', W / 2 - 46, 16, 92, 3); px(g, B.farHi, W / 2 - 46, 16, Math.round(92 * (m % RN.BIOME) / RN.BIOME), 3);
  if (rn.boss && rn.boss.t <= RN.BOSSLEN) { const near = Math.max(0, Math.min(1, (rn.boss.x + 60) / (HX + 4 - 56 + 60))); px(g, 'rgba(8,3,24,.65)', W / 2 - 52, 24, 104, 19); pxFont(g, 'DÉVOREUR', W / 2, 33, '#ff3a6a', 8, 'center'); px(g, '#2a1a4a', W / 2 - 46, 37, 92, 3); px(g, '#ff3a6a', W / 2 - 46, 37, Math.round(92 * near), 3); px(g, '#ffd07a', W / 2 - 46, 41, Math.round(92 * (1 - rn.boss.t / RN.BOSSLEN)), 1); }
  if (rn.banner && rn.mode === 'play') gameText(g, W, [[rn.banner.text, '#ffd07a', 16]], 62);
  const goal = rn.goal ? 'Défi du jour : ' + rn.goal.m + ' m et ' + rn.goal.s + ' étoiles' : null;
  if (rn.mode === 'ready') gameText(g, W, [['SAUT STELLAIRE', '#ff5ad9', 16], [goal || "Espace : sauter · en l'air : double saut", goal ? '#ffd07a' : '#f4ecff'], ['Obstacles : saute · météores : reste au sol', '#b9a4e8'], ['Appuie pour commencer', '#ffd07a']], 60);
  if (rn.mode === 'pause') gameText(g, W, [['PAUSE', '#ff5ad9', 16], ['Espace pour reprendre', '#ffffff']], 70);
  if (rn.mode === 'over') gameText(g, W, [['PERDU', '#ff5ad9', 16], ['Score ' + rnScore() + ' · ' + m + ' m', '#ffffff'], ['+' + rn.coins + ' étoiles · en banque : ' + rns.bank, '#ffd07a'], ...(rn.daily ? [[rn.done ? 'DÉFI RÉUSSI !' : goal, rn.done ? '#5fdf6a' : '#d9c6ff']] : []), ['Espace pour rejouer', '#d9c6ff']], 50);
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
$('rnCanvas').onpointerup = $('rnCanvas').onpointerleave = () => rnPress(false);
function rnStats() {
  setTimeout(rnTrophies);
  const dl = rns.daily.day === rnDay() ? (rns.daily.done ? 'réussi' : (rns.daily.best || 0) + ' m') : '—';
  $('rnStats').replaceChildren(...[['Record', games.best.runner ?? 0], ['Plus loin', (games.best.runnerM ?? 0) + ' m'], ['Dévoreurs semés', rns.bosses || 0], ['Défi du jour', dl]].flatMap(([k, v]) => [el('span', '', k), el('b', '', String(v))]));
  $('rnBank').textContent = 'Étoiles en banque : ' + rns.bank;
  $('rnShop').replaceChildren(...RN_UP.map(u => {  // les pouvoirs : un niveau de plus par achat, hors partie
    const lv = rnLv(u.id), max = lv >= u.price.length, price = u.price[lv], row = el('div', 'rnUp'), txt = el('div'), btn = el('button', 'btn' + (max ? '' : ' main'), max ? 'acquis' : price + ' ★');
    btn.disabled = max || rns.bank < price || rn?.mode === 'play';
    txt.append(el('span', '', u.name + (u.price.length > 1 ? ' ' + lv + '/' + u.price.length : '')), el('em', '', u.txt)); row.append(txt, btn);
    btn.onclick = () => { if (btn.disabled) return; rns.bank -= price; rns.up[u.id] = lv + 1; if (u.id === 'bouclier' && rn?.mode === 'ready') rn.shield = true; saveGames(); rnStats(); btn.blur(); };
    return row;
  }));
}
$('rnNew').onclick = () => { $('rnNew').blur(); rnStart(); };
$('rnDaily').onclick = () => { $('rnDaily').blur(); rnStart(true); };
$('rnFs').onclick = () => { $('rnFs').blur(); try { document.fullscreenElement ? document.exitFullscreen() : $('rnCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
{  // vérification : sauts (le triple seulement acheté), le Dévoreur (rattrape sans étoiles, lâche avec), la seconde chance, l'aimant, le même parcours pour le défi du jour, cinq biomes
  const keep = rn, kS = JSON.stringify(rns), kB = JSON.stringify(games.best), bad = []; rnMute = true;
  const sim = (n, f) => { for (let i = 0; i < n && rn.mode === 'play'; i++) { f?.(i); rnUpdate(); } };
  const go = () => { rn.mode = 'play'; rn.nextBoss = 1e9; rn.shield = false; };
  rns.up = {}; rnReset(); go(); rnPress(true); let hi = 0; sim(60, () => { rn.gap = 999; hi = Math.max(hi, rn.y); }); if (hi < RN_OBS[1].h + 12) bad.push('saut ' + hi);
  const jumps = () => { rnReset(); go(); rnPress(true); rnPress(false); sim(8, () => { rn.gap = 999; }); rnPress(true); rnPress(false); const a = rn.air; rnPress(true); rnPress(false); return [a, rn.air]; };
  const j2 = jumps(); rns.up.triple = 1; const j3 = jumps(); if (j2.join() !== '2,2' || j3.join() !== '2,3') bad.push('sauts ' + j2 + ' / ' + j3);
  rns.up = {}; rnReset(); rn.mode = 'play'; rn.dist = RN.BOSS0 * 10; sim(RN.BOSSLEN + 200, () => { rn.obs = []; rn.stars = []; rn.gap = 999; }); if (rn.mode !== 'over') bad.push('le Dévoreur ne rattrape pas');
  rnReset(); rn.mode = 'play'; rn.dist = RN.BOSS0 * 10; sim(RN.BOSSLEN + 300, i => { rn.obs = []; rn.gap = 999; if (i % 150 === 0) rn.stars = [{x: RN.HX + 8, y: RN.G - 10}]; });
  if (rn.mode !== 'play' || rn.boss || rn.bosses !== 1) bad.push('le Dévoreur ne lâche pas : ' + rn.mode + ' ' + rn.bosses);
  rns.up = {chance: 1}; const rock = () => [{kind: 'g', b: 0, s: 1, x: RN.HX + 4, w: 9, h: 17}];
  rnReset(); go(); rn.obs = rock(); rnUpdate(); const alive = rn.mode === 'play' && rn.used; rn.inv = 0; rn.obs = rock(); rnUpdate(); if (!alive || rn.mode !== 'over') bad.push('seconde chance');
  rns.up = {aimant: 2}; rnReset(); go(); rn.stars = [{x: RN.HX + 40, y: RN.G - 12}]; sim(12, () => { rn.obs = []; rn.gap = 999; }); if (rn.coins < 1) bad.push('aimant');
  rns.up = {}; const course = () => { rnReset(true); go(); sim(900, () => { rn.inv = 1e9; }); return rn.obs.map(o => o.kind + o.s + Math.round(o.x)).join(',') + '|' + rn.stars.length; };
  const c1 = course(); if (!c1.includes(',') || c1 !== course()) bad.push('défi du jour pas pareil');
  rnReset(); if (new Set([0, 600, 1200, 1800, 2400].map(rnBiomeAt)).size !== 5) bad.push('biomes');
  console.assert(!bad.length, 'saut stellaire', bad);
  Object.assign(rns, JSON.parse(kS)); games.best = JSON.parse(kB); rn = keep; rnMute = false;
}
$('rnCanvas').__rn = {st: () => rn, go: m => { rn.dist = m * 10; }, biome: () => RN_BIOMES[rnBiomeAt(Math.floor(rn.dist / 10))].name, rns, info: () => rnStats()};
  // ---- fin ----
  // les trophées, tirés des statistiques et des records gardés (aussi à l'ouverture : ce qui a été fait avant compte)
  function rnTrophies() {
    const b = games.best, m = b.runnerM || 0, up = RN_UP.every(u => rnLv(u.id) >= u.price.length), sig = [b.runner, m, rns.bosses, rns.daily.done, up].join(); if (sig === rnTrophies.sig) return; rnTrophies.sig = sig;
    trophyRecord('score', b.runner || null); trophyRecord('distance', m || null);
    if (m >= 600) trophy('m600'); if (m >= 1200) trophy('m1200'); if (m >= 2400) trophy('m2400'); if (m >= 5000) trophy('m5000');
    if (rns.bosses >= 1) trophy('boss'); if (rns.bosses >= 10) trophy('boss10'); if (rns.daily.done) trophy('defi'); if (up) trophy('equipe');
  }
  ctx.onOpen(() => { rn ? gameLoop(rn, 'neodex:runner', rnUpdate, rnDraw) : rnStart(); rnStats(); });
}
