import { Chip } from '@mui/material';
import {
  SubscriptionStatus,
  subscriptionStatusColor,
  subscriptionStatusLabel,
} from 'types/subscriptions';

const SubscriptionStatusChip = ({ status }: { status: SubscriptionStatus }) => {
  return <Chip label={subscriptionStatusLabel[status]} color={subscriptionStatusColor[status]} />;
};

export default SubscriptionStatusChip;
