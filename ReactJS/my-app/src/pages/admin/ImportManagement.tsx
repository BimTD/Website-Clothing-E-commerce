import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Import, ImportFilters, ImportRequest } from '@/types/import';
import { importAPI } from '@/services/importApi';
import { 
  MessageAlert, 
  PageTitle, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';
import ImportForm from '@/components/admin/ImportForm';

const ImportManagement: React.FC = () => {
  const { t } = useLanguage();
  
  // State
  const [imports, setImports] = useState<Import[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ImportFilters>({});

  // Load imports
  const loadImports = async () => {
    try {
      setLoading(true);
      const result = await importAPI.getAll({
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        ...filters
      });
      
      setImports(result.data);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Error loading imports:', error);
      setMessage({ type: 'error', text: t('import.loadError') });
    } finally {
      setLoading(false);
    }
  };

  // Load imports when page, size, search, or filters change
  React.useEffect(() => {
    loadImports();
  }, [currentPage, pageSize, searchTerm, filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  // Handle reset search
  const handleResetSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Handle create import
  const handleCreateImport = async (importRequest: ImportRequest) => {
    try {
      const result = await importAPI.create(importRequest);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || t('import.createSuccess') });
        setShowForm(false);
        loadImports(); // Reload the list
        return true;
      } else {
        setMessage({ type: 'error', text: result.message || t('import.createError') });
        return false;
      }
    } catch (error) {
      console.error('Error creating import:', error);
      setMessage({ type: 'error', text: t('import.createError') });
      return false;
    }
  };

  // Handle delete import
  const handleDeleteImport = async (id: number) => {
    if (!window.confirm(t('import.deleteConfirm'))) {
      return;
    }

    try {
      const result = await importAPI.delete(id);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || t('import.deleteSuccess') });
        loadImports(); // Reload the list
      } else {
        setMessage({ type: 'error', text: result.message || t('import.deleteError') });
      }
    } catch (error) {
      console.error('Error deleting import:', error);
      setMessage({ type: 'error', text: t('import.deleteError') });
    }
  };

  // Handle view import detail
  const handleViewDetail = async (id: number) => {
    try {
      const result = await importAPI.getById(id);
      
      if (result.success && result.data) {
        // Show import detail in a modal or navigate to detail page
        console.log('Import detail:', result.data);
        // You can implement a modal or navigate to a detail page here
      } else {
        setMessage({ type: 'error', text: result.message || t('import.loadError') });
      }
    } catch (error) {
      console.error('Error loading import detail:', error);
      setMessage({ type: 'error', text: t('import.loadError') });
    }
  };

  // Table columns
  const columns = [
    {
      key: 'id' as keyof Import,
      title: '#',
      render: (_: any, __: Import, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'soChungTu' as keyof Import,
      title: t('import.receiptNumber'),
      render: (value: string) => (
        <span className="font-medium text-blue-600">
          {value}
        </span>
      )
    },
    {
      key: 'nhaCungCapTen' as keyof Import,
      title: t('import.supplier'),
      render: (value: string) => (
        <span className="text-gray-900">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'ngayTao' as keyof Import,
      title: t('import.importDate'),
      render: (value: string) => (
        <span className="text-gray-600">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'tongTien' as keyof Import,
      title: t('import.totalAmount'),
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {value.toLocaleString('vi-VN')} ₫
        </span>
      )
    },
    {
      key: 'nguoiLapPhieu' as keyof Import,
      title: t('import.createdBy'),
      render: (value: string) => (
        <span className="text-gray-600">
          {value}
        </span>
      )
    },
    {
      key: 'actions' as keyof Import,
      title: t('common.actions'),
      render: (_: any, item: Import) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(item.id)}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            {t('common.view')}
          </button>
          <button
            onClick={() => handleDeleteImport(item.id)}
            className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
          >
            {t('common.delete')}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('Quản lý nhập hàng')} />

      {message && (
        <MessageAlert 
          message={message} 
        />
      )}

      {/* Search and Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="md:col-span-2">
              <SearchBar
              placeholder={t('import.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearch}
              onSearch={() => {}} // handleSearch is already called in onChange
              onReset={handleResetSearch}
            />
          </div>
      
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? t('common.cancel') : t('import.createNew')}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('import.createNew')}
          </h3>
          <ImportForm
            onSubmit={handleCreateImport}
            loading={loading}
          />
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={imports}
          columns={columns}
          loading={loading}
          emptyMessage={t('import.emptyMessage')}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ImportManagement;
