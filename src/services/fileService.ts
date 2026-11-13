import api from 'lib/api';

// The rules of a file type (set in the backend's config/files.js), so the upload box never disagrees with the server.
export interface FileRules {
  type: string;
  extensions: string[];
  maxSizeMB: number;
  maxFiles: number;
}

export const fileService = {
  async rules(type: string): Promise<FileRules> {
    const res = await api.get('/admin/files/rules', { params: { type } });
    return res.data.data;
  },

  // Saves the file in the server's temp folder and returns its temp name. The file only becomes real when the
  // form that uses it is saved (for example profileService.update with that name).
  async upload(type: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
    const form = new FormData();
    form.append('file', file);

    const res = await api.post('/admin/files/upload', form, {
      params: { type },
      onUploadProgress: (event) => {
        if (event.total) onProgress?.((event.loaded / event.total) * 100);
      },
    });
    return res.data.data.name;
  },
};
