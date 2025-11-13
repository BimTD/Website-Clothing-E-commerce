import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageButton } from '@/components/common';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    {
      section: t('admin.statistics'),
      items: [
        { path: '/admin', label: t('admin.overview'), icon: '📊' },
        { path: '/admin/revenue', label: t('admin.revenue'), icon: '💰' },
        { path: '/admin/import', label: t('admin.import'), icon: '📦' },
      ]
    },
    {
      section: t('admin.management'),
      items: [
        { path: '/admin/products', label: t('admin.products'), icon: '🛍️' },
        { path: '/admin/categories', label: t('admin.categories'), icon: '🏷️' },
        { path: '/admin/suppliers', label: t('admin.suppliers'), icon: '🏢' },
        { path: '/admin/brands', label: t('admin.brands'), icon: '⭐' },
        { path: '/admin/sizes', label: t('admin.sizes'), icon: '📏' },
        { path: '/admin/colors', label: t('admin.colors'), icon: '🎨' },
        { path: '/admin/variants', label: t('admin.variants'), icon: '🔄' },
        { path: '/admin/users', label: t('admin.users'), icon: '👥' },
        { path: '/admin/discounts', label: t('admin.discounts'), icon: '🎫' },
        { path: '/admin/marketing', label: t('admin.marketing'), icon: '📢' },
      ]
    },
    {
      section: t('admin.invoices'),
      items: [
        { path: '/admin/invoices', label: t('admin.invoices'), icon: '🧾' },
        { path: '/admin/imports', label: t('admin.import'), icon: '📋' },
      ]
    }
  ];

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/admin') return t('admin.breadcrumb.overview');
    if (path === '/admin/products') return t('admin.breadcrumb.products');
    if (path === '/admin/categories') return t('admin.breadcrumb.categories');
    if (path === '/admin/brands') return t('admin.breadcrumb.brands');
    if (path === '/admin/suppliers') return t('admin.breadcrumb.suppliers');
    if (path === '/admin/users') return t('admin.breadcrumb.users');
    if (path === '/admin/invoices') return t('admin.invoices');
    return t('admin.breadcrumb.management');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
        sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🛍️</span>
            </div>
            <span className="text-xl font-bold text-gray-800">REID STORE</span>
          </div>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <span className="text-xl">{sidebarCollapsed ? '☰' : '✕'}</span>
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageButton />
              
              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title={t('common.notifications')}>
                <span className="text-xl">🔔</span>
              </button>
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title={t('common.logout')}
                >
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-6 py-3 border-t border-gray-100">
            <nav className="text-sm">
              <span className="text-gray-500">{t('admin.breadcrumb.overview')}</span>
              <span className="mx-2 text-gray-400">›</span>
              <span className="text-gray-800 font-medium">{getBreadcrumb()}</span>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

