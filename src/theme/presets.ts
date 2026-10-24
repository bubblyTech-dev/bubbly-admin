export type ThemeMode = 'light' | 'dark';

export type SurfaceScale = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

export interface ThemePreset {
  id: string;
  label: string;
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    neutral: string;
  };
  // the hue the dark surfaces are tinted with ...
  surface?: string;
  // ... or an explicit 11-step surface scale (50 lightest, 950 darkest) for full control of the surfaces
  scale?: SurfaceScale;
}

export const DEFAULT_LIGHT_PRESET = 'light-default';
export const DEFAULT_DARK_PRESET = 'dark-default';

export const themePresets: ThemePreset[] = [
  // ---------- light ----------
  {
    id: 'light-default',
    label: 'Light',
    mode: 'light',
    colors: {
      primary: '#3385F0',
      secondary: '#A641FA',
      error: '#D02241',
      warning: '#F68D2A',
      success: '#099F69',
      info: '#0DA5E8',
      neutral: '#1B2124',
    },
  },
  {
    id: 'light-arctic',
    label: 'Arctic',
    mode: 'light',
    colors: {
      primary: '#017B8B',
      secondary: '#5E53B3',
      error: '#C44747',
      warning: '#95691E',
      success: '#2DA262',
      info: '#2B7BB9',
      neutral: '#2F3534',
    },
  },
  {
    id: 'light-nature',
    label: 'Nature',
    mode: 'light',
    colors: {
      primary: '#308236',
      secondary: '#8E6E1A',
      error: '#BC4749',
      warning: '#AB5F1B',
      success: '#5B7D0D',
      info: '#2F7F96',
      neutral: '#63615A',
    },
  },
  {
    id: 'light-luxury',
    label: 'Luxury',
    mode: 'light',
    colors: {
      primary: '#9E3B3B',
      secondary: '#9F6F3C',
      error: '#9F3C67',
      warning: '#9D933A',
      success: '#3A9E96',
      info: '#3C7A9F',
      neutral: '#272424',
    },
  },
  {
    id: 'light-retro',
    label: 'Retro',
    mode: 'light',
    colors: {
      primary: '#4D6A8C',
      secondary: '#BF2A72',
      error: '#BE3240',
      warning: '#B1441B',
      success: '#427065',
      info: '#4A7FA8',
      neutral: '#3B3A37',
    },
  },
  {
    id: 'light-bubbly',
    label: 'Bubbly',
    mode: 'light',
    // playful preschool theme: warm cream surfaces, sunny orange with sky blue, coral and mint
    scale: {
      50: '#FFF8EC',
      100: '#FFF0D9',
      200: '#F7E2C4',
      300: '#EBD3AE',
      400: '#BDA687',
      500: '#8F7B63',
      600: '#5F4E3D',
      700: '#43362A',
      800: '#2C231B',
      900: '#1C1611',
      950: '#100C09',
    },
    colors: {
      primary: '#F78C0A',
      secondary: '#2F9BEA',
      error: '#F2546B',
      warning: '#F5B700',
      success: '#2DBE7E',
      info: '#8B6CF0',
      neutral: '#43362A',
    },
  },
  // ---------- dark ----------
  {
    id: 'dark-default',
    label: 'Dark',
    mode: 'dark',
    // near-black neutral surfaces; colour comes only from the accents below
    scale: {
      50: '#F7F7F8',
      100: '#ECECEF',
      200: '#D4D4D8',
      300: '#B5B5BC',
      400: '#8E8E96',
      500: '#6B6B73',
      600: '#34343A',
      700: '#232327',
      800: '#161618',
      900: '#0C0C0D',
      950: '#000000',
    },
    colors: {
      primary: '#1466DA',
      secondary: '#B663FB',
      error: '#D84A63',
      warning: '#F8A250',
      success: '#35B084',
      info: '#3DB7EE',
      neutral: '#C3D3DB',
    },
  },
  {
    id: 'dark-midnight',
    label: 'Midnight',
    mode: 'dark',
    // ink black with a cool indigo cast; indigo + cyan accents
    scale: {
      50: '#F5F6FF',
      100: '#E8EAFB',
      200: '#CDD1F0',
      300: '#AEB4E0',
      400: '#868EC4',
      500: '#5F68A0',
      600: '#272D52',
      700: '#181C36',
      800: '#0F1226',
      900: '#080A18',
      950: '#03040B',
    },
    colors: {
      primary: '#7C83FF',
      secondary: '#38D6F5',
      error: '#FF6B8A',
      warning: '#FFC15E',
      success: '#4ADE9B',
      info: '#5CC8FF',
      neutral: '#DDE0FF',
    },
  },
  {
    id: 'dark-graphite',
    label: 'Graphite',
    mode: 'dark',
    // warm charcoal; amber + terracotta accents
    scale: {
      50: '#FAF8F5',
      100: '#F0EDE8',
      200: '#DDD8D0',
      300: '#BFB9AF',
      400: '#99928A',
      500: '#746E66',
      600: '#38352F',
      700: '#26241F',
      800: '#1A1814',
      900: '#110F0D',
      950: '#080706',
    },
    colors: {
      primary: '#F0A45D',
      secondary: '#E07A5F',
      error: '#F2677A',
      warning: '#F5C451',
      success: '#7CC796',
      info: '#6EB6D6',
      neutral: '#E6E0D6',
    },
  },
  {
    id: 'dark-forest',
    label: 'Forest',
    mode: 'dark',
    // emerald black; mint + gold accents
    scale: {
      50: '#F2FAF6',
      100: '#E0F2E8',
      200: '#BFE0CE',
      300: '#98C7AE',
      400: '#6FA68A',
      500: '#4B8068',
      600: '#1F3B2F',
      700: '#15291F',
      800: '#0E1D16',
      900: '#08130E',
      950: '#030A07',
    },
    colors: {
      primary: '#3DDC97',
      secondary: '#E6C35C',
      error: '#FF6F6F',
      warning: '#F5A524',
      success: '#6BE585',
      info: '#4FD1C5',
      neutral: '#D5F0E2',
    },
  },
  {
    id: 'dark-plum',
    label: 'Plum',
    mode: 'dark',
    // aubergine black; orchid + pink accents
    scale: {
      50: '#FBF5FF',
      100: '#F1E4FA',
      200: '#E0C8F1',
      300: '#C8A5E0',
      400: '#A67CC4',
      500: '#7F559E',
      600: '#3A2150',
      700: '#2A1740',
      800: '#1D0F2E',
      900: '#130820',
      950: '#0A0412',
    },
    colors: {
      primary: '#D07BFF',
      secondary: '#FF6FB5',
      error: '#FF6B81',
      warning: '#FFB84D',
      success: '#4ADEA8',
      info: '#6CC7FF',
      neutral: '#EBDDF7',
    },
  },
  {
    id: 'dark-bubbly',
    label: 'Bubbly',
    mode: 'dark',
    // playful preschool night: deep grape-navy sky with candy-bright orange, sky blue and mint
    scale: {
      50: '#F6F4FF',
      100: '#EAE6FB',
      200: '#D0C9F0',
      300: '#B1A8E0',
      400: '#8B82C2',
      500: '#665E9C',
      600: '#352E63',
      700: '#251F4B',
      800: '#181338',
      900: '#100C26',
      950: '#09061A',
    },
    colors: {
      primary: '#FFA11F',
      secondary: '#4DB8FF',
      error: '#FF6B81',
      warning: '#FFD23F',
      success: '#4FD99B',
      info: '#B79BFF',
      neutral: '#F3E9FF',
    },
  },
];

export const getPreset = (id: string | undefined): ThemePreset =>
  themePresets.find((preset) => preset.id === id) ?? themePresets[0];
