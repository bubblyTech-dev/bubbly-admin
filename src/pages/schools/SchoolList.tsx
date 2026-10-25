import { Paper, Stack } from '@mui/material';
import paths from 'routes/paths';
import PageHeader from 'components/common/PageHeader';
import SchoolsTable from 'components/sections/schools/SchoolsTable';

const SchoolList = () => {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Schools"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Schools', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <SchoolsTable />
      </Paper>
    </Stack>
  );
};

export default SchoolList;
