import { MouseEventHandler } from 'react';
import { Tab, TabOwnProps, tabClasses } from '@mui/material';

interface AccountTabProps extends TabOwnProps {
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
}
const AccountTab = (props: AccountTabProps) => {
  return (
    <Tab
      {...props}
      sx={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 1.5,
        [`& .${tabClasses.icon}`]: {
          mb: 0,
        },
        maxWidth: 1,
        ...props.sx,
      }}
    />
  );
};

export default AccountTab;
