import dotenv from 'dotenv';
import { Request, Response } from "express";
import { CreateUserInput, ForgotPasswordInput, ResetPasswordInput, VerifyUserInput } from "../schema/user.schema";
import { createUser, findUserByEmail, findUserById } from "../service/user.service";
import sendEmail from "../utils/mailer";
import log from "../utils/logger";
import { nanoid } from "nanoid";
import { Code, Status } from "../utils/httpStatus";
import generateToken from "../utils/generateToken";
import jwt from "jsonwebtoken";
import * as argon2 from 'argon2';
import UserModel from '../models/user.model';
dotenv.config();

export async function createUserHandler(
    req : Request<{} , {} , CreateUserInput>, 
    res : Response
){
    const body = req.body 
    try {

      const adminEmails = ['admin1@example.com', 'admin2@example.com']; // قائمة بريدات الأدمن
      const role = adminEmails.includes(body.email) ? 'admin' : 'user';
      const user = await createUser({ ...body , role });

      res.cookie('userId', user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000 // 15 دقيقة (تطابق صلاحية الكود)
    });

    // const newCode = nanoid(6);
    // await user.updateOne({
    //     verificationCode: newCode,
    //     verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 دقيقة
    // });
        await sendEmail({
            to: user.email,
            from: "yasmeenayr@gmail.com",
            subject: "Please Verify your email",
            html: `
                <p>Thank you for registering! Your verification code is:</p>
                <h2 style="color: #4CAF50;">${user.verificationCode}</h2>
                <p>Please enter this code in the verification page to verify your email.</p>
            `,
        });
       console.log( user.verificationCode)

          res.status(Code.Created).json({
              status : Status.SUCCESS , 
              code : Code.Created ,
              data : {
                message : 'user created succesfuly' ,
                role : user.role
              } 
            });
       
    
        return ;
    } catch (e: any) {
        if (e.code === 11000) {
          let message = "Account already exists";
            if (e.keyValue.email) {
                message = "Email already exists";
            } else if (e.keyValue.phoneNumber) {
                message = "Phone number already exists";
            }
          res.status(Code.Conflict).json({ 
              status: Status.FAIL,
              code : Code.Conflict ,  
              message
            });
          return ;
        }
    
        res.status(Code.InternalServerError).json({ 
            status: Status.ERROR, 
            code : Code.InternalServerError,
            message: e.message 
          });
        return ;
    }
}

export async function verifyUserHandler(
  req: Request<{}, {}, { verificationCode: string }>,
  res: Response
  ) {
    const { verificationCode } = req.body;
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(Code.BadRequest).json({
          status: Status.FAIL,
          message: "انتهت جلسة العمل، يرجى التسجيل مرة أخرى"
      });
  }
  try {

    const user = await findUserById(userId);
    if (!user) {
        return res
              .status(Code.NotFound)
              .json({ status: Status.FAIL, message: "User not found" });
    }

   

    if (user.verificationCode !== verificationCode) {
      return res.status(Code.BadRequest).json({
          status: Status.FAIL,
          message: "Verification code not true "
      });
  }

  if (new Date() > user.verificationCodeExpires) {
    return res.status(Code.BadRequest).json({
        status: Status.FAIL,
        message: "Verification code Expired"
    });
}
    // التحقق من الكود
    if (user.verified) {
      return res
            .status(Code.OK)
            .json({ status: Status.SUCCESS, message: "User is already verified" });
  }
  await user.updateOne({ 
    verified: true,
    verificationCode: null,
    verificationCodeExpires: null
});

res.clearCookie('userId');
 
    return res
          .status(Code.OK)
          .json({ 
              status: Status.SUCCESS, 
              message: "User successfully verified" 
            });
} catch (error) {
    return res
          .status(Code.BadRequest)
          .json({ 
              status: Status.FAIL, 
              message: "Invalid or expired token" 
            });
}

} 


