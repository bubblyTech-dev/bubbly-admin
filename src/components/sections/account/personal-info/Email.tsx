import { Stack } from '@mui/material';
import { useAccounts } from 'providers/AccountsProvider';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

// read only: the email is the login, so it cannot be edited here
const Email = () => {
  const { personalInfo } = useAccounts();

  return (
    <InfoCard>
      <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
        <InfoCardAttribute label="Email" value={personalInfo.email} />
      </Stack>
    </InfoCard>
  );
};

export default Email;
