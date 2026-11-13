import api from 'lib/api';
import { AnalyticsCatalogueArea, AnalyticsMeta, AnalyticsResult } from 'types/analytics';

export type ExportFormat = 'csv' | 'xlsx';

export interface DownloadedFile {
  blob: Blob;
  filename: string;
}

// the filename the server chose ("school-growth-2026-11-11.csv"), or a fallback
export const filenameFrom = (disposition: unknown, fallback: string) => {
  const match = /filename="?([^";]+)"?/.exec(String(disposition || ''));
  return match ? match[1] : fallback;
};

let metaPromise: Promise<AnalyticsMeta> | null = null;

export const analyticsService = {
  // filter options and the resolved presets; asked once per page load
  meta(): Promise<AnalyticsMeta> {
    if (!metaPromise) {
      metaPromise = api
        .get('/admin/analytics/meta')
        .then((res) => res.data.data as AnalyticsMeta)
        .catch((err) => {
          metaPromise = null;
          throw err;
        });
    }
    return metaPromise;
  },

  resetMeta() {
    metaPromise = null;
  },

  async catalogue(): Promise<AnalyticsCatalogueArea[]> {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },

  async get(
    key: string,
    params: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<AnalyticsResult> {
    const res = await api.get(`/admin/analytics/${key}`, { params, signal });
    return res.data.data;
  },

  async download(
    key: string,
    params: Record<string, string>,
    format: ExportFormat,
  ): Promise<DownloadedFile> {
    const res = await api.get(`/admin/analytics/${key}`, {
      params: { ...params, format },
      responseType: 'blob',
    });
    return {
      blob: res.data as Blob,
      filename: filenameFrom(res.headers['content-disposition'], `${key}.${format}`),
    };
  },
};
