import api from 'lib/api';
import { DownloadedFile, ExportFormat, filenameFrom } from 'services/analyticsService';
import { ReportCatalogueArea, ReportResult } from 'types/reports';

export const reportService = {
  async catalogue(): Promise<ReportCatalogueArea[]> {
    const res = await api.get('/admin/reports');
    return res.data.data;
  },

  async get(
    key: string,
    params: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<ReportResult> {
    const res = await api.get(`/admin/reports/${key}`, { params, signal });
    return { ...res.data.data, meta: res.data.meta };
  },

  async download(
    key: string,
    params: Record<string, string>,
    format: ExportFormat,
  ): Promise<DownloadedFile> {
    const res = await api.get(`/admin/reports/${key}`, {
      params: { ...params, format },
      responseType: 'blob',
    });
    return {
      blob: res.data as Blob,
      filename: filenameFrom(res.headers['content-disposition'], `${key}.${format}`),
    };
  },
};
