'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ScheduleBlockType, DayOfWeek } from '@prisma/client'

export async function createScheduleBlock(formData: FormData) {
  const trainerProfileId = formData.get('trainerProfileId') as string
  const scheduleType = formData.get('scheduleType') as ScheduleBlockType
  const dayOfWeek = (formData.get('dayOfWeek') as DayOfWeek) || null
  const specificDate = formData.get('specificDate') as string
  const startTime = formData.get('startTime') as string  // HH:MM
  const endTime = formData.get('endTime') as string      // HH:MM
  const slotDurationMinutes = parseInt(formData.get('slotDurationMinutes') as string)
  const timezone = (formData.get('timezone') as string) || 'Africa/Johannesburg'

  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em

  await prisma.trainerScheduleBlock.create({
    data: {
      trainerProfileId,
      scheduleType,
      dayOfWeek: scheduleType === 'RECURRING' ? dayOfWeek : null,
      specificDate: scheduleType === 'ONE_OFF' ? new Date(specificDate) : null,
      startMinutes,
      endMinutes,
      slotDurationMinutes,
      timezone,
      active: true,
    },
  })
  revalidatePath('/dashboard/schedule-blocks')
}

export async function deleteScheduleBlock(id: string) {
  await prisma.trainerScheduleBlock.delete({ where: { id } })
  revalidatePath('/dashboard/schedule-blocks')
}

export async function toggleBlockActive(id: string, active: boolean) {
  await prisma.trainerScheduleBlock.update({ where: { id }, data: { active } })
  revalidatePath('/dashboard/schedule-blocks')
}
