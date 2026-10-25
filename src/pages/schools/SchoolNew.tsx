import { useNavigate } from 'react-router';
import { Paper, Stack } from '@mui/material';
import paths, { schoolPath } from 'routes/paths';
import SchoolForm from 'components/sections/schools/SchoolForm';
import PageHeader from 'components/sections/user-table/PageHeader';

const SchoolNew = () => {
  const navigate = useNavigate();

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Add school"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Schools', url: paths.schools },
          { label: 'Add school', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <SchoolForm onSaved={(school) => navigate(schoolPath(school.uuid), { replace: true })} />
      </Paper>
    </Stack>
  );
};

export default SchoolNew;
