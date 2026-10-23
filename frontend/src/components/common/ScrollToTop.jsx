import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router keeps the browser's scroll position across navigations, so
// following a link while scrolled down on one page lands you at the same
// scroll Y on the next one instead of its top. Reset it on every route change.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
