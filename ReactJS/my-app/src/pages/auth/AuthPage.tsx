import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import { ROUTES } from '@/utils/constants';
import { tokenStorage } from '@/utils/tokenStorage';
import { useFormValidation, ValidationRules } from '@/hooks/useFormValidation';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validationRules: ValidationRules = {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50
    },
    email: {
      required: !isLogin,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 6
    },
    confirmPassword: {
      required: !isLogin,
      custom: (value) => {
        if (!isLogin && value !== formData.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  };

  const { errors, validateSingleField, clearErrors } = useFormValidation(validationRules);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
    
    // Validate field on change
    validateSingleField(name, value);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    clearErrors();
    setLoading(true);

    try {
      const loginData: LoginRequest = {
        username: formData.username,
        password: formData.password
      };

      const result = await login(loginData);
      
      if (result.success) {
        // Redirect based on role
        const user = tokenStorage.getUser();
        if (user?.roles.includes('ROLE_ADMIN')) {
          navigate(ROUTES.ADMIN);
        } else {
          navigate(ROUTES.HOME);
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearErrors();
    setLoading(true);

    try {
      const registerData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const result = await register(registerData);
      
      if (result.success) {
        setSuccess(result.message || 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    clearErrors();
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    clearErrors();
  };

  return (
    <div className="bg-white min-h-[60vh] py-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Left Column - Dynamic Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-soft">
            {isLogin ? (
              // Login Form
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Đăng Nhập</h2>
                
                <form onSubmit={handleLogin} className="w-full">
                  <div className="mb-6">
                    <label htmlFor="username" className="form-label">
                      Tài khoản <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`form-input ${errors.username ? 'error' : ''}`}
                      required
                    />
                    {errors.username && <div className="field-error">{errors.username}</div>}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="password" className="form-label">
                      Mật khẩu <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      required
                    />
                    {errors.password && <div className="field-error">{errors.password}</div>}
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors text-sm">
                      Quên mật khẩu?
                    </a>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-primary-500"
                      />
                      <span>Lưu tài khoản</span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary-500 text-white py-4 rounded font-bold text-base uppercase tracking-wide hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
                    disabled={loading}
                  >
                    {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                  </button>
                </form>
              </>
            ) : (
              // Register Form
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Đăng Ký</h2>
                <p className="text-gray-600 text-sm text-center mb-8 leading-relaxed">
                  Tạo một tài khoản mới để sử dụng đầy đủ các tính năng của hệ thống
                </p>

                <form onSubmit={handleRegister} className="w-full">
                  <div className="mb-6">
                    <label htmlFor="reg-username" className="form-label">
                      Tài khoản <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`form-input ${errors.username ? 'error' : ''}`}
                      required
                    />
                    {errors.username && <div className="field-error">{errors.username}</div>}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="reg-email" className="form-label">
                      Email <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      required
                    />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="reg-password" className="form-label">
                      Mật khẩu <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="reg-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      required
                    />
                    {errors.password && <div className="field-error">{errors.password}</div>}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="reg-confirmPassword" className="form-label">
                      Xác nhận mật khẩu <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="reg-confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      required
                    />
                    {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary-500 text-white py-4 rounded font-bold text-base uppercase tracking-wide hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
                    disabled={loading}
                  >
                    {loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN'}
                  </button>
                </form>
              </>
            )}

            {/* Error and Success Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>

          {/* Right Column - Action Buttons */}
          <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-soft">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </h2>
            <p className="text-gray-600 text-sm text-center mb-8 leading-relaxed">
              {isLogin 
                ? 'Tạo tài khoản mới để trải nghiệm đầy đủ các tính năng của chúng tôi'
                : 'Đăng nhập ngay để truy cập vào tài khoản của bạn'
              }
            </p>

            <div className="space-y-5 mb-8">
              <button 
                onClick={isLogin ? switchToRegister : switchToLogin}
                className="w-full py-3 px-6 rounded font-medium transition-all duration-300 bg-primary-500 text-white hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-medium"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
              </button>
              
              <div className="relative text-center">
                <span className="bg-white px-5 text-gray-500 text-sm relative z-10">Hoặc</span>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
              </div>
              
              <button className="w-full bg-white text-gray-700 border-2 border-gray-300 py-3 px-6 rounded font-medium hover:border-primary-500 hover:text-primary-500 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3">
                <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">G</span>
                Đăng nhập bằng Google
              </button>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-4">
                Bằng cách đăng ký, bạn đồng ý với 
                <a href="#" className="text-primary-500 hover:underline ml-1">Điều khoản sử dụng</a> 
                và 
                <a href="#" className="text-primary-500 hover:underline ml-1">Chính sách bảo mật</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
