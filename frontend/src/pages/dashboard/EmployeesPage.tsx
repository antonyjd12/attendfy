import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../../config/axios';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  joinDate: string;
  isActive: boolean;
}

const employeeSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  employeeId: Yup.string().required('Employee ID is required'),
  department: Yup.string().required('Department is required'),
  role: Yup.string().required('Role is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters'),
});

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get<Employee[]>('/users', {
        params: {
          ...(user?.role !== 'super_admin' && { assignedAdmin: user?._id }),
          ...(user?.role !== 'super_admin' && { role: 'employee' })
        }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };
  const handleAddEmployee = async (values: any, { resetForm }: any) => {
    try {
      if (!user?._id) {
        toast.error('Admin ID not found');
        return;
      }
      await api.post('/auth/register-employee', {
        ...values,
        ...(user.role !== 'super_admin' && { assignedAdmin: user._id }),
        joinDate: new Date().toISOString()
      });
      toast.success('Employee added successfully');
      setShowAddModal(false);
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    }
  };
  const handleUpdateEmployee = async (values: any) => {
    try {
      await axios.put(`/api/users/${selectedEmployee?._id}`, values);
      toast.success('Employee updated successfully');
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    }
  };
  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/${employeeId}`, {
        isActive: !currentStatus,
      });
      toast.success(`Employee ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee status');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/users/${employeeId}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };
  const EmployeeModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <button
            type="button"
            onClick={onClose}
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
            firstName: selectedEmployee?.firstName || '',
            lastName: selectedEmployee?.lastName || '',
            email: selectedEmployee?.email || '',
            employeeId: selectedEmployee?.employeeId || '',
            department: selectedEmployee?.department || '',
            role: selectedEmployee?.role || 'employee',
            password: '',
          }}
          validationSchema={employeeSchema}
          onSubmit={selectedEmployee ? handleUpdateEmployee : handleAddEmployee}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <Field
                  type="text"
                  name="firstName"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.firstName && touched.firstName ? 'border-red-300' : ''
                  }`}
                />
                {errors.firstName && touched.firstName && (
                  <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <Field
                  type="text"
                  name="lastName"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.lastName && touched.lastName ? 'border-red-300' : ''
                  }`}
                />
                {errors.lastName && touched.lastName && (
                  <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.email && touched.email ? 'border-red-300' : ''
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <Field
                  type="text"
                  name="employeeId"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.employeeId && touched.employeeId ? 'border-red-300' : ''
                  }`}
                />
                {errors.employeeId && touched.employeeId && (
                  <p className="mt-2 text-sm text-red-600">{errors.employeeId}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <Field
                  type="text"
                  name="department"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.department && touched.department ? 'border-red-300' : ''
                  }`}
                />
                {errors.department && touched.department && (
                  <p className="mt-2 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <Field
                  as="select"
                  name="role"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="hr_manager">HR Manager</option>
                  {user?.role === 'super_admin' && (
                    <option value="admin">Admin</option>
                  )}
                </Field>
              </div>

              {!selectedEmployee && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      errors.password && touched.password ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isSubmitting ? 'Saving...' : selectedEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );

  return (
    <Box sx={{ p: 3, height: '100%', bgcolor: 'background.default' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Employees
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage employee accounts and permissions
          </Typography>
        </Box>
        {user?.role === 'super_admin' && (
          <Button
            variant="contained"
            onClick={() => setShowAddModal(true)}
            startIcon={<PersonAddIcon />}
            sx={{
              background: (theme) => theme.palette.gradient?.primary || theme.palette.primary.main,
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': {
                background: (theme) => theme.palette.gradient?.primary || theme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: (theme) => theme.shadows[4],
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Add Employee
          </Button>
        )}
      </Stack>

      <Paper elevation={0} sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Join Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ '& > tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No employees found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow 
                    key={employee._id}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {employee.email}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          ID: {employee.employeeId}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.department}
                        size="small"
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                        {employee.role.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {format(new Date(employee.joinDate), 'MMM d, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.isActive ? 'Active' : 'Inactive'}
                        color={employee.isActive ? 'success' : 'error'}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedEmployee(employee)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(employee._id, employee.isActive)}
                          sx={{ color: employee.isActive ? 'error.main' : 'success.main' }}
                        >
                          {employee.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEmployee(employee._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {(showAddModal || selectedEmployee) && (
        <EmployeeModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </Box>
  );
};

export default EmployeesPage;