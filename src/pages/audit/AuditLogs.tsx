import { Paper, Stack } from '@mui/material';
import paths from 'routes/paths';
import PageHeader from 'components/common/PageHeader';
import AuditLogTable from 'components/sections/audit/AuditLogTable';

const AuditLogs = () => (
  <Stack direction="column" height={1}>
    <PageHeader
      title="Audit Log"
      breadcrumb={[
        { label: 'Home', url: paths.root },
        { label: 'Audit Log', active: true },
      ]}
    />
    <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
      <AuditLogTable />
    </Paper>
  </Stack>
);

export default AuditLogs;
