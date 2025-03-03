const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`, // Add specific admin login endpoint
  REGISTER: `${API_BASE_URL}/auth/register-public`,
  ME: `${API_BASE_URL}/auth/me`,
  // Attendance endpoints
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  ATTENDANCE_CHECK_IN: `${API_BASE_URL}/attendance/check-in`,
  ATTENDANCE_CHECK_OUT: `${API_BASE_URL}/attendance/check-out`,
  ATTENDANCE_SUMMARY: `${API_BASE_URL}/attendance/summary`,
  // Dashboard endpoints
  USER_STATS: `${API_BASE_URL}/users/stats`,
};

export default API_ENDPOINTS;