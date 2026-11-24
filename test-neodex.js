// lancé par le test « local » de NeoDex : une partie lancée au clavier, un saut, les cinq biomes (tous les 600 m), le Dévoreur,
// un pouvoir acheté, le défi du jour, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const key = (k, type = 'keydown') => pj(`document.dispatchEvent(new KeyboardEvent('${type}', {key: '${k}', bubbles: true})), 0`);
  const R = code => pj(`(() => { const T = document.getElementById('rnCanvas').__rn, rn = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('rnCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'saut-stellaire-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  await pj(`document.getElementById('rnNew').click(), 0`); await sleep(400); await shot('0-pret');
  await key(' '); await key(' ', 'keyup'); await sleep(300);
  if (await R(`return rn.mode;`) !== 'play') throw new Error('la partie devait commencer');
  await R(`rn.nextBoss = 1e9; window.__keep = setInterval(() => { rn.shield = true; rn.obs = rn.obs.filter(o => o.x > 120); }, 30); return 0;`);  // sans obstacle proche, le test ne perd pas
  await key(' '); await sleep(150); const y = await R(`return rn.y;`); await key(' ', 'keyup');
  if (!(y > 3)) throw new Error('le saut ne monte pas : ' + y);
  const biomes = [];
  for (const m of [0, 600, 1200, 1800, 2400]) { await R(`T.go(${m + 5}); return 0;`); await sleep(1400); biomes.push(await R(`return T.biome();`)); await shot((m / 600 + 1) + '-' + m + 'm'); }
  if (new Set(biomes).size !== 5) throw new Error('biomes : ' + biomes);
  // le Dévoreur arrive par la gauche ; une étoile le repousse
  await R(`rn.nextBoss = 0; return 0;`); await sleep(2200);
  const bx = await R(`return rn.boss && rn.boss.in ? rn.boss.x : null;`); await shot('6-devoreur');
  if (bx == null) throw new Error('le Dévoreur n’arrive pas');
  await R(`rn.stars.push({x: 48, y: 140}); return 0;`); await sleep(200);
  const bx2 = await R(`return rn.boss ? rn.boss.x : null;`);
  if (!(bx2 < bx)) throw new Error('l’étoile ne repousse pas le Dévoreur : ' + bx + ' puis ' + bx2);
  await pj(`clearInterval(__keep), 0`); await R(`rn.boss = null; rn.mode = 'pause'; return 0;`);
  // un pouvoir : avec assez d'étoiles en banque, le premier bouton achète l'aimant
  await R(`T.rns.bank = 1000; T.rns.up = {}; T.info(); return 0;`); await sleep(100);
  await pj(`document.querySelector('#rnShop .btn').click(), 0`); await sleep(100);
  const up = await R(`return [T.rns.up.aimant, T.rns.bank];`);
  if (up[0] !== 1 || up[1] !== 920) throw new Error('achat : ' + JSON.stringify(up));
  await R(`T.rns.bank = 0; T.rns.up = {}; T.info(); return 0;`);
  // le défi du jour : un objectif affiché avant de partir
  await pj(`document.getElementById('rnDaily').click(), 0`); await sleep(400); await shot('7-defi');
  const daily = await R(`return rn.daily && rn.goal ? rn.goal.m + ' m, ' + rn.goal.s + ' étoiles' : null;`);
  if (!daily) throw new Error('pas de défi du jour');
  await pj(`document.getElementById('rnFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('rnCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l’écran');
  const L = await pj(`(() => { const r = document.getElementById('rnCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('rnCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(L));
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  return 'saut ' + Math.round(y) + ' px · biomes : ' + biomes.join(', ') + ' · Dévoreur repoussé · aimant acheté · défi ' + daily + ' · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
