import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

interface Payload {
  [key: string]: any; // Define a flexible structure for payload
}

const generateToken = async (payload: Payload): Promise<string> => {
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in the environment variables.');
  }

  const token = await jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '60m' });
  return token;
};

export default generateToken;
