import { useState } from 'react';
import { Button } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import RecordOfflinePaymentDialog from './RecordOfflinePaymentDialog';

// The "Record offline payment" button for the page header of the Payments list, with its dialog.
const RecordOfflinePaymentButton = ({ onRecorded }: { onRecorded: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
        onClick={() => setOpen(true)}
      >
        Record offline payment
      </Button>
      <RecordOfflinePaymentDialog
        open={open}
        onClose={() => setOpen(false)}
        onRecorded={onRecorded}
      />
    </>
  );
};

export default RecordOfflinePaymentButton;
