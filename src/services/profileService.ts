import api from 'lib/api';
import { AuthUser } from 'types/auth';

// Send only what changed.
//   profileImage        the temp name returned by fileService.upload
//   removeProfileImage  true to delete the current photo
//   phone: ''           clears the phone
export interface ProfileInput {
  name?: string;
  phone?: string;
  profileImage?: string;
  removeProfileImage?: boolean;
}

export const profileService = {
  async update(input: ProfileInput): Promise<AuthUser> {
    const res = await api.patch('/admin/profile', input);
    return res.data.data.user;
  },
};
