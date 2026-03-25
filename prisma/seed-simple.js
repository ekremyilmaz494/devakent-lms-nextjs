const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env' })

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Create Prisma Client with adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Create Super Admin
  console.log('Creating Super Admin...')
  const superAdminPassword = await bcrypt.hash('super123', 10)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'super@devakent.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Created Super Admin:', superAdmin.email)

  // Create Hospital
  console.log('Creating Ankara Hospital...')
  const ankaraHospital = await prisma.hospital.create({
    data: {
      name: 'Ankara Şehir Hastanesi',
      city: 'Ankara',
      address: 'Üniversiteler Mahallesi, 06800 Çankaya/Ankara',
      phone: '+90 312 552 60 00',
      isActive: true,
    },
  })
  console.log('✅ Created Hospital:', ankaraHospital.name)

  // Create Admin
  console.log('Creating Admin...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin1@ankara.com',
      password: adminPassword,
      name: 'Ahmet Yılmaz',
      role: 'ADMIN',
      hospitalId: ankaraHospital.id,
      department: 'Yönetim',
      isActive: true,
    },
  })
  console.log('✅ Created Admin:', admin.email)

  // Create Staff
  console.log('Creating Staff...')
  const staffPassword = await bcrypt.hash('staff123', 10)
  const staff = await prisma.user.create({
    data: {
      email: 'staff1@ankara.com',
      password: staffPassword,
      name: 'Dr. Ayşe Yılmaz',
      role: 'STAFF',
      hospitalId: ankaraHospital.id,
      department: 'Kardiyoloji',
      isActive: true,
    },
  })
  console.log('✅ Created Staff:', staff.email)

  // Create İzmir Hospital
  console.log('Creating İzmir Hospital...')
  const izmirHospital = await prisma.hospital.create({
    data: {
      name: 'İzmir Bayraklı Hastanesi',
      city: 'İzmir',
      address: 'Bayraklı, 35530 İzmir',
      phone: '+90 232 458 50 00',
      isActive: true,
    },
  })
  console.log('✅ Created Hospital:', izmirHospital.name)

  // Create İzmir Admin
  const izmirAdmin = await prisma.user.create({
    data: {
      email: 'admin2@izmir.com',
      password: adminPassword,
      name: 'Elif Kaya',
      role: 'ADMIN',
      hospitalId: izmirHospital.id,
      department: 'Yönetim',
      isActive: true,
    },
  })
  console.log('✅ Created Admin:', izmirAdmin.email)

  // Create İzmir Staff
  const izmirStaff = await prisma.user.create({
    data: {
      email: 'staff1@izmir.com',
      password: staffPassword,
      name: 'Dr. Can Arslan',
      role: 'STAFF',
      hospitalId: izmirHospital.id,
      department: 'Cerrahi',
      isActive: true,
    },
  })
  console.log('✅ Created Staff:', izmirStaff.email)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test Kullanıcıları:')
  console.log('  Super Admin: super@devakent.com / super123')
  console.log('  Admin (Ankara): admin1@ankara.com / admin123')
  console.log('  Staff (Ankara): staff1@ankara.com / staff123')
  console.log('  Admin (İzmir): admin2@izmir.com / admin123')
  console.log('  Staff (İzmir): staff1@izmir.com / staff123')
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message)
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
