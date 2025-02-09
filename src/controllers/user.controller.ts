import { Request, Response } from "express";
import { CreateUserInput, ForgotPasswordInput, ResetPasswordInput, VerifyUserInput } from "../schema/user.schema";
import { createUser, findUserByEmail, findUserById } from "../service/user.service";
import sendEmail from "../utils/mailer";
import log from "../utils/logger";
import { nanoid } from "nanoid";
export async function createUserHandler(
    req : Request<{} , {} , CreateUserInput>, 
    res : Response
){
    const body = req.body 
    try {
        const user = await createUser(body);
        
        await sendEmail({
            to: user.email,
            from: "yasmeenayr@gmail.com",
            subject: "Please Verify your email",
            text: `verification code: ${user.verificationCode}. Id: ${user._id}`,
          });

        res.send("User successfully created");
    
        return ;
    } catch (e: any) {
        if (e.code === 11000) {
            res.status(409).send("Account already exists");
          return ;
        }
    
        res.status(500).send(e);
        return ;
    }
}

export async function verifyUserHandler(
    req: Request<VerifyUserInput>,
    res: Response
  ) {
    const id = req.params.id;
    const verificationCode = req.params.verificationCode;
  
    // find the user by id
    const user = await findUserById(id);
  
    if (!user) {
        res.send("Could not verify user");
      return;
    }
  
    // check to see if they are already verified
    if (user.verified) {
        res.send("User is already verified");
      return; 
    }
  
    // check to see if the verificationCode matches
    if (user.verificationCode === verificationCode) {
      user.verified = true;
  
      await user.save();
  
      res.send("User successfully verified");
      return ;
    }
  
    res.send("Could not verify user");
    return ;
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
      res.send(message);
      return ;
    }
  
    if (!user.verified) {
      res.send("User is not verified");
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
  
    res.send(message);
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
      res.status(400).send("Could not reset user password");
      return 
    }
  
    user.passwordResetCode = null;
  
    user.password = password;
  
    await user.save();
  
    res.send("Successfully updated password");
    return; 
  }

  export async function getCurrentUserHandler(req: Request, res: Response) {
    return res.send(res.locals.user);
  }
  