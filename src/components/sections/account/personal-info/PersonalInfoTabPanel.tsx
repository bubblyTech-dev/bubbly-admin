import { Divider, Stack } from '@mui/material';
import AccountTabPanelSection from '../common/AccountTabPanelSection';
import Email from './Email';
import Names from './Names';
import Phone from './Phone';
import ProfilePhoto from './ProfilePhoto';

const PersonalInfoTabPanel = () => {
  return (
    <Stack direction="column" divider={<Divider />} spacing={5}>
      <AccountTabPanelSection
        title="Profile Photo"
        subtitle="Add a photo so your team can recognise you."
        icon="material-symbols:imagesmode-outline"
      >
        <ProfilePhoto />
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Name"
        subtitle="Edit your name here if you wish to make any changes."
        icon="material-symbols:badge-outline"
      >
        <Names />
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Phone"
        subtitle="Add a personal or official phone number so your team can reach you."
        icon="material-symbols:call-outline"
      >
        <Phone />
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Email Address"
        subtitle="This is the email you log in with."
        icon="material-symbols:mail-outline"
      >
        <Email />
      </AccountTabPanelSection>
    </Stack>
  );
};

export default PersonalInfoTabPanel;
