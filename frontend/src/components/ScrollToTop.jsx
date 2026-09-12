import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — scrolls the window to the top on every route change.
 *
 * Why this is needed:
 *   React Router renders new routes inside the same SPA shell without a full
 *   page reload, so the browser keeps the previous scroll position.  This
 *   component listens to pathname changes via `useLocation()` and calls
 *   `window.scrollTo` to reset scroll.
 *
 * Hash links (#section) are respected — if the URL contains a hash, the
 * browser's native scroll-to-anchor behaviour is preserved instead.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If the URL has a hash (e.g. /page#section), let the browser handle it
    if (hash) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null; // This component renders nothing
};

export default ScrollToTop;
