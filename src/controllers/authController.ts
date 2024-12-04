import { Request, Response } from 'express';
import bcrypt  from 'bcrypt'
import Customer from '../models/customer';
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

    // Check if Customer already exists
    const oldCustomer = await Customer.findOne({ email });
    if (oldCustomer) {
      res.status(400).json({ status: FAIL, message: 'Customer already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save a new Customer
    const newCustomer = new Customer({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verified: true, 
    });

    // Generate a token for the Customer
    const token = await generateToken({ email: newCustomer.email, id: newCustomer._id });
    newCustomer.token = token;

    await newCustomer.save();

    res.status(201).json({ status: SUCCESS, message: 'Customer registered successfully', data: newCustomer });
  } catch (error: any) {
    res.status(400).json({ status: ERROR, message: error.message });
  }
};
