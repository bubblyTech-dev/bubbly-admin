import { Link as RouterLink } from 'react-router';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { AttentionItem, AttentionSeverity } from 'types/dashboard';
import IconifyIcon from 'components/base/IconifyIcon';

const SEVERITY: Record<AttentionSeverity, { icon: string; color: 'error' | 'warning' | 'info' }> = {
  error: { icon: 'material-symbols:error-outline-rounded', color: 'error' },
  warning: { icon: 'material-symbols:warning-outline-rounded', color: 'warning' },
  info: { icon: 'material-symbols:schedule-outline-rounded', color: 'info' },
};

interface NeedsAttentionCardProps {
  items: AttentionItem[];
}

// The things that need a person today, each with its count and a link to the page that fixes it.
// Rows with nothing to do are left out; when nothing is left the card says so.
const NeedsAttentionCard = ({ items }: NeedsAttentionCardProps) => {
  const open = items.filter((item) => item.count > 0);

  return (
    <Paper sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Needs attention
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            What your team should look at today.
          </Typography>
        </div>
        {open.length > 0 && (
          <Chip size="small" color="error" variant="soft" label={`${open.length} to check`} />
        )}
      </Stack>

      {open.length === 0 ? (
        <Stack
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'center', py: 5, textAlign: 'center' }}
        >
          <IconifyIcon
            icon="material-symbols:check-circle-outline-rounded"
            sx={{ fontSize: 44, color: 'success.main' }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            All clear
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nothing needs attention right now.
          </Typography>
        </Stack>
      ) : (
        <Stack direction="column" spacing={1}>
          {open.map((item) => {
            const style = SEVERITY[item.severity];
            return (
              <Box
                key={item.key}
                component={RouterLink}
                to={item.link}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  color: 'text.primary',
                  textDecoration: 'none',
                  bgcolor: 'background.elevation1',
                  '&:hover': { bgcolor: 'background.elevation2' },
                }}
              >
                <IconifyIcon
                  icon={style.icon}
                  sx={{ fontSize: 22, color: `${style.color}.main`, flexShrink: 0 }}
                />
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
                  {item.label}
                </Typography>
                <Chip
                  size="small"
                  color={style.color}
                  variant="soft"
                  label={item.count}
                  sx={{ fontWeight: 700 }}
                />
                <IconifyIcon
                  icon="material-symbols:chevron-right-rounded"
                  sx={{ fontSize: 20, color: 'text.secondary' }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default NeedsAttentionCard;
