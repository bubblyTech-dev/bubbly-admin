import { DragEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {
  AcceptType,
  FileKind,
  formatFileSize,
  getExtension,
  getFileKind,
  resolveExtensions,
} from 'lib/fileTypes';
import IconifyIcon from 'components/base/IconifyIcon';

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  kind: FileKind;
  url: string;
  status: 'uploading' | 'done';
  progress: number;
  file?: File;
  /** what the uploader returned, for example the temp name from the server */
  serverName?: string;
}

export interface InitialUploadFile {
  url: string;
  name?: string;
  kind?: FileKind;
}

export interface FileUploadBoxProps {
  /** round = circle (avatars), rounded = soft corners, square = sharp corners */
  shape?: 'round' | 'rounded' | 'square';
  width?: number | string;
  height?: number | string;
  /** allow several files; each file gets its own tile */
  multiple?: boolean;
  /** with multiple: the most files allowed (default: no limit) */
  maxFiles?: number;
  /** what may be picked: 'image', 'video' and/or single extensions such as '.pdf'. Default: images and videos */
  accept?: AcceptType[];
  /** extensions to switch off without touching `accept`, for example ['gif', 'avi'] */
  blockedExtensions?: string[];
  maxSizeMB?: number;
  /** text inside the empty box */
  label?: string;
  /** small text under the box. Pass `null` to hide it; by default it lists the allowed types and size */
  hint?: ReactNode;
  disabled?: boolean;
  /** where the box sits in its row: 'start' (default) or 'center' */
  align?: 'start' | 'center';
  /** files that already exist (for example a saved profile image) */
  initialFiles?: InitialUploadFile[];
  /** called when files are added (once uploaded) or removed */
  onChange?: (files: UploadItem[]) => void;
  /** real upload: report progress with onProgress(0-100) and resolve when finished (the resolved text is kept as serverName). Without it the upload is only simulated (UI only) */
  uploader?: (file: File, onProgress: (percent: number) => void) => Promise<string | void>;
}

const radiusFor = (shape: FileUploadBoxProps['shape']) => {
  if (shape === 'round') return '50%';
  if (shape === 'square') return 0;
  return 2;
};

