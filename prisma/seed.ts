import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Admin'

  if (!email) {
    throw new Error('ADMIN_EMAIL environment variable is required for seeding.')
  }
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is required for seeding.')
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.')
  }

  const existing = await prisma.user.findFirst({
    where: { email, role: 'ADMIN' },
  })

  if (existing) {
    console.log(`✓ Admin user already exists: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'ADMIN',
    },
  })

  console.log(`✓ Admin user created: ${email}`)
}

main()
  .catch((e) => {
    console.error('✗ Seed failed:', e.message || e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())