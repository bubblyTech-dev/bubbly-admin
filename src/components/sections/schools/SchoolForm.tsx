import { useEffect, useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { parseApiError } from 'lib/api';
import { FileRules, fileService } from 'services/fileService';
import { schoolService } from 'services/schoolService';
import { School, SchoolInput } from 'types/school';
import FileUploadBox, { UploadItem } from 'components/base/FileUploadBox';

const LOGO_TYPE = 'clientLogo';

interface SchoolFormProps {
  // without a school the form adds a new one
  school?: School;
  readOnly?: boolean;
  onSaved: (school: School) => void;
}

interface FormValues {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  gstNumber: string;
  timezone: string;
  principalPassword: string;
}

const valuesOf = (school?: School): FormValues => ({
  name: school?.name ?? '',
  contactName: school?.contactName ?? '',
  contactEmail: school?.contactEmail ?? '',
  contactPhone: school?.contactPhone ?? '',
  addressLine1: school?.addressLine1 ?? '',
  addressLine2: school?.addressLine2 ?? '',
  city: school?.city ?? '',
  state: school?.state ?? '',
  postalCode: school?.postalCode ?? '',
  country: school?.country ?? 'India',
  gstNumber: school?.gstNumber ?? '',
  timezone: school?.timezone ?? 'Asia/Kolkata',
  principalPassword: '',
});

const SchoolForm = ({ school, readOnly = false, onSaved }: SchoolFormProps) => {
  const [values, setValues] = useState<FormValues>(() => valuesOf(school));
  const [rules, setRules] = useState<FileRules | null>(null);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fileService
      .rules(LOGO_TYPE)
      .then(setRules)
      .catch((err) => setError(parseApiError(err).message));
  }, []);

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: e.target.value }));
    setSaved(false);
  };

  // the logo is saved together with the form, so only remember what the upload box says
  const handleLogoChange = (files: UploadItem[]) => {
    setSaved(false);
    if (files.length === 0) {
      setLogo(undefined);
      setRemoveLogo(Boolean(school?.logo));
    } else if (files[0].serverName) {
      setLogo(files[0].serverName);
      setRemoveLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSaved(false);
    setSaving(true);

    const input: SchoolInput = { ...values };
    // the Principal password is only sent when adding a school
    if (school || !values.principalPassword) delete input.principalPassword;
    if (logo) input.logo = logo;
    if (removeLogo) input.removeLogo = true;

    try {
      const result = school
        ? await schoolService.update(school.uuid, input)
        : await schoolService.create(input);
      setLogo(undefined);
      setRemoveLogo(false);
      setSaved(true);
      onSaved(result);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  const field = (name: keyof FormValues, label: string, required = false, type = 'text') => (
    <TextField
      fullWidth
      type={type}
      id={`school-${name}`}
      label={label}
      required={required}
      value={values[name]}
      onChange={handleChange(name)}
      error={Boolean(fields[name])}
      helperText={fields[name]}
      disabled={readOnly}
    />
  );

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack direction="column" spacing={4}>
        {error && <Alert severity="error">{error}</Alert>}
        {saved && <Alert severity="success">Saved.</Alert>}

        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Logo</Typography>
          {rules ? (
            <FileUploadBox
              shape="rounded"
              width={120}
              accept={rules.extensions.map((extension) => `.${extension}` as const)}
              maxSizeMB={rules.maxSizeMB}
              label="Add logo"
              hint={`${rules.extensions.join(', ').toUpperCase()} · max ${rules.maxSizeMB} MB`}
              disabled={readOnly}
              initialFiles={
                school?.logo ? [{ url: school.logo, name: 'logo.png', kind: 'image' }] : []
              }
              uploader={(file, onProgress) => fileService.upload(LOGO_TYPE, file, onProgress)}
              onChange={handleLogoChange}
            />
          ) : null}
          {fields.logo && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {fields.logo}
            </Typography>
          )}
        </Stack>

        <Stack direction="column" spacing={2}>
          <Typography variant="h6">School</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{field('name', 'School name', true)}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{field('gstNumber', 'GST number')}</Grid>
          </Grid>
        </Stack>

        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Contact</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>{field('contactName', 'Contact name')}</Grid>
            <Grid size={{ xs: 12, md: 4 }}>{field('contactEmail', 'Contact email')}</Grid>
            <Grid size={{ xs: 12, md: 4 }}>{field('contactPhone', 'Contact phone')}</Grid>
            {!school && (
              <Grid size={{ xs: 12, md: 4 }}>
                {field('principalPassword', 'Principal password', false, 'password')}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Optional. With the contact email it creates the Principal login now (8+ characters, a letter and a
                  number). The Principal changes it at first login.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Stack>

        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Address</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{field('addressLine1', 'Address line 1')}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{field('addressLine2', 'Address line 2')}</Grid>
            <Grid size={{ xs: 12, md: 3 }}>{field('city', 'City')}</Grid>
            <Grid size={{ xs: 12, md: 3 }}>{field('state', 'State')}</Grid>
            <Grid size={{ xs: 12, md: 3 }}>{field('postalCode', 'Postal code')}</Grid>
            <Grid size={{ xs: 12, md: 3 }}>{field('country', 'Country')}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{field('timezone', 'Time zone')}</Grid>
          </Grid>
        </Stack>

        {!readOnly && (
          <Box>
            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Saving…' : school ? 'Save changes' : 'Add school'}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default SchoolForm;
