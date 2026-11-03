// Open only the disclosure explicitly requested by a shareable link.
function openContextAnchor() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  for (let node = target; node; node = node.parentElement) {
    if (node.tagName === 'DETAILS') node.open = true;
  }
  target.scrollIntoView({block:'start'});
}
window.addEventListener('hashchange', openContextAnchor);
openContextAnchor();
