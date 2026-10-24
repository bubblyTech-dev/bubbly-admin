import { Dispatch, PropsWithChildren, createContext, use, useReducer } from 'react';
import {
  Config,
  contentWidthOptions,
  fontFamilies,
  initialConfig,
  sidenavPositions,
  sidenavWidthOptions,
} from 'config';
import { getColor } from 'helpers/echart-utils';
import { mainDrawerWidth, sidenavWidths } from 'lib/constants';
import { getItemFromStore } from 'lib/utils';
import {
  ACTIONTYPE,
  COLLAPSE_NAVBAR,
  EXPAND_NAVBAR,
  SET_CONFIG,
  settingsReducer,
} from 'reducers/SettingsReducer';
import { themePresets } from 'theme/presets';

interface SettingsContextInterFace {
  config: Config;
  configDispatch: Dispatch<ACTIONTYPE>;
  setConfig: (payload: Partial<Config>) => void;
  handleDrawerToggle: () => void;
  toggleNavbarCollapse: () => void;
  getThemeColor: (color: string) => string;
}

export const SettingsContext = createContext({} as SettingsContextInterFace);

// stored values are only trusted if they are one of the allowed options
const stored = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const value = getItemFromStore(key, fallback);
  return allowed.includes(value) ? value : fallback;
};

const loadConfig = (): Config => ({
  ...initialConfig,
  sidenavCollapsed: getItemFromStore('sidenavCollapsed', initialConfig.sidenavCollapsed) === true,
  fontFamily: stored('fontFamily', fontFamilies, initialConfig.fontFamily),
  themePreset: stored(
    'themePreset',
    themePresets.map((preset) => preset.id),
    initialConfig.themePreset,
  ),
  sidenavPosition: stored('sidenavPosition', sidenavPositions, initialConfig.sidenavPosition),
  sidenavWidth: stored('sidenavWidth', sidenavWidthOptions, initialConfig.sidenavWidth),
  contentWidth: stored('contentWidth', contentWidthOptions, initialConfig.contentWidth),
});

const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [state, configDispatch] = useReducer(settingsReducer, undefined, loadConfig);

  // drawer width always follows the collapsed flag and the chosen sidebar width
  const config: Config = {
    ...state,
    drawerWidth: state.sidenavCollapsed
      ? mainDrawerWidth.collapsed
      : sidenavWidths[state.sidenavWidth],
  };

  const setConfig = (payload: Partial<Config>) => {
    configDispatch({
      type: SET_CONFIG,
      payload,
    });
  };

  const handleDrawerToggle = () => {
    setConfig({
      openNavbarDrawer: !config.openNavbarDrawer,
    });
  };

  const toggleNavbarCollapse = () => {
    if (config.sidenavCollapsed) {
      configDispatch({
        type: EXPAND_NAVBAR,
      });
    } else {
      configDispatch({
        type: COLLAPSE_NAVBAR,
      });
    }
  };

  const getThemeColor = (color: string) => {
    return getColor(color);
  };

  return (
    <SettingsContext
      value={{
        config,
        configDispatch,
        setConfig,
        handleDrawerToggle,
        toggleNavbarCollapse,
        getThemeColor,
      }}
    >
      {children}
    </SettingsContext>
  );
};

export const useSettingsContext = () => use(SettingsContext);

export default SettingsProvider;
