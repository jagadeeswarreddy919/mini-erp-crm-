import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customersApi } from '../services/api';
import { Customer, CustomerFollowUp } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { ArrowLeft, Phone, Mail, Building, FileText, Calendar, Plus, MessageSquare, Clock } from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canAddNote = hasRole(['ADMIN', 'SALES']);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Note Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomer = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await customersApi.getById(id);
      if (res.success) {
        setCustomer(res.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;

    setIsSubmitting(true);
    try {
      await customersApi.addFollowUp(id, noteText, nextDate);
      showToast('CRM follow-up note added successfully', 'success');
      setNoteText('');
      setNextDate('');
      setIsModalOpen(false);
      fetchCustomer();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add follow-up note', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <TableSkeleton rows={4} cols={4} />;
  if (errorMsg) return <ErrorState message={errorMsg} onRetry={fetchCustomer} />;
  if (!customer) return <Card>Customer record not found.</Card>;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/customers">
          <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />}>
            Back to Customers
          </Button>
        </Link>
      </div>

      <PageHeader
        title={customer.name}
        subtitle={`${customer.businessName} ${customer.gstNumber ? `• GSTIN: ${customer.gstNumber}` : ''}`}
        actions={
          canAddNote ? (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
              Add Follow-up Note
            </Button>
          ) : undefined
        }
      />

      {/* Header Info Badges Card */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px' }}>Account Status:</span>
          <Badge variant={customer.status === 'ACTIVE' ? 'success' : customer.status === 'LEAD' ? 'warning' : 'danger'}>
            {customer.status}
          </Badge>
          <Badge variant="neutral">{customer.customerType}</Badge>
        </div>
      </Card>

      {/* Grid for Info and Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: Customer Specs & Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Contact & Address Info">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 600 }}>Mobile:</span> {customer.mobile}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 600 }}>Email:</span> {customer.email || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>Next Scheduled Follow-up:</span>{' '}
                {customer.followUpDate ? (
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Not Scheduled</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                <FileText size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 600 }}>Address:</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{customer.address}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Sales Challans History */}
          <Card title="Recent Sales Challans">
            {customer.challans && customer.challans.length > 0 ? (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Challan No</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.challans.map((ch: any) => (
                      <tr key={ch.id}>
                        <td>
                          <Link to={`/challans/${ch.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                            {ch.challanNumber}
                          </Link>
                        </td>
                        <td>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <Badge variant={ch.status === 'CONFIRMED' ? 'success' : ch.status === 'DRAFT' ? 'warning' : 'danger'}>
                            {ch.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No sales challans recorded for this customer yet.</p>
            )}
          </Card>
        </div>

        {/* Right Column: CRM Follow-up Timeline */}
        <Card
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              CRM Follow-Up Notes Timeline
            </span>
          }
        >
          {customer.followUps && customer.followUps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {customer.followUps.map((f: CustomerFollowUp) => (
                <div
                  key={f.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    borderLeft: '3px solid var(--primary)',
                  }}
                >
                  <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {f.note}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      fontSize: '11.5px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>By {f.createdBy.name} ({f.createdBy.role})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(f.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No follow-up notes recorded yet.</p>
          )}
        </Card>
      </div>

      {/* Add Follow-Up Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Customer Follow-up Note"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddNote} isLoading={isSubmitting}>
              Save Note
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddNote}>
          <FormField label="Follow-up Note" required>
            <textarea
              className="form-textarea"
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record details of conversation, email interaction, or pricing quote..."
              required
            />
          </FormField>

          <FormField label="Update Next Follow-up Date (Optional)">
            <Input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
