import React, { useState } from 'react';
import { Formik, Form, Field, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Divider,
  useTheme,
  Stack,
  Paper,
} from '@mui/material';

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    try {
      await axios.put(`/api/users/${user?._id}`, values);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (values: FormValues, { resetForm }: { resetForm: () => void }) => {
    try {
      await axios.put(`/api/users/${user?._id}/change-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const PasswordChangeModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          <button
            type="button"
            onClick={() => setShowPasswordModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={passwordSchema}
          onSubmit={handleChangePassword}
        >
          {({ errors, touched, isSubmitting }: { 
            errors: FormikErrors<FormValues>;
            touched: FormikTouched<FormValues>;
            isSubmitting: boolean;
          }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <Field
                  type="password"
                  name="currentPassword"
                  className={`mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:border-primary-500 focus:ring-primary-500 ${
                    errors.currentPassword && touched.currentPassword ? 'border-red-300' : ''
                  }`}
                />
                {errors.currentPassword && touched.currentPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <Field
                  type="password"
                  name="newPassword"
                  className={`mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:border-primary-500 focus:ring-primary-500 ${
                    errors.newPassword && touched.newPassword ? 'border-red-300' : ''
                  }`}
                />
                {errors.newPassword && touched.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className={`mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:border-primary-500 focus:ring-primary-500 ${
                    errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : ''
                  }`}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 600 
        }}
      >
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              background: theme.palette.gradient?.primary || theme.palette.primary.main,
              color: 'white',
              borderRadius: 2
            }}
          >
            <CardContent>
              <Stack 
                spacing={3} 
                alignItems="center" 
                sx={{ 
                  py: { xs: 3, sm: 5 }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 120 },
                    height: { xs: 80, sm: 120 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: { xs: '2rem', sm: '3rem' },
                    fontWeight: 600,
                  }}
                >
                  {user.firstName[0]}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    {user.role.replace(/_/g, ' ').toUpperCase()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details Card */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Profile Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">
                    {user.employeeId}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {user.department}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: user.isActive ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Password</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your password to keep your account secure.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && <PasswordChangeModal />}
    </Box>
  );
};

export default ProfilePage; 