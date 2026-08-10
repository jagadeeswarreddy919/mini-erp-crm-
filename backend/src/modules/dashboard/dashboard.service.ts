import prisma from '../../config/db';

export const getDashboardSummaryForUser = async (userRole: string, userId: string) => {
  // Shared data queries
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  if (userRole === 'SALES') {
    const [
      totalCustomers,
      myChallansCount,
      draftChallansCount,
      upcomingFollowUps,
      myRecentChallans,
      draftChallans,
      recentSalesMovements,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.challan.count({ where: { createdById: userId } }),
      prisma.challan.count({ where: { createdById: userId, status: 'DRAFT' } }),
      prisma.customer.findMany({
        where: {
          followUpDate: { not: null, gte: startOfDay },
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        select: { id: true, name: true, businessName: true, mobile: true, followUpDate: true, status: true },
      }),
      prisma.challan.findMany({
        where: { createdById: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, businessName: true } } },
      }),
      prisma.challan.findMany({
        where: { createdById: userId, status: 'DRAFT' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, businessName: true } } },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, challanNumber: true, status: true, totalAmount: true, createdAt: true, customer: { select: { name: true } } },
      }),
    ]);

    return {
      role: 'SALES',
      kpi: [
        { label: 'Total Customers', value: totalCustomers, subtext: 'Active & Lead business accounts', icon: 'users' },
        { label: 'My Sales Challans', value: myChallansCount, subtext: 'Challans created by you', icon: 'fileText' },
        { label: 'Draft Challans', value: draftChallansCount, subtext: 'Pending draft orders', icon: 'clock', warning: draftChallansCount > 0 },
        { label: 'Upcoming Follow-ups', value: upcomingFollowUps.length, subtext: 'Scheduled customer follow-ups', icon: 'calendar' },
      ],
      primarySection: {
        title: 'My Recent Sales Challans',
        type: 'challans',
        data: myRecentChallans,
      },
      secondaryGrid: {
        left: { title: 'Upcoming Customer Follow-ups', type: 'followUps', data: upcomingFollowUps },
        right: { title: 'Draft Sales Challans', type: 'challans', data: draftChallans },
      },
      activity: {
        title: 'Recent Sales Activity',
        items: recentSalesMovements.map((ch) => ({
          id: ch.id,
          text: `Sales Challan #${ch.challanNumber} (${ch.status}) created for ${ch.customer.name}`,
          timestamp: ch.createdAt,
        })),
      },
      quickActions: [
        { label: 'Add Customer', path: '/customers', variant: 'primary', icon: 'plus' },
        { label: 'Create Sales Challan', path: '/challans/new', variant: 'primary', icon: 'filePlus' },
        { label: 'View Customers', path: '/customers', variant: 'secondary', icon: 'users' },
        { label: 'View Sales Challans', path: '/challans', variant: 'secondary', icon: 'fileText' },
      ],
    };
  }

  if (userRole === 'WAREHOUSE') {
    const [
      activeSkus,
      allProducts,
      outOfStockCount,
      todaysMovementsCount,
      recentMovements,
      recentInOrOut,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true, warehouseLocation: true },
      }),
      prisma.product.count({ where: { currentStock: 0 } }),
      prisma.stockMovement.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          createdBy: { select: { name: true, role: true } },
        },
      }),
      prisma.stockMovement.findMany({
        where: { type: 'IN' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
    ]);

    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStockAlert);

    return {
      role: 'WAREHOUSE',
      kpi: [
        { label: 'Active SKUs', value: activeSkus, subtext: 'Products in catalog', icon: 'package' },
        { label: 'Low Stock Items', value: lowStockProducts.length, subtext: 'Near reorder threshold', icon: 'alertTriangle', warning: lowStockProducts.length > 0 },
        { label: 'Out of Stock', value: outOfStockCount, subtext: '0 units remaining', icon: 'alertCircle', danger: outOfStockCount > 0 },
        { label: "Today's Movements", value: todaysMovementsCount, subtext: 'Stock IN / OUT today', icon: 'arrowUpDown' },
      ],
      primarySection: {
        title: 'Recent Stock Movements',
        type: 'movements',
        data: recentMovements,
      },
      secondaryGrid: {
        left: { title: 'Low Stock Items', type: 'products', data: lowStockProducts.slice(0, 5) },
        right: { title: 'Recent Stock Receipts (IN)', type: 'movements', data: recentInOrOut },
      },
      activity: {
        title: 'Inventory Activity',
        items: recentMovements.map((m) => ({
          id: m.id,
          text: `Stock ${m.type} of ${m.quantity} units for "${m.product.name}" (${m.reason})`,
          timestamp: m.createdAt,
        })),
      },
      quickActions: [
        { label: 'Add Product', path: '/products', variant: 'primary', icon: 'plus' },
        { label: 'Stock IN / Adjustment', path: '/inventory', variant: 'primary', icon: 'arrowDownRight' },
        { label: 'View Inventory', path: '/inventory', variant: 'secondary', icon: 'warehouse' },
        { label: 'View Products Catalog', path: '/products', variant: 'secondary', icon: 'package' },
      ],
    };
  }

  if (userRole === 'ACCOUNTS') {
    const [
      totalChallans,
      confirmedCount,
      draftCount,
      allChallans,
      recentChallans,
      pendingDrafts,
      recentConfirmed,
    ] = await Promise.all([
      prisma.challan.count(),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.findMany({ select: { totalAmount: true } }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, businessName: true } } },
      }),
      prisma.challan.findMany({
        where: { status: 'DRAFT' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, businessName: true } } },
      }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED' },
        take: 5,
        orderBy: { confirmedAt: 'desc' },
        include: { customer: { select: { id: true, name: true, businessName: true } } },
      }),
    ]);

    const totalSalesValue = allChallans.reduce((sum, c) => sum + c.totalAmount, 0);

    return {
      role: 'ACCOUNTS',
      kpi: [
        { label: 'Total Challans', value: totalChallans, subtext: 'Generated sales orders', icon: 'fileText' },
        { label: 'Confirmed Challans', value: confirmedCount, subtext: 'Stock deducted & verified', icon: 'checkCircle' },
        { label: 'Draft Challans', value: draftCount, subtext: 'Awaiting accounts review', icon: 'clock', warning: draftCount > 0 },
        { label: 'Total Sales Value', value: `₹${totalSalesValue.toLocaleString('en-IN')}`, subtext: 'Combined sales valuation', icon: 'dollar' },
      ],
      primarySection: {
        title: 'Recent Sales Challans',
        type: 'challans',
        data: recentChallans,
      },
      secondaryGrid: {
        left: { title: 'Pending / Draft Challans', type: 'challans', data: pendingDrafts },
        right: { title: 'Recent Confirmed Challans', type: 'challans', data: recentConfirmed },
      },
      activity: {
        title: 'Accounts Financial Activity',
        items: recentConfirmed.map((c) => ({
          id: c.id,
          text: `Sales Challan #${c.challanNumber} for ₹${c.totalAmount.toLocaleString('en-IN')} confirmed for ${c.customer.name}`,
          timestamp: c.confirmedAt || c.createdAt,
        })),
      },
      quickActions: [
        { label: 'View All Challans', path: '/challans', variant: 'primary', icon: 'fileText' },
        { label: 'Review Draft Challans', path: '/challans?status=DRAFT', variant: 'primary', icon: 'clock' },
        { label: 'View Confirmed Orders', path: '/challans?status=CONFIRMED', variant: 'secondary', icon: 'checkCircle' },
        { label: 'View Customers Directory', path: '/customers', variant: 'secondary', icon: 'users' },
      ],
    };
  }

  // DEFAULT: ADMIN Dashboard Overview
  const [
    totalCustomers,
    totalProducts,
    allProducts,
    pendingChallans,
    recentChallans,
    upcomingFollowUps,
    recentMovements,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.product.findMany({
      select: { id: true, name: true, sku: true, category: true, currentStock: true, minStockAlert: true, warehouseLocation: true },
    }),
    prisma.challan.count({ where: { status: 'DRAFT' } }),
    prisma.challan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, name: true, businessName: true } } },
    }),
    prisma.customer.findMany({
      where: { followUpDate: { not: null, gte: startOfDay } },
      take: 5,
      orderBy: { followUpDate: 'asc' },
      select: { id: true, name: true, businessName: true, mobile: true, followUpDate: true, status: true },
    }),
    prisma.stockMovement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } },
        createdBy: { select: { name: true, role: true } },
      },
    }),
  ]);

  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStockAlert);

  return {
    role: 'ADMIN',
    kpi: [
      { label: 'Total Customers', value: totalCustomers, subtext: 'Active & Lead business accounts', icon: 'users' },
      { label: 'Total Products', value: totalProducts, subtext: 'Catalog items across categories', icon: 'package' },
      { label: 'Low Stock Products', value: lowStockProducts.length, subtext: 'Items at or below reorder threshold', icon: 'alertTriangle', warning: lowStockProducts.length > 0 },
      { label: 'Pending Challans', value: pendingChallans, subtext: 'Draft sales orders awaiting confirmation', icon: 'fileText' },
    ],
    primarySection: {
      title: 'Recent Sales Challans',
      type: 'challans',
      data: recentChallans,
    },
    secondaryGrid: {
      left: { title: 'Low Stock Items', type: 'products', data: lowStockProducts.slice(0, 5) },
      right: { title: 'Upcoming Customer Follow-ups', type: 'followUps', data: upcomingFollowUps },
    },
    activity: {
      title: 'Recent System Activity',
      items: recentMovements.map((m) => ({
        id: m.id,
        text: `Stock ${m.type} of ${m.quantity} units logged by ${m.createdBy.name} (${m.createdBy.role}) for "${m.product.name}"`,
        timestamp: m.createdAt,
      })),
    },
    quickActions: [
      { label: 'Add Customer', path: '/customers', variant: 'primary', icon: 'plus' },
      { label: 'Add Product', path: '/products', variant: 'primary', icon: 'plus' },
      { label: 'Create Sales Challan', path: '/challans/new', variant: 'secondary', icon: 'fileText' },
      { label: 'Manage Team Members', path: '/team-members', variant: 'secondary', icon: 'userCog' },
    ],
  };
};
