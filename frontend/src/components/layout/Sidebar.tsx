import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  Boxes,
  UserCog,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const mainNavItems: NavItemConfig[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: <Users size={18} />,
    roles: ['ADMIN', 'SALES'],
  },
  {
    label: 'Products',
    path: '/products',
    icon: <Package size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE'],
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: <Warehouse size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE'],
  },
  {
    label: 'Sales Challans',
    path: '/challans',
    icon: <FileText size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
];

const adminNavItems: NavItemConfig[] = [
  {
    label: 'Team Members',
    path: '/team-members',
    icon: <UserCog size={18} />,
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';

  const visibleMainNav = mainNavItems.filter((item) => item.roles.includes(currentRole));
  const visibleAdminNav = adminNavItems.filter((item) => item.roles.includes(currentRole));

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <Boxes size={22} style={{ color: 'var(--primary)' }} />
            <span>ApexERP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-badge">OPS</span>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-sidebar-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleMainNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {visibleAdminNav.length > 0 && (
            <>
              <div
                style={{
                  margin: '16px 12px 8px 12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-sidebar-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Administration
              </div>
              {visibleAdminNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontWeight: 600, color: 'var(--text-sidebar)' }}>ApexERP Portal</div>
          <div style={{ color: 'var(--text-sidebar-muted)', fontSize: '11px', marginTop: '2px' }}>
            Wholesale Operations v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
