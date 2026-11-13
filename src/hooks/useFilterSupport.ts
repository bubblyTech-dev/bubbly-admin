import { useEffect, useState } from 'react';
import { analyticsService } from 'services/analyticsService';
import { AnalyticsCatalogueArea } from 'types/analytics';
import { FilterSupport } from 'components/analytics/FiltersProvider';

let cache: Promise<AnalyticsCatalogueArea[]> | null = null;

const catalogue = () => {
  if (!cache) {
    cache = analyticsService.catalogue().catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
};

// Which global filters the datasets of an area page honour (plan, status, source), from the API catalogue.
// Until the catalogue arrives only the date range and compare are offered.
const useFilterSupport = (datasetKeys: string[]): FilterSupport => {
  const [support, setSupport] = useState<FilterSupport>({
    dateRange: true,
    compare: true,
    plan: false,
    status: null,
    source: null,
  });
  const joined = datasetKeys.join('|');

  useEffect(() => {
    let active = true;
    const keys = joined ? joined.split('|') : [];

    catalogue()
      .then((areas) => {
        if (!active) return;
        const datasets = areas
          .flatMap((area) => area.datasets)
          .filter((dataset) => keys.includes(dataset.key));
        setSupport({
          dateRange: true,
          compare: true,
          plan: datasets.some((dataset) => dataset.filters.includes('plan')),
          status:
            datasets.find((dataset) => dataset.filters.includes('status'))?.statusKind ?? null,
          source:
            datasets.find((dataset) => dataset.filters.includes('source'))?.sourceKind ?? null,
        });
      })
      .catch(() => {
        // the bar still works with the date range only
      });

    return () => {
      active = false;
    };
  }, [joined]);

  return support;
};

export default useFilterSupport;
