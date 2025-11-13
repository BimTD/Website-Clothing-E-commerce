import React from 'react';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Tổng Sản Phẩm',
      value: '1,234',
      icon: '🛍️',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Đơn Hàng Hôm Nay',
      value: '56',
      icon: '📦',
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Doanh Thu Tháng',
      value: '₫45.2M',
      icon: '💰',
      color: 'bg-yellow-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Khách Hàng Mới',
      value: '89',
      icon: '👥',
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Đơn hàng mới #1234', time: '2 phút trước', type: 'order' },
    { id: 2, action: 'Sản phẩm mới được thêm', time: '15 phút trước', type: 'product' },
    { id: 3, action: 'Khách hàng đăng ký mới', time: '1 giờ trước', type: 'user' },
    { id: 4, action: 'Cập nhật danh mục', time: '2 giờ trước', type: 'category' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại, {user?.username}!</h1>
        <p className="text-blue-100">Đây là tổng quan về cửa hàng của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} so với tháng trước
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-2xl text-white">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Hoạt Động Gần Đây</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'product' ? 'bg-green-500' :
                    activity.type === 'user' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <span className="text-gray-800">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Thao Tác Nhanh</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3 className="font-medium text-gray-800">Thêm Sản Phẩm</h3>
                  <p className="text-sm text-gray-600">Tạo sản phẩm mới</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <h3 className="font-medium text-gray-800">Quản Lý Danh Mục</h3>
                  <p className="text-sm text-gray-600">Thêm/sửa danh mục</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-medium text-gray-800">Xem Báo Cáo</h3>
                  <p className="text-sm text-gray-600">Thống kê doanh thu</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