export async function resendVerificationCode(
  req: Request,
  res: Response
) {
  const userId = req.cookies.userId;

  if (!userId) {
      return res.status(Code.BadRequest).json({
          status: Status.FAIL,
          message: "انتهت جلسة العمل"
      });
  }

  try {
      const user = await findUserById(userId);
      if (!user) {
          return res.status(Code.NotFound).json({
              status: Status.FAIL,
              message: "User not Exist "
          });
      }

      if (user.verified) {
          return res.status(Code.BadRequest).json({
              status: Status.FAIL,
              message: "Account Verified Exactly "
          });
      }

      // إنشاء كود جديد
      const newCode = nanoid(5);
      await user.updateOne({
          verificationCode: newCode,
          verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 دقيقة
      });

      await sendEmail({
          to: user.email,
          from: "noreply@yourapp.com",
          subject: "كود التحقق الجديد",
          html: `
              <h2>كود التحقق الجديد: <strong>${newCode}</strong></h2>
              <p>صالح لمدة 15 دقيقة فقط</p>
          `
      });

      // تجديد مدة الكوكي
      res.cookie('userId', userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000
      });

      return res.status(Code.OK).json({
          status: Status.SUCCESS,
          message: "Code Resended "
      });

  } catch (error) {
      return res.status(Code.InternalServerError).json({
          status: Status.ERROR,
          message: "Error When Resend Code "
      });
  }
}
export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const message = "If a user with that email is registered you will receive a password reset email";
  const { email } = req.body;

  try {
      const user = await findUserByEmail(email);
      if (!user) {
          log.debug(`User with email ${email} does not exists`);
          return res.status(Code.OK).json({ status: Status.SUCCESS, message });
      }

      if (!user.verified) {
          return res.status(Code.BadRequest).json({ 
              status: Status.FAIL, 
              message: "User is not verified" 
          });
      }

      const passwordResetCode = nanoid(5);
      
      await UserModel.updateOne(
          { _id: user._id },
          { passwordResetCode }
      );

      await sendEmail({
          to: user.email,
          from: "yasmeenayr@gmail.com",
          subject: "Reset your password",
          text: `Password reset code: ${passwordResetCode}.`,
      });

      log.debug(`Password reset email sent to ${email}`);
      res.cookie("userId", user._id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000 // 1 يوم
      });

      return res.status(Code.OK).json({ 
          status: Status.SUCCESS, 
          message 
      });

  } catch (e: any) {
      log.error("Error in forgotPasswordHandler:", e);
      return res.status(Code.InternalServerError).json({ 
          status: Status.ERROR,
          message: e.message 
      });
  }
}
export const verifyResetCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        const userId = req.cookies.userId;
        console.log(userId)
        if (!userId || !code) {
            return res.status(400).json({ message: "User ID and code are required" });
        }

        const user = await findUserById(userId);
        console.log(user)
        if (!user || user.passwordResetCode !== code) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        res.status(200).json({ message: "Code verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
   
export async function resetPasswordHandler(
  req: Request<{}, {}, ResetPasswordInput["body"]>,
  res: Response
) {
  const { email, password, passwordConfirmation } = req.body;

  try {
      if (!password || password !== passwordConfirmation) {
          return res.status(Code.BadRequest).json({ 
              status: Status.FAIL, 
              message: "Passwords do not match" 
          });
      }

      const user = await findUserByEmail(email);
      if (!user) {
          return res.status(Code.NotFound).json({ 
              status: Status.FAIL, 
              message: "User not found" 
          });
      }

      // استخدام updateOne بدلاً من save
      await UserModel.updateOne(
          { _id: user._id },
          { 
              passwordResetCode: null,
              password: await argon2.hash(password) 
          }
      );

      return res.status(Code.OK).json({ 
          status: Status.SUCCESS, 
          message: "Password successfully updated" 
      });

  } catch (error) {
      log.error("Error in resetPasswordHandler:", error);
      return res.status(Code.InternalServerError).json({ 
          status: Status.ERROR,
          message: "An error occurred while resetting password" 
      });
  }
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  res.status(Code.OK).json({ status: Status.SUCCESS, data: { user: res.locals.user } });
}
  