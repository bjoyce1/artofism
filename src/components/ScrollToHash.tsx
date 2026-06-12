import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * react-router doesn't scroll to #hash targets on navigation, so links like
 * /#chapters from other pages would land at the top of the page. This
 * component watches the location and scrolls the hash target into view.
 */
const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // Give the destination page a frame to mount before scrolling.
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

export default ScrollToHash;
