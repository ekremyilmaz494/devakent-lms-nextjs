import { PrismaClient, UserRole, TrainingStatus, EnrollmentStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool as any)

// Create Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.examAttempt.deleteMany()
  await prisma.trainingEnrollment.deleteMany()
  await prisma.training.deleteMany()
  await prisma.hospitalSubscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.subscriptionPlan.deleteMany()

  console.log('✅ Cleared existing data')

  // Create Subscription Plans
  const planBasic = await prisma.subscriptionPlan.create({
    data: {
      name: 'Başlangıç',
      description: 'Küçük hastaneler için ideal',
      price: 2500,
      maxUsers: 50,
      maxTrainings: 10,
      features: ['Temel eğitim modülleri', '50 kullanıcı', '10 eğitim', 'E-posta desteği'],
      isActive: true,
    },
  })

  const planPro = await prisma.subscriptionPlan.create({
    data: {
      name: 'Profesyonel',
      description: 'Orta ölçekli hastaneler için',
      price: 5000,
      maxUsers: 200,
      maxTrainings: 50,
      features: [
        'Tüm eğitim modülleri',
        '200 kullanıcı',
        '50 eğitim',
        'Öncelikli destek',
        'Özel raporlama',
      ],
      isActive: true,
    },
  })

  const planEnterprise = await prisma.subscriptionPlan.create({
    data: {
      name: 'Kurumsal',
      description: 'Büyük hastane grupları için',
      price: 10000,
      maxUsers: 1000,
      maxTrainings: 200,
      features: [
        'Sınırsız eğitim modülleri',
        '1000 kullanıcı',
        '200 eğitim',
        '7/24 destek',
        'Özel entegrasyonlar',
        'Dedike hesap yöneticisi',
      ],
      isActive: true,
    },
  })

  console.log('✅ Created Subscription Plans')

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
      code: 'ANK-001',
      city: 'Ankara',
      address: 'Üniversiteler Mahallesi, 06800 Çankaya/Ankara',
      phone: '+90 312 552 60 00',
      isActive: true,
    },
  })
  console.log('✅ Created Hospital:', ankaraHospital.name)

  // Create Subscription for Ankara Hospital
  await prisma.hospitalSubscription.create({
    data: {
      hospitalId: ankaraHospital.id,
      planId: planPro.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  })
  console.log('✅ Created Subscription for:', ankaraHospital.name)

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
  const ankaraStaff = await prisma.user.createMany({
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
      {
        email: 'staff4@ankara.com',
        password: staffPassword,
        name: 'Teknisyen Ahmet Şahin',
        role: UserRole.STAFF,
        hospitalId: ankaraHospital.id,
        department: 'Radyoloji',
        isActive: true,
      },
      {
        email: 'staff5@ankara.com',
        password: staffPassword,
        name: 'Hemşire Fatma Çelik',
        role: UserRole.STAFF,
        hospitalId: ankaraHospital.id,
        department: 'Pediatri',
        isActive: true,
      },
    ],
  })
  console.log('✅ Created 5 Staff members for Ankara')

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
      {
        email: 'staff3@izmir.com',
        password: staffPassword,
        name: 'Laborant Burak Öztürk',
        role: UserRole.STAFF,
        hospitalId: izmirHospital.id,
        department: 'Laboratuvar',
        isActive: true,
      },
      {
        email: 'staff4@izmir.com',
        password: staffPassword,
        name: 'Dr. Selin Aydın',
        role: UserRole.STAFF,
        hospitalId: izmirHospital.id,
        department: 'Kardiyoloji',
        isActive: true,
      },
      {
        email: 'staff5@izmir.com',
        password: staffPassword,
        name: 'Hemşire Murat Koç',
        role: UserRole.STAFF,
        hospitalId: izmirHospital.id,
        department: 'Ortopedi',
        isActive: true,
      },
    ],
  })
  console.log('✅ Created 5 Staff members for İzmir')

  // Create sample trainings for Ankara
  const ankaraTrainings = await prisma.training.createMany({
    data: [
      {
        title: 'Hasta Güvenliği ve Risk Yönetimi',
        description: 'Hasta güvenliği standartları ve risk yönetim süreçleri hakkında kapsamlı eğitim',
        examDuration: 45,
        passingScore: 70,
        status: TrainingStatus.PUBLISHED,
        hospitalId: ankaraHospital.id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        publishedAt: new Date(),
      },
      {
        title: 'Enfeksiyon Kontrol Protokolleri',
        description: 'Hastane enfeksiyonlarının önlenmesi ve kontrol protokolleri',
        examDuration: 60,
        passingScore: 80,
        status: TrainingStatus.PUBLISHED,
        hospitalId: ankaraHospital.id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        publishedAt: new Date(),
      },
      {
        title: 'Acil Müdahale Teknikleri',
        description: 'Acil durumlarda uygulanacak müdahale teknikleri ve prosedürler',
        examDuration: 90,
        passingScore: 75,
        status: TrainingStatus.PUBLISHED,
        hospitalId: ankaraHospital.id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        publishedAt: new Date(),
      },
    ],
  })
  console.log('✅ Created 3 trainings for Ankara')

  // Create sample trainings for İzmir
  const izmirTrainings = await prisma.training.createMany({
    data: [
      {
        title: 'Cerrahi Asepsi ve Antisepsi',
        description: 'Cerrahi ortamlarda asepsi ve antisepsi kuralları',
        examDuration: 50,
        passingScore: 70,
        status: TrainingStatus.PUBLISHED,
        hospitalId: izmirHospital.id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        publishedAt: new Date(),
      },
      {
        title: 'Hasta İletişim Becerileri',
        description: 'Hasta ve hasta yakınları ile etkili iletişim teknikleri',
        examDuration: 40,
        passingScore: 65,
        status: TrainingStatus.PUBLISHED,
        hospitalId: izmirHospital.id,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        publishedAt: new Date(),
      },
    ],
  })
  console.log('✅ Created 2 trainings for İzmir')

  // Get all staff and trainings to create enrollments
  const allAnkaraStaff = await prisma.user.findMany({
    where: { hospitalId: ankaraHospital.id, role: UserRole.STAFF },
  })

  const allAnkaraTrainings = await prisma.training.findMany({
    where: { hospitalId: ankaraHospital.id },
  })

  // Create some sample enrollments
  if (allAnkaraStaff.length > 0 && allAnkaraTrainings.length > 0) {
    await prisma.trainingEnrollment.create({
      data: {
        userId: allAnkaraStaff[0].id,
        trainingId: allAnkaraTrainings[0].id,
        status: EnrollmentStatus.COMPLETED,
        progress: 100,
        score: 95,
        startedAt: new Date('2026-03-15'),
        completedAt: new Date('2026-03-20'),
      },
    })

    await prisma.trainingEnrollment.create({
      data: {
        userId: allAnkaraStaff[1].id,
        trainingId: allAnkaraTrainings[1].id,
        status: EnrollmentStatus.IN_PROGRESS,
        progress: 60,
        startedAt: new Date('2026-03-18'),
      },
    })

    console.log('✅ Created sample enrollments')
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
