import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}) => {
  const { t } = useLanguage();
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        {t('common.page')} {startItem}-{endItem} {t('common.of')} {totalElements} {t('common.items')}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{t('common.page')} {t('common.of')}:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt; {t('common.page')}
          </button>
          <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            {currentPage + 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.page')} &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;


