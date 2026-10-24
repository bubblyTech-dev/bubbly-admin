import { Link, SxProps, Theme } from '@mui/material';
import { rootPaths } from 'routes/paths';
import Image from 'components/base/Image';
import logoMark from '/assets/images/logo-mark.svg';
import logo from '/assets/images/logo.svg';

interface LogoProps {
  showName?: boolean;
  sx?: SxProps<Theme>;
}

// The Bubbly logo (public/assets/images/logo.svg, a vector so it stays sharp at any size).
// When the sidebar is collapsed only the "B" is shown.
const Logo = ({ showName = true, sx }: LogoProps) => (
  <Link
    href={rootPaths.root}
    underline="none"
    aria-label="Bubbly home"
    sx={{ display: 'flex', alignItems: 'center' }}
  >
    <Image
      src={showName ? logo : logoMark}
      alt="Bubbly"
      sx={[
        (theme) => ({
          height: 40,
          width: 'auto',
          display: 'block',
          // a faint light edge keeps the dark outline readable on dark themes
          ...theme.applyStyles('dark', {
            filter: 'drop-shadow(0 0 1.2px rgba(255, 255, 255, 0.5))',
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  </Link>
);

export default Logo;
