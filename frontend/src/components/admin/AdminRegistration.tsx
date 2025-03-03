import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import api from '../../config/axios';
import {
  Box,
  Paper,
  Typography,
  Divider,
  useTheme,
  TextField,
  Button,
  Container,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const AdminRegistrationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  department: Yup.string().required('Required'),
  employeeId: Yup.string().required('Required'),
  role: Yup.string().required('Required'),
});

const AdminRegistration: React.FC = () => {
  const theme = useTheme();

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      // Explicitly set the role as admin
      const adminData = {
        ...values,
        role: 'admin',
        isActive: true // Ensure the admin account is active by default
      };
      await api.post('/auth/register-admin', adminData);
      toast.success('Admin registered successfully');
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to register admin';
      toast.error(errorMessage);
      console.error('Admin registration error:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <PersonAddIcon
              sx={{
                fontSize: 40,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                background: theme.palette.gradient?.primary || theme.palette.primary.main,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                mb: 1,
              }}
            >
              Register New Admin
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a new administrator account with full system access
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Formik
            initialValues={{
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              department: '',
              employeeId: '',
              role: 'admin',
            }}
            validationSchema={AdminRegistrationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { sm: '1fr 1fr' } }}>
                  <Field name="firstName">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="First Name"
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                      />
                    )}
                  </Field>

                  <Field name="lastName">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Last Name"
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
                      />
                    )}
                  </Field>

                  <Field name="email">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    )}
                  </Field>

                  <Field name="password">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Password"
                        type="password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                      />
                    )}
                  </Field>

                  <Field name="employeeId">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Employee ID"
                        error={touched.employeeId && Boolean(errors.employeeId)}
                        helperText={touched.employeeId && errors.employeeId}
                      />
                    )}
                  </Field>

                  <Field name="department">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Department"
                        error={touched.department && Boolean(errors.department)}
                        helperText={touched.department && errors.department}
                      />
                    )}
                  </Field>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 2,
                      background: theme.palette.gradient?.primary || theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.gradient?.primary || theme.palette.primary.dark,
                      },
                    }}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Admin'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminRegistration;