import React, { useEffect, useState } from 'react';
import { teamMembersApi } from '../services/api';
import { User, UserRole, UserStatus } from '../types';
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
import { Plus, Edit2, UserX, UserCheck, ShieldAlert, Mail } from 'lucide-react';

export const TeamMembersPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [toggleStatusMember, setToggleStatusMember] = useState<{ id: string; name: string; currentStatus: UserStatus } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SALES' as UserRole,
    password: '',
    confirmPassword: '',
    status: 'ACTIVE' as UserStatus,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await teamMembersApi.list({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setMembers(res.data.members);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1);
  }, [search, roleFilter, statusFilter]);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: 'SALES',
      password: '',
      confirmPassword: '',
      status: 'ACTIVE',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (m: User) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      email: m.email,
      role: m.role,
      password: '',
      confirmPassword: '',
      status: m.status || 'ACTIVE',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!editingMember) {
      if (!formData.password) {
        setFormError('Password is required when creating a new team member.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingMember) {
        await teamMembersApi.update(editingMember.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
        });
        showToast(`Team member details for "${formData.name}" updated`, 'success');
      } else {
        await teamMembersApi.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          status: formData.status,
        });
        showToast(`New team member "${formData.name}" created successfully`, 'success');
      }
      setIsModalOpen(false);
      fetchMembers(pagination.page);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save team member details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!toggleStatusMember) return;
    const targetStatus = toggleStatusMember.currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setIsSubmitting(true);

    try {
      await teamMembersApi.toggleStatus(toggleStatusMember.id, targetStatus);
      showToast(
        `Team member "${toggleStatusMember.name}" has been ${targetStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`,
        targetStatus === 'ACTIVE' ? 'success' : 'info'
      );
      setToggleStatusMember(null);
      fetchMembers(pagination.page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update user status.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SALES':
        return 'primary';
      case 'WAREHOUSE':
        return 'warning';
      case 'ACCOUNTS':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div>
      <PageHeader
        title="Team Members"
        subtitle="Manage company users and their access roles."
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
            Add Member
          </Button>
        }
      />

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="filter-group">
          <SearchInput
            placeholder="Search members by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SALES">Sales</option>
            <option value="WAREHOUSE">Warehouse</option>
            <option value="ACCOUNTS">Accounts</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      {/* Team Members Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : members.length === 0 ? (
        <EmptyState
          title="No team members found"
          description="Add your first company member to get started."
          actionText="Add Member"
          onAction={openAddModal}
        />
      ) : (
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar-circle">{getInitials(m.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                        {user?.id === m.id && (
                          <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                            (You)
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {m.email}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getRoleBadgeVariant(m.role)}>{m.role}</Badge>
                  </td>
                  <td>
                    <Badge variant={m.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {m.status || 'ACTIVE'}
                    </Badge>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit2 size={14} />}
                        onClick={() => openEditModal(m)}
                        title="Edit Member Details"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={m.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                        onClick={() =>
                          setToggleStatusMember({
                            id: m.id,
                            name: m.name,
                            currentStatus: m.status || 'ACTIVE',
                          })
                        }
                        style={m.status === 'ACTIVE' ? { color: 'var(--danger)' } : { color: 'var(--success)' }}
                        title={m.status === 'ACTIVE' ? 'Deactivate Member' : 'Activate Member'}
                      />
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
            onPageChange={fetchMembers}
          />
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingMember ? 'Update Member' : 'Create Member'}
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldAlert size={15} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField label="Full Name" required>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Samuel Ray"
              required
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="samuel@apexerp.com"
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Access Role" required>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                required
              >
                <option value="SALES">Sales Officer</option>
                <option value="WAREHOUSE">Warehouse Manager</option>
                <option value="ACCOUNTS">Accounts Officer</option>
                <option value="ADMIN">Administrator</option>
              </Select>
            </FormField>

            <FormField label="Account Status" required>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </FormField>
          </div>

          {!editingMember && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Password" required>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </FormField>

              <FormField label="Confirm Password" required>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </FormField>
            </div>
          )}
        </form>
      </Modal>

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!toggleStatusMember}
        onClose={() => setToggleStatusMember(null)}
        onConfirm={handleToggleStatusConfirm}
        title={toggleStatusMember?.currentStatus === 'ACTIVE' ? 'Deactivate Team Member?' : 'Activate Team Member?'}
        message={
          toggleStatusMember?.currentStatus === 'ACTIVE'
            ? `Are you sure you want to deactivate ${toggleStatusMember?.name}? This member will no longer be able to log in, but historical records remain intact.`
            : `Activate ${toggleStatusMember?.name}? This member will be able to log in again.`
        }
        confirmText={toggleStatusMember?.currentStatus === 'ACTIVE' ? 'Deactivate Member' : 'Activate Member'}
        isDanger={toggleStatusMember?.currentStatus === 'ACTIVE'}
        isLoading={isSubmitting}
      />
    </div>
  );
};
