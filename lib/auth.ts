import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
};

export async function createUser(input: CreateUserInput) {
  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role ?? 'CANDIDATE',
    },
  });
  return user;
}
