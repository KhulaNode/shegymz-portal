import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  email: string
  passwordHash: string
  name: string | null
  role: 'ADMIN' | 'TRAINER'
  trainerId: string | null
  createdAt: Date
}

export function findUserByEmail(email: string): Promise<AdminUser | null> {
  return prisma.user.findFirst({
    where: {
      email,
      role: { in: ['ADMIN', 'TRAINER'] },
      passwordHash: { not: null },
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      name: true,
      role: true,
      trainerId: true,
      createdAt: true,
    },
  }) as Promise<AdminUser | null>
}

export async function getAllUsers(): Promise<Omit<AdminUser, 'passwordHash'>[]> {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'TRAINER'] } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      trainerId: true,
      createdAt: true,
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })
  return users.map((u) => ({
    ...u,
    createdAt: u.createdAt,
  })) as Omit<AdminUser, 'passwordHash'>[]
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'ADMIN' | 'TRAINER',
  trainerId?: string | null
) {
  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      trainerId: trainerId ?? null,
    },
  })
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } })
}

export async function updatePassword(id: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  })
}