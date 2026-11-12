export function installZoomGuard() {
  const prevent = (e) => {
    if (e.cancelable) e.preventDefault();
  };
  for (const name of ['gesturestart', 'gesturechange'])
    document.addEventListener(name, prevent, { passive: false });
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) prevent(e);
    },
    { passive: false },
  );
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) prevent(e);
    },
    { passive: false },
  );
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) prevent(e);
  });
}
