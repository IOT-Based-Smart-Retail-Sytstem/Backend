import ContactModel, {Contact} from "../models/contact.model";
import { Request } from "express";

export async function createContact(input: Partial<Contact>) {
  return ContactModel.create(input);
}

export async function getContactById(id: string) {
  return ContactModel.findById(id).select("-__v");
}

export async function getAllContacts(req: Request) {
  const page = parseInt(req.query.page as string) || 1;
  const limits = parseInt(req.query.limits as string) || 10;
  return ContactModel.find().limit(limits).skip((page - 1) * page).sort({ createdAt: -1 }).select("-__v");
}