import express from 'express' ;
import validateResource from '../../middlware/validateResource';
import { createUserSchema, forgotPasswordSchema, resetPasswordSchema, verifyUserSchema } from '../../schema/user/user.schema';
import { createUserHandler, forgotPasswordHandler, getCurrentUserHandler, resendVerificationCode, resetPasswordHandler, verifyResetCode, verifyUserHandler } from '../../controllers/user/user.controller';
import requireUser from '../../middlware/requireUser';
import { requireRole } from "../../middlware/requireRole";

const router  = express.Router()


router.post(
    "/api/users",
    validateResource(createUserSchema), 
    createUserHandler
);

router.post(
    "/api/users/verify",
     validateResource(verifyUserSchema),
    verifyUserHandler
  );

router.post(
    "/api/users/forgotpassword",
    validateResource(forgotPasswordSchema),
    forgotPasswordHandler
  );
router.post(
    "/api/users/VerifyResetCode",
    verifyResetCode 
  );

router.post(
    "/api/users/resetpassword",
    // KvalidateResource(resetPasswordSchema),
    resetPasswordHandler
  );

// في user.routes.ts
router.get(
  "/api/users/resend-verification",
resendVerificationCode);

router.get(
    "/api/users/me", 
    requireUser,    
    requireRole(['admin']),
    getCurrentUserHandler
);

export default router 