'use server'

import { revalidatePath } from 'next/cache'
import { createUser, deleteUser, updatePassword } from '@/lib/db'

export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as 'ADMIN' | 'TRAINER'
  const trainerId = (formData.get('trainerId') as string) || null

  if (!email || !password || !name || !role) return
  if (role === 'TRAINER' && !trainerId) return

  await createUser(email, password, name, role, trainerId)
  revalidatePath('/dashboard/users')
}

export async function deleteUserAction(id: string) {
  await deleteUser(id)
  revalidatePath('/dashboard/users')
}

export async function resetPasswordAction(formData: FormData) {
  const id = formData.get('id') as string
  const password = formData.get('password') as string
  if (!id || !password || password.length < 8) return
  await updatePassword(id, password)
  revalidatePath('/dashboard/users')
}
