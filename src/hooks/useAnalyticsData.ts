import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseApiError } from 'lib/api';
import { analyticsService } from 'services/analyticsService';
import { AnalyticsResult } from 'types/analytics';

export interface DatasetState {
  loading: boolean;
  error: string;
  result: AnalyticsResult | null;
}

const EMPTY: DatasetState = { loading: true, error: '', result: null };

// Loads every dataset an area page needs, in parallel, whenever the filters change.
// Each dataset has its own loading and error state, so one failing dataset does not blank the page.
const useAnalyticsData = (keys: string[], params: Record<string, string>) => {
  const [states, setStates] = useState<Record<string, DatasetState>>({});
  const [reloadKey, setReloadKey] = useState(0);

  const keyList = keys.join('|');
  const paramText = JSON.stringify(params);
  const stable = useMemo(
    () => ({
      keys: keyList ? keyList.split('|') : [],
      params: JSON.parse(paramText) as Record<string, string>,
    }),
    [keyList, paramText],
  );

  const load = useCallback(
    (only: string[], signal: AbortSignal) => {
      setStates((current) => {
        const next = { ...current };
        for (const key of only)
          next[key] = { ...(current[key] ?? EMPTY), loading: true, error: '' };
        return next;
      });

      only.forEach((key) => {
        analyticsService
          .get(key, stable.params, signal)
          .then((result) =>
            setStates((current) => ({ ...current, [key]: { loading: false, error: '', result } })),
          )
          .catch((err) => {
            if (signal.aborted) return;
            setStates((current) => ({
              ...current,
              [key]: { loading: false, error: parseApiError(err).message, result: null },
            }));
          });
      });
    },
    [stable.params],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(stable.keys, controller.signal);
    return () => controller.abort();
  }, [load, stable.keys, reloadKey]);

  const retry = (key: string) => {
    const controller = new AbortController();
    load([key], controller.signal);
  };

  const retryAll = () => setReloadKey((value) => value + 1);

  return { states, retry, retryAll };
};

export default useAnalyticsData;
