import { ReportAreaConfig } from 'types/reports';

const gstInvoices: ReportAreaConfig = {
  area: 'gst-invoices',
  title: 'GST & invoices',
  icon: 'material-symbols:description-outline-rounded',
  description: 'Invoice register, GST summary for filing and statements per school.',
  order: 50,
  reports: ['gst.invoice_register', 'gst.summary', 'gst.statement'],
};

export default gstInvoices;
