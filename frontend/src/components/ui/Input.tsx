import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', error, ...props }) => {
  return (
    <div>
      <input className={`form-input ${className}`} {...props} />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};
