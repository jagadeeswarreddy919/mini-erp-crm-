import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Plus,
  FileText,
  Warehouse,
  Package,
  Users,
  UserCog,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

export interface QuickActionConfig {
  label: string;
  path: string;
  variant: 'primary' | 'secondary';
  icon: string;
}

interface DashboardQuickActionsProps {
  actions: QuickActionConfig[];
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ actions }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'plus':
        return <Plus size={16} />;
      case 'fileText':
        return <FileText size={16} />;
      case 'filePlus':
        return <FileText size={16} />;
      case 'warehouse':
        return <Warehouse size={16} />;
      case 'package':
        return <Package size={16} />;
      case 'users':
        return <Users size={16} />;
      case 'userCog':
        return <UserCog size={16} />;
      case 'arrowDownRight':
        return <ArrowDownRight size={16} />;
      case 'checkCircle':
        return <CheckCircle size={16} />;
      case 'clock':
        return <Clock size={16} />;
      default:
        return <Zap size={16} />;
    }
  };

  return (
    <Card
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--primary)' }} />
          Quick Operations Shortcuts
        </span>
      }
    >
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {actions.map((act, idx) => (
          <Link key={idx} to={act.path} style={{ textDecoration: 'none' }}>
            <Button variant={act.variant} icon={getIcon(act.icon)}>
              {act.label}
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};
