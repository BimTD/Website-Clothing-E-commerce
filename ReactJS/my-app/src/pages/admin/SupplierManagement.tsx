import React from 'react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { supplierAPI } from '@/services/supplierApi';
import { Supplier } from '@/types/supplier';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageAlert, 
  PageTitle, 
  SimpleForm, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';

const SupplierManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    data: suppliers,
    loading,
    message,
    editingItem,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    searchTerm,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSearch,
    handleResetSearch,
    handlePageChange,
    handlePageSizeChange,
    startEdit,
    cancelEdit,
    updateEditingItem
  } = useCrudOperations<Supplier>({
    api: supplierAPI,
    entityName: 'nhà cung cấp'
  });

  const handleEditSubmit = async (item: Supplier) => {
    await handleUpdate(item.id, { 
      ten: item.ten,
      email: item.email,
      sdt: item.sdt,
      thongTin: item.thongTin,
      diaChi: item.diaChi
    });
  };

  const handleEditChange = (updatedItem: Supplier) => {
    updateEditingItem(updatedItem);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm);
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    const supplierData = { 
      ten: data.ten,
      email: data.email,
      sdt: data.sdt,
      thongTin: data.thongTin || '',
      diaChi: data.diaChi
    };
    return await handleCreate(supplierData);
  };

  const columns = [
    {
      key: 'id' as keyof Supplier,
      title: '#',
      render: (_: any, __: Supplier, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'ten' as keyof Supplier,
      title: t('supplier.name'),
      editable: true
    },
    {
      key: 'email' as keyof Supplier,
      title: t('supplier.email'),
      editable: true
    },
    {
      key: 'sdt' as keyof Supplier,
      title: t('supplier.phone'),
      editable: true
    },
    {
      key: 'diaChi' as keyof Supplier,
      title: t('supplier.address'),
      editable: true
    },
    {
      key: 'actions' as keyof Supplier,
      title: t('common.actions')
    }
  ];

  const formFields = [
    {
      name: 'ten',
      label: t('supplier.name'),
      type: 'text' as const,
      placeholder: t('supplier.namePlaceholder'),
      required: true
    },
    {
      name: 'email',
      label: t('supplier.email'),
      type: 'email' as const,
      placeholder: t('supplier.emailPlaceholder'),
      required: true
    },
    {
      name: 'sdt',
      label: t('supplier.phone'),
      type: 'text' as const,
      placeholder: t('supplier.phonePlaceholder'),
      required: true
    },
    {
      name: 'diaChi',
      label: t('supplier.address'),
      type: 'text' as const,
      placeholder: t('supplier.addressPlaceholder'),
      required: true
    },
    {
      name: 'thongTin',
      label: t('supplier.info'),
      type: 'text' as const,
      placeholder: t('supplier.infoPlaceholder'),
      required: false
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('supplier.title')} subtitle={t('supplier.subtitle')} />
      
      <MessageAlert message={message} />
      
      <SimpleForm
        title={t('supplier.addTitle')}
        fields={formFields}
        onSubmit={handleFormSubmit}
        loading={loading}
        submitText={t('common.add')}
        submitIcon="+"
      />
      
      <DataTable
        data={suppliers}
        columns={columns}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDelete}
        editingItem={editingItem}
        onEditSubmit={handleEditSubmit}
        onEditCancel={cancelEdit}
        onEditChange={handleEditChange}
        emptyMessage={t('supplier.emptyMessage')}
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default SupplierManagement;

