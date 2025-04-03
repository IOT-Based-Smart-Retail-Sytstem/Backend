import { DocumentType } from "@typegoose/typegoose";
import { Request, Response } from "express";
import { get } from "lodash";
import {User} from "../models/user.model";
import { CreateSessionInput } from "../schema/auth.schema";
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";
import { findUserByEmail, findUserById } from "../service/user.service";
import { verifyJwt } from "../utils/jwt";
import { Code, Status } from "../utils/httpStatus";


export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Invalid email or password";
  const { email, password } = req.body;
  
  const user = await findUserByEmail(email);
  const firstName  = user?.firstName ;
  const lastName   = user?.lastName  ;

  if (!user) {
    return res.status(Code.Unauthorized).json({
      status: Status.FAIL,
      message: "Invalid email or password",
    });  }

  if (!user.verified) {
    return res.status(Code.Forbidden).json({
      status: Status.FAIL,
      message: "Please verify your email",
    });  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.status(Code.Unauthorized).json({
      status: Status.FAIL,
      message: "Invalid email or password",
    });  }

  // sign a access token
  const accessToken = signAccessToken(user);

  // sign a refresh token
  const refreshToken = await signRefreshToken({ userId: user._id.toString() });

  // send the tokens

  return res
  .cookie("refreshToken", refreshToken, {
      httpOnly: true,   
      secure: true,    
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000 

  })
  .status(Code.OK)
  .json({
      status: Status.SUCCESS,
      accessToken, 
      firstName ,
      lastName
  });

}



export async function refreshAccessTokenHandler(req: Request, res: Response) {
  //const refreshToken = get(req, "headers.x-refresh");
  const refreshToken = req.cookies.refreshToken; 

  // Ensure refreshToken is a string
  const token = Array.isArray(refreshToken) ? refreshToken.join("") : refreshToken;

  if (!token) {
    return res.status(Code.Unauthorized).json({
      status: Status.FAIL,
      message: "Refresh token is missing",
    });  }

  const decoded = verifyJwt<{ session: string }>(token, "refreshTokenPublicKey");

  if (!decoded) {
    return res.status(Code.Unauthorized).json({
      status: Status.FAIL,
      message: "Could not refresh access token",
    });  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(Code.Unauthorized).json({
      status: Status.FAIL,
      message: "Invalid session",
    });  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(Code.Unauthorized).json({
      status: Status.FAIL,
      message: "Could not refresh access token",
    });
  }

  const accessToken = signAccessToken(user);

  return res.status(Code.OK).json({
    status: Status.SUCCESS,
    data: { accessToken },
  });}
