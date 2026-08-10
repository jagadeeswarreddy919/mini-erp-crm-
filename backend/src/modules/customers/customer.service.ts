import prisma from '../../config/db';
import { NotFoundError } from '../../utils/errors';

export interface CustomerQueryOptions {
  search?: string;
  status?: string;
  customerType?: string;
  page?: number;
  limit?: number;
}

export const getCustomers = async (options: CustomerQueryOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.customerType) {
    where.customerType = options.customerType;
  }

  if (options.search) {
    const s = options.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { businessName: { contains: s, mode: 'insensitive' } },
      { mobile: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { gstNumber: { contains: s, mode: 'insensitive' } },
    ];
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { followUps: true, challans: true },
        },
      },
    }),
  ]);

  return {
    customers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      challans: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          challanNumber: true,
          totalQuantity: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  return customer;
};

export const createCustomer = async (data: any) => {
  const formattedData = {
    ...data,
    email: data.email ? data.email.trim() : null,
    gstNumber: data.gstNumber ? data.gstNumber.trim() : null,
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
  };

  return await prisma.customer.create({
    data: formattedData,
  });
};

export const updateCustomer = async (id: string, data: any) => {
  await getCustomerById(id);

  const formattedData = { ...data };
  if (formattedData.email === '') formattedData.email = null;
  if (formattedData.gstNumber === '') formattedData.gstNumber = null;
  if (formattedData.followUpDate) {
    formattedData.followUpDate = new Date(formattedData.followUpDate);
  } else if (formattedData.followUpDate === '') {
    formattedData.followUpDate = null;
  }

  return await prisma.customer.update({
    where: { id },
    data: formattedData,
  });
};

export const deleteCustomer = async (id: string) => {
  await getCustomerById(id);
  return await prisma.customer.delete({
    where: { id },
  });
};

export const addFollowUpNote = async (
  customerId: string,
  userId: string,
  note: string,
  newFollowUpDate?: string
) => {
  await getCustomerById(customerId);

  const result = await prisma.$transaction(async (tx) => {
    const followUp = await tx.customerFollowUp.create({
      data: {
        customerId,
        note,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (newFollowUpDate !== undefined) {
      await tx.customer.update({
        where: { id: customerId },
        data: {
          followUpDate: newFollowUpDate ? new Date(newFollowUpDate) : null,
        },
      });
    }

    return followUp;
  });

  return result;
};

export const getCustomerFollowUps = async (customerId: string) => {
  await getCustomerById(customerId);
  return await prisma.customerFollowUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });
};
