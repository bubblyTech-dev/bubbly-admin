import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, Divider, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import paths, { schoolPath } from 'routes/paths';
import { School } from 'types/school';
import PageHeader from 'components/common/PageHeader';
import SchoolEntitlements from 'components/sections/schools/SchoolEntitlements';
import SchoolForm from 'components/sections/schools/SchoolForm';
import SchoolSubscriptions from 'components/sections/subscriptions/SchoolSubscriptions';

type SetupTab = 'plan' | 'entitlements';

// Step 1: the school details. Step 2 (after saving): its plan and its features and limits, so a new school can be
// fully set up without leaving the page. Step 2 is optional and can be done later from the school page.
const SchoolNew = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canPlan = hasPermission('subscriptions.view');
  const [created, setCreated] = useState<School | null>(null);
  const [tab, setTab] = useState<SetupTab>(canPlan ? 'plan' : 'entitlements');

  return (
    <Stack direction="column" height={1} spacing={3}>
      <PageHeader
        title="Add school"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Schools', url: paths.schools },
          { label: 'Add school', active: true },
        ]}
      />

      {!created && (
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <SchoolForm onSaved={setCreated} />
        </Paper>
      )}

      {created && (
        <>
          <Alert severity="success">
            <strong>{created.name}</strong> was created. Next, set up its plan and what it can use.
            You can skip this and do it later from the school page.
          </Alert>

          <Paper sx={{ p: { xs: 3, md: 5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}
            >
              <Typography variant="h6">Step 2: Plan, features and limits</Typography>
              <Button
                variant="contained"
                onClick={() => navigate(schoolPath(created.uuid), { replace: true })}
              >
                Go to school
              </Button>
            </Stack>

            <Tabs value={tab} onChange={(_event, value: SetupTab) => setTab(value)} sx={{ mb: 4 }}>
              {canPlan && <Tab value="plan" label="Plan" />}
              <Tab value="entitlements" label="Features & limits" />
            </Tabs>

            {tab === 'plan' && canPlan && (
              <SchoolSubscriptions schoolUuid={created.uuid} schoolName={created.name} />
            )}
            {tab === 'entitlements' && (
              <SchoolEntitlements
                schoolUuid={created.uuid}
                canEdit={hasPermission('schools.entitlements')}
              />
            )}

            <Divider sx={{ my: 4 }} />
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => navigate(schoolPath(created.uuid), { replace: true })}
              >
                Done, go to school
              </Button>
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default SchoolNew;
