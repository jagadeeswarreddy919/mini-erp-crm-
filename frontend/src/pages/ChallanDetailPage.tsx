import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { challansApi } from '../services/api';
import { Challan, ChallanItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { ArrowLeft, CheckCircle2, XCircle, ShieldAlert, Building, Phone, Calendar, UserCheck, Printer } from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canConfirm = hasRole(['ADMIN', 'SALES', 'ACCOUNTS']);
  const canCancel = hasRole(['ADMIN', 'SALES', 'ACCOUNTS']);

  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Dialogs
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChallan = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await challansApi.getById(id);
      if (res.success) {
        setChallan(res.data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load sales challan details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirmChallan = async () => {
    if (!id) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await challansApi.confirm(id);
      if (res.success) {
        showToast(`Sales Challan #${res.data.challanNumber} CONFIRMED! Product stock updated.`, 'success');
        setShowConfirmModal(false);
        fetchChallan();
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      const msg = err.response?.data?.message || 'Cannot confirm challan due to insufficient product inventory.';
      setErrorMsg(msg);
      showToast('Insufficient stock to confirm challan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!id) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await challansApi.cancel(id);
      if (res.success) {
        showToast(`Sales Challan #${res.data.challanNumber} has been CANCELLED.`, 'info');
        setShowCancelModal(false);
        fetchChallan();
      }
    } catch (err: any) {
      setShowCancelModal(false);
      const msg = err.response?.data?.message || 'Failed to cancel sales challan.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <TableSkeleton rows={4} cols={5} />;
  if (errorMsg && !challan) return <ErrorState message={errorMsg} onRetry={fetchChallan} />;
  if (!challan) return <Card>Sales challan record not found.</Card>;

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/challans">
          <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />}>
            Back to Sales Challans
          </Button>
        </Link>
        <Button variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
          Print Challan
        </Button>
      </div>

      <PageHeader
        title={`Sales Challan — ${challan.challanNumber}`}
        subtitle={`Created by ${challan.createdBy?.name} (${challan.createdBy?.role}) on ${new Date(challan.createdAt).toLocaleString('en-IN')}`}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            {challan.status === 'DRAFT' && canConfirm && (
              <Button
                variant="primary"
                icon={<CheckCircle2 size={16} />}
                onClick={() => setShowConfirmModal(true)}
                isLoading={isSubmitting}
              >
                Confirm Challan
              </Button>
            )}

            {challan.status !== 'CANCELLED' && canCancel && (
              <Button
                variant="danger"
                icon={<XCircle size={16} />}
                onClick={() => setShowCancelModal(true)}
                isLoading={isSubmitting}
              >
                Cancel Challan
              </Button>
            )}
          </div>
        }
      />

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            border: '1px solid var(--danger-border)',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
          }}
        >
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Status Header Badge Card */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px' }}>Challan Order Status:</span>
          <Badge
            variant={
              challan.status === 'CONFIRMED'
                ? 'success'
                : challan.status === 'DRAFT'
                ? 'warning'
                : 'danger'
            }
          >
            {challan.status}
          </Badge>
          {challan.confirmedAt && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Confirmed at: {new Date(challan.confirmedAt).toLocaleString('en-IN')}
            </span>
          )}
          {challan.cancelledAt && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cancelled at: {new Date(challan.cancelledAt).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </Card>

      {/* Customer Info Box */}
      <Card title="Customer & Consignee Details" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '13.5px' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{challan.customer?.name}</div>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} /> {challan.customer?.businessName}
            </div>
            {challan.customer?.gstNumber && (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                GSTIN: {challan.customer.gstNumber}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {challan.customer?.mobile}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              Type: <Badge variant="neutral">{challan.customer?.customerType}</Badge>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>Delivery Address:</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
              {challan.customer?.address}
            </div>
          </div>
        </div>
      </Card>

      {/* Line Items Table (with Snapshot Data) */}
      <Card title="Historical Snapshot Line Items" style={{ marginBottom: '20px' }}>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Snapshot</th>
                <th>SKU Snapshot</th>
                <th>Live Stock</th>
                <th style={{ textAlign: 'right' }}>Unit Price (₹)</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item: ChallanItem, idx: number) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{item.productNameSnapshot}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {item.skuSnapshot}
                  </td>
                  <td>
                    {item.product ? (
                      <Badge variant={item.product.currentStock < item.quantity ? 'warning' : 'success'}>
                        {item.product.currentStock} in stock
                      </Badge>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {item.quantity} units
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Totals Summary */}
      <Card style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Quantity:</span>
            <span style={{ fontWeight: 700 }}>{challan.totalQuantity} units</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Grand Total Amount:</span>
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>
              ₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>

      {/* Confirm Challan Dialog */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmChallan}
        title="Confirm Sales Challan"
        message={`Confirming Sales Challan #${challan.challanNumber} will deduct inventory from product stock and log outgoing stock movements. Are you sure you want to proceed?`}
        confirmText="Confirm & Deduct Stock"
        isLoading={isSubmitting}
      />

      {/* Cancel Challan Dialog */}
      <ConfirmDialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelChallan}
        title="Cancel Sales Challan"
        message={`Cancelling this challan will change its status to CANCELLED. If it was already confirmed, product stock will be automatically restored. Proceed?`}
        confirmText="Cancel Challan"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
