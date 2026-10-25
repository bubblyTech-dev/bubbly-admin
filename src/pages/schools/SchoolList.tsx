import { Link as RouterLink } from 'react-router';
import { Button, Paper, Stack } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/common/PageHeader';
import SchoolsTable from 'components/sections/schools/SchoolsTable';

const SchoolList = () => {
  const { hasPermission } = useAuth();

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Schools"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Schools', active: true },
        ]}
        actionComponent={
          hasPermission('schools.create') ? (
            <Button
              variant="contained"
              component={RouterLink}
              to={paths.schoolNew}
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            >
              Add school
            </Button>
          ) : undefined
        }
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <SchoolsTable />
      </Paper>
    </Stack>
  );
};

export default SchoolList;
