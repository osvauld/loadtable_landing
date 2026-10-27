// The homepage's copy button and the example board's ticking estimates. External: the page policy allows no inline script.
const copy = document.getElementById('copy');
const snip = document.getElementById('snip');
if (copy && snip) {
  const select = () => {
    const r = document.createRange();
    r.selectNodeContents(snip);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    copy.textContent = 'Selected';
  };
  copy.addEventListener('click', () => {
    const done = () => {
      copy.textContent = 'Copied';
      setTimeout(() => { copy.textContent = 'Copy'; }, 1600);
    };
    try { navigator.clipboard.writeText(snip.textContent).then(done, select); } catch { select(); }
  });
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const running = [...document.querySelectorAll('.st[data-eta]')].map(el => ({ el, start: Number(el.dataset.eta), left: Number(el.dataset.eta) }));
  const fmt = s => { const m = Math.floor(s / 60), r = s % 60; return 'ETA ' + (m ? m + 'm' : '') + (m && r < 10 ? '0' : '') + r + 's'; };
  const m0 = document.getElementById('m0'), m1 = document.getElementById('m1');
  setInterval(() => {
    for (const j of running) {
      j.left = j.left > 5 ? j.left - 1 : j.start;
      j.el.textContent = fmt(j.left);
    }
    if (m1) m1.value = 62 + Math.round(Math.sin(Date.now() / 4000) * 12);
    if (m0) m0.value = 30 + Math.round(Math.cos(Date.now() / 5000) * 6);
  }, 1000);
}
