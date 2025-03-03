import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Avatar,
  Stack,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../config/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  presentPercentage: string;
  latePercentage: string;
  absentPercentage: string;
}

interface WeeklyAttendance {
  day: string;
  present: number;
  late: number;
}

interface RecentActivity {
  name: string;
  action: string;
  time: string;
  avatar: string;
}

const DashboardHome = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch stats and weekly attendance for admin roles
        const requests = [];
        
        if (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'hr_manager') {
          requests.push(api.get('/dashboard/stats'));
          requests.push(api.get('/dashboard/weekly-attendance'));
        } else {
          // For regular employees, fetch their own attendance data
          requests.push(api.get(`/dashboard/stats?userId=${user?._id}`));
          requests.push(api.get(`/dashboard/weekly-attendance?userId=${user?._id}`));
        }

        // Recent activity is available for all users
        requests.push(api.get('/dashboard/recent-activity'));

        const [statsResponse, weeklyResponse, activityResponse] = await Promise.all(requests);

        setStats(statsResponse.data);
        setWeeklyAttendance(weeklyResponse.data);
        setRecentActivity(activityResponse.data);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Alert severity="info">
          Please log in to view dashboard data.
        </Alert>
      </Box>
    );
  }

  const attendanceData = {
    labels: weeklyAttendance.map(day => day.day),
    datasets: [
      {
        label: 'Present',
        data: weeklyAttendance.map(day => day.present),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        tension: 0.4,
      },
      {
        label: 'Late',
        data: weeklyAttendance.map(day => day.late),
        borderColor: theme.palette.warning.main,
        backgroundColor: theme.palette.warning.main,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const dashboardStats = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees?.toString() || '0',
      icon: PeopleIcon,
      color: theme.palette.primary.main,
      trend: `${(stats?.totalEmployees || 0) > 0 ? '+' : ''}${stats?.totalEmployees || 0}`,
    },
    {
      title: 'Present Today',
      value: stats?.presentToday.toString() || '0',
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      trend: stats?.presentPercentage || '0%',
    },
    {
      title: 'Late Today',
      value: stats?.lateToday.toString() || '0',
      icon: AccessTimeIcon,
      color: theme.palette.warning.main,
      trend: stats?.latePercentage || '0%',
    },
    {
      title: 'Absent Today',
      value: stats?.absentToday.toString() || '0',
      icon: WarningIcon,
      color: theme.palette.error.main,
      trend: stats?.absentPercentage || '0%',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {dashboardStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${theme.palette.background.paper} 100%)`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2" sx={{ mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: stat.color,
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {stat.trend}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <stat.icon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Weekly Attendance Overview</Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Line options={chartOptions} data={attendanceData} height={100} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {recentActivity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                      }}
                    >
                      {activity.avatar}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle2">{activity.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {activity.action} • {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;