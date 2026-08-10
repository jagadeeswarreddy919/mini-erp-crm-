import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challansApi } from '../services/api';
import { Challan } from '../types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/ui/SearchInput';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const { hasRole } = useAuth();
  const canCreate = hasRole(['ADMIN', 'SALES']);

  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallans = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await challansApi.list({
        search,
        status: statusFilter,
        startDate,
        endDate,
        page,
        limit: 10,
      });
      if (res.success) {
        setChallans(res.data.challans);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch sales challans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans(1);
  }, [search, statusFilter, startDate, endDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Badge variant="success">
            <CheckCircle2 size={13} /> Confirmed
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="warning">
            <FileText size={13} /> Draft
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="danger">
            <XCircle size={13} /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        subtitle="Generate, track, and confirm outgoing wholesale delivery orders"
        actions={
          canCreate ? (
            <Link to="/challans/new">
              <Button variant="primary" icon={<Plus size={16} />}>
                Create Sales Challan
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="filter-group">
          <SearchInput
            placeholder="Search challan #, customer, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '140px' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '140px' }}
          />
        </div>
      </div>

      {/* Challans Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={8} />
      ) : challans.length === 0 ? (
        <EmptyState
          title="No sales challans found"
          description="Try adjusting search or create a new sales challan order."
          actionText={canCreate ? 'Create First Challan' : undefined}
          onAction={canCreate ? () => window.location.assign('/challans/new') : undefined}
        />
      ) : (
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer / Business</th>
                <th>Total Units</th>
                <th>Total Value (₹)</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <Link
                      to={`/challans/${ch.id}`}
                      style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      {ch.challanNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ch.customer?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {ch.customer?.businessName}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{ch.totalQuantity} units</td>
                  <td style={{ fontWeight: 700 }}>
                    ₹{ch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>{getStatusBadge(ch.status)}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {ch.createdBy?.name}
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {new Date(ch.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/challans/${ch.id}`}>
                      <Button variant="secondary" size="sm" icon={<Eye size={14} />}>
                        View
                      </Button>
                    </Link>
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
            onPageChange={fetchChallans}
          />
        </div>
      )}
    </div>
  );
};
