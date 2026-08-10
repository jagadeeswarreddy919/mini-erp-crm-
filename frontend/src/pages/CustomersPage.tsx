import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customersApi } from '../services/api';
import { Customer, CustomerStatus, CustomerType } from '../types';
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
import { Plus, Edit2, Trash2, Eye, Phone, Mail } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canEdit = hasRole(['ADMIN', 'SALES']);
  const canDelete = hasRole(['ADMIN']);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'ACTIVE' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await customersApi.list({
        search,
        status: statusFilter,
        customerType: typeFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setCustomers(res.data.customers);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter, typeFilter]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      address: '',
      status: 'ACTIVE',
      followUpDate: '',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      mobile: c.mobile,
      email: c.email || '',
      businessName: c.businessName,
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address,
      status: c.status,
      followUpDate: c.followUpDate ? new Date(c.followUpDate).toISOString().split('T')[0] : '',
      notes: c.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.businessName || !formData.address) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, formData);
        showToast(`Customer account for "${formData.name}" updated`, 'success');
      } else {
        await customersApi.create(formData);
        showToast(`New customer "${formData.name}" added to CRM`, 'success');
      }
      setIsModalOpen(false);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save customer details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await customersApi.delete(deleteId);
      showToast('Customer record deleted', 'info');
      setDeleteId(null);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete customer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customer CRM Directory"
        subtitle="Manage wholesale, distributor, and retail customer accounts"
        actions={
          canEdit ? (
            <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
              Add Customer
            </Button>
          ) : undefined
        }
      />

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="filter-group">
          <SearchInput
            placeholder="Search customer, mobile, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="INACTIVE">Inactive</option>
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Customer Types</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="RETAIL">Retail</option>
          </Select>
        </div>
      </div>

      {/* Customer Data Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your search criteria or add a new customer record."
          actionText={canEdit ? 'Add First Customer' : undefined}
          onAction={canEdit ? openAddModal : undefined}
        />
      ) : (
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Business Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      to={`/customers/${c.id}`}
                      style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      {c.name}
                    </Link>
                    {c.gstNumber && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GST: {c.gstNumber}</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.businessName}</td>
                  <td>
                    <div style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} style={{ color: 'var(--text-muted)' }} /> {c.mobile}
                    </div>
                    {c.email && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {c.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge variant="neutral">{c.customerType}</Badge>
                  </td>
                  <td>
                    <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'LEAD' ? 'warning' : 'danger'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td style={{ fontSize: '12.5px' }}>
                    {c.followUpDate ? (
                      <span style={{ fontWeight: 500, color: 'var(--primary)' }}>
                        {new Date(c.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link to={`/customers/${c.id}`}>
                        <Button variant="secondary" size="sm" icon={<Eye size={14} />} title="View Details" />
                      </Link>
                      {canEdit && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={14} />}
                          onClick={() => openEditModal(c)}
                          title="Edit Customer"
                        />
                      )}
                      {canDelete && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => setDeleteId(c.id)}
                          style={{ color: 'var(--danger)' }}
                          title="Delete Customer"
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
            onPageChange={fetchCustomers}
          />
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Customer Name" required>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                required
              />
            </FormField>

            <FormField label="Business Name" required>
              <Input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Acme Corp"
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Mobile Number" required>
              <Input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 9876543210"
                required
              />
            </FormField>

            <FormField label="Email Address">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="GST Number">
              <Input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AAAAA0000A1Z5"
              />
            </FormField>

            <FormField label="Customer Type">
              <Select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              >
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="RETAIL">Retail</option>
              </Select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Account Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              >
                <option value="ACTIVE">Active</option>
                <option value="LEAD">Lead</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </FormField>

            <FormField label="Next Follow-up Date">
              <Input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Address" required>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, city, state, pincode"
              required
            />
          </FormField>

          <FormField label="Initial Notes">
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Initial lead or business notes..."
            />
          </FormField>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer Account"
        message="Are you sure you want to delete this customer? This action cannot be undone and will delete associated follow-up notes."
        confirmText="Delete Account"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
