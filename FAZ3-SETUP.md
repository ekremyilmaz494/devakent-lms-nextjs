# Faz 3 Kurulum Rehberi

## ✅ Tamamlanan İşler

- ✅ Prisma, Supabase, NextAuth paketleri kuruldu
- ✅ Prisma schema tasarlandı (multi-tenant SaaS yapısı)
- ✅ NextAuth.js yapılandırıldı (credentials provider)
- ✅ Login sayfası oluşturuldu
- ✅ Auth middleware (role-based access control)
- ✅ SessionProvider entegrasyonu
- ✅ Logout fonksiyonu
- ✅ Seed script (test kullanıcıları)

## 🚀 Sonraki Adımlar (Sizin yapmanız gerekenler)

### 1. Supabase Projesi Oluşturun

1. https://supabase.com adresine gidin
2. Yeni bir proje oluşturun
3. **Settings > Database** bölümünden **Connection String (Direct)** alın
4. **Settings > API** bölümünden API anahtarlarını alın

### 2. `.env.local` Dosyasını Güncelleyin

`.env.local` dosyasındaki placeholder değerleri gerçek bilgilerinizle değiştirin:

```bash
# Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase API keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth URL (localhost for development)
NEXTAUTH_URL="http://localhost:3000"

# Generate NEXTAUTH_SECRET with:
# openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
```

### 3. NEXTAUTH_SECRET Oluşturun

Terminal'de şu komutu çalıştırın:

```bash
openssl rand -base64 32
```

Çıktıyı kopyalayıp `.env.local` dosyasındaki `NEXTAUTH_SECRET` değerine yapıştırın.

### 4. Prisma Migration Çalıştırın

Database schema'yı Supabase'e gönderin:

```bash
pnpm db:push
```

VEYA migration oluşturup çalıştırın:

```bash
pnpm db:migrate
```

### 5. Prisma Client Oluşturun

```bash
pnpm db:generate
```

### 6. Test Verilerini Yükleyin (Seed)

```bash
pnpm db:seed
```

Bu komut şu test kullanıcılarını oluşturacak:

**Super Admin:**
- Email: `super@devakent.com`
- Password: `super123`

**Admin (Ankara Şehir Hastanesi):**
- Email: `admin1@ankara.com`
- Password: `admin123`

**Personel (Ankara Şehir Hastanesi):**
- Email: `staff1@ankara.com` (Dr. Ayşe Yılmaz - Kardiyoloji)
- Email: `staff2@ankara.com` (Hemşire Mehmet Kaya - Yoğun Bakım)
- Email: `staff3@ankara.com` (Dr. Zeynep Demir - Acil Servis)
- Email: `staff4@ankara.com` (Teknisyen Ahmet Şahin - Radyoloji)
- Email: `staff5@ankara.com` (Hemşire Fatma Çelik - Pediatri)
- Password: `staff123` (hepsi için)

**Admin (İzmir Bayraklı Hastanesi):**
- Email: `admin2@izmir.com`
- Password: `admin123`

**Personel (İzmir):**
- Email: `staff1@izmir.com` - `staff5@izmir.com`
- Password: `staff123`

### 7. Dev Server'ı Başlatın

```bash
pnpm dev
```

### 8. Test Edin

1. http://localhost:3000/login adresine gidin
2. Yukarıdaki test kullanıcılarından biriyle giriş yapın
3. Role'e göre doğru dashboard'a yönlendirilmelisiniz:
   - Super Admin → `/super-admin/dashboard`
   - Admin → `/admin/dashboard`
   - Staff → `/staff/dashboard`
4. Logout butonu çalışmalı (Topbar → Avatar → Çıkış Yap)

## 📊 Database Schema Özeti

**Multi-tenant yapı:**
- Her Admin sadece kendi hastanesini yönetir
- Staff sadece kendi hastanesinin eğitimlerini görür
- Super Admin tüm hastanelere erişir

**Ana tablolar:**
- `Hospital` - Hastaneler
- `User` - Kullanıcılar (SUPER_ADMIN, ADMIN, STAFF)
- `Training` - Eğitim içerikleri
- `TrainingEnrollment` - Personel-eğitim kayıtları
- `Exam` - Sınavlar
- `ExamAttempt` - Sınav denemeleri
- `Certificate` - Sertifikalar
- `AuditLog` - Denetim kayıtları
- `Notification` - Bildirimler

## 🛠️ Faydalı Komutlar

```bash
# Prisma Studio (database GUI)
pnpm db:studio

# Migration oluştur
pnpm db:migrate

# Schema'yı database'e push et (migration olmadan)
pnpm db:push

# Seed script çalıştır
pnpm db:seed

# Prisma client yeniden oluştur
pnpm db:generate
```

## ⚠️ Sorun Giderme

### "PrismaClient is not configured" hatası
```bash
pnpm db:generate
```

### Migration hatası
```bash
# Tüm migration'ları sıfırla ve yeniden başlat
rm -rf prisma/migrations
pnpm db:push
```

### Seed hatası
Seed script çalıştırılmadan önce migration/push yapıldığından emin olun.

## 🎉 Başarılı Oldu mu?

Eğer login sayfasından giriş yapabiliyorsanız ve dashboard'unuz açılıyorsa, **Faz 3 tamamdır!**

Sıradaki: **Faz 4 - Eğitim CRUD, video yükleme, soru yönetimi**
