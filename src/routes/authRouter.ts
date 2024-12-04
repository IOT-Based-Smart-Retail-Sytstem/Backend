import { Router } from 'express';
import { register } from '../controllers/authController';
//import authenticateUser from '../middleware/authenticateUser';

const router = Router();

router
  .route('/register')
  .post(register);


export default router;
