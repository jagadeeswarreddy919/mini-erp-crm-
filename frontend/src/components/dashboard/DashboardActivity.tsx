import React from 'react';
import { Card } from '../ui/Card';
import { Activity, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

interface DashboardActivityProps {
  title: string;
  items: ActivityItem[];
}

export const DashboardActivity: React.FC<DashboardActivityProps> = ({ title, items }) => {
  return (
    <Card
      style={{ marginBottom: '20px' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          {title}
        </span>
      }
    >
      {items.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>No Recent Activity</p>
          <p style={{ fontSize: '13px' }}>There are no recent audit logs or system events to display.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                borderLeft: '3px solid var(--primary)',
                fontSize: '13.5px',
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.text}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Clock size={13} />
                {new Date(item.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
