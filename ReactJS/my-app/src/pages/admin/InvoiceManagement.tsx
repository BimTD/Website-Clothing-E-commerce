import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Invoice, InvoiceFilters, InvoiceStatus } from '@/types/invoice';
import { invoiceAPI } from '@/services/invoiceApi';
import { 
  MessageAlert, 
  PageTitle, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';
import InvoiceDetailModal from '@/components/admin/InvoiceDetailModal';

const InvoiceManagement: React.FC = () => {
  const { t } = useLanguage();
  
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filters, setFilters] = useState<InvoiceFilters>({});

  // Load invoices
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await invoiceAPI.getAll({
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        status: statusFilter,
        ...filters
      });
      
      setInvoices(result.data);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setMessage({ type: 'error', text: t('invoice.loadError') });
    } finally {
      setLoading(false);
    }
  };

  // Load invoices when page, size, search, or status filter change
  React.useEffect(() => {
    loadInvoices();
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  // Handle reset search
  const handleResetSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
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

  // Handle view detail
  const handleViewDetail = async (id: number) => {
    try {
      const result = await invoiceAPI.getById(id);
      
      if (result.success && result.data) {
        setSelectedInvoice(result.data);
        setShowDetailModal(true);
      } else {
        setMessage({ type: 'error', text: result.message || t('invoice.loadError') });
      }
    } catch (error) {
      console.error('Error loading invoice detail:', error);
      setMessage({ type: 'error', text: t('invoice.loadError') });
    }
  };

  // Handle approve invoice
  const handleApprove = async (id: number) => {
    try {
      const result = await invoiceAPI.approve(id);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || t('invoice.approveSuccess') });
        setShowDetailModal(false);
        loadInvoices(); // Reload the list
      } else {
        setMessage({ type: 'error', text: result.message || t('invoice.approveError') });
      }
    } catch (error) {
      console.error('Error approving invoice:', error);
      setMessage({ type: 'error', text: t('invoice.approveError') });
    }
  };

  // Handle cancel invoice
  const handleCancel = async (id: number) => {
    if (!window.confirm(t('invoice.cancelConfirm'))) {
      return;
    }

    try {
      const result = await invoiceAPI.cancel(id);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || t('invoice.cancelSuccess') });
        setShowDetailModal(false);
        loadInvoices(); // Reload the list
      } else {
        setMessage({ type: 'error', text: result.message || t('invoice.cancelError') });
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      setMessage({ type: 'error', text: t('invoice.cancelError') });
    }
  };

  // Handle update status
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const result = await invoiceAPI.updateStatus(id, newStatus);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || t('invoice.updateStatusSuccess') });
        setShowDetailModal(false);
        loadInvoices(); // Reload the list
      } else {
        setMessage({ type: 'error', text: result.message || t('invoice.updateStatusError') });
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setMessage({ type: 'error', text: t('invoice.updateStatusError') });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('invoice.status.pending');
      case 'CONFIRMED':
        return t('invoice.status.confirmed');
      case 'SHIPPING':
        return t('invoice.status.shipping');
      case 'DELIVERED':
        return t('invoice.status.delivered');
      case 'CANCELLED':
        return t('invoice.status.cancelled');
      default:
        return status;
    }
  };

  // Table columns
  const columns = [
    {
      key: 'id' as keyof Invoice,
      title: '#',
      render: (_: any, __: Invoice, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'id' as keyof Invoice,
      title: t('invoice.id'),
      render: (value: number) => (
        <span className="font-medium text-blue-600">
          #{value}
        </span>
      )
    },
    {
      key: 'userTen' as keyof Invoice,
      title: t('invoice.customer'),
      render: (value: string) => (
        <span className="text-gray-900">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'ngayTao' as keyof Invoice,
      title: t('invoice.createDate'),
      render: (value: string) => (
        <span className="text-gray-600">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'trangThai' as keyof Invoice,
      title: t('invoice.status'),
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      )
    },
    {
      key: 'tongTien' as keyof Invoice,
      title: t('invoice.totalAmount'),
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {value.toLocaleString('vi-VN')} ₫
        </span>
      )
    },
    {
      key: 'actions' as keyof Invoice,
      title: t('common.actions'),
      render: (_: any, item: Invoice) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(item.id)}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            {t('common.view')}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('admin.invoices')} />

      {message && (
        <MessageAlert 
          message={message} 
        />
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={invoices}
          columns={columns}
          loading={loading}
          emptyMessage={t('invoice.emptyMessage')}
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

      {/* Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onUpdateStatus={handleUpdateStatus}
        loading={loading}
      />
    </div>
  );
};

export default InvoiceManagement;
