import { ReportAreaConfig } from 'types/reports';

const billing: ReportAreaConfig = {
  area: 'billing',
  title: 'Billing',
  icon: 'material-symbols:payments-outline-rounded',
  description: 'Payments, refunds, daily collection and the Razorpay settlement check.',
  order: 40,
  reports: [
    'billing.payments',
    'billing.failed',
    'billing.refunds',
    'billing.offline',
    'billing.daily',
    'billing.outstanding',
    'billing.settlement',
  ],
};

export default billing;
