import { PropsWithChildren, createContext, use } from 'react';
import { useAuth } from 'providers/AuthProvider';
import { PersonalInfo } from 'types/accounts';

interface AccountsContextInterface {
  personalInfo: PersonalInfo;
}

export const AccountsContext = createContext({} as AccountsContextInterface);

// The account page shows the logged-in admin's own details
const AccountsProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();

  const personalInfo: PersonalInfo = {
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
  };

  return <AccountsContext value={{ personalInfo }}>{children}</AccountsContext>;
};

export const useAccounts = () => use(AccountsContext);

export default AccountsProvider;
