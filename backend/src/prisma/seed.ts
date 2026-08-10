import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Clear existing records
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // Create Demo Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);
  const warehousePassword = await bcrypt.hash('warehouse123', 10);
  const accountsPassword = await bcrypt.hash('accounts123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Eleanor Vance (Admin)',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Samuel Ray (Sales Lead)',
      email: 'sales@example.com',
      passwordHash: salesPassword,
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Marcus Vance (Warehouse Manager)',
      email: 'warehouse@example.com',
      passwordHash: warehousePassword,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Clara Oswald (Accounts Officer)',
      email: 'accounts@example.com',
      passwordHash: accountsPassword,
      role: 'ACCOUNTS',
    },
  });

  console.log('👤 Created Demo Users for Admin, Sales, Warehouse, and Accounts roles.');

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Apex Industrial Distributors',
      businessName: 'Apex Logistics & Supply Ltd',
      mobile: '+91 9876543210',
      email: 'contact@apexlogistics.com',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: 'DISTRIBUTOR',
      address: 'Plot 42, Industrial Zone 3, Navi Mumbai, MH - 400705',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
      notes: 'Key distributor for Western region. Prefers bulk delivery on Mondays.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Metro Retail Mart',
      businessName: 'Metro Hypermarkets Pvt Ltd',
      mobile: '+91 9123456789',
      email: 'procurement@metromart.in',
      gstNumber: '27BBBBA1111B2Z4',
      customerType: 'RETAIL',
      address: 'Unit 102, Retail Plaza, Andheri East, Mumbai, MH - 400069',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Requires itemized invoices with batch numbers.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Sunrise Hardware Traders',
      businessName: 'Sunrise Hardware Solutions',
      mobile: '+91 9988776655',
      email: 'sales@sunrisetraders.co.in',
      gstNumber: '27CCCCA2222C3Z3',
      customerType: 'WHOLESALE',
      address: '88 Market Yard Road, Pune, MH - 411037',
      status: 'LEAD',
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'Inquired about fastener bulk pricing. Sent product catalog.',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Vanguard Tech Components',
      businessName: 'Vanguard Engineering Works',
      mobile: '+91 9765432109',
      email: 'info@vanguardtech.com',
      gstNumber: '27DDDDD3333D4Z2',
      customerType: 'WHOLESALE',
      address: 'GIDC Estate, Phase II, Vadodara, GJ - 390010',
      status: 'INACTIVE',
      notes: 'Account on hold pending payment reconciliation.',
    },
  });

  console.log('🏬 Created Sample Customers.');

  // Customer Follow-ups
  await prisma.customerFollowUp.createMany({
    data: [
      {
        customerId: customer1.id,
        note: 'Discussed Q3 bulk order volume discounts. Customer agreed to place order next week.',
        createdById: salesUser.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer3.id,
        note: 'Initial phone inquiry regarding synthetic lubricants and bearings catalog.',
        createdById: salesUser.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Create Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Heavy-Duty Steel Fastener M8x50',
      sku: 'FST-M8-050',
      category: 'Fasteners',
      unitPrice: 15.5,
      currentStock: 250,
      minStockAlert: 50,
      warehouseLocation: 'Bay A-12',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Industrial Grade Synthetic Lubricant 5L',
      sku: 'LUB-SYN-005',
      category: 'Lubricants',
      unitPrice: 450.0,
      currentStock: 8,
      minStockAlert: 15, // LOW STOCK!
      warehouseLocation: 'Rack B-04',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'High-Tension Polypropylene Strapping Tape 500m',
      sku: 'TPE-STR-500',
      category: 'Packaging',
      unitPrice: 120.0,
      currentStock: 0,
      minStockAlert: 10, // OUT OF STOCK!
      warehouseLocation: 'Rack C-01',
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'Stainless Steel Deep Groove Bearing 6204-ZZ',
      sku: 'BRG-6204-ZZ',
      category: 'Bearings',
      unitPrice: 85.0,
      currentStock: 120,
      minStockAlert: 25,
      warehouseLocation: 'Bay A-08',
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      name: 'Precision Digital Vernier Caliper 150mm',
      sku: 'TL-CAL-150',
      category: 'Tools',
      unitPrice: 890.0,
      currentStock: 5,
      minStockAlert: 8, // LOW STOCK!
      warehouseLocation: 'Cabinet 1',
    },
  });

  console.log('📦 Created Sample Products with realistic stock levels.');

  // Create Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: prod1.id,
        quantity: 300,
        type: 'IN',
        reason: 'Shipment received from manufacturer (PO-8821)',
        createdById: warehouseUser.id,
      },
      {
        productId: prod2.id,
        quantity: 50,
        type: 'IN',
        reason: 'Monthly inventory restock',
        createdById: warehouseUser.id,
      },
      {
        productId: prod2.id,
        quantity: 42,
        type: 'OUT',
        reason: 'Internal transfer to regional hub',
        createdById: warehouseUser.id,
      },
    ],
  });

  // Create Draft Challan
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      totalQuantity: 50,
      totalAmount: 50 * 15.5,
      status: 'DRAFT',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productNameSnapshot: prod1.name,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 50,
            lineTotal: 50 * prod1.unitPrice,
          },
        ],
      },
    },
  });

  // Create Confirmed Challan (stock deduction logged)
  const challan2 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer2.id,
      totalQuantity: 20,
      totalAmount: 10 * 85.0 + 10 * 15.5,
      status: 'CONFIRMED',
      createdById: salesUser.id,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: prod4.id,
            productNameSnapshot: prod4.name,
            skuSnapshot: prod4.sku,
            unitPriceSnapshot: prod4.unitPrice,
            quantity: 10,
            lineTotal: 10 * prod4.unitPrice,
          },
          {
            productId: prod1.id,
            productNameSnapshot: prod1.name,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 10,
            lineTotal: 10 * prod1.unitPrice,
          },
        ],
      },
    },
  });

  // Deduct stock for confirmed challan to keep db consistent
  await prisma.product.update({
    where: { id: prod4.id },
    data: { currentStock: 110 },
  });
  await prisma.stockMovement.create({
    data: {
      productId: prod4.id,
      quantity: 10,
      type: 'OUT',
      reason: 'Sales Challan #CH-2026-0002 Confirmed',
      createdById: salesUser.id,
    },
  });

  console.log('📄 Created Sample Sales Challans (Draft & Confirmed).');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
