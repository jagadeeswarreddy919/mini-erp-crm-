import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '../../context/ToastContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Operations Dashboard',
  '/customers': 'Customer CRM Directory',
  '/products': 'Products Catalog',
  '/inventory': 'Stock & Inventory Log',
  '/challans': 'Sales Challans',
  '/challans/new': 'Create New Sales Challan',
};

export const AppShell: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  let pageTitle = pageTitles[path];
  if (!pageTitle) {
    if (path.startsWith('/customers/')) pageTitle = 'Customer Details & History';
    else if (path.startsWith('/challans/')) pageTitle = 'Sales Challan View';
    else pageTitle = 'Operations Portal';
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
        <div className="app-main">
          <Header title={pageTitle} onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
