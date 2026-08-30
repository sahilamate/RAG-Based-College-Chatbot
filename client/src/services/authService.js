import api from './api';

const TOKEN_KEY = 'collegeai_jwt_token';

export const authService = {
  // Login user with email & password
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      return { token, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  },

  // Register new student account
  async register(data) {
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        studentId: data.studentId,
        department: data.department
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  // Restore current user session from GET /api/auth/me
  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('[authService] Session restoration failed:', error.message);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  // Logout current user session
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore API logout error if offline
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
    return true;
  }
};
