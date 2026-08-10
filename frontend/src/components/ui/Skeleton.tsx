import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="table-container">
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton height="32px" />
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', gap: '12px' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height="24px" style={{ flex: 1 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const KpiSkeleton: React.FC = () => {
  return (
    <div className="kpi-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="kpi-card" style={{ height: '110px' }}>
          <Skeleton width="60%" height="14px" />
          <Skeleton width="40%" height="32px" style={{ margin: '8px 0' }} />
          <Skeleton width="80%" height="12px" />
        </div>
      ))}
    </div>
  );
};
