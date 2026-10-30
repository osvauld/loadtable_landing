// The homepage's copy buttons: each copies the text of the element its data-copy names.
// External: the page policy allows no inline script.
for (const button of document.querySelectorAll('button[data-copy]')) {
  const source = document.getElementById(button.dataset.copy);
  if (!source) continue;
  const label = button.textContent;
  const select = () => {
    const r = document.createRange();
    r.selectNodeContents(source);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    button.textContent = 'Selected';
  };
  button.addEventListener('click', () => {
    const done = () => {
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = label; }, 1600);
    };
    try { navigator.clipboard.writeText(source.textContent).then(done, select); } catch { select(); }
  });
}
