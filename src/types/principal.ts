// The Principal login of a school, as the Admin app shows it. Never a password or a token.
export interface SchoolPrincipal {
  uuid: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: number; // 1: Active, 2: Inactive, 3: Locked
  hasPassword: boolean;
  lastLoginAt: string | null;
  welcomeLinkSentAt: string | null;
  welcomeLinkExpiresAt: string | null;
  // only in the answer to "resend" and "reset": the one-time link to set a password, shown once
  setPasswordUrl?: string;
}
