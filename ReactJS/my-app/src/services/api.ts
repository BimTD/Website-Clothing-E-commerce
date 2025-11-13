import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';
import { API_BASE_URL } from '@/utils/constants';
import { LoginRequest, RegisterRequest, LoginResponse, UserInfo, ApiResponse } from '@/types/auth';

// Cấu hình Axios và interceptors

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> => 
    api.post('/auth/login', credentials),
  
  register: (userData: RegisterRequest): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/register', userData),
  
  getCurrentUser: (): Promise<AxiosResponse<UserInfo>> => 
    api.get('/auth/me'),
};

export default api;