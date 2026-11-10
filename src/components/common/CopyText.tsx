import { useState } from 'react';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface CopyTextProps {
  value: string | null | undefined;
  // shown instead of the value (for example a short label for a long link)
  label?: string;
}

// A piece of text with a small copy button. Shows a dash when there is no value.
const CopyText = ({ value, label }: CopyTextProps) => {
  const [copied, setCopied] = useState(false);

  if (!value) return <>-</>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // the browser refused: the text stays selectable for a manual copy
    }
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography variant="body2" sx={{ wordBreak: 'break-all', userSelect: 'all' }}>
        {label ?? value}
      </Typography>
      <Tooltip title={copied ? 'Copied' : 'Copy'}>
        <IconButton size="small" aria-label="Copy" onClick={() => void copy()}>
          <IconifyIcon
            icon={
              copied
                ? 'material-symbols:check-rounded'
                : 'material-symbols:content-copy-outline-rounded'
            }
            sx={{ fontSize: 16 }}
          />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default CopyText;
