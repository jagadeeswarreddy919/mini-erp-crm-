import React from 'react';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowUpDown,
  AlertCircle,
  Calendar,
  FilePlus,
} from 'lucide-react';

export interface KpiItem {
  label: string;
  value: string | number;
  subtext: string;
  icon: string;
  warning?: boolean;
  danger?: boolean;
}

interface DashboardKpiGridProps {
  items: KpiItem[];
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({ items }) => {
  const getIcon = (iconName: string, isWarning?: boolean, isDanger?: boolean) => {
    const color = isDanger
      ? 'var(--danger)'
      : isWarning
      ? 'var(--warning)'
      : 'var(--primary)';

    switch (iconName) {
      case 'users':
        return <Users size={18} style={{ color }} />;
      case 'package':
        return <Package size={18} style={{ color }} />;
      case 'alertTriangle':
        return <AlertTriangle size={18} style={{ color }} />;
      case 'alertCircle':
        return <AlertCircle size={18} style={{ color }} />;
      case 'fileText':
        return <FileText size={18} style={{ color }} />;
      case 'filePlus':
        return <FilePlus size={18} style={{ color }} />;
      case 'clock':
        return <Clock size={18} style={{ color }} />;
      case 'checkCircle':
        return <CheckCircle size={18} style={{ color }} />;
      case 'dollar':
        return <DollarSign size={18} style={{ color }} />;
      case 'arrowUpDown':
        return <ArrowUpDown size={18} style={{ color }} />;
      case 'calendar':
        return <Calendar size={18} style={{ color }} />;
      default:
        return <FileText size={18} style={{ color }} />;
    }
  };

  return (
    <div className="kpi-grid">
      {items.map((item, index) => (
        <div
          key={index}
          className="kpi-card"
          style={
            item.danger
              ? { borderLeft: '4px solid var(--danger)' }
              : item.warning
              ? { borderLeft: '4px solid var(--warning)' }
              : undefined
          }
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">{item.label}</span>
            {getIcon(item.icon, item.warning, item.danger)}
          </div>
          <div
            className="kpi-value"
            style={{
              color: item.danger
                ? 'var(--danger)'
                : item.warning
                ? 'var(--warning)'
                : 'inherit',
            }}
          >
            {item.value}
          </div>
          <div className="kpi-subtext">{item.subtext}</div>
        </div>
      ))}
    </div>
  );
};
