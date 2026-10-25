import {
  PropsWithChildren,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { refreshSession, setAccessToken, setSessionLostHandler } from 'lib/api';
import { authService } from 'services/authService';
import { ProfileInput, profileService } from 'services/profileService';
import { AuthStatus, AuthUser } from 'types/auth';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }) => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const clear = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // On first load (and after a page refresh) try to continue the session using the refresh cookie.
  useEffect(() => {
    setSessionLostHandler(clear);
    let active = true;

    refreshSession()
      .then((payload) => {
        if (!active) return;
        setUser(payload.user);
        setStatus('authenticated');
      })
      .catch(() => {
        if (active) clear();
      });

    return () => {
      active = false;
      setSessionLostHandler(null);
    };
  }, [clear]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await authService.login(email, password);
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    setStatus('authenticated');
    return payload.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // the local session is cleared even when the server cannot be reached
    }
    clear();
  }, [clear]);

  const changePassword = useCallback<AuthContextValue['changePassword']>(async (input) => {
    setUser(await authService.changePassword(input));
  }, []);

  const updateProfile = useCallback(async (input: ProfileInput) => {
    setUser(await profileService.update(input));
  }, []);

  const hasPermission = useCallback(
    (key: string) => Boolean(user && (user.isMaster || user.permissions.includes(key))),
    [user],
  );

  const value = useMemo(
    () => ({ status, user, login, logout, changePassword, updateProfile, hasPermission }),
    [status, user, login, logout, changePassword, updateProfile, hasPermission],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};

export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export default AuthProvider;
