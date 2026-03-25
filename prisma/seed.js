const { PrismaClient, UserRole, TrainingStatus, EnrollmentStatus } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env' })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.examAttempt.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.trainingEnrollment.deleteMany()
  await prisma.training.deleteMany()
  await prisma.user.deleteMany()
  await prisma.hospital.deleteMany()

  console.log('✅ Cleared existing data')

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('super123', 10)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'super@devakent.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Created Super Admin:', superAdmin.email)

  // Create Hospital 1: Ankara Şehir Hastanesi
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

  // Create Admin for Ankara
  const adminPassword = await bcrypt.hash('admin123', 10)
  const ankaraAdmin = await prisma.user.create({
    data: {
      email: 'admin1@ankara.com',
      password: adminPassword,
      name: 'Ahmet Yılmaz',
      role: UserRole.ADMIN,
      hospitalId: ankaraHospital.id,
      department: 'Yönetim',
      isActive: true,
    },
  })
  console.log('✅ Created Admin:', ankaraAdmin.email)

  // Create Staff for Ankara
  const staffPassword = await bcrypt.hash('staff123', 10)
  await prisma.user.createMany({
    data: [
      {
        email: 'staff1@ankara.com',
        password: staffPassword,
        name: 'Dr. Ayşe Yılmaz',
        role: UserRole.STAFF,
        hospitalId: ankaraHospital.id,
        department: 'Kardiyoloji',
        isActive: true,
      },
      {
        email: 'staff2@ankara.com',
        password: staffPassword,
        name: 'Hemşire Mehmet Kaya',
        role: UserRole.STAFF,
        hospitalId: ankaraHospital.id,
        department: 'Yoğun Bakım',
        isActive: true,
      },
      {
        email: 'staff3@ankara.com',
        password: staffPassword,
        name: 'Dr. Zeynep Demir',
        role: UserRole.STAFF,
        hospitalId: ankaraHospital.id,
        department: 'Acil Servis',
        isActive: true,
      },
    ],
  })
  console.log('✅ Created 3 Staff members for Ankara')

  // Create Hospital 2: İzmir Bayraklı Hastanesi
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

  // Create Admin for İzmir
  const izmirAdmin = await prisma.user.create({
    data: {
      email: 'admin2@izmir.com',
      password: adminPassword,
      name: 'Elif Kaya',
      role: UserRole.ADMIN,
      hospitalId: izmirHospital.id,
      department: 'Yönetim',
      isActive: true,
    },
  })
  console.log('✅ Created Admin:', izmirAdmin.email)

  // Create Staff for İzmir
  await prisma.user.createMany({
    data: [
      {
        email: 'staff1@izmir.com',
        password: staffPassword,
        name: 'Dr. Can Arslan',
        role: UserRole.STAFF,
        hospitalId: izmirHospital.id,
        department: 'Cerrahi',
        isActive: true,
      },
      {
        email: 'staff2@izmir.com',
        password: staffPassword,
        name: 'Hemşire Elif Yıldız',
        role: UserRole.STAFF,
        hospitalId: izmirHospital.id,
        department: 'Dahiliye',
        isActive: true,
      },
    ],
  })
  console.log('✅ Created 2 Staff members for İzmir')

  // Create sample trainings for Ankara
  await prisma.training.createMany({
    data: [
      {
        title: 'Hasta Güvenliği ve Risk Yönetimi',
        description: 'Hasta güvenliği standartları ve risk yönetim süreçleri hakkında kapsamlı eğitim',
        duration: 45,
        passingScore: 70,
        status: TrainingStatus.PUBLISHED,
        hospitalId: ankaraHospital.id,
        publishedAt: new Date(),
      },
      {
        title: 'Enfeksiyon Kontrol Protokolleri',
        description: 'Hastane enfeksiyonlarının önlenmesi ve kontrol protokolleri',
        duration: 60,
        passingScore: 80,
        status: TrainingStatus.PUBLISHED,
        hospitalId: ankaraHospital.id,
        publishedAt: new Date(),
      },
    ],
  })
  console.log('✅ Created 2 trainings for Ankara')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
