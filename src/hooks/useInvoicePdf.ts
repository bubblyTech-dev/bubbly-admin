import { useState } from 'react';
import { parseApiError } from 'lib/api';
import { saveBlob } from 'lib/download';
import { billingService } from 'services/billingService';

// Downloads an invoice as a PDF. `error` holds the message when it fails, `busy` the uuid being fetched.
const useInvoicePdf = () => {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const download = async (uuid: string, invoiceNo: string) => {
    setBusy(uuid);
    setError('');
    try {
      saveBlob(await billingService.downloadInvoicePdf(uuid), `${invoiceNo}.pdf`);
    } catch (err) {
      // an error answer is JSON, but axios hands it over as a blob when a blob was asked for
      setError(await messageFromError(err));
    }
    setBusy(null);
  };

  return { download, busy, error, clearError: () => setError('') };
};

const messageFromError = async (err: unknown): Promise<string> => {
  const response = (err as { response?: { data?: unknown } }).response;
  if (response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await response.data.text()) as { message?: string };
      if (body.message) return body.message;
    } catch {
      // not JSON: use the general message below
    }
  }
  return parseApiError(err).message;
};

export default useInvoicePdf;
