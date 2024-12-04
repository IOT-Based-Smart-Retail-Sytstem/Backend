import { Request, Response } from 'express';
import bcrypt  from 'bcrypt'
import User from '../models/customer';
import { FAIL, SUCCESS, ERROR } from '../utils/httpStatusText';
import generateToken from '../utils/generateToken';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      res.status(400).json({ status: FAIL, message: 'Passwords do not match' });
      return;
    }

    // Check if user already exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      res.status(400).json({ status: FAIL, message: 'User already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verified: true, 
    });

    // Generate a token for the user
    const token = await generateToken({ email: newUser.email, id: newUser._id });
    newUser.token = token;

    await newUser.save();

    res.status(201).json({ status: SUCCESS, message: 'User registered successfully', data: newUser });
  } catch (error: any) {
    res.status(400).json({ status: ERROR, message: error.message });
  }
};
