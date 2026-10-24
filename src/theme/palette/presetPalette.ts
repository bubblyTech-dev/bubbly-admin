import { PaletteOptions } from '@mui/material/styles';
import { cssVarRgba, generatePaletteChannel } from 'lib/utils';
import { grey as baseGrey } from 'theme/palette/colors';
import { DEFAULT_DARK_PRESET, DEFAULT_LIGHT_PRESET, ThemePreset } from 'theme/presets';
import { paletteOptions as lightBasePalette } from './index';

// ---------- small colour helpers ----------
const toRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const toHex = ([r, g, b]: number[]) =>
  `#${[r, g, b]
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

// amount 0 = a, 1 = b
const mix = (a: string, b: string, amount: number) => {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex([ar + (br - ar) * amount, ag + (bg - ag) * amount, ab + (bb - ab) * amount]);
};

const channel = (hex: string) => toRgb(hex).join(' ');

// white or near-black text, whichever reads better on the given colour
const readableOn = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.38 ? '#101114' : '#FFFFFF';
};

// ---------- colour families ----------
const lightFamily = (main: string, contrastText?: string) =>
  generatePaletteChannel({
    lighter: mix(main, '#FFFFFF', 0.9),
    light: mix(main, '#FFFFFF', 0.25),
    main,
    dark: mix(main, '#000000', 0.18),
    darker: mix(main, '#000000', 0.55),
    ...(contrastText ? { contrastText } : {}),
  });

const darkFamily = (main: string, surface: string, contrastText?: string) =>
  generatePaletteChannel({
    lighter: mix(main, surface, 0.82),
    light: mix(main, '#FFFFFF', 0.22),
    main,
    dark: mix(main, '#000000', 0.2),
    darker: mix(main, '#FFFFFF', 0.55),
    ...(contrastText ? { contrastText } : {}),
  });

// grey scale tinted towards the preset's surface hue (dark steps pick up more of the hue)
const tintedScale = (hue: string) => {
  const amount: Record<string, number> = {
    50: 0.04,
    100: 0.05,
    200: 0.07,
    300: 0.1,
    400: 0.16,
    500: 0.28,
    600: 0.45,
    700: 0.6,
    800: 0.7,
    900: 0.78,
    950: 0.85,
  };
  return Object.fromEntries(
    Object.entries(baseGrey).map(([step, value]) => [step, mix(value, hue, amount[step] ?? 0.1)]),
  ) as Record<keyof typeof baseGrey, string>;
};

// ---------- palettes ----------
const buildLight = (preset: ThemePreset): PaletteOptions => {
  const c = preset.colors;
  const s = preset.scale;

  // optional warm/custom surfaces for light themes (otherwise the template's cool greys are kept)
  const surfaces: PaletteOptions = s
    ? {
        text: generatePaletteChannel({ primary: s[800], secondary: s[600], disabled: s[400] }),
        action: generatePaletteChannel({
          active: s[500],
          hover: s[100],
          selected: s[100],
          disabled: s[400],
          disabledBackground: s[200],
          focus: s[300],
        }),
        divider: s[300],
        dividerLight: cssVarRgba(channel(s[300]), 0.6),
        background: generatePaletteChannel({
          default: '#FFFFFF',
          paper: '#FFFFFF',
          elevation1: s[50],
          elevation2: s[100],
          elevation3: s[200],
          elevation4: s[300],
          menu: '#FFFFFF',
          menuElevation1: s[50],
          menuElevation2: s[100],
        }),
      }
    : {};

  return {
    ...lightBasePalette,
    ...surfaces,
    primary: lightFamily(c.primary),
    secondary: lightFamily(c.secondary),
    error: lightFamily(c.error),
    warning: lightFamily(c.warning, '#FFFFFF'),
    success: lightFamily(c.success),
    info: lightFamily(c.info, '#FFFFFF'),
    neutral: lightFamily(c.neutral, '#FFFFFF'),
  };
};

const buildDark = (preset: ThemePreset): PaletteOptions => {
  const c = preset.colors;
  const s = preset.scale ?? tintedScale(preset.surface ?? baseGrey[800]);

  // the main Dark theme keeps its original fixed button text colours; the others pick whichever reads best
  const isMainDark = preset.id === DEFAULT_DARK_PRESET;
  const text = {
    primary: isMainDark ? '#FFFFFF' : readableOn(c.primary),
    secondary: isMainDark ? '#FFFFFF' : readableOn(c.secondary),
    error: isMainDark ? '#FFFFFF' : readableOn(c.error),
    warning: isMainDark ? '#1B1B1B' : readableOn(c.warning),
    success: isMainDark ? '#FFFFFF' : readableOn(c.success),
    info: isMainDark ? '#1B1B1B' : readableOn(c.info),
  };

  const background = generatePaletteChannel({
    default: s[950],
    paper: s[900],
    elevation1: s[900],
    elevation2: s[800],
    elevation3: s[700],
    elevation4: s[600],
    menu: s[900],
    menuElevation1: s[800],
    menuElevation2: s[700],
  });

  return {
    ...lightBasePalette,
    primary: darkFamily(c.primary, s[900], text.primary),
    secondary: darkFamily(c.secondary, s[900], text.secondary),
    error: darkFamily(c.error, s[900], text.error),
    warning: darkFamily(c.warning, s[900], text.warning),
    success: darkFamily(c.success, s[900], text.success),
    info: darkFamily(c.info, s[900], text.info),
    neutral: generatePaletteChannel({
      lighter: s[800],
      light: mix(c.neutral, '#000000', 0.25),
      main: c.neutral,
      dark: mix(c.neutral, '#FFFFFF', 0.25),
      darker: '#FFFFFF',
      contrastText: s[900],
    }),
    text: generatePaletteChannel({
      primary: s[100],
      secondary: s[300],
      disabled: s[500],
    }),
    action: generatePaletteChannel({
      active: s[400],
      hover: s[800],
      selected: s[800],
      disabled: s[600],
      disabledBackground: s[800],
      focus: s[700],
    }),
    divider: s[700],
    dividerLight: cssVarRgba(channel(s[700]), 0.6),
    menuDivider: cssVarRgba(channel(s[700]), 0),
    background,
  };
};

export const createPresetPalette = (preset: ThemePreset): PaletteOptions => {
  if (preset.id === DEFAULT_LIGHT_PRESET) return lightBasePalette; // the template's own light palette, untouched
  return preset.mode === 'dark' ? buildDark(preset) : buildLight(preset);
};

// flat colours used to draw a small preview of a preset in the customizer
export const presetSurfaces = (preset: ThemePreset) => {
  if (preset.mode === 'dark') {
    const s = preset.scale ?? tintedScale(preset.surface ?? baseGrey[800]);
    return { page: s[950], panel: s[900], line: s[700], text: s[300] };
  }
  const s = preset.scale;
  if (s) return { page: '#FFFFFF', panel: s[50], line: s[300], text: s[500] };
  return { page: '#FFFFFF', panel: baseGrey[50], line: baseGrey[200], text: baseGrey[500] };
};
