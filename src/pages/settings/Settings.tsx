import { SyntheticEvent, useEffect, useState } from 'react';
import { Alert, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import { settingService } from 'services/settingService';
import { SettingGroup } from 'types/settings';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loading/PageLoader';
import SettingsGroupForm from 'components/sections/settings/SettingsGroupForm';

const Settings = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('settings.edit');

  const [groups, setGroups] = useState<SettingGroup[]>([]);
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    settingService
      .list()
      .then((list) => {
        setGroups(list);
        setActive(list[0]?.name ?? '');
      })
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated: SettingGroup) => {
    setGroups((current) => current.map((group) => (group.name === updated.name ? updated : group)));
  };

  if (loading) return <PageLoader />;

  const current = groups.find((group) => group.name === active);

  return (
    <Paper sx={{ flex: 1, maxWidth: 1, p: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 4 }}>
        <IconifyIcon icon="material-symbols:settings-outline-rounded" sx={{ fontSize: 32 }} />
        <Typography variant="h4">Settings</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {current && (
        <>
          <Tabs
            value={active}
            onChange={(_event: SyntheticEvent, value: string) => setActive(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 4 }}
          >
            {groups.map((group) => (
              <Tab key={group.name} value={group.name} label={group.label} />
            ))}
          </Tabs>

          <SettingsGroupForm
            key={current.name}
            group={current}
            canEdit={canEdit}
            onSaved={handleSaved}
          />
        </>
      )}
    </Paper>
  );
};

export default Settings;
