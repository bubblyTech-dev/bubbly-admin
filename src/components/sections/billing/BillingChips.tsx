import { Chip } from '@mui/material';
import {
  InvoiceStatus,
  PaymentStatus,
  WebhookEventStatus,
  invoiceStatusColor,
  invoiceStatusLabel,
  paymentStatusColor,
  paymentStatusLabel,
  webhookStatusColor,
  webhookStatusLabel,
} from 'types/billing';

export const PaymentStatusChip = ({ status }: { status: PaymentStatus }) => (
  <Chip label={paymentStatusLabel[status]} color={paymentStatusColor[status]} />
);

export const InvoiceStatusChip = ({ status }: { status: InvoiceStatus }) => (
  <Chip label={invoiceStatusLabel[status]} color={invoiceStatusColor[status]} />
);

export const WebhookStatusChip = ({ status }: { status: WebhookEventStatus }) => (
  <Chip label={webhookStatusLabel[status]} color={webhookStatusColor[status]} />
);
