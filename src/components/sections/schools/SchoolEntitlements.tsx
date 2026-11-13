import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
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
import { formatCount, formatDate, formatDateTime } from 'lib/format';
import { schoolService } from 'services/schoolService';
import {
  EntitlementLimit,
  EntitlementModule,
  SchoolEntitlements as Entitlements,
} from 'types/school';
import TableEmptyRow from 'components/common/TableEmptyRow';
import PageLoader from 'components/loading/PageLoader';
import EntitlementDialog from './EntitlementDialog';

interface SchoolEntitlementsProps {
  schoolUuid: string;
  // false = view only (no schools.entitlements permission)
  canEdit: boolean;
}

const limitText = (value: number | null) => (value === null ? 'Unlimited' : formatCount(value));

const overrideNote = (who: string | null, when: string, reason: string) =>
  `${who ?? 'An admin'} on ${formatDateTime(when)}: ${reason}`;

type ModuleDialog = { module: EntitlementModule; access: 'grant' | 'revoke' } | null;

// The "Features & limits" tab: the plan's defaults for this school, with per-school overrides on top.
const SchoolEntitlements = ({ schoolUuid, canEdit }: SchoolEntitlementsProps) => {
  const [data, setData] = useState<Entitlements | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');

  const [moduleDialog, setModuleDialog] = useState<ModuleDialog>(null);
  const [limitDialog, setLimitDialog] = useState<EntitlementLimit | null>(null);
  const [limitUnlimited, setLimitUnlimited] = useState(false);
  const [limitValue, setLimitValue] = useState('');
  const [limitProblem, setLimitProblem] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await schoolService.entitlements(schoolUuid));
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
  }, [schoolUuid]);

  useEffect(() => {
    setData(null);
    void load();
  }, [load]);

  const saved = async (message: string) => {
    setNotice(message);
    await load();
  };

  const handleToggle = (item: EntitlementModule, checked: boolean) => {
    setNotice('');
    setActionError('');
    if (item.override && checked === item.includedByPlan) {
      void resetModule(item);
      return;
    }
    setModuleDialog({ module: item, access: checked ? 'grant' : 'revoke' });
  };

  const resetModule = async (item: EntitlementModule) => {
    setBusy(item.uuid);
    try {
      await schoolService.clearModuleOverride(schoolUuid, item.uuid);
      await saved(`${item.name} is back to the plan default.`);
    } catch (err) {
      setActionError(parseApiError(err).message);
    }
    setBusy('');
  };

  const resetLimit = async (item: EntitlementLimit) => {
    setNotice('');
    setActionError('');
    setBusy(item.key);
    try {
      await schoolService.clearLimitOverride(schoolUuid, item.key);
      await saved(`${item.label} is back to the plan default.`);
    } catch (err) {
      setActionError(parseApiError(err).message);
    }
    setBusy('');
  };

  const openLimit = (item: EntitlementLimit) => {
    setNotice('');
    setActionError('');
    setLimitProblem('');
    setLimitUnlimited(item.effectiveValue === null);
    setLimitValue(item.effectiveValue === null ? '' : String(item.effectiveValue));
    setLimitDialog(item);
  };

  const submitModule = async (reason: string) => {
    if (!moduleDialog) return;
    await schoolService.setModuleOverride(
      schoolUuid,
      moduleDialog.module.uuid,
      moduleDialog.access,
      reason,
    );
    await saved(
      `${moduleDialog.module.name} ${moduleDialog.access === 'grant' ? 'added to' : 'removed from'} this school.`,
    );
  };

  const submitLimit = async (reason: string) => {
    if (!limitDialog) return false;
    setLimitProblem('');
    let value: number | null = null;
    if (!limitUnlimited) {
      if (!/^\d+$/.test(limitValue.trim())) {
        setLimitProblem('Enter a whole number, or tick Unlimited.');
        return false;
      }
      value = Number(limitValue);
    }
    await schoolService.setLimitOverride(schoolUuid, limitDialog.key, value, reason);
    await saved(`${limitDialog.label} changed for this school.`);
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <PageLoader sx={{ minHeight: 240 }} />;

  const { subscription } = data;

  return (
    <Stack direction="column" spacing={4}>
      {!canEdit && (
        <Alert severity="info">
          You can view this school's features and limits but not change them. Ask an admin with the
          &quot;Manage school features and limits&quot; permission.
        </Alert>
      )}
      {notice && (
        <Alert severity="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="column" spacing={1.5}>
          {subscription ? (
            <Stack
              direction="row"
              spacing={3}
              useFlexGap
              sx={{ flexWrap: 'wrap', alignItems: 'center' }}
            >
              <Stack direction="column">
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Plan
                </Typography>
                <Typography variant="subtitle2">{subscription.planName}</Typography>
              </Stack>
              <Stack direction="column">
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Subscription
                </Typography>
                <Chip
                  size="small"
                  label={subscription.status}
                  sx={{ textTransform: 'capitalize', alignSelf: 'flex-start' }}
                />
              </Stack>
              <Stack direction="column">
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Plan ends
                </Typography>
                <Typography variant="subtitle2">{formatDate(subscription.endsAt)}</Typography>
              </Stack>
            </Stack>
          ) : (
            <Alert severity="warning">
              No active plan. You can still set overrides, but they have nothing to build on.
            </Alert>
          )}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Changes here apply only to this school and stop when its plan ends or when you reset
            them.
          </Typography>
        </Stack>
      </Paper>

      <Stack direction="column" spacing={2}>
        <Typography variant="h6">Modules</Typography>
        <Stack
          direction="column"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
        >
          {data.modules.length === 0 && (
            <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No modules to show.
            </Typography>
          )}
          {data.modules.map((item, index) => {
            const granted = item.override?.access === 'grant';
            const revoked = item.override?.access === 'revoke';
            const note = item.override
              ? overrideNote(
                  item.override.createdByName,
                  item.override.createdAt,
                  item.override.reason,
                )
              : '';
            return (
              <Stack
                key={item.uuid}
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderTop: index === 0 ? 0 : 1,
                  borderColor: 'divider',
                }}
              >
                <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Typography variant="subtitle2">{item.name}</Typography>
                    {item.isCore && (
                      <Tooltip title="Core modules are always on for every school.">
                        <Chip size="small" label="Core" />
                      </Tooltip>
                    )}
                    {!item.isCore && !item.override && item.includedByPlan && (
                      <Chip size="small" color="success" label="In plan" />
                    )}
                    {granted && (
                      <Tooltip title={note}>
                        <Chip size="small" color="primary" label="Added by admin" />
                      </Tooltip>
                    )}
                    {revoked && (
                      <Tooltip title={note}>
                        <Chip size="small" color="warning" label="Removed by admin" />
                      </Tooltip>
                    )}
                  </Stack>
                  {item.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.description}
                    </Typography>
                  )}
                  {item.override && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {note}
                    </Typography>
                  )}
                </Stack>
                {canEdit && item.override && (
                  <Button
                    size="small"
                    variant="soft"
                    color="neutral"
                    disabled={busy === item.uuid}
                    onClick={() => void resetModule(item)}
                    sx={{ flexShrink: 0 }}
                  >
                    Reset to plan
                  </Button>
                )}
                <Switch
                  checked={item.effective}
                  disabled={!canEdit || item.isCore || busy === item.uuid}
                  onChange={(_event, checked) => handleToggle(item, checked)}
                  slotProps={{ input: { 'aria-label': item.name } }}
                />
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      <Stack direction="column" spacing={2}>
        <Typography variant="h6">Limits</Typography>
        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Limit</TableCell>
                <TableCell align="right">Plan</TableCell>
                <TableCell align="right">Used</TableCell>
                <TableCell align="right">This school</TableCell>
                {canEdit && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.limits.length === 0 && (
                <TableEmptyRow colSpan={canEdit ? 5 : 4} message="No limits to show." />
              )}
              {data.limits.map((item) => (
                <TableRow key={item.key}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell align="right">{limitText(item.planValue)}</TableCell>
                  <TableCell align="right">
                    {item.usage === undefined ? '-' : formatCount(item.usage)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      {item.override && (
                        <Tooltip
                          title={overrideNote(
                            item.override.createdByName,
                            item.override.createdAt,
                            item.override.reason,
                          )}
                        >
                          <Chip size="small" color="primary" label="Override" />
                        </Tooltip>
                      )}
                      <Typography variant="subtitle2">{limitText(item.effectiveValue)}</Typography>
                    </Stack>
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" variant="soft" onClick={() => openLimit(item)}>
                        Change
                      </Button>
                      {item.override && (
                        <Button
                          size="small"
                          variant="soft"
                          color="neutral"
                          sx={{ ml: 1 }}
                          disabled={busy === item.key}
                          onClick={() => void resetLimit(item)}
                        >
                          Reset to plan
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <EntitlementDialog
        open={moduleDialog !== null}
        title={moduleDialog?.access === 'grant' ? 'Add module' : 'Remove module'}
        description={
          moduleDialog
            ? `${moduleDialog.access === 'grant' ? 'Give this school' : 'Take away from this school'} the ${moduleDialog.module.name} module. The plan itself does not change.`
            : ''
        }
        confirmLabel={moduleDialog?.access === 'grant' ? 'Add module' : 'Remove module'}
        onSubmit={submitModule}
        onClose={() => setModuleDialog(null)}
      />

      <EntitlementDialog
        open={limitDialog !== null}
        title={limitDialog ? `Change ${limitDialog.label}` : 'Change limit'}
        description={
          limitDialog
            ? `The plan allows ${limitText(limitDialog.planValue)}. This changes it for this school only.`
            : ''
        }
        confirmLabel="Save limit"
        onSubmit={submitLimit}
        onClose={() => setLimitDialog(null)}
      >
        <TextField
          fullWidth
          type="number"
          id="entitlement-limit"
          label="Limit"
          value={limitUnlimited ? '' : limitValue}
          placeholder={limitUnlimited ? 'Unlimited' : ''}
          disabled={limitUnlimited}
          onChange={(e) => setLimitValue(e.target.value)}
          error={Boolean(limitProblem)}
          helperText={limitProblem}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={limitUnlimited}
              onChange={(e) => setLimitUnlimited(e.target.checked)}
            />
          }
          label="Unlimited"
        />
      </EntitlementDialog>
    </Stack>
  );
};

export default SchoolEntitlements;
