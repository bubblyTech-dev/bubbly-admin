import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  Alert,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { parseApiError } from 'lib/api';
import { paiseToRupees, rupeesToPaise } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { planService } from 'services/planService';
import { Plan, PlanInput, PlanOptions } from 'types/plans';
import ConfirmDialog from 'components/common/ConfirmDialog';
import PageHeader from 'components/common/PageHeader';
import GatewayChip from 'components/sections/plans/GatewayChip';
import PlanFeatures from 'components/sections/plans/PlanFeatures';
import PlanStatusChip from 'components/sections/plans/PlanStatusChip';

interface LimitField {
  unlimited: boolean;
  value: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const PlanForm = () => {
  const { uuid } = useParams();
  const isNew = !uuid;
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [options, setOptions] = useState<PlanOptions | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [priceText, setPriceText] = useState('');
  const [interval, setInterval] = useState('1');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [limits, setLimits] = useState<Record<string, LimitField>>({});
  const [features, setFeatures] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState(
    (location.state as { notice?: string } | null)?.notice ?? '',
  );
  const [pending, setPending] = useState<'publish' | 'archive' | null>(null);
  const [working, setWorking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fill = (source: Plan) => {
    setPlan(source);
    setName(source.name);
    setSlug(source.slug);
    setSlugTouched(true);
    setDescription(source.description ?? '');
    setPriceText(paiseToRupees(source.pricePaise));
    setInterval(String(source.billingInterval));
    setTaxInclusive(source.taxInclusive);
    setIsFeatured(source.isFeatured);
    setSortOrder(String(source.sortOrder));
    setLimits(
      Object.fromEntries(
        Object.entries(source.limits).map(([key, value]) => [
          key,
          { unlimited: value === null, value: value === null ? '' : String(value) },
        ]),
      ),
    );
    setFeatures(source.features.map((feature) => feature.title));
  };

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const loadedOptions = await planService.options();
        if (!active) return;

        setOptions(loadedOptions);

        if (uuid) {
          fill(await planService.get(uuid));
        } else {
          setLimits(
            Object.fromEntries(
              loadedOptions.limits.map((limit) => [limit.key, { unlimited: true, value: '' }]),
            ),
          );
        }
      } catch (err) {
        if (active) setError(parseApiError(err).message);
      }
      if (active) setLoading(false);
    };

