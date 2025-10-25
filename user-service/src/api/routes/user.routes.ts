import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();


router.post('/', userController.createUser.bind(userController));
router.get('/search', userController.searchUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));

export default router;