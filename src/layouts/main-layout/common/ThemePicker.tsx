import { MouseEvent, useState } from 'react';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import { ThemeMode, themePresets } from 'theme/presets';
import IconifyIcon from 'components/base/IconifyIcon';

const groups: { mode: ThemeMode; title: string }[] = [
  { mode: 'light', title: 'Light themes' },
  { mode: 'dark', title: 'Dark themes' },
];

// header button that opens a box with every theme, so one can be picked without opening Customize
const ThemePicker = () => {
  const {
    config: { themePreset },
    setConfig,
  } = useSettingsContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSelect = (id: string) => {
    setConfig({ themePreset: id });
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Theme">
        <Button
          color="neutral"
          variant="soft"
          shape="circle"
          aria-label="Choose theme"
          onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        >
          <IconifyIcon icon="material-symbols:palette-outline" sx={{ fontSize: 22 }} />
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 280,
              maxHeight: 'calc(100vh - 120px)',
              border: 1,
              borderColor: 'divider',
            },
          },
        }}
      >
        {groups.map(({ mode, title }) => [
          <Typography
            key={`${mode}-title`}
            variant="caption"
            sx={{
              display: 'block',
              px: 2,
              pt: 1.5,
              pb: 0.5,
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>,
          ...themePresets
            .filter((preset) => preset.mode === mode)
            .map((preset) => {
              const selected = preset.id === themePreset;
              const swatches = [
                preset.colors.primary,
                preset.colors.secondary,
                preset.colors.success,
                preset.colors.warning,
                preset.colors.error,
                preset.colors.neutral,
              ];
              return (
                <MenuItem
                  key={preset.id}
                  selected={selected}
                  onClick={() => handleSelect(preset.id)}
                  sx={{ py: 0.5, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Radio
                      checked={selected}
                      value={preset.id}
                      tabIndex={-1}
                      checkedIcon={
                        <IconifyIcon
                          icon="material-symbols-light:check-circle"
                          sx={{ color: 'primary.main', fontSize: '24px !important' }}
                        />
                      }
                      sx={{ p: 0 }}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: selected ? 600 : 400,
                        color: selected ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {preset.label}
                    </Typography>
                  </ListItemText>
                  <Stack direction="row" spacing={0.5} sx={{ ml: 'auto', pl: 2 }}>
                    {swatches.map((color) => (
                      <Box
                        key={color}
                        sx={{ width: 12, height: 12, bgcolor: color, borderRadius: 0.5 }}
                      />
                    ))}
                  </Stack>
                </MenuItem>
              );
            }),
        ])}
      </Menu>
    </>
  );
};

export default ThemePicker;
