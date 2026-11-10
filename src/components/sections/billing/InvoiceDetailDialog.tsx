import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import useInvoicePdf from 'hooks/useInvoicePdf';
import { parseApiError } from 'lib/api';
import { formatDate, formatDateTime } from 'lib/format';
import { formatRupees } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import { billingService } from 'services/billingService';
import { Invoice, InvoiceParty } from 'types/billing';
import CopyText from 'components/common/CopyText';
import { InvoiceStatusChip } from './BillingChips';
import DetailField from './DetailField';

interface InvoiceDetailDialogProps {
  uuid: string | null;
  onClose: () => void;
}

const Party = ({ title, party }: { title: string; party: InvoiceParty }) => (
  <Stack direction="column" spacing={0.5}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {title}
    </Typography>
    <Typography variant="subtitle2">{party.name || '-'}</Typography>
    <Typography variant="body2">{party.address || '-'}</Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      GST: {party.gstNumber || '-'}
    </Typography>
  </Stack>
);

const AmountRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
    <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 400 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 400 }}>
      {value}
    </Typography>
  </Stack>
);

// One invoice: who issued it, who it is for, and how the GST is split.
const InvoiceDetailDialog = ({ uuid, onClose }: InvoiceDetailDialogProps) => {
  const { hasPermission } = useAuth();
  const pdf = useInvoicePdf();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState('');

  // closing also clears a download error left from this invoice
  const handleClose = () => {
    pdf.clearError();
    onClose();
  };

  useEffect(() => {
    if (!uuid) return undefined;
    let active = true;
    setInvoice(null);
    setError('');

    billingService
      .getInvoice(uuid)
      .then((result) => {
        if (active) setInvoice(result);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      });

    return () => {
      active = false;
    };
  }, [uuid]);

  return (
    <Dialog open={Boolean(uuid)} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Invoice</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {pdf.error && (
          <Alert severity="error" sx={{ mt: error ? 2 : 0 }}>
            {pdf.error}
          </Alert>
        )}
        {invoice && (
          <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <InvoiceStatusChip status={invoice.status} />
              <CopyText value={invoice.invoiceNo} />
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Party title="From" party={invoice.seller} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Party title="To" party={invoice.buyer} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailField label="Issued">{formatDateTime(invoice.issuedAt)}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailField label="Period">
                  {invoice.periodStart ? formatDate(invoice.periodStart) : '-'} to{' '}
                  {invoice.periodEnd ? formatDate(invoice.periodEnd) : '-'}
                </DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailField label="Razorpay payment id">
                  <CopyText value={invoice.razorpayPaymentId} />
                </DetailField>
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="column" spacing={1} sx={{ maxWidth: 360, ml: 'auto', width: 1 }}>
              <AmountRow label="Subtotal" value={formatRupees(invoice.subtotalPaise)} />
              <AmountRow
                label={`GST (${invoice.taxRatePercent}%)`}
                value={formatRupees(invoice.taxPaise)}
              />
              <Divider />
              <AmountRow label="Total" value={formatRupees(invoice.totalPaise)} bold />
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {invoice && hasPermission('billing.invoices_download') && (
          <Button
            variant="contained"
            disabled={pdf.busy !== null}
            onClick={() => void pdf.download(invoice.uuid, invoice.invoiceNo)}
          >
            {pdf.busy ? 'Preparing PDF…' : 'Download PDF'}
          </Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDetailDialog;
