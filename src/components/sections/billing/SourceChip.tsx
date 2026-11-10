import { Chip } from '@mui/material';
import { BillingSource, billingSourceLabel } from 'types/billing';

// Online (Razorpay) or Offline (recorded by staff), for payments and subscriptions.
const SourceChip = ({ source }: { source: BillingSource }) => (
  <Chip
    size="small"
    variant="outlined"
    label={billingSourceLabel[source] ?? billingSourceLabel[1]}
    color={source === 2 ? 'warning' : 'default'}
  />
);

export default SourceChip;
