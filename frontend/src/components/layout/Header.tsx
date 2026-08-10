import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-danger';
      case 'SALES':
        return 'badge-primary';
      case 'WAREHOUSE':
        return 'badge-warning';
      case 'ACCOUNTS':
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px', display: 'flex' }}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="page-title-text">{title}</h1>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-profile-badge">
            <div className="avatar-circle">{getInitials(user.name)}</div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role-tag">
                <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ fontSize: '10px', padding: '1px 5px' }}>
                  {user.role}
                </span>
              </span>
            </div>
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          icon={<LogOut size={15} />}
          onClick={logout}
          title="Sign out of portal"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};
