import { Router } from 'express';
import * as teamMembersController from './team-members.controller';
import { authenticateUser } from '../../middleware/auth';
import { requireRole } from '../../middleware/authorize';

const router = Router();

// Protect ALL Team Member API endpoints to ADMIN role only
router.use(authenticateUser);
router.use(requireRole(['ADMIN']));

router.get('/', teamMembersController.listMembers);
router.post('/', teamMembersController.createMember);
router.get('/:id', teamMembersController.getMember);
router.put('/:id', teamMembersController.updateMember);
router.patch('/:id/status', teamMembersController.toggleStatus);

export default router;
