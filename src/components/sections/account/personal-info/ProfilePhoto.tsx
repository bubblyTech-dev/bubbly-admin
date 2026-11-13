import { useEffect, useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import { FileRules, fileService } from 'services/fileService';
import FileUploadBox, { UploadItem } from 'components/base/FileUploadBox';

const FILE_TYPE = 'adminProfile';

// A finished upload is saved straight away, and so is deleting the photo.
const ProfilePhoto = () => {
  const { user, updateProfile } = useAuth();
  const [rules, setRules] = useState<FileRules | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fileService
      .rules(FILE_TYPE)
      .then(setRules)
      .catch((err) => setError(parseApiError(err).message));
  }, []);

  const handleChange = async (files: UploadItem[]) => {
    setError('');
    try {
      if (files.length === 0) {
        if (user?.profileImage) await updateProfile({ removeProfileImage: true });
      } else if (files[0].serverName) {
        await updateProfile({ profileImage: files[0].serverName });
      }
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <Stack direction="column" spacing={2} sx={{ alignItems: 'center' }}>
      {rules && (
        <FileUploadBox
          align="center"
          shape="round"
          width={120}
          accept={rules.extensions.map((extension) => `.${extension}` as const)}
          maxSizeMB={rules.maxSizeMB}
          label="Add photo"
          hint={`${rules.extensions.join(', ').toUpperCase()} · max ${rules.maxSizeMB} MB`}
          initialFiles={
            user?.profileImage
              ? [{ url: user.profileImage, name: 'profile.png', kind: 'image' }]
              : []
          }
          uploader={(file, onProgress) => fileService.upload(FILE_TYPE, file, onProgress)}
          onChange={handleChange}
        />
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
};

export default ProfilePhoto;
