import { parseApiError } from 'lib/api';

// An error answer to a file download is JSON, but axios hands it over as a blob when a blob was asked for.
// This turns it back into the message the API wrote (for example "This export has more than 50000 rows...").
export const blobErrorMessage = async (err: unknown): Promise<string> => {
  const response = (err as { response?: { data?: unknown } }).response;

  if (response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await response.data.text()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };
      const first = body.errors ? Object.values(body.errors)[0]?.[0] : undefined;
      if (first) return first;
      if (body.message) return body.message;
    } catch {
      // not JSON: fall through to the general message
    }
  }

  return parseApiError(err).message;
};
