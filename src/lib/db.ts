import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// PrismaClient singleton pattern for better connection pooling
const globalForPrisma = global as unknown as {
  prisma: PrismaClient
  pool: Pool
}

// Create PostgreSQL connection pool
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

const pool = globalForPrisma.pool

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Create Prisma Client with adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
