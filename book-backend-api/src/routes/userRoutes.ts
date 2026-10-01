import { Router } from 'express';
import { getUsers, createUser, getUserById, updateUser, deleteUser } from '#controllers';
import { validateRequest } from '#middleware';
import { userSchema } from '#schemas';

const router = Router();

router.get('/', getUsers);
router.post('/', validateRequest(userSchema), createUser);
router.get('/:id', getUserById);
router.put('/:id', validateRequest(userSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;