const toCss = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const FileUploadBox = ({
  shape = 'rounded',
  width = 140,
  height,
  multiple = false,
  maxFiles,
  accept = ['image', 'video'],
  blockedExtensions = [],
  maxSizeMB = 10,
  label = 'Upload',
  hint,
  disabled = false,
  align = 'start',
  initialFiles = [],
  onChange,
  uploader,
}: FileUploadBoxProps) => {
  const boxHeight = height ?? width;
  const limit = multiple ? (maxFiles ?? Infinity) : 1;
  const extensions = resolveExtensions(accept, blockedExtensions);

  const [items, setItems] = useState<UploadItem[]>(() =>
    initialFiles.map((file, index) => ({
      id: `initial-${index}`,
      name: file.name ?? file.url.split('/').pop() ?? 'file',
      size: 0,
      kind: file.kind ?? getFileKind(file.name ?? file.url),
      url: file.url,
      status: 'done',
      progress: 100,
    })),
  );
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<UploadItem | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // free the temporary preview URLs and stop simulated uploads when the box goes away
  useEffect(() => {
    const running = timers.current;
    return () => {
      Object.values(running).forEach(clearInterval);
      itemsRef.current.forEach((item) => item.file && URL.revokeObjectURL(item.url));
    };
  }, []);

  const commit = (next: UploadItem[], notify = true) => {
    itemsRef.current = next;
    setItems(next);
    if (notify) onChange?.(next.filter((item) => item.status === 'done'));
  };

  const patch = (id: string, changes: Partial<UploadItem>, notify = false) => {
    commit(
      itemsRef.current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      notify,
    );
  };

  const startUpload = (item: UploadItem) => {
    if (uploader && item.file) {
      uploader(item.file, (percent) => patch(item.id, { progress: Math.min(99, percent) }))
        .then((serverName) =>
          patch(
            item.id,
            { status: 'done', progress: 100, serverName: serverName || undefined },
            true,
          ),
        )
        .catch(() => {
          setError(`Could not upload ${item.name}.`);
          remove(item.id);
        });
      return;
    }

    // UI-only upload: counts up to 100 so the progress state can be seen
    timers.current[item.id] = setInterval(() => {
      const current = itemsRef.current.find((entry) => entry.id === item.id);
      if (!current) return clearInterval(timers.current[item.id]);
      const next = Math.min(100, current.progress + 6 + Math.random() * 12);
      if (next >= 100) {
        clearInterval(timers.current[item.id]);
        delete timers.current[item.id];
        patch(item.id, { status: 'done', progress: 100 }, true);
      } else {
        patch(item.id, { progress: next });
      }
    }, 160);
  };

  const remove = (id: string) => {
    clearInterval(timers.current[id]);
    delete timers.current[id];
    const target = itemsRef.current.find((item) => item.id === id);
    if (target?.file) URL.revokeObjectURL(target.url);
    commit(itemsRef.current.filter((item) => item.id !== id));
  };

  const addFiles = (list: FileList | File[]) => {
    const picked = Array.from(list);
    if (!picked.length || disabled) return;

    setError('');
    const problems: string[] = [];
    const valid = picked.filter((file) => {
      if (!extensions.includes(getExtension(file.name))) {
        problems.push(`${file.name}: this file type is not allowed.`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        problems.push(`${file.name}: larger than ${maxSizeMB} MB.`);
        return false;
      }
      return true;
    });

    // a single box replaces its file, a multiple box fills the free places
    let base = itemsRef.current;
    let accepted = valid;
    if (!multiple) {
      accepted = valid.slice(0, 1);
      if (accepted.length) {
        base.forEach((item) => item.file && URL.revokeObjectURL(item.url));
        base = [];
      }
    } else if (base.length + valid.length > limit) {
      accepted = valid.slice(0, Math.max(0, limit - base.length));
      problems.push(`You can add up to ${limit} files.`);
    }

    const added: UploadItem[] = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      kind: getFileKind(file.name),
      url: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      file,
    }));

    if (added.length || base !== itemsRef.current) commit([...base, ...added]);
    added.forEach(startUpload);
    if (problems.length) setError(problems[0]);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const dragProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: handleDrop,
  };

  const radius = radiusFor(shape);
  const tileSx = {
    position: 'relative',
    width: toCss(width),
    height: toCss(boxHeight),
    flexShrink: 0,
  } as const;
  const smallest = Math.min(
    typeof width === 'number' ? width : 120,
    typeof boxHeight === 'number' ? boxHeight : 120,
  );
  const spinnerSize = Math.max(24, Math.min(56, smallest * 0.4));
  const compact = smallest < 96;

  const defaultHint = `${accept
    .map((item) => (item === 'image' ? 'Images' : item === 'video' ? 'Videos' : item))
    .join(', ')} · max ${maxSizeMB} MB`;

  const canAdd = !disabled && items.length < limit;
  // single mode keeps showing the picker only while empty; a filled box is replaced by deleting first
  const showAddTile = canAdd;

  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{ alignItems: align === 'center' ? 'center' : 'flex-start', width: 1 }}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={extensions.map((extension) => `.${extension}`).join(',')}
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = ''; // lets the same file be picked again
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
        }}
      >
        {items.map((item) => (
          <Box key={item.id} sx={tileSx} {...(multiple ? {} : dragProps)}>
            <Box
              sx={{
                width: 1,
                height: 1,
                borderRadius: radius,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'background.elevation2',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <TilePreview item={item} />

              {item.status === 'uploading' && (
                <Stack
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0.55)',
                    color: 'common.white',
                  }}
                >
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={item.progress}
                      size={spinnerSize}
                      thickness={4}
                      sx={{ color: 'common.white' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: spinnerSize < 36 ? 9 : 11,
                      }}
                    >
                      {Math.round(item.progress)}%
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Box>

            {item.status === 'done' && (
              <Stack
                direction={shape === 'round' ? 'column' : 'row'}
                spacing={0.5}
                sx={{
                  position: 'absolute',
                  top: shape === 'round' ? -4 : 6,
                  right: shape === 'round' ? -8 : 6,
                }}
              >
                {item.kind !== 'file' && (
                  <ActionButton
                    label="Preview"
                    icon="material-symbols:visibility"
                    onClick={() => setPreview(item)}
                  />
                )}
                {!disabled && (
                  <ActionButton
                    label="Delete"
                    icon="material-symbols:delete-outline-rounded"
                    onClick={() => remove(item.id)}
                  />
                )}
              </Stack>
            )}
          </Box>
        ))}

        {showAddTile && (
          <ButtonBase
            onClick={() => inputRef.current?.click()}
            {...dragProps}
            sx={{
              ...tileSx,
              borderRadius: radius,
              border: 2,
              borderStyle: 'dashed',
              borderColor: dragging ? 'primary.main' : 'divider',
              bgcolor: dragging ? 'action.hover' : 'background.elevation1',
              flexDirection: 'column',
              gap: 0.5,
              color: 'text.secondary',
              transition: 'border-color 0.2s, background-color 0.2s',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            <IconifyIcon
              icon={
                multiple && items.length
                  ? 'material-symbols:add-rounded'
                  : 'material-symbols:add-a-photo-outline-rounded'
              }
              sx={{ fontSize: compact ? 22 : 30 }}
            />
            {!compact && (
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {multiple && items.length ? 'Add more' : label}
              </Typography>
            )}
          </ButtonBase>
        )}
      </Box>

      {error ? (
        <Typography
          variant="caption"
          sx={{ color: 'error.main', textAlign: align === 'center' ? 'center' : 'left' }}
        >
          {error}
        </Typography>
      ) : (
        hint !== null && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: align === 'center' ? 'center' : 'left' }}
          >
            {hint ?? defaultHint}
          </Typography>
        )
      )}

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
              {preview?.name}
            </Typography>
            {preview && preview.size > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatFileSize(preview.size)}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => setPreview(null)} aria-label="Close">
            <IconifyIcon icon="material-symbols:close-rounded" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
          {preview?.kind === 'image' && (
            <Box
              component="img"
              src={preview.url}
              alt={preview.name}
              sx={{ maxWidth: 1, maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
          {preview?.kind === 'video' && (
            <Box
              component="video"
              src={preview.url}
              controls
              sx={{ maxWidth: 1, maxHeight: '70vh' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

const TilePreview = ({ item }: { item: UploadItem }) => {
  if (item.kind === 'image') {
    return (
      <Box
        component="img"
        src={item.url}
        alt={item.name}
        sx={{ width: 1, height: 1, objectFit: 'cover' }}
      />
    );
  }

  if (item.kind === 'video') {
    return (
      <>
        <Box
          component="video"
          src={item.url}
          muted
          preload="metadata"
          sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
        />
        <IconifyIcon
          icon="material-symbols:play-circle-rounded"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 32,
            color: 'common.white',
            opacity: 0.85,
          }}
        />
      </>
    );
  }

  return (
    <Stack
      sx={{ width: 1, height: 1, alignItems: 'center', justifyContent: 'center', p: 1, gap: 0.5 }}
    >
      <IconifyIcon
        icon="material-symbols:draft-outline-rounded"
        sx={{ fontSize: 28, color: 'text.secondary' }}
      />
      <Typography variant="caption" noWrap sx={{ maxWidth: 1, color: 'text.secondary' }}>
        {item.name}
      </Typography>
    </Stack>
  );
};

interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

const ActionButton = ({ label, icon, onClick }: ActionButtonProps) => (
  <IconButton
    aria-label={label}
    title={label}
    onClick={onClick}
    sx={{
      width: 22,
      height: 22,
      p: 0,
      color: 'common.white',
      bgcolor: 'rgba(0, 0, 0, 0.65)',
      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.85)' },
    }}
  >
    <IconifyIcon icon={icon} sx={{ fontSize: 14 }} />
  </IconButton>
);

export default FileUploadBox;
