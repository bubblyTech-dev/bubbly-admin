import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import { staffService } from 'services/staffService';
import { PermissionGroup, StaffUser } from 'types/staff';
import PageLoader from 'components/loading/PageLoader';

interface StaffPermissionsTabProps {
  staff: StaffUser;
  onSaved: (staff: StaffUser) => void;
}

// The checklist of what a staff member may do. You can only hand out permissions you hold yourself;
// the others are shown greyed out and stay as they are.
const StaffPermissionsTab = ({ staff, onSaved }: StaffPermissionsTabProps) => {
  const { user, hasPermission } = useAuth();

  const [groups, setGroups] = useState<PermissionGroup[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set(staff.permissions ?? []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const isSelf = user?.uuid === staff.uuid;
  const canSave = hasPermission('users_access.permissions') && !isSelf;
  // the permissions this admin may give
  const canGrant = (key: string) => canSave && hasPermission(key);

  useEffect(() => {
    staffService
      .permissions()
      .then(setGroups)
      .catch((err) => setError(parseApiError(err).message));
  }, []);

  useEffect(() => {
    setSelected(new Set(staff.permissions ?? []));
  }, [staff]);

  const changed = useMemo(() => {
    const original = new Set(staff.permissions ?? []);
    return original.size !== selected.size || [...selected].some((key) => !original.has(key));
  }, [staff, selected]);

  const toggle = (key: string) => {
    setSaved(false);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleGroup = (group: PermissionGroup) => {
    setSaved(false);
    const keys = group.items.map((item) => item.key).filter(canGrant);
    setSelected((current) => {
      const next = new Set(current);
      const allOn = keys.every((key) => next.has(key));
      keys.forEach((key) => (allOn ? next.delete(key) : next.add(key)));
      return next;
    });
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const updated = await staffService.setPermissions(staff.uuid, [...selected]);
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.permissions ?? info.message);
    }
    setSaving(false);
  };

  if (!groups)
    return error ? <Alert severity="error">{error}</Alert> : <PageLoader sx={{ minHeight: 200 }} />;

  return (
    <Stack direction="column" spacing={3}>
      {isSelf && <Alert severity="info">You cannot change your own permissions.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {saved && <Alert severity="success">Permissions saved.</Alert>}

      {groups.map((group) => {
        const grantable = group.items.filter((item) => canGrant(item.key));
        const onCount = grantable.filter((item) => selected.has(item.key)).length;

        return (
          <Paper key={group.module} variant="outlined" sx={{ p: 2.5 }}>
            <FormControlLabel
              label={<Typography variant="subtitle1">{group.label}</Typography>}
              control={
                <Checkbox
                  checked={grantable.length > 0 && onCount === grantable.length}
                  indeterminate={onCount > 0 && onCount < grantable.length}
                  disabled={grantable.length === 0}
                  onChange={() => toggleGroup(group)}
                />
              }
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                columnGap: 3,
                pl: 4,
              }}
            >
              {group.items.map((item) => (
                <FormControlLabel
                  key={item.key}
                  label={<Typography variant="body2">{item.name}</Typography>}
                  control={
                    <Checkbox
                      size="small"
                      checked={selected.has(item.key)}
                      disabled={!canGrant(item.key)}
                      onChange={() => toggle(item.key)}
                    />
                  }
                />
              ))}
            </Box>
          </Paper>
        );
      })}

      {canSave && (
        <Box>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={!changed || saving}
          >
            {saving ? 'Saving…' : 'Save permissions'}
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default StaffPermissionsTab;
