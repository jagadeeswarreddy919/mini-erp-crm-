import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (val: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearchChange,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className="search-input-wrapper">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        className={`form-input search-input ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e);
          if (onSearchChange) onSearchChange(e.target.value);
        }}
        {...props}
      />
    </div>
  );
};
