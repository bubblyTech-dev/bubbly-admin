import { mainDrawerWidth } from 'lib/constants';
import { DEFAULT_LIGHT_PRESET } from 'theme/presets';

export const fontFamilies = ['Plus Jakarta Sans', 'Roboto', 'Inter', 'Poppins'] as const;
export const sidenavPositions = ['left', 'right', 'top'] as const;
export const sidenavWidthOptions = ['compact', 'default', 'wide'] as const;
export const contentWidthOptions = ['fluid', 'boxed'] as const;

export type FontFamily = (typeof fontFamilies)[number];
export type SidenavPosition = (typeof sidenavPositions)[number];
export type SidenavWidth = (typeof sidenavWidthOptions)[number];
export type ContentWidth = (typeof contentWidthOptions)[number];

export interface Config {
  sidenavCollapsed: boolean;
  openNavbarDrawer: boolean;
  drawerWidth: number; // derived from sidenavCollapsed + sidenavWidth by SettingsProvider
  fontFamily: FontFamily;
  themePreset: string;
  sidenavPosition: SidenavPosition;
  sidenavWidth: SidenavWidth;
  contentWidth: ContentWidth;
}

export const initialConfig: Config = {
  sidenavCollapsed: false,
  openNavbarDrawer: false,
  drawerWidth: mainDrawerWidth.full,
  fontFamily: fontFamilies[0],
  themePreset: DEFAULT_LIGHT_PRESET,
  sidenavPosition: 'left',
  sidenavWidth: 'default',
  contentWidth: 'fluid',
};

// settings that survive a page reload
export const persistedConfigKeys = [
  'sidenavCollapsed',
  'fontFamily',
  'themePreset',
  'sidenavPosition',
  'sidenavWidth',
  'contentWidth',
] as const satisfies readonly (keyof Config)[];
