import { AccountTab } from 'types/accounts';
import PersonalInfoTabPanel from 'components/sections/account/personal-info/PersonalInfoTabPanel';
import SecurityTabPanel from 'components/sections/account/security/SecurityTabPanel';

export const accountTabs: AccountTab[] = [
  {
    id: 1,
    label: 'Personal Information',
    title: 'Personal Info',
    value: 'personal_information',
    icon: 'material-symbols:person-outline',
    panelIcon: 'material-symbols:person-outline',
    tabPanel: <PersonalInfoTabPanel />,
  },
  {
    id: 2,
    label: 'Security',
    title: 'Security',
    value: 'security',
    icon: 'material-symbols:lock-outline',
    panelIcon: 'material-symbols:lock-outline',
    tabPanel: <SecurityTabPanel />,
  },
];