    void start();
    return () => {
      active = false;
    };
  }, [uuid]);

  const published = plan?.status === 2;
  const archived = plan?.status === 3;
  const canSave = isNew ? hasPermission('plans.create') : hasPermission('plans.edit');
  const readOnly = archived || !canSave;
  const lockedPrice = readOnly || published;
  const priceInPaise = rupeesToPaise(priceText);
  const overAutoChargeLimit =
    options !== null &&
    priceInPaise !== null &&
    options.maxAutoChargeRupees > 0 &&
    priceInPaise > options.maxAutoChargeRupees * 100;

  const handleSave = async () => {
    setError('');
    setFields({});

    const problems: Record<string, string> = {};
    const price = rupeesToPaise(priceText);
    if (price === null)
      problems.pricePaise = 'Enter an amount in rupees, for example 499 or 499.50.';

    const limitValues: Record<string, number | null> = {};
    Object.entries(limits).forEach(([key, field]) => {
      if (field.unlimited) {
        limitValues[key] = null;
      } else if (/^\d+$/.test(field.value.trim())) {
        limitValues[key] = Number(field.value);
      } else {
        problems.limits = 'Enter a whole number, or switch on Unlimited.';
      }
    });
    if (Object.keys(problems).length) {
      setFields(problems);
      return;
    }

    const payload: PlanInput = {
      name,
      description,
      isFeatured,
      sortOrder: Number(sortOrder) || 0,
      limits: limitValues,
      features,
    };
    // a published plan keeps these; the server would refuse a change
    if (!published) {
      payload.slug = slug || undefined;
      payload.pricePaise = price ?? 0;
      payload.billingInterval = Number(interval);
      payload.taxInclusive = taxInclusive;
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await planService.create(payload);
        navigate(`${paths.plans}/${created.uuid}`, {
          replace: true,
          state: { notice: 'Plan created as a draft.' },
        });
        return;
      }
      fill(await planService.update(uuid, payload));
      setNotice('Plan saved.');
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.plan ?? info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  const handleConfirm = async () => {
    if (!plan || !pending) return;
    setWorking(true);
    setError('');
    try {
      fill(
        pending === 'publish'
          ? await planService.publish(plan.uuid)
          : await planService.archive(plan.uuid),
      );
      setNotice(pending === 'publish' ? 'Plan published.' : 'Plan archived.');
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.plan ?? info.message);
    }
    setPending(null);
    setWorking(false);
  };

  const handleSync = async () => {
    if (!plan) return;
    setSyncing(true);
    setError('');
    try {
      fill(await planService.syncGateway(plan.uuid));
      setNotice('The plan is now on Razorpay.');
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.plan ?? info.message);
    }
    setSyncing(false);
  };

  const handleDuplicate = async () => {
    if (!plan) return;
    setError('');
    try {
      const copy = await planService.duplicate(plan.uuid);
      navigate(`${paths.plans}/${copy.uuid}`, {
        state: {
          notice: 'New draft created from the plan. Change its price and publish it when ready.',
        },
      });
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title={isNew ? 'New plan' : (plan?.name ?? 'Plan')}
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Plans', url: paths.plans },
          { label: isNew ? 'New' : (plan?.name ?? 'Plan'), active: true },
        ]}
        actionComponent={
          plan ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PlanStatusChip status={plan.status} />
              {plan.status === 1 && hasPermission('plans.publish') && (
                <Button variant="contained" onClick={() => setPending('publish')}>
                  Publish
                </Button>
              )}
              {hasPermission('plans.create') && (
                <Button variant="soft" color="neutral" onClick={() => void handleDuplicate()}>
                  Duplicate
                </Button>
              )}
              {plan.status !== 3 && hasPermission('plans.archive') && (
                <Button variant="soft" color="neutral" onClick={() => setPending('archive')}>
                  Archive
                </Button>
              )}
            </Stack>
          ) : undefined
        }
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={4} sx={{ maxWidth: 820 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}
          {published && (
            <Alert severity="info">
              This plan is published. Its price, billing interval, tax setting and link name are
              locked because schools may already pay for them. To change the price, use Duplicate to
              create a new version.
            </Alert>
          )}
          {archived && (
            <Alert severity="warning">
              This plan is archived and cannot be edited. Use Duplicate to start a new draft from
              it.
            </Alert>
          )}

          <Stack direction="column" spacing={3}>
            <Typography variant="h6">Details</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  disabled={readOnly || loading}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (isNew && !slugTouched) setSlug(slugify(e.target.value));
                  }}
                  error={Boolean(fields.name)}
                  helperText={fields.name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Link name"
                  value={slug}
                  disabled={lockedPrice || loading}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setSlugTouched(true);
                  }}
                  error={Boolean(fields.slug)}
                  helperText={
                    fields.slug ?? 'Used in public links. Made from the name if left empty.'
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Description"
                  value={description}
                  disabled={readOnly || loading}
                  onChange={(e) => setDescription(e.target.value)}
                  error={Boolean(fields.description)}
                  helperText={fields.description}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Sort order"
                  type="number"
                  value={sortOrder}
                  disabled={readOnly || loading}
                  onChange={(e) => setSortOrder(e.target.value)}
                  error={Boolean(fields.sortOrder)}
                  helperText={fields.sortOrder}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 9 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFeatured}
                      disabled={readOnly || loading}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                  }
                  label="Highlight on the pricing page"
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack direction="column" spacing={3}>
            <Typography variant="h6">Price</Typography>
            {overAutoChargeLimit && options && (
              <Alert severity="warning">
                Banks limit automatic debit (UPI AutoPay and cards) to about ₹
                {options.maxAutoChargeRupees.toLocaleString('en-IN')} per charge without extra
                authentication. A price above that may not be charged automatically each period.
                Confirm the current limit with Razorpay.
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  value={priceText}
                  disabled={lockedPrice || loading}
                  onChange={(e) => setPriceText(e.target.value)}
                  error={Boolean(fields.pricePaise)}
                  helperText={fields.pricePaise ?? 'In rupees. Stored in paise.'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Billing interval"
                  value={interval}
                  disabled={lockedPrice || loading}
                  onChange={(e) => setInterval(e.target.value)}
                  error={Boolean(fields.billingInterval)}
                  helperText={fields.billingInterval}
                >
                  {(options?.intervals ?? []).map((item) => (
                    <MenuItem key={item.value} value={String(item.value)}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={taxInclusive}
                      disabled={lockedPrice || loading}
                      onChange={(e) => setTaxInclusive(e.target.checked)}
                    />
                  }
                  label="Price includes GST"
                />
              </Grid>
            </Grid>
          </Stack>

          {plan && plan.status !== 1 && (
            <>
              <Divider />
              <Stack direction="column" spacing={2}>
                <Typography variant="h6">Razorpay</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <GatewayChip plan={plan} />
                  {!plan.gatewaySynced && plan.status === 2 && hasPermission('plans.publish') && (
                    <Button
                      variant="soft"
                      color="neutral"
                      onClick={() => void handleSync()}
                      disabled={syncing}
                    >
                      {syncing ? 'Syncing…' : 'Sync to Razorpay'}
                    </Button>
                  )}
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  A plan is created on Razorpay once, when it is published. Razorpay plans cannot be
                  edited, which is why a published plan's price is locked.
                </Typography>
              </Stack>
            </>
          )}

          <Divider />

          <Stack direction="column" spacing={3}>
            <Typography variant="h6">Limits</Typography>
            {fields.limits && <Alert severity="error">{fields.limits}</Alert>}
            <Grid container spacing={3}>
              {(options?.limits ?? []).map((limit) => {
                const field = limits[limit.key] ?? { unlimited: true, value: '' };
                return (
                  <Grid key={limit.key} size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        label={limit.label}
                        type="number"
                        value={field.unlimited ? '' : field.value}
                        placeholder={field.unlimited ? 'Unlimited' : ''}
                        disabled={readOnly || loading || field.unlimited}
                        onChange={(e) =>
                          setLimits({ ...limits, [limit.key]: { ...field, value: e.target.value } })
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.unlimited}
                            disabled={readOnly || loading}
                            onChange={(e) =>
                              setLimits({
                                ...limits,
                                [limit.key]: { ...field, unlimited: e.target.checked },
                              })
                            }
                          />
                        }
                        label="Unlimited"
                        sx={{ whiteSpace: 'nowrap' }}
                      />
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>

          <Divider />

          <PlanFeatures
            features={features}
            onChange={setFeatures}
            readOnly={readOnly || loading}
            error={fields.features}
          />

          {!readOnly && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => void handleSave()}
                disabled={saving || loading}
              >
                {saving ? 'Saving…' : isNew ? 'Create plan' : 'Save changes'}
              </Button>
              <Button
                variant="soft"
                color="neutral"
                size="large"
                onClick={() => navigate(paths.plans)}
                disabled={saving}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending === 'publish' ? 'Publish this plan?' : 'Archive this plan?'}
        message={
          pending === 'publish'
            ? 'It will appear on the pricing page, and its price and billing interval can no longer be changed.'
            : 'It disappears from the pricing page. Schools already on it keep it.'
        }
        confirmLabel={pending === 'publish' ? 'Publish' : 'Archive'}
        loading={working}
        onConfirm={() => void handleConfirm()}
        onClose={() => setPending(null)}
      />
    </Stack>
  );
};

export default PlanForm;
