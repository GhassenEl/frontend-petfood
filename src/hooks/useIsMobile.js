import { useEffect, useState } from 'react';

import { MOBILE_MAX } from '../constants/breakpoints';

const getMatch = (breakpoint) =>
  typeof window !== 'undefined' && window.matchMedia(`(max-width: ${breakpoint}px)`).matches;

export const useIsMobile = (breakpoint = MOBILE_MAX) => {
  const [isMobile, setIsMobile] = useState(() => getMatch(breakpoint));

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
