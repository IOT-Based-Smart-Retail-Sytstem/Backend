import express from 'express' ;
import validateResource from '../middlware/validateResource';
import { createUserSchema, verifyUserSchema } from '../schema/user.schema';
import { createUserHandler, verifyUserHandler } from '../controllers/user.controller';
const router  = express.Router()


router.post(
    "/api/users",
    validateResource(createUserSchema), 
    createUserHandler
);

router.post(
    "/api/users/verify/:id/:verificationCode",
    validateResource(verifyUserSchema),
    verifyUserHandler
  );

export default router 