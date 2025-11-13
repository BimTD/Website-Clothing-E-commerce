import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface Column<T> {
  key: keyof T | 'actions';
  title: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  editable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  editingItem?: T | null;
  onEditSubmit?: (item: T) => void;
  onEditCancel?: () => void;
  onEditChange?: (item: T) => void;
  emptyMessage?: string;
}

const DataTable = <T extends { id: number }>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  editingItem,
  onEditSubmit,
  onEditCancel,
  onEditChange,
  emptyMessage = 'Không có dữ liệu'
}: DataTableProps<T>) => {
  const { t } = useLanguage();
  
  const handleEditSubmit = (e: React.FormEvent, item: T) => {
    e.preventDefault();
    if (onEditSubmit) {
      onEditSubmit(item);
    }
  };

  const renderCellContent = (column: Column<T>, item: T, index: number) => {
    // Nếu có custom render function, sử dụng nó trước
    if (column.render) {
      return column.render(item[column.key as keyof T], item, index);
    }

    // Nếu không có custom render và là cột actions, hiển thị nút mặc định
    if (column.key === 'actions') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(item)}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
            disabled={editingItem?.id === item.id}
          >
            ✏️ {t('common.edit')}
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
            disabled={editingItem?.id === item.id}
          >
            🗑️ {t('common.delete')}
          </button>
        </div>
      );
    }

    if (editingItem?.id === item.id && column.editable) {
      return (
        <form onSubmit={(e) => handleEditSubmit(e, editingItem)} className="flex gap-2">
          <input
            type="text"
            value={editingItem[column.key as keyof T] as string}
            onChange={(e) => {
              const updatedItem = { ...editingItem, [column.key]: e.target.value };
              if (onEditChange) {
                onEditChange(updatedItem);
              }
            }}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
          >
            {t('common.save')}
          </button>
          <button
            type="button"
            onClick={onEditCancel}
            className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
          >
            {t('common.cancel')}
          </button>
        </form>
      );
    }

    return item[column.key as keyof T] as React.ReactNode;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('common.loading')}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCellContent(column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
