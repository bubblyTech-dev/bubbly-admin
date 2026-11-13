export interface AuthUser {
  uuid: string;
  name: string | null;
  email: string;
  phone: string | null;
  profileImage: string | null; // full link, ready to use in <img>
  type: number;
  isMaster: boolean;
  status: number;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  permissions: string[];
}

export interface AuthPayload {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface ApiErrorInfo {
  message: string;
  code?: string;
  status?: number;
  // per-field messages from a 422, first message of each field
  fields: Record<string, string>;
}
