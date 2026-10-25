// Extensions the upload box understands. To stop allowing a type, pass it in the box's blockedExtensions prop
// (or remove it here to remove it everywhere).
export const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'avif',
  'heic',
  'heif',
  'tif',
  'tiff',
  'ico',
];

export const VIDEO_EXTENSIONS = [
  'mp4',
  'webm',
  'mov',
  'avi',
  'mkv',
  'm4v',
  'mpg',
  'mpeg',
  '3gp',
  'wmv',
  'flv',
  'ogv',
];

export type FileKind = 'image' | 'video' | 'file';

// 'image' and 'video' stand for the lists above; anything else is a single extension such as '.pdf'
export type AcceptType = 'image' | 'video' | `.${string}`;

export const getExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  return index === -1 ? '' : name.slice(index + 1).toLowerCase();
};

export const getFileKind = (name: string): FileKind => {
  const extension = getExtension(name);
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  return 'file';
};

export const resolveExtensions = (accept: AcceptType[], blocked: string[] = []) => {
  const blockedSet = new Set(blocked.map((item) => item.replace('.', '').toLowerCase()));
  const all = accept.flatMap((item) => {
    if (item === 'image') return IMAGE_EXTENSIONS;
    if (item === 'video') return VIDEO_EXTENSIONS;
    return [item.replace('.', '').toLowerCase()];
  });
  return [...new Set(all)].filter((extension) => !blockedSet.has(extension));
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
