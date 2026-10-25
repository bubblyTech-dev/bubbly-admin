import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { moduleService } from 'services/moduleService';
import { PlanModule } from 'types/plans';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/common/PageHeader';

const ModuleList = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('modules.edit');

  const [modules, setModules] = useState<PlanModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [editing, setEditing] = useState<PlanModule | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      setModules(await moduleService.list());
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleEdit = (module: PlanModule) => {
    setEditing(module);
    setName(module.name);
    setDescription(module.description ?? '');
    setSortOrder(String(module.sortOrder));
    setActive(module.status === 1);
    setDialogError('');
    setFields({});
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setDialogError('');
    setFields({});
    try {
      await moduleService.update(editing.uuid, {
        name,
        description,
        sortOrder: Number(sortOrder) || 0,
        status: active ? 1 : 2,
      });
      setNotice(`Module "${name}" updated.`);
      setEditing(null);
      await load();
    } catch (err) {
      const info = parseApiError(err);
      setDialogError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Modules"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Modules', active: true },
        ]}
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Modules are the features a school can use. Plans choose which modules they include. Core
            modules are part of every plan.
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  {canEdit && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.uuid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <div>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {module.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {module.moduleKey}
                          </Typography>
                        </div>
                        {module.isCore && <Chip label="Core" color="primary" />}
                      </Stack>
                    </TableCell>
                    <TableCell>{module.description}</TableCell>
                    <TableCell>{module.sortOrder}</TableCell>
                    <TableCell>
                      <Chip
                        label={module.status === 1 ? 'Active' : 'Inactive'}
                        color={module.status === 1 ? 'success' : 'default'}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            aria-label="Edit"
                            onClick={() => handleEdit(module)}
                          >
                            <IconifyIcon
                              icon="material-symbols:edit-outline-rounded"
                              sx={{ fontSize: 20 }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!loading && modules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No modules yet. Run the modules seeder on the server.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      <Dialog
        open={Boolean(editing)}
        onClose={saving ? undefined : () => setEditing(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit module</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fields.name)}
              helperText={fields.name}
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(fields.description)}
              helperText={fields.description}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              error={Boolean(fields.sortOrder)}
              helperText={fields.sortOrder}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={editing?.isCore}
                />
              }
              label={editing?.isCore ? 'Active (core modules always stay active)' : 'Active'}
            />
            {fields.status && (
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                {fields.status}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="soft" color="neutral" onClick={() => setEditing(null)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ModuleList;
