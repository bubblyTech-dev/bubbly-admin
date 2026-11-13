import { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { blobErrorMessage } from 'lib/blobError';
import { saveBlob } from 'lib/download';
import { useAuth } from 'providers/AuthProvider';
import { ExportFormat, analyticsService } from 'services/analyticsService';
import { reportService } from 'services/reportService';
import IconifyIcon from 'components/base/IconifyIcon';

interface ExportMenuProps {
  // what to download: an analytics dataset or a report
  kind: 'analytics' | 'reports';
  dataKey: string;
  // the filters to apply (the same parameters the page used)
  params: Record<string, string>;
  // 'button' is the "Export" button with a label, 'icon' a small icon button for a single chart
  variant?: 'button' | 'icon';
  disabled?: boolean;
}

// "Export" with a small menu: Download CSV / Download Excel. Hidden for admins without the export permission.
const ExportMenu = ({
  kind,
  dataKey,
  params,
  variant = 'button',
  disabled = false,
}: ExportMenuProps) => {
  const { hasPermission } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [error, setError] = useState('');

  if (!hasPermission('reports.export')) return null;

  const download = async (format: ExportFormat) => {
    setAnchor(null);
    setBusy(format);
    setError('');
    try {
      const service = kind === 'analytics' ? analyticsService : reportService;
      const file = await service.download(dataKey, params, format);
      saveBlob(file.blob, file.filename);
    } catch (err) {
      setError(await blobErrorMessage(err));
    }
    setBusy(null);
  };

  const loading = busy !== null;

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title="Download this data">
          <span>
            <IconButton
              size="small"
              aria-label="Export"
              disabled={disabled || loading}
              onClick={(event) => setAnchor(event.currentTarget)}
            >
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <IconifyIcon icon="material-symbols:download-rounded" sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          color="neutral"
          disabled={disabled || loading}
          onClick={(event) => setAnchor(event.currentTarget)}
          startIcon={
            loading ? (
              <CircularProgress size={16} />
            ) : (
              <IconifyIcon icon="material-symbols:download-rounded" sx={{ fontSize: 20 }} />
            )
          }
          endIcon={
            <IconifyIcon icon="material-symbols:expand-more-rounded" sx={{ fontSize: 18 }} />
          }
          sx={{ whiteSpace: 'nowrap' }}
        >
          Export
        </Button>
      )}

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => void download('csv')}>
          <ListItemIcon>
            <IconifyIcon
              icon="material-symbols:description-outline-rounded"
              sx={{ fontSize: 20 }}
            />
          </ListItemIcon>
          <ListItemText>Download CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void download('xlsx')}>
          <ListItemIcon>
            <IconifyIcon icon="material-symbols:grid-view-outline-rounded" sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Download Excel</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={8000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportMenu;
