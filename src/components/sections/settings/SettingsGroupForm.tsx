import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { SettingValues, settingService } from 'services/settingService';
import { SettingGroup, SettingItem } from 'types/settings';

interface SettingsGroupFormProps {
  group: SettingGroup;
  canEdit: boolean;
  onSaved: (group: SettingGroup) => void;
}

// what the input shows for a saved value
const toInput = (setting: SettingItem): string | boolean => {
  if (setting.type === 'boolean') return Boolean(setting.value);
  if (Array.isArray(setting.value)) return setting.value.join(', ');
  return setting.value === null || setting.value === undefined ? '' : String(setting.value);
};

const initialValues = (group: SettingGroup): SettingValues => {
  const values: SettingValues = {};
  group.settings.forEach((setting) => {
    values[setting.key] = toInput(setting);
  });
  return values;
};

const helperFor = (setting: SettingItem, error?: string) => {
  if (error) return error;
  return setting.description;
};

// One tab of the Settings page. The form is built from what the API says about each setting.
const SettingsGroupForm = ({ group, canEdit, onSaved }: SettingsGroupFormProps) => {
  const [values, setValues] = useState<SettingValues>(() => initialValues(group));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSaved(false);
    setSaving(true);
    try {
      const updated = await settingService.saveGroup(group.name, values);
      onSaved(updated);
      setValues(initialValues(updated));
      setSaved(true);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack direction="column" spacing={3} sx={{ maxWidth: 640 }}>
        {!canEdit && (
          <Alert severity="info">You can view these settings but not change them.</Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {saved && <Alert severity="success">Settings saved.</Alert>}

        {group.settings.map((setting) =>
          setting.type === 'boolean' ? (
            <Box key={setting.key}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(values[setting.key])}
                    onChange={(e) => handleChange(setting.key, e.target.checked)}
                    disabled={!canEdit}
                  />
                }
                label={setting.label}
              />
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                {helperFor(setting, fields[setting.key])}
              </Typography>
            </Box>
          ) : (
            <TextField
              key={setting.key}
              fullWidth
              id={setting.key}
              label={setting.label}
              value={String(values[setting.key] ?? '')}
              onChange={(e) => handleChange(setting.key, e.target.value)}
              disabled={!canEdit}
              error={Boolean(fields[setting.key])}
              helperText={helperFor(setting, fields[setting.key])}
              slotProps={{
                htmlInput: setting.maxLength ? { maxLength: setting.maxLength } : undefined,
              }}
            />
          ),
        )}

        {canEdit && (
          <Box>
            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default SettingsGroupForm;
