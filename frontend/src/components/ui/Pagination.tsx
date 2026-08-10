import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
}) => {
  if (totalRecords === 0) return null;

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="pagination">
      <div>
        Showing <span style={{ fontWeight: 600 }}>{startRecord}</span> to{' '}
        <span style={{ fontWeight: 600 }}>{endRecord}</span> of{' '}
        <span style={{ fontWeight: 600 }}>{totalRecords}</span> entries
      </div>

      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span style={{ padding: '0 8px', alignSelf: 'center', fontSize: '12px' }}>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
