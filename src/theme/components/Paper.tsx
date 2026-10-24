import { PaperProps, Theme, paperClasses } from '@mui/material';
import { Components } from '@mui/material/styles';

declare module '@mui/material' {
  interface PaperPropsVariantOverrides {
    default: true;
  }

  interface PaperOwnProps {
    background?: 1 | 2 | 3 | 4 | 5;
  }
}

// background tokens exist for both colour schemes, so every theme preset tints these
const backgroundColors: { [key: number]: (theme: Theme) => string } = {
  1: (theme) => theme.vars.palette.background.elevation1,
  2: (theme) => theme.vars.palette.background.elevation2,
  3: (theme) => theme.vars.palette.background.elevation3,
  4: (theme) => theme.vars.palette.background.elevation4,
  5: (theme) => theme.vars.palette.primary.lighter,
};

const backgroundVariants = Object.keys(backgroundColors).map((background) => ({
  props: { background: Number(background) as PaperProps['background'] },
  style: ({ theme }: { theme: Theme }) => ({
    [`&.${paperClasses.root}`]: {
      backgroundColor: backgroundColors[Number(background)](theme),
    },
  }),
}));

const Paper: Components<Omit<Theme, 'components'>>['MuiPaper'] = {
  variants: [
    {
      props: { variant: 'default' },
      style: ({ theme }) => ({
        border: 'none',
        outline: `1px solid ${theme.vars.palette.divider}`,
        borderRadius: 0,
      }),
    },
    ...backgroundVariants,
  ],
  defaultProps: {
    variant: 'default',
    elevation: 3,
  },
  styleOverrides: {
    elevation: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.menu,
      backgroundImage: 'none',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: theme.vars.palette.menuDivider,
      ...theme.applyStyles('dark', {
        borderWidth: 1,
      }),
    }),
    rounded: {
      borderRadius: 8,
    },
  },
};

export default Paper;
