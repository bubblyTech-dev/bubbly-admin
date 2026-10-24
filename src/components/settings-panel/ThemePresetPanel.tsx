import { ButtonBase, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useSettingsContext } from 'providers/SettingsProvider';
import { presetSurfaces } from 'theme/palette/presetPalette';
import { ThemeMode, ThemePreset, themePresets } from 'theme/presets';
import IconifyIcon from 'components/base/IconifyIcon';

const PresetCard = ({ preset, selected }: { preset: ThemePreset; selected: boolean }) => {
  const { setConfig } = useSettingsContext();
  const surface = presetSurfaces(preset);
  const dots = [
    preset.colors.primary,
    preset.colors.secondary,
    preset.colors.success,
    preset.colors.warning,
    preset.colors.error,
  ];

  return (
    <ButtonBase
      onClick={() => setConfig({ themePreset: preset.id })}
      aria-pressed={selected}
      aria-label={`${preset.label} theme`}
      sx={{
        display: 'block',
        textAlign: 'left',
        borderRadius: 2,
        p: 0.75,
        border: 2,
        borderColor: selected ? 'primary.main' : 'divider',
        position: 'relative',
        bgcolor: 'background.paper',
      }}
    >
      {/* miniature of the app: sidebar strip, top bar, content card */}
      <Box
        sx={{
          display: 'flex',
          height: 64,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: surface.page,
          border: 1,
          borderColor: surface.line,
        }}
      >
        <Box
          sx={{ width: 18, bgcolor: surface.panel, borderRight: 1, borderColor: surface.line }}
        />
        <Box sx={{ flex: 1, p: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ height: 6, borderRadius: 0.5, bgcolor: surface.line, width: '60%' }} />
          <Box
            sx={{
              flex: 1,
              borderRadius: 0.75,
              bgcolor: surface.panel,
              border: 1,
              borderColor: surface.line,
              p: 0.5,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
            }}
          >
            <Box
              sx={{ width: 10, height: '40%', borderRadius: 0.25, bgcolor: preset.colors.primary }}
            />
            <Box
              sx={{
                width: 10,
                height: '70%',
                borderRadius: 0.25,
                bgcolor: preset.colors.secondary,
              }}
            />
            <Box
              sx={{ width: 10, height: '55%', borderRadius: 0.25, bgcolor: preset.colors.success }}
            />
          </Box>
        </Box>
      </Box>

      <Stack direction="column" sx={{ mt: 1, px: 0.5, gap: 0.5 }}>
        <Typography
          variant="caption"
          noWrap
          sx={{ fontWeight: selected ? 700 : 500, color: 'text.primary' }}
        >
          {preset.label}
        </Typography>
        <Stack direction="row" spacing={0.25}>
          {dots.map((color) => (
            <Box key={color} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
          ))}
        </Stack>
      </Stack>

      {selected && (
        <IconifyIcon
          icon="material-symbols-light:check-circle"
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            fontSize: 22,
            color: 'primary.main',
            bgcolor: 'background.paper',
            borderRadius: '50%',
          }}
        />
      )}
    </ButtonBase>
  );
};

const Group = ({ mode, title }: { mode: ThemeMode; title: string }) => {
  const {
    config: { themePreset },
  } = useSettingsContext();

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
        {themePresets
          .filter((preset) => preset.mode === mode)
          .map((preset) => (
            <PresetCard key={preset.id} preset={preset} selected={preset.id === themePreset} />
          ))}
      </Box>
    </Box>
  );
};

const ThemePresetPanel = () => (
  <Stack direction="column" sx={{ gap: 2.5 }}>
    <Group mode="light" title="Light themes" />
    <Group mode="dark" title="Dark themes" />
  </Stack>
);

export default ThemePresetPanel;
