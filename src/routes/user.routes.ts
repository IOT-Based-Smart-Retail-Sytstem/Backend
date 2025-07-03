import express from 'express' ;
import validateResource from '../middlware/validateResource';
import { createUserSchema, forgotPasswordSchema, verifyUserSchema } from '../schema/user/user.schema';
import { createUserHandler, forgotPasswordHandler, getCurrentUserHandler, resendVerificationCode, resetPasswordHandler, verifyResetCode, verifyUserHandler, getUserByIdHandler, updateUserByIdHandler, deleteUserByIdHandler } from '../controllers/user.controller';
import requireUser from '../middlware/requireUser';
import { requireRole } from "../middlware/requireRole";

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
    requireRole(['admin', 'user']),
    getCurrentUserHandler
);

// Get user by ID
router.get(
  "/api/users/:id",
  requireUser,
  getUserByIdHandler
);

// Update user by ID
router.put(
  "/api/users/:id",
  requireUser,
  updateUserByIdHandler
);

// Delete user by ID
router.delete(
  "/api/users/:id",
  requireUser,
  deleteUserByIdHandler
);

export default router 