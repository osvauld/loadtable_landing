// The homepage's copy button. External: the page policy allows no inline script.
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

