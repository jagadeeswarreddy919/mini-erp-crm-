import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors';

export interface ListTeamMembersOptions {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const listTeamMembers = async (options: ListTeamMembersOptions) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (options.role) {
    where.role = options.role;
  }

  if (options.status) {
    where.status = options.status;
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    members,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getTeamMemberById = async (id: string) => {
  const member = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!member) {
    throw new NotFoundError('Team member not found');
  }

  return member;
};

export const createTeamMember = async (data: {
  name: string;
  email: string;
  role: string;
  password: string;
  status?: string;
}) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check unique email
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new ConflictError('A team member with this email address already exists.');
  }

  const validRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
  if (!validRoles.includes(data.role)) {
    throw new BadRequestError('Invalid role specified.');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const newMember = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role,
      passwordHash,
      status: data.status || 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newMember;
};

export const updateTeamMember = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  }
) => {
  const member = await prisma.user.findUnique({ where: { id } });
  if (!member) {
    throw new NotFoundError('Team member not found');
  }

  // Check last active admin protection
  if (member.role === 'ADMIN') {
    const isRoleChanging = data.role && data.role !== 'ADMIN';
    const isStatusDeactivating = data.status && data.status === 'INACTIVE';

    if (isRoleChanging || isStatusDeactivating) {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'ADMIN', status: 'ACTIVE' },
      });

      if (activeAdminCount <= 1 && member.status === 'ACTIVE') {
        throw new ConflictError('Cannot deactivate or change role of the last active administrator.');
      }
    }
  }

  const updateData: any = {};

  if (data.name) updateData.name = data.name.trim();

  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (normalizedEmail !== member.email) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        throw new ConflictError('A team member with this email address already exists.');
      }
      updateData.email = normalizedEmail;
    }
  }

  if (data.role) {
    const validRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
    if (!validRoles.includes(data.role)) {
      throw new BadRequestError('Invalid role specified.');
    }
    updateData.role = data.role;
  }

  if (data.status) {
    if (!['ACTIVE', 'INACTIVE'].includes(data.status)) {
      throw new BadRequestError('Invalid status specified.');
    }
    updateData.status = data.status;
  }

  const updatedMember = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedMember;
};

export const toggleTeamMemberStatus = async (id: string, newStatus: string) => {
  return updateTeamMember(id, { status: newStatus });
};
