import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export interface PrimarySectionConfig {
  title: string;
  type: 'challans' | 'movements' | 'products';
  data: any[];
}

export const DashboardPrimarySection: React.FC<PrimarySectionConfig> = ({
  title,
  type,
  data,
}) => {
  return (
    <Card
      title={title}
      style={{ marginBottom: '20px' }}
      actions={
        <Link to={type === 'challans' ? '/challans' : type === 'movements' ? '/inventory' : '/products'}>
          <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />}>
            View All
          </Button>
        </Link>
      }
    >
      <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
        <table className="erp-table">
          {type === 'challans' && (
            <>
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No recent sales challans recorded.
                    </td>
                  </tr>
                ) : (
                  data.map((ch) => (
                    <tr key={ch.id}>
                      <td>
                        <Link to={`/challans/${ch.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                          {ch.challanNumber}
                        </Link>
                      </td>
                      <td>{ch.customer?.businessName || ch.customer?.name}</td>
                      <td>₹{ch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <Badge
                          variant={
                            ch.status === 'CONFIRMED'
                              ? 'success'
                              : ch.status === 'DRAFT'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {ch.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}

          {type === 'movements' && (
            <>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product Item</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No recent stock movements recorded.
                    </td>
                  </tr>
                ) : (
                  data.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.product?.name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{m.product?.sku}</td>
                      <td>
                        <Badge variant={m.type === 'IN' ? 'success' : 'warning'}>
                          {m.type === 'IN' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />} Stock {m.type}
                        </Badge>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} units
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}

          {type === 'products' && (
            <>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No product records available.
                    </td>
                  </tr>
                ) : (
                  data.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                      <td>₹{p.unitPrice.toLocaleString('en-IN')}</td>
                      <td>
                        <Badge variant={p.currentStock === 0 ? 'danger' : p.currentStock <= p.minStockAlert ? 'warning' : 'success'}>
                          {p.currentStock} units
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}
        </table>
      </div>
    </Card>
  );
};
