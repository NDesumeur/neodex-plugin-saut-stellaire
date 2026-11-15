// lancé par le test « local » de NeoDex : une partie lancée au clavier, des sauts, les quatre planètes (tous les 1000 m),
// le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const key = (k, type = 'keydown') => pj(`document.dispatchEvent(new KeyboardEvent('${type}', {key: '${k}', bubbles: true})), 0`);
  const R = code => pj(`(() => { const T = document.getElementById('rnCanvas').__rn; ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('rnCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'saut-stellaire-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  await pj(`document.getElementById('rnNew').click(), 0`); await sleep(400); await shot('0-pret');
  await key(' '); await key(' ', 'keyup'); await sleep(300);
  if (await R(`return T.st().mode;`) !== 'play') throw new Error('la partie devait commencer');
  await R(`T.st().shield = true; return 0;`);  // un bouclier pour que le test ne perde pas tout de suite
  await key(' '); await sleep(150); const y = await R(`return T.st().y;`); await key(' ', 'keyup');
  if (!(y > 3)) throw new Error('le saut ne monte pas : ' + y);
  const worlds = [];
  for (const m of [0, 1000, 2000, 3000]) { await R(`T.st().obs = []; T.st().shield = true; T.go(${m + 5}); return 0;`); await sleep(500); worlds.push(await R(`return T.world();`)); await shot((m / 1000 + 1) + '-' + m + 'm'); }
  if (new Set(worlds).size !== 4) throw new Error('planètes : ' + worlds);
  await pj(`document.getElementById('rnFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('rnCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l’écran');
  await key('p'); await sleep(200);
  const L = await pj(`(() => { const r = document.getElementById('rnCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('rnCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(L));
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  return 'saut ' + Math.round(y) + ' px · planètes : ' + worlds.join(', ') + ' · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
