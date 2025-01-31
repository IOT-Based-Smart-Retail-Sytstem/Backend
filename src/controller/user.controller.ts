import { Request, Response } from "express";
import { CreateUserInput, VerifyUserInput } from "../schema/user.schema";
import { createUser, findUserById } from "../service/user.service";
import sendEmail from "../utils/mailer";

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
            text: `verification code: ${user.verficationCode}. Id: ${user._id}`,
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
    if (user.verficationCode === verificationCode) {
      user.verified = true;
  
      await user.save();
  
      res.send("User successfully verified");
      return ;
    }
  
    res.send("Could not verify user");
    return ;
  } 