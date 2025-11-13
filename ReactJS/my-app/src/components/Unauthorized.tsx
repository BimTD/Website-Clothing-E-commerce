import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

// Trang lỗi 403
const Unauthorized: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = (): void => {
    navigate(-1);
  };

  const handleLogout = (): void => {
    logout();
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="error-icon">
          <span>🚫</span>
        </div>
        
        <h1>Access Denied</h1>
        <h2>403 - Unauthorized</h2>
        
        <div className="error-message">
          <p>
            Sorry, you don't have permission to access this page.
          </p>
          <p>
            Your current role: <strong>{user?.roles}</strong>
          </p>
          <p>
            This page requires administrator privileges.
          </p>
        </div>

        <div className="action-buttons">
          <button onClick={handleGoBack} className="btn btn-secondary">
            ← Go Back
          </button>
          
          <Link to={ROUTES.HOME} className="btn btn-primary">
            🏠 Go to Home
          </Link>
          
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <p>
            If you believe you should have access to this page, please contact your administrator.
          </p>
          <div className="contact-info">
            <p>📧 Email: admin@clothesstore.com</p>
            <p>📞 Phone: (123) 456-7890</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;