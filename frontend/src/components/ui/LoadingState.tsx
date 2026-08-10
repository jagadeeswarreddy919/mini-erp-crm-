import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading operational data...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '13px', fontWeight: 500 }}>{message}</p>
    </div>
  );
};
