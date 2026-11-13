import {
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  formatCount,
  formatDateIST,
  formatDateTimeIST,
  formatPercent,
  formatRupeesFromPaise,
} from 'lib/format';
import { TableColumn } from 'types/analytics';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';

interface DataTableProps {
  columns: TableColumn[];
  rows: Array<Record<string, unknown>>;
  totals?: Record<string, unknown> | null;
  loading?: boolean;
  emptyText?: string;
  // show the pager under the table (reports); analytics tables leave this out
  pager?: { page: number; perPage: number; total: number; onChange: (page: number) => void };
  // show at most this many rows (analytics tables)
  maxRows?: number;
  minWidth?: number;
}

const NUMERIC: TableColumn['type'][] = ['number', 'integer', 'money', 'percent'];

// one cell as text, by column type (money arrives in paise)
export const formatCell = (value: unknown, type: TableColumn['type']) => {
  if (value === null || value === undefined || value === '') return '-';

  switch (type) {
    case 'money':
      return formatRupeesFromPaise(Number(value), true);
    case 'percent':
      return formatPercent(Number(value));
    case 'number':
    case 'integer':
      return formatCount(Number(value));
    case 'date':
      return formatDateIST(String(value));
    case 'datetime':
      return formatDateTimeIST(String(value));
    default:
      return String(value);
  }
};

// The table used by every report preview and by table widgets: header, hover rows, numbers aligned right,
// a totals row, loading rows, an empty state and (optionally) the pager.
const DataTable = ({
  columns,
  rows,
  totals,
  loading = false,
  emptyText = 'No rows for these filters.',
  pager,
  maxRows,
  minWidth = 640,
}: DataTableProps) => {
  const shown = maxRows ? rows.slice(0, maxRows) : rows;

  return (
    <Stack direction="column" spacing={2}>
      <TableContainer>
        <Table sx={{ minWidth }} size="medium">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={NUMERIC.includes(column.type) ? 'right' : 'left'}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
            {loading && rows.length === 0
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton
                          variant="text"
                          width={NUMERIC.includes(column.type) ? 56 : '70%'}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : shown.map((row, index) => (
                  <TableRow key={index} hover>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={NUMERIC.includes(column.type) ? 'right' : 'left'}
                        sx={{
                          fontVariantNumeric: NUMERIC.includes(column.type)
                            ? 'tabular-nums'
                            : undefined,
                          whiteSpace: column.type === 'text' ? 'normal' : 'nowrap',
                          minWidth: column.type === 'text' ? 120 : undefined,
                        }}
                      >
                        {formatCell(row[column.key], column.type)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

            {!loading && shown.length === 0 && (
              <TableEmptyRow colSpan={columns.length} message={emptyText} />
            )}

            {totals && shown.length > 0 && (
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell
                    key={column.key}
                    align={NUMERIC.includes(column.type) ? 'right' : 'left'}
                    sx={{
                      fontWeight: 700,
                      borderTop: 2,
                      borderColor: 'divider',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {totals[column.key] !== undefined
                      ? formatCell(totals[column.key], column.type)
                      : index === 0
                        ? 'Total'
                        : ''}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {maxRows && rows.length > maxRows && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Showing the first {maxRows} of {rows.length}. Download the data to see them all.
        </Typography>
      )}

      {pager && (
        <TablePager
          page={pager.page}
          perPage={pager.perPage}
          total={pager.total}
          onChange={pager.onChange}
        />
      )}
    </Stack>
  );
};

export default DataTable;
