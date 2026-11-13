import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { parseApiError } from 'lib/api';
import { dashboardService } from 'services/dashboardService';
import { DashboardData, DashboardPreset } from 'types/dashboard';

// Loads the dashboard for the chosen range and keeps the previous numbers on screen while a new range loads.
const useDashboard = (preset: DashboardPreset) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    dashboardService
      .get(preset, controller.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(parseApiError(err).message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [preset, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, loading, error, reload };
};

export default useDashboard;
