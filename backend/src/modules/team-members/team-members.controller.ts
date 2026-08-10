import { Response, NextFunction } from 'express';
import * as teamMembersService from './team-members.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../middleware/auth';
import { BadRequestError } from '../../utils/errors';

export const listMembers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role, status, page, limit } = req.query;
    const result = await teamMembersService.listTeamMembers({
      search: search as string,
      role: role as string,
      status: status as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const member = await teamMembersService.getTeamMemberById(id);
    return sendSuccess(res, member);
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, password, status } = req.body;
    if (!name || !email || !role || !password) {
      throw new BadRequestError('Full Name, Email, Role, and Password are required.');
    }
    const newMember = await teamMembersService.createTeamMember({
      name,
      email,
      role,
      password,
      status,
    });
    return sendSuccess(res, newMember, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    const updated = await teamMembersService.updateTeamMember(id, {
      name,
      email,
      role,
      status,
    });
    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new BadRequestError('Valid status (ACTIVE or INACTIVE) is required.');
    }
    const updated = await teamMembersService.toggleTeamMemberStatus(id, status);
    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};
