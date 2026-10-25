import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Chip } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import { inquiryService } from 'services/inquiryService';

// The number of New inquiries, shown next to the sidebar item. It refreshes whenever the page changes.
const InquiryBadge = () => {
  const { hasPermission } = useAuth();
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  const allowed = hasPermission('inquiries.view');

  useEffect(() => {
    if (!allowed) return;

    let active = true;
    inquiryService
      .counts()
      .then((counts) => {
        if (active) setCount(counts.new);
      })
      .catch(() => {
        // the badge is optional: stay quiet when it cannot be loaded
      });

    return () => {
      active = false;
    };
  }, [pathname, allowed]);

  if (!allowed || count === 0) return null;

  return (
    <Chip
      size="small"
      color="primary"
      label={count > 99 ? '99+' : count}
      sx={{ height: 18, fontSize: 11 }}
    />
  );
};

export default InquiryBadge;
