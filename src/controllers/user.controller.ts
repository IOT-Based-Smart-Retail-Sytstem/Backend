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

dotenv.config();

export async function createUserHandler(
    req : Request<{} , {} , CreateUserInput>, 
    res : Response
){
    const body = req.body 
    try {
        const user = await createUser(body);

        const token = await generateToken({ id: user._id})

        const verificationLink = `https://yourfrontend.com/verify-user?token=${token}`;

        await sendEmail({
            to: user.email,
            from: "yasmeenayr@gmail.com",
            subject: "Please Verify your email",
            html: `
                <p>Thank you for registering! Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>If the button above doesn't work, you can also click this link:</p>
                <p><a href="${verificationLink}">${verificationLink}</a></p>
            `,
          });


          res.status(Code.Created).json({
              status : Status.SUCCESS , 
              code : Code.Created ,
              data : {user} 
            });
       
    
        return ;
    } catch (e: any) {
        if (e.code === 11000) {
          res.status(Code.Conflict).json({ 
              status: Status.FAIL,
              code : Code.Conflict ,  
              message: "Account already exists" 
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
    req: Request<VerifyUserInput>,
    res: Response
  ) {
    const token = req.query.token as string ;

    if (!token) {
      return res
          .status(Code.BadRequest)
          .json({ status: Status.FAIL, message: "Token is missing" });
  }
  try {

    if (!process.env.SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined in environment variables.");
    }
    // فك تشفير التوكن
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };

    // البحث عن المستخدم
    const user = await findUserById(decoded.id);

    if (!user) {
        return res
              .status(Code.BadRequest)
              .json({ status: Status.FAIL, message: "User not found" });
    }

    // التحقق من الكود
    if (user.verified) {
        return res
              .status(Code.OK)
              .json({ status: Status.SUCCESS, message: "User is already verified" });
    }

   
    await user.updateOne({ verified: true });

    // // تحديث حالة المستخدم
    // user.verified = true;
    // await user.save();

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
    // const id = req.params.id;
    // const verificationCode = req.params.verificationCode;
  
    // // find the user by id
    // const user = await findUserById(id);
  
    // if (!user) {
    //   res.status(Code.BadRequest).json({ status: Status.FAIL, message: "Could not verify user" });
    //   return;
    // }
  
    // // check to see if they are already verified
    // if (user.verified) {
    //   res.status(Code.OK).json({ status: Status.SUCCESS, message: "User is already verified" });
    //   return; 
    // }
  
    // // check to see if the verificationCode matches
    // if (user.verificationCode === verificationCode) {
    //   user.verified = true;
  
    //   await user.save();
  
    //   res.status(Code.OK).json({ status: Status.SUCCESS, message: "User successfully verified" });
    //   return ;
    // }
  
    // res.status(Code.BadRequest).json({ status: Status.FAIL, message: "Could not verify user" });
    // return ;
  } 

export async function forgotPasswordHandler(
    req: Request<{}, {},ForgotPasswordInput>,
    res: Response
  ) {
    const message =
      "If a user with that email is registered you will receive a password reset email";
  
    const { email } = req.body;
  
    const user = await findUserByEmail(email);
  
    if (!user) {
      log.debug(`User with email ${email} does not exists`);
      res.status(Code.OK).json({ status: Status.SUCCESS, message });
      return ;
    }
  
    if (!user.verified) {
      res.status(Code.BadRequest).json({ status: Status.FAIL, message: "User is not verified" });
      return ;
    }
  
    const passwordResetCode = nanoid();
  
    user.passwordResetCode = passwordResetCode;
  
    await user.save();
  
    await sendEmail({
      to: user.email,
      from: "yasmeenayr@gmail.com",
      subject: "Reset your password",
      text: `Password reset code: ${passwordResetCode}. Id ${user._id}`,
    });
  
    log.debug(`Password reset email sent to ${email}`);
  
    res.status(Code.OK).json({ status: Status.SUCCESS, message });
    return  ;
  }
  
export async function resetPasswordHandler(
    req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
    res: Response
  ) {
    const { id, passwordResetCode } = req.params;
  
    const { password } = req.body;
  
    const user = await findUserById(id);
  
    if (
      !user ||
      !user.passwordResetCode ||
      user.passwordResetCode !== passwordResetCode
    ) {
      res.status(Code.BadRequest).json({ status: Status.FAIL, message: "Could not reset user password" });
      return 
    }
  
    user.passwordResetCode = null;
  
    user.password = password;
  
    await user.save();
  
    res.status(Code.OK).json({ status: Status.SUCCESS, message: "Successfully updated password" });
    return; 
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  res.status(Code.OK).json({ status: Status.SUCCESS, data: { user: res.locals.user } });
}
  