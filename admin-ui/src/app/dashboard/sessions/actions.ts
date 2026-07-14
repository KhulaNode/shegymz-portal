'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { AttendanceOutcome } from '@prisma/client'

export async function cancelSession(id: string) {
  await prisma.$executeRaw`SELECT cancel_training_session_by_admin(${id}, 'admin-ui', NULL)`
  revalidatePath('/dashboard/sessions')
}

export async function markAttendance(formData: FormData) {
  const sessionId = formData.get('sessionId') as string
  const outcome = formData.get('outcome') as AttendanceOutcome

  await prisma.$executeRaw`SELECT mark_training_session_attendance(${sessionId}, 'admin-ui', ${outcome}::"AttendanceOutcome", NULL)`
  revalidatePath('/dashboard/sessions')
}
