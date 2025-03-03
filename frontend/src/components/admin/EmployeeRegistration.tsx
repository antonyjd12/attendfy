import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../context/AuthContext';

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  location: string;
}

const EmployeeRegistrationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  department: Yup.string().required('Required'),
  employeeId: Yup.string().required('Required'),
  deviceId: Yup.string().required('Device assignment is required'),
});

const EmployeeRegistration: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get('/devices');
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
        toast.error('Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Redirect if user is not authorized
  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        sx={{
          opacity: 0,
          animation: 'fadeIn 0.5s ease-in-out forwards',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Only administrators can register new employees.
        </Typography>
      </Box>
    );
  }

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      if (!user?._id) {
        throw new Error('Admin ID not found');
      }

      const employeeData = {
        ...values,
        role: 'employee',
        isActive: true,
        assignedAdmin: user._id,
        joinDate: new Date().toISOString()
      };

      await api.post('/auth/register-employee', employeeData);
      toast.success('Employee registered successfully');
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to register employee';
      toast.error(errorMessage);
      console.error('Employee registration error:', error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        sx={{
          opacity: 0,
          animation: 'fadeIn 0.3s ease-in-out forwards',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          }
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          py: 4,
          opacity: 0,
          animation: 'slideIn 0.5s ease-out forwards',
          '@keyframes slideIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <Box
            sx={{
              mb: 4,
              textAlign: 'center',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            <PersonAddIcon
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'rotate(10deg)'
                }
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                mb: 1,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Register New Employee
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                margin: '0 auto',
                opacity: 0.8
              }}
            >
              Create a new employee account
            </Typography>
          </Box>

          <Divider
            sx={{
              mb: 4,
              '&::before, &::after': {
                borderColor: 'primary.light'
              }
            }}
          />

          <Formik
            initialValues={{
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              department: '',
              employeeId: '',
              deviceId: ''
            }}
            validationSchema={EmployeeRegistrationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    '& .MuiTextField-root, & .MuiFormControl-root': {
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }
                  }}
                >
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

                  <Field name="deviceId">
                    {({ field }: any) => (
                      <FormControl
                        fullWidth
                        error={touched.deviceId && Boolean(errors.deviceId)}
                      >
                        <InputLabel>Assign Device</InputLabel>
                        <Select {...field} label="Assign Device">
                          {devices.map((device) => (
                            <MenuItem key={device._id} value={device._id}>
                              {device.name} - {device.location}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.deviceId && errors.deviceId && (
                          <Typography variant="caption" color="error">
                            {errors.deviceId}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  </Field>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Registering...</span>
                      </Box>
                    ) : (
                      'Register Employee'
                    )}
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

export default EmployeeRegistration;