import { PropsWithChildren, useEffect, useMemo } from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useColorScheme,
} from '@mui/material';
import { ThemeMode, getPreset } from 'theme/presets';
import { createThemeOverrides } from 'theme/theme';
import createTypography from 'theme/typography';
import { useSettingsContext } from './SettingsProvider';

// keeps MUI's colour scheme in step with the selected preset (a preset is either light or dark)
const ModeSync = ({ mode }: { mode: ThemeMode }) => {
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(mode);
  }, [mode, setMode]);

  return null;
};

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const {
    config: { fontFamily, themePreset },
  } = useSettingsContext();

  const preset = getPreset(themePreset);
  const typography = useMemo(() => createTypography(fontFamily), [fontFamily]);

  const theme = useMemo(
    () => createTheme({ typography, ...createThemeOverrides(preset) }),
    [typography, preset],
  );

  return (
    <MuiThemeProvider
      disableTransitionOnChange
      theme={theme}
      defaultMode={preset.mode}
      storageManager={null}
    >
      <ModeSync mode={preset.mode} />
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
