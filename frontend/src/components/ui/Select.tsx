import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ children, className = '', error, ...props }) => {
  return (
    <div>
      <select className={`form-select ${className}`} {...props}>
        {children}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};
