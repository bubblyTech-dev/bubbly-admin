import { Divider, Stack } from '@mui/material';
import AccountTabPanelSection from '../common/AccountTabPanelSection';
import ChangePassword from './ChangePassword';

const SecurityTabPanel = () => {
  return (
    <Stack direction="column" divider={<Divider />} spacing={5}>
      <AccountTabPanelSection
        title="Change Password"
        subtitle="Use at least 8 characters. Changing your password signs you out of your other devices."
        icon="material-symbols:lock-outline"
      >
        <ChangePassword />
      </AccountTabPanelSection>
    </Stack>
  );
};

export default SecurityTabPanel;
