import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';

export interface ChartPalette {
  // series colours, in the order series are drawn
  colors: string[];
  text: string;
  muted: string;
  grid: string;
  surface: string;
}

// ECharts cannot read CSS variables, so the theme colours are resolved to real values here.
// It follows the colour theme the admin picked (and light or dark), so charts never use a hard-coded colour.
const useChartPalette = (): ChartPalette => {
  const { vars } = useTheme();
  const { getThemeColor, config } = useSettingsContext();

  return useMemo(
    () => ({
      colors: [
        getThemeColor(vars.palette.primary.main),
        getThemeColor(vars.palette.success.main),
        getThemeColor(vars.palette.warning.main),
        getThemeColor(vars.palette.info.main),
        getThemeColor(vars.palette.error.main),
        getThemeColor(vars.palette.secondary.main),
        getThemeColor(vars.palette.chBlue[300]),
        getThemeColor(vars.palette.chGreen[300]),
        getThemeColor(vars.palette.chOrange[300]),
        getThemeColor(vars.palette.chRed[300]),
      ],
      text: getThemeColor(vars.palette.text.secondary),
      muted: getThemeColor(vars.palette.text.disabled),
      grid: getThemeColor(vars.palette.dividerLight),
      surface: getThemeColor(vars.palette.background.paper),
    }),
    // the resolved colours change when the colour theme changes

    [config.themePreset],
  );
};

export default useChartPalette;
