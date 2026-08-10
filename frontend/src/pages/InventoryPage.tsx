import React, { useEffect, useState } from 'react';
import { inventoryApi, productsApi } from '../services/api';
import { StockMovement, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/ui/SearchInput';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { ArrowDownRight, ArrowUpRight, PlusCircle, PackageCheck, AlertTriangle, Layers } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canAdjust = hasRole(['ADMIN', 'WAREHOUSE']);

  const [summary, setSummary] = useState<{
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalCategories: number;
  } | null>(null);

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [adjustData, setAdjustData] = useState({
    productId: '',
    quantity: 1,
    type: 'IN' as 'IN' | 'OUT',
    reason: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await inventoryApi.getSummary();
      if (res.success) setSummary(res.data);
    } catch (err) {}
  };

  const fetchMovements = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await inventoryApi.listMovements({
        search,
        type: typeFilter,
        startDate,
        endDate,
        page,
        limit: 10,
      });
      if (res.success) {
        setMovements(res.data.movements);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch stock movements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsForDropdown = async () => {
    try {
      const res = await productsApi.list({ limit: 100 });
      if (res.success) setProductList(res.data.products);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchMovements(1);
  }, [search, typeFilter, startDate, endDate]);

  const openAdjustModal = () => {
    fetchProductsForDropdown();
    setAdjustData({
      productId: '',
      quantity: 1,
      type: 'IN',
      reason: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustData.productId || !adjustData.reason || adjustData.quantity < 1) {
      setFormError('Please select a product and enter a valid quantity & reason.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await inventoryApi.adjustStock(adjustData);
      showToast(`Stock ${adjustData.type} adjustment logged successfully`, 'success');
      setIsModalOpen(false);
      fetchSummary();
      fetchMovements(1);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record stock movement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Stock & Inventory Log"
        subtitle="Track incoming restocks, outgoing stock deductions, and audit movements"
        actions={
          canAdjust ? (
            <Button variant="primary" icon={<PlusCircle size={16} />} onClick={openAdjustModal}>
              Record Stock Adjustment
            </Button>
          ) : undefined
        }
      />

      {/* Inventory KPI Summary */}
      {summary && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Active SKUs</span>
              <PackageCheck size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="kpi-value">{summary.totalProducts}</div>
            <div className="kpi-subtext">Products tracked in warehouse</div>
          </div>

          <div className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Categories</span>
              <Layers size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="kpi-value">{summary.totalCategories}</div>
            <div className="kpi-subtext">Product classification groups</div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Low Stock Items</span>
              <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            </div>
            <div className="kpi-value" style={{ color: summary.lowStockCount > 0 ? 'var(--warning)' : 'inherit' }}>
              {summary.lowStockCount}
            </div>
            <div className="kpi-subtext">Near minimum threshold</div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Out of Stock</span>
              <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            </div>
            <div className="kpi-value" style={{ color: summary.outOfStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
              {summary.outOfStockCount}
            </div>
            <div className="kpi-subtext">0 units remaining</div>
          </div>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="filter-group">
          <SearchInput
            placeholder="Search product, SKU, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Movement Types</option>
            <option value="IN">Stock IN (Restock)</option>
            <option value="OUT">Stock OUT (Issue)</option>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
            style={{ width: '140px' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
            style={{ width: '140px' }}
          />
        </div>
      </div>

      {/* Stock Movement Log Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : movements.length === 0 ? (
        <EmptyState
          title="No stock movements recorded"
          description="Try clearing date filters or adjust inventory stock manually."
          actionText={canAdjust ? 'Record First Adjustment' : undefined}
          onAction={canAdjust ? openAdjustModal : undefined}
        />
      ) : (
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product Item</th>
                <th>SKU</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Reason / Reference</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {new Date(m.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.product?.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {m.product?.sku}
                  </td>
                  <td>
                    <Badge variant={m.type === 'IN' ? 'success' : 'warning'}>
                      {m.type === 'IN' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <ArrowDownRight size={13} /> Stock IN
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <ArrowUpRight size={13} /> Stock OUT
                        </span>
                      )}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '14px' }}>
                    {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                  </td>
                  <td style={{ color: 'var(--text-primary)' }}>{m.reason}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {m.createdBy?.name} ({m.createdBy?.role})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalRecords={pagination.total}
            limit={pagination.limit}
            onPageChange={fetchMovements}
          />
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Stock Movement / Adjustment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdjustSubmit} isLoading={isSubmitting}>
              Submit Movement
            </Button>
          </>
        }
      >
        {formError && (
          <div
            style={{
              padding: '8px 12px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: '4px',
              fontSize: '12.5px',
              marginBottom: '14px',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleAdjustSubmit}>
          <FormField label="Select Product" required>
            <Select
              value={adjustData.productId}
              onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
              required
            >
              <option value="">-- Choose Product Item --</option>
              {productList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available Stock: {p.currentStock}
                </option>
              ))}
            </Select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Movement Direction" required>
              <Select
                value={adjustData.type}
                onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value as 'IN' | 'OUT' })}
              >
                <option value="IN">IN — Stock Restock / Receipt</option>
                <option value="OUT">OUT — Manual Issue / Adjustment</option>
              </Select>
            </FormField>

            <FormField label="Quantity Units" required>
              <Input
                type="number"
                min="1"
                value={adjustData.quantity}
                onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>

          <FormField label="Reason / Remarks" required>
            <textarea
              className="form-textarea"
              rows={3}
              value={adjustData.reason}
              onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
              placeholder="e.g. Manufacturer shipment PO-9912 received, or Damage write-off..."
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
