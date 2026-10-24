import { ReactNode } from 'react';
import {
  ButtonBase,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import {
  ContentWidth,
  SidenavPosition,
  SidenavWidth,
  contentWidthOptions,
  sidenavPositions,
  sidenavWidthOptions,
} from 'config';
import { useSettingsContext } from 'providers/SettingsProvider';

const positionLabels: Record<SidenavPosition, string> = {
  left: 'Left',
  right: 'Right',
  top: 'Top',
};
const widthLabels: Record<SidenavWidth, string> = {
  compact: 'Compact',
  default: 'Default',
  wide: 'Wide',
};
const contentLabels: Record<ContentWidth, string> = { fluid: 'Fluid', boxed: 'Boxed' };

// tiny wireframe of where the navigation sits
const Wireframe = ({ position }: { position: SidenavPosition }) => {
  const nav = (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        bgcolor: 'primary.main',
        opacity: 0.85,
        borderRadius: 0.75,
      }}
    />
  );
  const body = (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        bgcolor: 'text.disabled',
        opacity: 0.35,
        borderRadius: 0.75,
      }}
    />
  );
  const layouts: Record<SidenavPosition, ReactNode> = {
    left: (
      <>
        <Box sx={{ width: 14, display: 'flex' }}>{nav}</Box>
        <Box sx={{ flex: 1, display: 'flex' }}>{body}</Box>
      </>
    ),
    right: (
      <>
        <Box sx={{ flex: 1, display: 'flex' }}>{body}</Box>
        <Box sx={{ width: 14, display: 'flex' }}>{nav}</Box>
      </>
    ),
    top: (
      <Stack direction="column" sx={{ flex: 1, gap: 0.5 }}>
        <Box sx={{ height: 9, display: 'flex' }}>{nav}</Box>
        <Box sx={{ flex: 1, display: 'flex' }}>{body}</Box>
      </Stack>
    ),
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        height: 44,
        p: 0.5,
        borderRadius: 1,
        bgcolor: 'background.elevation1',
        '& > *': { alignSelf: 'stretch' },
      }}
    >
      {layouts[position]}
    </Box>
  );
};

const PositionPicker = () => {
  const {
    config: { sidenavPosition },
    setConfig,
  } = useSettingsContext();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
      {sidenavPositions.map((position) => {
        const selected = position === sidenavPosition;
        return (
          <ButtonBase
            key={position}
            onClick={() => setConfig({ sidenavPosition: position })}
            aria-pressed={selected}
            sx={{
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 0.75,
              p: 0.75,
              borderRadius: 2,
              border: 2,
              borderColor: selected ? 'primary.main' : 'divider',
            }}
          >
            <Wireframe position={position} />
            <Typography variant="caption" sx={{ fontWeight: selected ? 700 : 500 }}>
              {positionLabels[position]}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

const LayoutPanel = () => {
  const {
    config: { sidenavPosition, sidenavWidth, sidenavCollapsed, contentWidth },
    setConfig,
    toggleNavbarCollapse,
  } = useSettingsContext();
  const isTop = sidenavPosition === 'top';

  return (
    <Stack direction="column" sx={{ gap: 3 }}>
      <Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
        >
          Navigation position
        </Typography>
        <PositionPicker />
      </Box>

      <Box sx={isTop ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
        >
          Sidebar width {isTop && '(side layouts only)'}
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={sidenavWidth}
          onChange={(_event, value: SidenavWidth | null) =>
            value && setConfig({ sidenavWidth: value })
          }
        >
          {sidenavWidthOptions.map((option) => (
            <ToggleButton key={option} value={option}>
              {widthLabels[option]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <FormControlLabel
          sx={{ mt: 1.5, ml: 0, display: 'flex', justifyContent: 'space-between' }}
          labelPlacement="start"
          label={<Typography variant="subtitle2">Collapsed sidebar</Typography>}
          control={<Switch checked={sidenavCollapsed} onChange={toggleNavbarCollapse} />}
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
        >
          Content width
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={contentWidth}
          onChange={(_event, value: ContentWidth | null) =>
            value && setConfig({ contentWidth: value })
          }
        >
          {contentWidthOptions.map((option) => (
            <ToggleButton key={option} value={option}>
              {contentLabels[option]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  );
};

export default LayoutPanel;
