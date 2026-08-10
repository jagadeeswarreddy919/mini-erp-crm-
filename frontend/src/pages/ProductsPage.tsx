import React, { useEffect, useState } from 'react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/ui/SearchInput';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus, Edit2, Trash2, Tag, MapPin } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canEdit = hasRole(['ADMIN', 'WAREHOUSE']);
  const canDelete = hasRole(['ADMIN']);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 10,
    warehouseLocation: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await productsApi.list({
        search,
        category: categoryFilter,
        stockStatus: stockStatusFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productsApi.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryFilter, stockStatusFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      unitPrice: 0,
      currentStock: 0,
      minStockAlert: 10,
      warehouseLocation: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      warehouseLocation: p.warehouseLocation,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.category || !formData.warehouseLocation) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData);
        showToast(`Product "${formData.name}" updated`, 'success');
      } else {
        await productsApi.create(formData);
        showToast(`New product "${formData.name}" added to catalog`, 'success');
      }
      setIsModalOpen(false);
      fetchProducts(pagination.page);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await productsApi.delete(deleteId);
      showToast('Product deleted from catalog', 'info');
      setDeleteId(null);
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockBadge = (p: Product) => {
    if (p.currentStock === 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    } else if (p.currentStock <= p.minStockAlert) {
      return <Badge variant="warning">Low Stock ({p.currentStock})</Badge>;
    }
    return <Badge variant="success">In Stock ({p.currentStock})</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Products Catalog"
        subtitle="Manage product SKUs, pricing, categories, and warehouse bin locations"
        actions={
          canEdit ? (
            <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
              Add Product
            </Button>
          ) : undefined
        }
      />

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="filter-group">
          <SearchInput
            placeholder="Search product name, SKU, warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Stock Levels</option>
            <option value="LOW">Low Stock</option>
            <option value="OUT">Out of Stock</option>
          </Select>
        </div>
      </div>

      {/* Product Catalog Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your category/stock filter or add a new product item."
          actionText={canEdit ? 'Add First Product' : undefined}
          onAction={canEdit ? openAddModal : undefined}
        />
      ) : (
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU Code</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock Level</th>
                <th>Warehouse Bay</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontWeight: 600 }}>
                    {p.sku}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
                      <Tag size={13} style={{ color: 'var(--text-muted)' }} /> {p.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>{getStockBadge(p)}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)' }} /> {p.warehouseLocation}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {canEdit && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={14} />}
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                        />
                      )}
                      {canDelete && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => setDeleteId(p.id)}
                          style={{ color: 'var(--danger)' }}
                          title="Delete Product"
                        />
                      )}
                    </div>
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
            onPageChange={fetchProducts}
          />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product Item'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingProduct ? 'Update Product' : 'Create Product'}
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

        <form onSubmit={handleSubmit}>
          <FormField label="Product Name" required>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. M8x50 Heavy-Duty Steel Fastener"
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="SKU Code" required>
              <Input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="FST-M8-050"
                required
              />
            </FormField>

            <FormField label="Category" required>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Fasteners / Bearings"
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Unit Price (₹)" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                required
              />
            </FormField>

            <FormField label="Current Stock" required>
              <Input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Min Stock Alert Quantity" required>
              <Input
                type="number"
                min="0"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                required
              />
            </FormField>

            <FormField label="Warehouse Rack / Bay" required>
              <Input
                type="text"
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                placeholder="Bay A-12 / Rack B-04"
                required
              />
            </FormField>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product Item"
        message="Are you sure you want to delete this product? Deleting a product will remove it from future catalog listings."
        confirmText="Delete Product"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
