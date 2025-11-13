export interface User {
  username: string;
  roles: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: string;
}

export interface UserInfo {
  username: string;
  roles: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  message: string;
}