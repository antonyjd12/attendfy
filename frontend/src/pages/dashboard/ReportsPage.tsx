import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import {
  // Update the Material-UI imports at the top of the file
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  useTheme,
  TextField, // Add this import
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AttendanceStats {
  present: number;
  absent: number;
  leave: number;
  'half-day': number;
  total: number;
}

interface DepartmentStats {
  _id: string;
  count: number;
  activeCount: number;
}

interface DepartmentResponse {
  departmentBreakdown: DepartmentStats[];
}

interface User {
  _id: string;
  role: string;
  employeeId: string;
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const [attendanceResponse, departmentResponse] = await Promise.all([
        api.get('/attendance/summary', {
          params: {
            ...dateRange,
            userId: user?.role === 'employee' ? user?._id : undefined,
          },
        }),
        api.get('/users/stats/overview'),
      ]);
      setAttendanceStats(attendanceResponse.data);
      if (user?.role !== 'employee') {
        setDepartmentStats(departmentResponse.data.departmentBreakdown);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, user]);
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get('/reports/download', {
        params: dateRange,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${dateRange.startDate}-${dateRange.endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Leave', 'Half Day'],
    datasets: [
      {
        label: 'Attendance Distribution',
        data: attendanceStats
          ? [
              attendanceStats.present,
              attendanceStats.absent,
              attendanceStats.leave,
              attendanceStats['half-day'],
            ]
          : [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(234, 179, 8, 0.5)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const departmentChartData = {
    labels: departmentStats.map(dept => dept._id),
    datasets: [
      {
        label: 'Total Employees',
        data: departmentStats.map(dept => dept.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Active Employees',
        data: departmentStats.map(dept => dept.activeCount),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          View attendance statistics {user?.role === 'employee' ? 'for your records' : 'and employee distribution'}
        </Typography>

        {/* Date Range Filter */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {attendanceStats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Present"
                value={attendanceStats.present}
                total={attendanceStats.total}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Absent"
                value={attendanceStats.absent}
                total={attendanceStats.total}
                color="error.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Leave"
                value={attendanceStats.leave}
                total={attendanceStats.total}
                color="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Half Day"
                value={attendanceStats['half-day']}
                total={attendanceStats.total}
                color="warning.main"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie
                data={attendanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {user?.role !== 'employee' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Department Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={departmentChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReport}
          sx={{
            background: (theme) => 
              theme.palette.gradient?.primary || theme.palette.primary.main,
            borderRadius: 2,
          }}
        >
          Download Report
        </Button>
      </Box>
    </Box>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, total, color }: { 
  title: string; 
  value: number; 
  total: number; 
  color: string; 
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {percentage}% of total
      </Typography>
    </Paper>
  );
};

export default ReportsPage;