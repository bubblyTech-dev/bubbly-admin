import { Chip } from '@mui/material';
import { RenewalTab } from 'types/renewals';

interface RenewalDaysChipProps {
  tab: RenewalTab;
  daysLeft: number | null;
}

const plural = (days: number) => `${days} day${days === 1 ? '' : 's'}`;

// The "when" of a renewal row in words and colour:
//   Due soon:        "in 3 days", warning when it is 2 days or less, red "2 days overdue" once the date has passed
//   In grace period: "5 days left", warning at 2 days or less
//   Payment failed and Suspended: "2 days ago"
const RenewalDaysChip = ({ tab, daysLeft }: RenewalDaysChipProps) => {
  if (daysLeft === null) return <Chip label="-" />;

  if (tab === 'payment_failed' || tab === 'suspended') {
    const ago = Math.max(0, -daysLeft);
    return (
      <Chip
        label={ago === 0 ? 'Today' : `${plural(ago)} ago`}
        color={tab === 'suspended' ? 'error' : 'warning'}
      />
    );
  }

  if (tab === 'in_grace') {
    return (
      <Chip
        label={daysLeft <= 0 ? 'Ends today' : `${plural(daysLeft)} left`}
        color={daysLeft <= 2 ? 'warning' : 'info'}
      />
    );
  }

  if (daysLeft < 0) return <Chip label={`${plural(-daysLeft)} overdue`} color="error" />;
  if (daysLeft === 0) return <Chip label="Today" color="warning" />;
  return <Chip label={`in ${plural(daysLeft)}`} color={daysLeft <= 2 ? 'warning' : 'default'} />;
};

export default RenewalDaysChip;
