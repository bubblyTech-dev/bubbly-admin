import { Chip, Stack, Typography } from '@mui/material';
import { Plan } from 'types/plans';

// Whether a plan exists on Razorpay. A draft is never created there, so it shows a dash.
const GatewayChip = ({ plan }: { plan: Plan }) => {
  if (plan.status === 1) {
    return (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Created when published
      </Typography>
    );
  }

  return (
    <Stack direction="column" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
      <Chip
        label={plan.gatewaySynced ? 'Synced' : 'Not synced'}
        color={plan.gatewaySynced ? 'success' : 'warning'}
      />
      {plan.razorpayPlanId && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {plan.razorpayPlanId}
        </Typography>
      )}
    </Stack>
  );
};

export default GatewayChip;
