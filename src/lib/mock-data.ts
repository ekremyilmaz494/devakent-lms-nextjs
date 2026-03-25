// Mock data service for dashboard
// Gerçek API entegrasyonuna hazır yapı

export interface DashboardStats {
  activeStaff: number
  completedTrainings: number
  averageScore: number
  pendingCertificates: number
}

export interface TrendDataPoint {
  day: string
  tamamlanan: number
  devamEden: number
}

export interface TopPerformer {
  id: string
  name: string
  department: string
  completedCount: number
  score: number
  avatarUrl?: string
}

export interface RecentActivity {
  id: string
  staffName: string
  trainingTitle: string
  status: 'tamamlandı' | 'devam ediyor' | 'başarısız'
  score: number | null
  date: string
}

export function getDashboardStats(): DashboardStats {
  return {
    activeStaff: 248,
    completedTrainings: 1856,
    averageScore: 87.3,
    pendingCertificates: 42,
  }
}

export function getCompletionTrend(): TrendDataPoint[] {
  return [
    { day: 'Pzt', tamamlanan: 42, devamEden: 18 },
    { day: 'Sal', tamamlanan: 38, devamEden: 22 },
    { day: 'Çar', tamamlanan: 51, devamEden: 15 },
    { day: 'Per', tamamlanan: 47, devamEden: 20 },
    { day: 'Cum', tamamlanan: 55, devamEden: 12 },
    { day: 'Cmt', tamamlanan: 28, devamEden: 8 },
    { day: 'Paz', tamamlanan: 31, devamEden: 6 },
  ]
}

export function getTopPerformers(): TopPerformer[] {
  return [
    {
      id: '1',
      name: 'Dr. Ayşe Yılmaz',
      department: 'Kardiyoloji',
      completedCount: 24,
      score: 96.5,
    },
    {
      id: '2',
      name: 'Hemşire Mehmet Kaya',
      department: 'Yoğun Bakım',
      completedCount: 22,
      score: 94.8,
    },
    {
      id: '3',
      name: 'Dr. Zeynep Demir',
      department: 'Acil Servis',
      completedCount: 21,
      score: 93.2,
    },
    {
      id: '4',
      name: 'Teknisyen Ahmet Şahin',
      department: 'Radyoloji',
      completedCount: 19,
      score: 91.7,
    },
    {
      id: '5',
      name: 'Hemşire Fatma Çelik',
      department: 'Pediatri',
      completedCount: 18,
      score: 90.4,
    },
  ]
}

export function getRecentActivities(): RecentActivity[] {
  return [
    {
      id: '1',
      staffName: 'Dr. Ayşe Yılmaz',
      trainingTitle: 'Hasta Güvenliği ve Risk Yönetimi',
      status: 'tamamlandı',
      score: 95,
      date: '2026-03-20 14:32',
    },
    {
      id: '2',
      staffName: 'Hemşire Mehmet Kaya',
      trainingTitle: 'Enfeksiyon Kontrol Protokolleri',
      status: 'tamamlandı',
      score: 88,
      date: '2026-03-20 13:15',
    },
    {
      id: '3',
      staffName: 'Dr. Zeynep Demir',
      trainingTitle: 'Acil Müdahale Teknikleri',
      status: 'devam ediyor',
      score: null,
      date: '2026-03-20 11:20',
    },
    {
      id: '4',
      staffName: 'Teknisyen Ahmet Şahin',
      trainingTitle: 'MR Güvenliği ve Protokolleri',
      status: 'tamamlandı',
      score: 92,
      date: '2026-03-20 10:45',
    },
    {
      id: '5',
      staffName: 'Hemşire Fatma Çelik',
      trainingTitle: 'Pediatrik İlaç Dozajları',
      status: 'başarısız',
      score: 42,
      date: '2026-03-20 09:30',
    },
    {
      id: '6',
      staffName: 'Dr. Can Arslan',
      trainingTitle: 'Cerrahi Asepsi ve Antisepsi',
      status: 'tamamlandı',
      score: 90,
      date: '2026-03-19 16:22',
    },
    {
      id: '7',
      staffName: 'Hemşire Elif Yıldız',
      trainingTitle: 'Hasta İletişim Becerileri',
      status: 'tamamlandı',
      score: 87,
      date: '2026-03-19 15:10',
    },
    {
      id: '8',
      staffName: 'Laborant Burak Öztürk',
      trainingTitle: 'Kan Örnekleme ve Saklama',
      status: 'devam ediyor',
      score: null,
      date: '2026-03-19 14:05',
    },
    {
      id: '9',
      staffName: 'Dr. Selin Aydın',
      trainingTitle: 'EKG Yorumlama Temelleri',
      status: 'tamamlandı',
      score: 94,
      date: '2026-03-19 11:30',
    },
    {
      id: '10',
      staffName: 'Hemşire Murat Koç',
      trainingTitle: 'Yara Bakımı ve Pansuman',
      status: 'tamamlandı',
      score: 85,
      date: '2026-03-19 09:15',
    },
  ]
}
