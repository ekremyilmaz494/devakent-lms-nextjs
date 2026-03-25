import { UserRole } from '@prisma/client'

// NextAuth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      hospitalId?: string | null
      department?: string | null
      avatarUrl?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    hospitalId?: string | null
    department?: string | null
    avatarUrl?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    hospitalId?: string | null
    department?: string | null
    avatarUrl?: string | null
  }
}

export { UserRole }
