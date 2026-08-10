import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, Phone, Calendar, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export interface SecondarySectionConfig {
  title: string;
  type: 'products' | 'followUps' | 'challans' | 'movements';
  data: any[];
}

interface DashboardSecondaryGridProps {
  left: SecondarySectionConfig;
  right: SecondarySectionConfig;
}

export const DashboardSecondaryGrid: React.FC<DashboardSecondaryGridProps> = ({
  left,
  right,
}) => {
  const renderTableContent = (sec: SecondarySectionConfig) => {
    if (sec.type === 'products') {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Alert</th>
            </tr>
          </thead>
          <tbody>
            {sec.data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  All product stock levels are healthy.
                </td>
              </tr>
            ) : (
              sec.data.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.sku}</td>
                  <td>
                    <Badge variant={p.currentStock === 0 ? 'danger' : 'warning'}>
                      {p.currentStock} units
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.minStockAlert} units</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (sec.type === 'followUps') {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sec.data.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No upcoming follow-ups scheduled.
                </td>
              </tr>
            ) : (
              sec.data.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/customers/${c.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {c.name}
                    </Link>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{c.businessName}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {c.mobile}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--primary)', fontSize: '12.5px' }}>
                    {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (sec.type === 'challans') {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Challan No</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sec.data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No sales challans recorded.
                </td>
              </tr>
            ) : (
              sec.data.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <Link to={`/challans/${ch.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {ch.challanNumber}
                    </Link>
                  </td>
                  <td>{ch.customer?.businessName || ch.customer?.name}</td>
                  <td>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <Badge variant={ch.status === 'CONFIRMED' ? 'success' : ch.status === 'DRAFT' ? 'warning' : 'danger'}>
                      {ch.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (sec.type === 'movements') {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {sec.data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No stock receipts recorded.
                </td>
              </tr>
            ) : (
              sec.data.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ fontWeight: 500 }}>{m.product?.name}</td>
                  <td>
                    <Badge variant={m.type === 'IN' ? 'success' : 'warning'}>
                      {m.type === 'IN' ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />} {m.type}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 700 }}>+{m.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
      }}
    >
      <Card
        title={left.title}
        actions={
          <Link to={left.type === 'products' ? '/products' : left.type === 'followUps' ? '/customers' : '/challans'}>
            <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />}>
              View
            </Button>
          </Link>
        }
      >
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          {renderTableContent(left)}
        </div>
      </Card>

      <Card
        title={right.title}
        actions={
          <Link to={right.type === 'products' ? '/products' : right.type === 'followUps' ? '/customers' : right.type === 'movements' ? '/inventory' : '/challans'}>
            <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />}>
              View
            </Button>
          </Link>
        }
      >
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          {renderTableContent(right)}
        </div>
      </Card>
    </div>
  );
};
