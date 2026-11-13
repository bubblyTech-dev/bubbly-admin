import { useEffect, useState } from 'react';

// Returns `value` only after it stopped changing for `delay` ms (for search boxes that call the API).
const useDebouncedValue = <T>(value: T, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
