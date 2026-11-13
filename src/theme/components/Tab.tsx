import { Theme, svgIconClasses, tabClasses, tabsClasses } from '@mui/material';
import { Components } from '@mui/material/styles';

// Every tab bar in the app is a row of pills: outlined when idle, filled with the primary colour when selected.
export const Tab: Components<Omit<Theme, 'components'>>['MuiTab'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      minHeight: 40,
      minWidth: 'auto',
      padding: '0 20px',
      borderRadius: 999,
      border: `1px solid ${theme.vars.palette.divider}`,
      fontWeight: 600,
      textTransform: 'none',
      color: theme.vars.palette.text.secondary,
      transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
        duration: theme.transitions.duration.shorter,
      }),
      '&:hover': {
        backgroundColor: theme.vars.palette.action.hover,
        color: theme.vars.palette.text.primary,
      },
      [`&.${tabClasses.selected}`]: {
        backgroundColor: theme.vars.palette.primary.main,
        borderColor: theme.vars.palette.primary.main,
        color: theme.vars.palette.primary.contrastText,
      },
      [`.${svgIconClasses.root}`]: {
        fontSize: 20,
      },
    }),
  },
};

export const Tabs: Components<Omit<Theme, 'components'>>['MuiTabs'] = {
  defaultProps: {},
  styleOverrides: {
    root: {
      minHeight: 40,
      [`& .${tabsClasses.indicator}`]: {
        display: 'none',
      },
    },
    list: {
      gap: '8px',
    },
  },
};
