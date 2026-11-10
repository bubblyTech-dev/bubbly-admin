import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { formatRupees, intervalLabel, paiseToRupees, rupeesToPaise } from 'lib/money';
import { billingService } from 'services/billingService';
import { planService } from 'services/planService';
import { schoolService } from 'services/schoolService';
import { Plan } from 'types/plans';
import { School } from 'types/school';

interface RecordOfflinePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onRecorded: () => void;
}

const today = () => dayjs().format('YYYY-MM-DD');

// For a school that paid outside Razorpay (bank transfer, cash, cheque, UPI). Staff enter the money received and the
// last day the school may use the product. The payment gets a GST invoice like an online one.
const RecordOfflinePaymentDialog = ({
  open,
  onClose,
  onRecorded,
}: RecordOfflinePaymentDialogProps) => {
  const [methods, setMethods] = useState<string[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [school, setSchool] = useState<School | null>(null);
  const [planUuid, setPlanUuid] = useState('');
  const [amount, setAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [paidAt, setPaidAt] = useState(today());
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const debouncedSchoolSearch = useDebouncedValue(schoolSearch);

  // the choices: payment methods from Settings and the published plans
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setSchool(null);
    setPlanUuid('');
    setAmount('');
    setAmountTouched(false);
    setPaidAt(today());
    setReference('');
    setValidUntil('');
    setNotes('');
    setError('');
    setFields({});
    setLoading(true);

    Promise.all([billingService.offlineOptions(), planService.list({ status: 2, perPage: 100 })])
      .then(([methodList, planResult]) => {
        if (!active) return;
        setMethods(methodList);
        setMethod(methodList[0] ?? '');
        setPlans(planResult.plans);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  // searchable list of active schools
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    schoolService
      .list({ search: debouncedSchoolSearch || undefined, status: 1, perPage: 20 })
      .then((result) => {
        if (active) setSchools(result.data);
      })
      .catch(() => {
        if (active) setSchools([]);
      });
    return () => {
      active = false;
    };
  }, [open, debouncedSchoolSearch]);

  // choosing a plan fills in its price until the amount is typed by hand
  const choosePlan = (uuid: string) => {
    setPlanUuid(uuid);
    const plan = plans.find((item) => item.uuid === uuid);
    if (plan && !amountTouched) setAmount(paiseToRupees(plan.pricePaise));
  };

  const handleSave = async () => {
    setError('');
    setFields({});

    const paise = rupeesToPaise(amount);
    if (!school || !planUuid || paise === null) {
      setFields({
        ...(school ? {} : { schoolUuid: 'Choose the school.' }),
        ...(planUuid ? {} : { planUuid: 'Choose the plan.' }),
        ...(paise === null
          ? { amountPaise: 'Enter the amount received, for example 1180.00.' }
          : {}),
      });
      return;
    }

    setSaving(true);
    try {
      await billingService.recordOffline({
        schoolUuid: school.uuid,
        planUuid,
        amountPaise: paise,
        paidAt,
        method,
        reference: reference || undefined,
        validUntil,
        notes: notes || undefined,
      });
      onRecorded();
      onClose();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record offline payment</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={schools}
            value={school}
            loading={loading}
            disabled={saving}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
            filterOptions={(options) => options}
            onChange={(_event, value) => setSchool(value)}
            onInputChange={(_event, value) => setSchoolSearch(value)}
            noOptionsText="No active school found"
            renderInput={(params) => (
              <TextField
                {...params}
                label="School"
                error={Boolean(fields.schoolUuid)}
                helperText={fields.schoolUuid}
              />
            )}
          />

          <TextField
            select
            fullWidth
            label="Plan"
            value={planUuid}
            disabled={loading || saving}
            onChange={(e) => choosePlan(e.target.value)}
            error={Boolean(fields.planUuid)}
            helperText={fields.planUuid}
          >
            {plans.map((plan) => (
              <MenuItem key={plan.uuid} value={plan.uuid}>
                {plan.name} · {formatRupees(plan.pricePaise)} /{' '}
                {intervalLabel(plan.billingInterval)}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Amount received (₹)"
              value={amount}
              disabled={saving}
              onChange={(e) => {
                setAmountTouched(true);
                setAmount(e.target.value);
              }}
              error={Boolean(fields.amountPaise)}
              helperText={fields.amountPaise ?? 'GST is taken out of this amount for the invoice.'}
            />
            <TextField
              select
              fullWidth
              label="Method"
              value={method}
              disabled={loading || saving}
              onChange={(e) => setMethod(e.target.value)}
              error={Boolean(fields.method)}
              helperText={fields.method}
            >
              {methods.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Payment date"
              value={paidAt}
              disabled={saving}
              onChange={(e) => setPaidAt(e.target.value)}
              error={Boolean(fields.paidAt)}
              helperText={fields.paidAt}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="date"
              label="Valid until"
              value={validUntil}
              disabled={saving}
              onChange={(e) => setValidUntil(e.target.value)}
              error={Boolean(fields.validUntil)}
              helperText={fields.validUntil ?? 'The last day the school may use Bubbly.'}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <TextField
            fullWidth
            label="Reference (optional)"
            value={reference}
            disabled={saving}
            onChange={(e) => setReference(e.target.value)}
            error={Boolean(fields.reference)}
            helperText={fields.reference ?? 'Bank reference, cheque number or UPI id.'}
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Note (optional)"
            value={notes}
            disabled={saving}
            onChange={(e) => setNotes(e.target.value)}
            error={Boolean(fields.notes)}
            helperText={fields.notes}
          />

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This records the payment, issues a GST invoice and keeps the school Active until the
            valid-until date. After that date the school becomes past due, then suspended, using the
            grace days in Settings.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Record payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordOfflinePaymentDialog;
