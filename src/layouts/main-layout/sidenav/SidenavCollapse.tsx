import { useState } from 'react';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';

const SidenavCollapse = () => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    config: { sidenavCollapsed, sidenavPosition },
    toggleNavbarCollapse,
  } = useSettingsContext();

  const isRight = sidenavPosition === 'right';

  const paths = {
    vertical: 'M8 4v16',
    chevronRight: 'M8 6l6 6-6 6',
    chevronLeft: 'M14 6l-6 6 6 6',
  };

  // the chevron points towards the edge the sidebar collapses into
  const collapseChevron = isRight ? paths.chevronRight : paths.chevronLeft;
  const expandChevron = isRight ? paths.chevronLeft : paths.chevronRight;

  const currentPath = isHovered
    ? sidenavCollapsed
      ? expandChevron
      : collapseChevron
    : paths.vertical;

  return (
    <ButtonBase
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleNavbarCollapse}
      disableRipple
      sx={{
        width: 40,
        flexShrink: 0,
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        ...(isRight ? { left: -30 } : { right: -30 }),
        height: 80,
        borderRadius: 0,
        textAlign: 'center',
        p: '0px !important',
      }}
    >
      <Tooltip
        open={isHovered}
        title={sidenavCollapsed ? 'Expand' : 'Collapse'}
        placement={isRight ? 'left' : 'right'}
        slotProps={{
          tooltip: {},
          popper: {
            sx: {
              cursor: 'pointer',
            },
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -8],
                },
              },
            ],
          },
        }}
      >
        <Box
          component="svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          sx={{
            width: 24,
            stroke: (theme) => theme.vars.palette.background.elevation4,
            height: 24,
          }}
        >
          <path d={currentPath} />
        </Box>
      </Tooltip>
    </ButtonBase>
  );
};

export default SidenavCollapse;
