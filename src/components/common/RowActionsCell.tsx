import { MouseEvent, useState } from 'react';
import { IconButton, Menu, MenuItem, TableCell } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

export interface RowAction {
  label: string;
  onClick: () => void;
  // destructive actions (delete) are shown in red
  danger?: boolean;
  // false hides the action, for example when the admin lacks the permission
  visible?: boolean;
  disabled?: boolean;
}

interface RowActionsCellProps {
  actions: RowAction[];
}

// The last cell of a list row: a three-dots button that opens the actions menu.
const RowActionsCell = ({ actions }: RowActionsCellProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const shown = actions.filter((action) => action.visible !== false);

  const open = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchor(event.currentTarget);
  };

  const close = () => setAnchor(null);

  return (
    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
      {shown.length > 0 && (
        <>
          <IconButton aria-label="Actions" onClick={open}>
            <IconifyIcon icon="material-symbols:more-vert" />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
            {shown.map((action) => (
              <MenuItem
                key={action.label}
                disabled={action.disabled}
                sx={action.danger ? { color: 'error.main' } : undefined}
                onClick={() => {
                  close();
                  action.onClick();
                }}
              >
                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </TableCell>
  );
};

export default RowActionsCell;
