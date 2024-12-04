import { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import Customer from '../models/customer';
import { Code, Status } from '../utils/httpStatus';
import generateToken from '../utils/generateToken';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      res.status(Code.BadRequest).json({ status: Status.FAIL, message: 'Passwords do not match' });
      return;
    }

    // Check if Customer already exists
    const oldCustomer = await Customer.findOne({ email });
    if (oldCustomer) {
      res.status(Code.BadRequest).json({ status: Status.FAIL, message: 'Customer already exists' });
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

    res.status(Code.Created).json({ status: Status.SUCCESS, message: 'Customer registered successfully', data: newCustomer });
  } catch (error: any) {
    res.status(Code.InternalServerError).json({ status: Status.ERROR, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if Customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      res.status(Code.BadRequest).json({ status: Status.FAIL, message: 'Customer does not exist' });
      return;
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      res.status(Code.BadRequest).json({ status: Status.FAIL, message: 'Invalid credentials' });
      return;
    }

    // Generate a token for the Customer
    const token = await generateToken({ email: customer.email, id: customer._id });
    res.cookie('token', token, { httpOnly: true });

    await customer.save();

    res.status(Code.OK).json({ status: Status.SUCCESS, message: 'Customer logged in successfully', data: customer });
  }
  catch (error: any) {
    res.status(Code.InternalServerError).json({ status: Status.ERROR, message: error.message });
  }

}