import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ROUTES } from '@/utils/constants';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-soft">
      {/* Top notification bar */}
      <div className="bg-black text-white py-2 text-sm">
        <div className="container">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Miễn phí vận chuyển cho đơn hàng trên 100.000 VNĐ
            </span>
            <div className="flex gap-5">
              <a href="#" className="text-white hover:text-primary-500 transition-colors flex items-center gap-1">
                Tài Khoản <span className="text-xs">▼</span>
              </a>
              <a href="#" className="text-white hover:text-primary-500 transition-colors flex items-center gap-1">
                Ngôn Ngữ <span className="text-xs">▼</span>
              </a>
              <a href="#" className="text-white hover:text-primary-500 transition-colors flex items-center gap-1">
                Hỗ Trợ <span className="text-xs">▼</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="py-5 border-b border-gray-200">
        <div className="container">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-3xl font-bold text-black tracking-tight">
                Reid
              </Link>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex bg-white border-2 border-gray-300 rounded-full overflow-hidden h-12">
                <div className="flex-shrink-0">
                  <button className="bg-gray-50 border-r border-gray-300 px-5 h-full text-sm text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    Tất cả danh mục <span className="text-xs">▼</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 px-5 text-sm outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-primary-500 hover:bg-primary-600 w-12 h-full flex items-center justify-center transition-colors">
                  <span className="text-white text-lg">🔍</span>
                </button>
              </div>
            </div>

            {/* Right side links */}
            <div className="flex items-center gap-5">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Xin chào, {user?.username}</span>
                  <button 
                    onClick={handleLogout} 
                    className="bg-primary-500 text-white px-4 py-2 rounded text-sm hover:bg-primary-600 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link 
                  to={ROUTES.LOGIN} 
                  className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                >
                  Đăng nhập / Đăng ký
                </Link>
              )}
              {/* Orders Link */}
              <Link to={ROUTES.ORDERS} className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
                Đơn hàng
              </Link>
              
              {/* Cart Icon */}
              <Link to={ROUTES.CART} className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
              </Link>
              
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                <span className="text-lg">🏠</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container">
          <ul className="flex gap-10 py-4">
            <li>
              <Link to="/" className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-base relative group">
                Trang Chủ
                <span className="absolute -bottom-4 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-base relative group">
                Cửa Hàng
                <span className="absolute -bottom-4 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/news" className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-base relative group">
                Tin Tức
                <span className="absolute -bottom-4 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-base relative group">
                Giới Thiệu
                <span className="absolute -bottom-4 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-base relative group">
                Liên Hệ
                <span className="absolute -bottom-4 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

    </header>
  );
};

export default Header;
