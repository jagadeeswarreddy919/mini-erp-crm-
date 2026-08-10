import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customersApi, productsApi, challansApi } from '../services/api';
import { Customer, Product } from '../types';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle2, Save } from 'lucide-react';

interface SelectedItem {
  productId: string;
  name: string;
  sku: string;
  availableStock: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const ChallanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [items, setItems] = useState<SelectedItem[]>([]);
  const [productToAddId, setProductToAddId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customersApi.list({ limit: 100 }),
          productsApi.list({ limit: 100 }),
        ]);
        if (custRes.success) setCustomers(custRes.data.customers);
        if (prodRes.success) setProducts(prodRes.data.products);
      } catch (err) {
        setErrorMsg('Failed to load customers or products catalog');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const found = customers.find((c) => c.id === customerId);
    setSelectedCustomer(found || null);
  };

  const handleAddProduct = () => {
    if (!productToAddId) return;
    const prod = products.find((p) => p.id === productToAddId);
    if (!prod) return;

    if (items.some((i) => i.productId === prod.id)) {
      showToast(`"${prod.name}" is already added to the challan.`, 'warning');
      return;
    }

    const newItem: SelectedItem = {
      productId: prod.id,
      name: prod.name,
      sku: prod.sku,
      availableStock: prod.currentStock,
      quantity: 1,
      unitPrice: prod.unitPrice,
      lineTotal: prod.unitPrice * 1,
    };

    setItems([...items, newItem]);
    setProductToAddId('');
    showToast(`Added "${prod.name}" to line items`, 'info');
  };

  const handleQuantityChange = (productId: string, qty: number) => {
    const validQty = Math.max(1, qty);
    setItems(
      items.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: validQty,
            lineTotal: validQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const handleUnitPriceChange = (productId: string, price: number) => {
    const validPrice = Math.max(0, price);
    setItems(
      items.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            unitPrice: validPrice,
            lineTotal: item.quantity * validPrice,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSaveChallan = async (shouldConfirm = false) => {
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer for this sales challan.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Please add at least one product item to the challan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Step 1: Create Draft Challan
      const payload = {
        customerId: selectedCustomerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };

      const res = await challansApi.create(payload);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to create sales challan');
      }

      const createdChallan = res.data;

      // Step 2: If user clicked "Confirm Challan", attempt confirmation transaction immediately
      if (shouldConfirm) {
        try {
          const confirmRes = await challansApi.confirm(createdChallan.id);
          if (confirmRes.success) {
            showToast(`Sales Challan #${createdChallan.challanNumber} CONFIRMED! Stock updated.`, 'success');
            navigate(`/challans/${createdChallan.id}`);
            return;
          }
        } catch (confirmErr: any) {
          const confirmMsg =
            confirmErr.response?.data?.message ||
            'Insufficient stock to confirm challan.';
          setErrorMsg(
            `Challan saved as DRAFT, but confirmation failed: ${confirmMsg}`
          );
          showToast('Insufficient stock to confirm challan', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      showToast(`Sales Challan #${createdChallan.challanNumber} saved as DRAFT`, 'info');
      navigate(`/challans/${createdChallan.id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save sales challan.');
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <TableSkeleton rows={4} cols={5} />;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/challans">
          <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />}>
            Back to Sales Challans
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create Sales Challan"
        subtitle="Select customer, add product items, calculate totals, and save draft or confirm"
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

      {/* Customer Selection Section */}
      <Card title="1. Customer Selection" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <FormField label="Select Customer" required style={{ marginBottom: 0 }}>
            <Select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.businessName}) — {c.customerType}
                </option>
              ))}
            </Select>
          </FormField>

          {selectedCustomer && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedCustomer.businessName}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Contact: {selectedCustomer.name} ({selectedCustomer.mobile})</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                Address: {selectedCustomer.address}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Products & Items Table Section */}
      <Card
        title="2. Challan Product Items"
        style={{ marginBottom: '20px' }}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Select
              value={productToAddId}
              onChange={(e) => setProductToAddId(e.target.value)}
              style={{ width: '280px' }}
            >
              <option value="">-- Add Product Item --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Stock: {p.currentStock}
                </option>
              ))}
            </Select>
            <Button variant="secondary" icon={<Plus size={16} />} onClick={handleAddProduct}>
              Add Item
            </Button>
          </div>
        }
      >
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Available Stock</th>
                <th style={{ width: '120px' }}>Quantity</th>
                <th style={{ width: '140px' }}>Unit Price (₹)</th>
                <th style={{ textAlign: 'right' }}>Line Total (₹)</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No product items added yet. Select a product from dropdown above.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isStockInsufficient = item.quantity > item.availableStock;
                  return (
                    <tr key={item.productId}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {item.sku}
                      </td>
                      <td>
                        <Badge variant={item.availableStock === 0 ? 'danger' : isStockInsufficient ? 'warning' : 'success'}>
                          {item.availableStock} units available
                        </Badge>
                        {isStockInsufficient && (
                          <div style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '2px', fontWeight: 600 }}>
                            ⚠️ Exceeds current stock!
                          </div>
                        )}
                      </td>
                      <td>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                          style={{ height: '30px', fontSize: '13px' }}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUnitPriceChange(item.productId, Number(e.target.value))}
                          style={{ height: '30px', fontSize: '13px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => handleRemoveItem(item.productId)}
                          style={{ color: 'var(--danger)', height: '28px', padding: '0 6px' }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary & Action Toolbar */}
      <Card
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>TOTAL ITEMS</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{items.length} products</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>TOTAL QUANTITY</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{totalQuantity} units</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ESTIMATED TOTAL AMOUNT</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            onClick={() => navigate('/challans')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            icon={<Save size={16} />}
            onClick={() => handleSaveChallan(false)}
            isLoading={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            icon={<CheckCircle2 size={16} />}
            onClick={() => handleSaveChallan(true)}
            isLoading={isSubmitting}
          >
            Save & Confirm Challan
          </Button>
        </div>
      </Card>
    </div>
  );
};
