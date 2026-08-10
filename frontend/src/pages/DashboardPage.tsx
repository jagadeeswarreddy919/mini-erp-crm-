import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KpiSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { DashboardKpiGrid } from '../components/dashboard/DashboardKpiGrid';
import { DashboardPrimarySection } from '../components/dashboard/DashboardPrimarySection';
import { DashboardSecondaryGrid } from '../components/dashboard/DashboardSecondaryGrid';
import { DashboardActivity } from '../components/dashboard/DashboardActivity';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await dashboardApi.getSummary();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      setError('Unable to load role-specific operations dashboard summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.role]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
        <div style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Real-time wholesale inventory & CRM metrics
        </div>
        <KpiSkeleton />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
        <div style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Real-time wholesale inventory & CRM metrics
        </div>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* Subtitle Header (No Duplicate H1) */}
      <div style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
        Real-time wholesale inventory & CRM metrics
      </div>

      {/* 4 KPI Cards (Desktop 1x4, Tablet 2x2, Mobile 1x4) */}
      <DashboardKpiGrid items={dashboardData.kpi} />

      {/* Primary Section (Main Operational Table) */}
      <DashboardPrimarySection {...dashboardData.primarySection} />

      {/* Secondary Two-Column Grid */}
      <DashboardSecondaryGrid {...dashboardData.secondaryGrid} />

      {/* Full-Width Activity Section */}
      <DashboardActivity {...dashboardData.activity} />

      {/* Quick Actions Shortcuts */}
      <DashboardQuickActions actions={dashboardData.quickActions} />
    </div>
  );
};
