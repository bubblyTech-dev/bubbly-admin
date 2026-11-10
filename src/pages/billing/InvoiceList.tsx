import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Alert,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { formatDate } from 'lib/format';
import { formatRupees } from 'lib/money';
import paths, { schoolPath } from 'routes/paths';
import { billingService } from 'services/billingService';
import { Invoice, invoiceStatusLabel } from 'types/billing';
import { PageMeta } from 'types/plans';
import CopyText from 'components/common/CopyText';
import FilterSelect from 'components/common/FilterSelect';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import { InvoiceStatusChip } from 'components/sections/billing/BillingChips';
import InvoiceDetailDialog from 'components/sections/billing/InvoiceDetailDialog';

const statusOptions = Object.entries(invoiceStatusLabel).map(([value, label]) => ({
  value,
  label,
}));

const InvoiceList = () => {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, perPage: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await billingService.listInvoices({
        search: debouncedSearch || undefined,
        status: status ? Number(status) : undefined,
        page,
        perPage: 15,
      });
      setRows(result.items);
      setMeta(result.meta);
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Invoices"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Billing' },
          { label: 'Invoices', active: true },
        ]}
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SearchField
              value={search}
              placeholder="Search invoice number or school"
              onChange={setSearch}
            />
            <FilterSelect
              label="Status"
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />
          </Stack>

          <TableContainer>
            <Table sx={{ minWidth: 880 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>School</TableCell>
                  <TableCell>Issued</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>GST</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
                {rows.map((row) => (
                  <TableRow
                    key={row.uuid}
                    hover
                    onClick={() => setViewing(row.uuid)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <CopyText value={row.invoiceNo} />
                    </TableCell>
                    <TableCell>
                      {row.client ? (
                        <Typography
                          variant="subtitle2"
                          component={RouterLink}
                          to={schoolPath(row.client.uuid)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {row.client.name}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(row.issuedAt)}</TableCell>
                    <TableCell>{formatRupees(row.subtotalPaise)}</TableCell>
                    <TableCell>{formatRupees(row.taxPaise)}</TableCell>
                    <TableCell>{formatRupees(row.totalPaise)}</TableCell>
                    <TableCell>
                      <InvoiceStatusChip status={row.status} />
                    </TableCell>
                    <RowActionsCell
                      actions={[{ label: 'View', onClick: () => setViewing(row.uuid) }]}
                    />
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableEmptyRow colSpan={8} message="No invoices found." />
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePager
            page={meta.page}
            perPage={meta.perPage}
            total={meta.total}
            onChange={setPage}
          />
        </Stack>
      </Paper>

      <InvoiceDetailDialog uuid={viewing} onClose={() => setViewing(null)} />
    </Stack>
  );
};

export default InvoiceList;
