import { Platform } from 'react-native';

// When running on Android emulator, localhost refers to the emulator itself.
// Use 10.0.2.2 to reach the host machine's localhost.
// For iOS simulator, localhost works fine.
// For physical devices, use your computer's local IP address.

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001';
    }
    return 'http://localhost:5001';
  }
  // Production URL — update this when you deploy your backend
  return 'https://your-production-api.com';
};

export const API_BASE = getBaseUrl();

export const ENDPOINTS = {
  // Jobs
  jobs: `${API_BASE}/api/jobs`,
  jobById: (id) => `${API_BASE}/api/jobs/${id}`,
  jobStats: `${API_BASE}/api/jobs/stats`,
  syncDaily: `${API_BASE}/api/jobs/sync-daily`,

  // Auth
  login: `${API_BASE}/api/login`,
  registerSeeker: `${API_BASE}/api/register/job-seeker`,
  registerCompany: `${API_BASE}/api/register/company`,
  sendOtp: `${API_BASE}/api/send-otp`,
  verifyOtp: `${API_BASE}/api/verify-otp`,
  me: `${API_BASE}/api/me`,

  // Applications
  applications: `${API_BASE}/api/applications`,
  myApplications: `${API_BASE}/api/applications/my`,

  // Health
  health: `${API_BASE}/api/health`,
};
