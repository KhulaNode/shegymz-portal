import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'TRAINER'
      trainerId: string | null
    }
  }
  interface User {
    role: 'ADMIN' | 'TRAINER'
    trainerId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'TRAINER'
    trainerId: string | null
  }
}
