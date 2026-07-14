'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTrainer(formData: FormData) {
  const displayName = formData.get('displayName') as string
  const email = formData.get('email') as string
  const bio = formData.get('bio') as string

  await prisma.trainerProfile.create({
    data: {
      displayName,
      email: email || null,
      bio: bio || null,
      active: true,
    },
  })
  revalidatePath('/dashboard/trainers')
}

export async function toggleTrainerActive(id: string, active: boolean) {
  await prisma.trainerProfile.update({ where: { id }, data: { active } })
  revalidatePath('/dashboard/trainers')
}