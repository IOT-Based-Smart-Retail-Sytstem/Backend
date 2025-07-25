import UserModel, { User } from "../models/user.model";
import { CustomError } from "../utils/custom.error";

export function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export function findUserById(id: string) {
  const user = UserModel.findById(id);
  if (!user) throw new CustomError("User not found", 404);
  return user;
}

export function findUserByEmail(email: string) {
  const user = UserModel.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);
  return user;
}

export function updateUserById(id: string, update: Partial<User>) {
  return UserModel.findByIdAndUpdate(id, update, { new: true });
}

export function deleteUserById(id: string) {
  return UserModel.findByIdAndDelete(id);
}