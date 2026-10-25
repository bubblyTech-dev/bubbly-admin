import { Pagination, Stack, Typography } from '@mui/material';

interface TablePagerProps {
  page: number; // starts at 1
  perPage: number;
  total: number;
  onChange: (page: number) => void;
}

// "1-15 of 40" and the page buttons, for tables that load one page at a time from the API.
const TablePager = ({ page, perPage, total, onChange }: TablePagerProps) => {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {first}-{last} of {total}
      </Typography>
      <Pagination
        count={pageCount}
        page={page}
        onChange={(_event, next) => onChange(next)}
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
};

export default TablePager;
