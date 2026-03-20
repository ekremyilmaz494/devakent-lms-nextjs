# HASTANE LMS — TAM PROJE & MASTER PROMPT DOKÜMANI
> **Google Antigravity IDE | Claude ile Geliştirme Kılavuzu**
> Her yeni oturumda bu dokümanı Claude'a ver. Proje bağlamını sıfırdan anlar veya kaldığı yerden devam eder.

**Proje Adı:** Hastane Personel Eğitim ve Sınav Yönetim Sistemi (LMS)
**Platform:** Google Antigravity IDE
**Versiyon:** 1.0 | **Tarih:** Mart 2026 | **Ölçek:** Çoklu Hastane

---

## ══════════════════════════════════════════════
## BÖLÜM A — MASTER PROMPT (CLAUDE İÇİN BAĞLAM)
## ══════════════════════════════════════════════

### A.1 SEN KİMSİN & NE İNŞA EDİYORUZ

Sen deneyimli bir full-stack developer'sın. Birlikte **çoklu hastane desteğine sahip profesyonel bir SaaS LMS (Learning Management System)** sistemi inşa ediyoruz.

Bu sistem **3 katmanlı bir panel mimarisine** sahiptir:

```
┌─────────────────────────────────────────────────────────────┐
│  🔵 SÜPER ADMİN PANELİ  (Proje Sahibi / SaaS Operatörü)   │
│  • Tüm hastaneleri yönetir                                   │
│  • Lisans & abonelik oluşturur                              │
│  • Platform geneli raporlar görür                           │
│  • Yeni hastane kaydı yapar, admin atar                     │
├─────────────────────────────────────────────────────────────┤
│  🟢 HASTANE ADMİN PANELİ  (Tenant Admin — Her hastane için)│
│  • Kendi hastanesindeki eğitimleri yönetir                  │
│  • Personelini yönetir, atar, raporlar                      │
│  • Kendi hastanesi kapsamında çalışır                       │
├─────────────────────────────────────────────────────────────┤
│  ⚪ PERSONEL PANELİ  (Son Kullanıcı)                        │
│  • Atanan eğitimleri izler, sınava girer                    │
│  • Kendi ilerleme ve sonuçlarını görür                      │
└─────────────────────────────────────────────────────────────┘
```

**Hedef:** Proje bittiğinde birden fazla hastaneye pazarlanabilir, premium, production-ready bir SaaS LMS sistemi ortaya çıkmalı.

---

### A.2 TEKNOLOJİ STACK (ÖZET)

```
Frontend:   Next.js 15 (App Router) + TypeScript
UI:         shadcn/ui + Tailwind CSS 4
Tema:       next-themes (aydınlık/karanlık)
State:      Zustand 5
Form:       React Hook Form 7 + Zod 3
Tablo:      TanStack Table 8
Grafik:     Recharts 2
Takvim:     FullCalendar 6
Video:      React Player (özel, hızlandırma engelli)
Animasyon:  Framer Motion

Backend:    Node.js 22 LTS + Fastify 5 + TypeScript
ORM:        Prisma 6
Auth:       Supabase Auth (JWT + RLS)
Realtime:   Supabase Realtime (WebSocket)
Queue:      BullMQ + Redis (Upstash)
Mail:       Nodemailer
Log:        Winston
Cron:       node-cron
Export:     ExcelJS + Puppeteer (PDF)

Veritabanı: PostgreSQL 16 (Supabase Cloud)
Video CDN:  AWS S3 + CloudFront (HLS streaming)
Hosting:    Vercel (frontend) + Supabase (backend)
Paket Mgr:  pnpm
```

---

### A.3 21ST.DEV MCP KULLANIM KURALLARI

Bu projede **21st.dev MCP** aktif olarak kullanılacak:

```
✅ Her yeni UI bileşeni yazmadan ÖNCE 21st.dev'de ara
✅ Sidebar, navbar, data table, card, chart gibi bileşenler için önce 21st.dev'den getir
✅ shadcn/ui registry'den de bileşen çek (form, dialog, dropdown için)
✅ Getirilen bileşeni projenin renk sistemi ve font'larına uyarla
✅ 21st.dev bileşeni varsa sıfırdan yazma

❌ Generic, düz tasarımlı bileşenler üretme
❌ 21st.dev'e bakmadan kendi bileşenlerinle ilerleme
❌ Tailwind'in varsayılan renklerini (indigo-500, blue-600 vb.) doğrudan kullanma
```

**21st.dev Arama Terimleri:**

| Bileşen | Arama Terimi |
|---------|-------------|
| Sidebar navigasyon | `dashboard sidebar collapsible` |
| İstatistik kartı | `metric stat card with trend` |
| Veri tablosu | `data table sortable filterable` |
| Grafik kartı | `chart card line bar recharts` |
| Bildirim dropdown | `notification bell popover` |
| Avatar + badge | `user avatar status badge` |
| Progress indicator | `step wizard progress bar` |
| Video player | `custom video player controls` |
| Dosya upload zone | `file upload drag drop` |
| Tarih aralığı seçici | `date range picker` |
| Sonuç ekranı | `quiz result score card` |
| Boş durum ekranı | `empty state illustration` |

---

### A.4 TASARIM SİSTEMİ (ÖZET)

**Referans:** EduCore LMS Dashboard (Dribbble) — layout, kartlar, tablolar ve sidebar yapısı bu tasarıma benzer şekilde uygulanacak.

**Estetik:** Industrial/Utilitarian + Premium Dark karışımı. Kurumsal sağlık platformuna yakışır: temiz, güvenilir, modern, premium.

**Font Sistemi:**
```
Display/Heading: Syne (700, 800)        ← ASLA Inter/Roboto/Arial kullanma
Body:            DM Sans (400-600)
Mono/Veri:       JetBrains Mono (400-500)
```

**Renk Özeti:**
```css
/* Aydınlık */   --color-primary: #1a6b4e  (koyu yeşil) | --color-accent: #e67e22 (turuncu)
/* Karanlık */   --color-primary: #34d399  (parlak yeşil) | --color-bg: #0c0f14 (derin koyu)
```

**Animasyon:**
```
✅ Sadece transform ve opacity | ✅ cubic-bezier(0.16, 1, 0.3, 1)
❌ transition-all ASLA | ❌ Her şeyi animate etme
```

**Layout İlkeleri:**
- Sol: sabit, collapsible sidebar (280px) + logo + menü grupları + kullanıcı bilgisi
- Üst: sticky topbar — başlık, arama, bildirim çanı, tema toggle, avatar
- İçerik: stat kartları → grafik → tablo hiyerarşisi
- Kartlar: hover'da subtle yükseliş + sol kenarda 4px renkli border accent

---

### A.5 ROTA YAPISI

```
/login

── 🔵 SÜPER ADMİN (Proje Sahibi) ──────────────────────────────
/(super-admin)/dashboard
/(super-admin)/hospitals         /(super-admin)/hospitals/new
/(super-admin)/hospitals/[id]    /(super-admin)/hospitals/[id]/edit
/(super-admin)/subscriptions
/(super-admin)/reports
/(super-admin)/settings
/(super-admin)/audit-logs

── 🟢 HASTANE ADMİN (Tenant) ───────────────────────────────────
/(admin)/dashboard
/(admin)/trainings          /(admin)/trainings/new    /(admin)/trainings/[id]
/(admin)/trainings/[id]/edit
/(admin)/staff              /(admin)/staff/[id]
/(admin)/reports
/(admin)/notifications      /(admin)/audit-logs
/(admin)/backups            /(admin)/settings

── ⚪ PERSONEL ──────────────────────────────────────────────────
/(staff)/dashboard
/(staff)/my-trainings       /(staff)/my-trainings/[id]
/(staff)/my-trainings/[id]/pre-exam
/(staff)/my-trainings/[id]/videos
/(staff)/my-trainings/[id]/post-exam
/(staff)/calendar           /(staff)/notifications    /(staff)/profile
```

---

### A.6 ÇALIŞMA YÖNTEMİ

**Başlangıç Sırası:**
```
1. pnpm ile Next.js 15 projesi oluştur (TypeScript, App Router, Tailwind)
2. shadcn/ui init
3. 21st.dev MCP bağlantısını doğrula
4. globals.css'e CSS variables sistemini kur (aydınlık + karanlık)
5. Google Fonts import (Syne + DM Sans + JetBrains Mono)
6. Supabase projesi oluştur, bağla
7. Prisma schema yaz, migration çalıştır
8. Auth sistemi kur (Supabase Auth + middleware + rol bazlı yönlendirme)
   → super_admin  → /(super-admin)/dashboard
   → admin        → /(admin)/dashboard
   → staff        → /(staff)/dashboard
9. Layout bileşenlerini oluştur (SuperAdminLayout, AdminLayout, StaffLayout)
10. Sayfa sayfa ilerle: önce Super Admin, sonra Admin, sonra Staff
```

**Her Sayfayı Yaparken:**
```
1. 21st.dev'den ilgili bileşenleri ara ve getir
2. Sayfanın temel layout'unu iskelet olarak oluştur
3. Mock data ile görünümü tamamla
4. API bağlantısını ekle
5. Loading / error / empty state'leri ekle
6. Responsive düzenlemeleri yap
7. Aydınlık/karanlık tema uyumunu kontrol et
```

---

### A.7 KRİTİK UYARILAR

```
⚠️  ASLA mor gradient + beyaz arka plan kombinasyonu kullanma
⚠️  ASLA Inter, Roboto, system-ui kullanma (Syne + DM Sans kullan)
⚠️  ASLA transition-all kullanma
⚠️  ASLA varsayılan Tailwind renklerini doğrudan kullanma
⚠️  Video hızlandırma KESİNLİKLE engellenecek (frontend + backend)
⚠️  Sınav zamanlayıcısı SADECE server-side (Redis)
⚠️  Tüm API route'larında auth middleware kontrol edilecek
⚠️  RLS Supabase'de tüm tablolarda aktif olacak
⚠️  Revizyon istendiğinde SADECE ilgili dosyalara dokunulacak
⚠️  Çalışan kodu "iyileştirme" adı altında değiştirme
```

---

### A.8 BAŞLAMAK İÇİN İLK KOMUT

```
"Yukarıdaki spesifikasyona göre projeyi başlat.
Önce proje kurulumu ve CSS variables sistemini kur,
ardından 21st.dev'den sidebar ve topbar bileşenlerini getirip
AdminLayout'u oluştur. Her adımı bana göster."
```

---

## ══════════════════════════════════════════════
## BÖLÜM B — TAM TEKNİK SPESİFİKASYON
## ══════════════════════════════════════════════

## 1. TEKNOLOJİ STACK (DETAY)

### 1.1 Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **Next.js** | 15.x | React tabanlı SSR/SSG framework |
| **TypeScript** | 5.x | Tip güvenliği |
| **shadcn/ui** | Latest | UI bileşen kütüphanesi |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **next-themes** | Latest | Aydınlık/Karanlık tema |
| **React Hook Form** | 7.x | Form yönetimi |
| **Zod** | 3.x | Form ve veri doğrulama |
| **TanStack Table** | 8.x | Gelişmiş tablo/filtreleme |
| **Recharts** | 2.x | Grafik ve raporlama |
| **FullCalendar** | 6.x | Takvim bileşeni |
| **React Player** | Latest | Video oynatıcı (hızlandırma engelli) |
| **date-fns** | 3.x | Tarih işlemleri |
| **Zustand** | 5.x | Global state yönetimi |
| **Framer Motion** | Latest | Animasyon kütüphanesi |
| **next-intl** | Latest | Çoklu dil desteği (TR/EN) |

### 1.2 Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **Node.js** | 22.x LTS | Runtime ortamı |
| **Fastify** | 5.x | Hızlı HTTP framework |
| **TypeScript** | 5.x | Tip güvenliği |
| **Prisma ORM** | 6.x | Veritabanı ORM, migration |
| **Supabase JS SDK** | 2.x | Supabase servislerine erişim |
| **Bull MQ** | 5.x | Kuyruk sistemi (video işleme, bildirim) |
| **Nodemailer** | 6.x | E-posta bildirimleri |
| **Winston** | 3.x | Loglama |
| **node-cron** | 3.x | Zamanlanmış görevler |
| **ExcelJS** | 4.x | Excel rapor çıktısı |
| **PDFKit / Puppeteer** | Latest | PDF rapor çıktısı |
| **jsonwebtoken** | 9.x | JWT token yönetimi |
| **bcrypt** | 5.x | Şifre hashleme |

### 1.3 Veritabanı & Altyapı
| Teknoloji | Açıklama |
|-----------|----------|
| **PostgreSQL 16** | Ana ilişkisel veritabanı (Supabase üzerinde) |
| **Supabase** | BaaS: Auth, Realtime, Storage, Edge Functions |
| **Redis (Upstash)** | Oturum önbellekleme, sınav zamanlayıcı, kuyruk |
| **AWS S3** | Video dosyalarının depolanması |
| **AWS CloudFront** | CDN ile hızlı video streaming |
| **HLS** | Adaptif video streaming protokolü |
| **FFmpeg** | Video dönüştürme ve HLS segmentleme |

### 1.4 Hosting & DevOps
| Teknoloji | Açıklama |
|-----------|----------|
| **Vercel** | Next.js frontend hosting, CI/CD |
| **Supabase Cloud** | PostgreSQL + Auth + Storage + Realtime |
| **GitHub Actions** | CI/CD pipeline |
| **Sentry** | Hata takibi |
| **Vercel Analytics** | Performans izleme |
| **ESLint + Prettier** | Kod kalitesi |
| **Vitest** | Unit/integration test |
| **Playwright** | E2E test |

---

## 2. VERİTABANI ŞEMASI

### 2.1 Tablolar

#### `subscription_plans` (Abonelik Planları — Süper Admin tanımlar)
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- 'Başlangıç', 'Profesyonel', 'Kurumsal'
  slug VARCHAR(50) UNIQUE NOT NULL,     -- 'starter', 'pro', 'enterprise'
  description TEXT,
  max_staff INTEGER,                    -- NULL = sınırsız
  max_trainings INTEGER,                -- NULL = sınırsız
  max_storage_gb INTEGER DEFAULT 10,
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  features JSONB DEFAULT '[]',          -- ['Audit Log', 'Excel Export', ...]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `organizations` (Hastaneler)
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_suspended BOOLEAN DEFAULT false,
  suspended_reason TEXT,
  suspended_at TIMESTAMPTZ,
  created_by UUID,                      -- super_admin user id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `organization_subscriptions` (Hastane Abonelikleri)
```sql
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'trial'
    CHECK (status IN ('trial', 'active', 'suspended', 'expired', 'cancelled')),
  billing_cycle VARCHAR(10) CHECK (billing_cycle IN ('monthly', 'annual')),
  trial_ends_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)               -- Her hastanede 1 aktif abonelik
);
```

#### `users` (Kullanıcılar)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  tc_no VARCHAR(11) UNIQUE,
  phone VARCHAR(20),
  department VARCHAR(100),
  title VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `trainings` (Eğitimler)
```sql
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  thumbnail_url TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  exam_duration_minutes INTEGER NOT NULL DEFAULT 30,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `training_videos` (Eğitim Videoları)
```sql
CREATE TABLE training_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_key TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `questions` (Sorular) & `question_options` (Şıklar)
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice',
  points INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

#### `training_assignments` (Eğitim Atamaları)
```sql
CREATE TABLE training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'in_progress', 'passed', 'failed', 'locked')),
  current_attempt INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(training_id, user_id)
);
```

#### `exam_attempts` (Sınav Denemeleri)
```sql
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES training_assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  training_id UUID REFERENCES trainings(id),
  attempt_number INTEGER NOT NULL,
  pre_exam_score DECIMAL(5,2),
  post_exam_score DECIMAL(5,2),
  pre_exam_started_at TIMESTAMPTZ,
  pre_exam_completed_at TIMESTAMPTZ,
  post_exam_started_at TIMESTAMPTZ,
  post_exam_completed_at TIMESTAMPTZ,
  videos_completed_at TIMESTAMPTZ,
  is_passed BOOLEAN DEFAULT false,
  status VARCHAR(30) DEFAULT 'pre_exam'
    CHECK (status IN ('pre_exam', 'watching_videos', 'post_exam', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `exam_answers` (Sınav Cevapları)
```sql
CREATE TABLE exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  exam_phase VARCHAR(10) CHECK (exam_phase IN ('pre', 'post')),
  answered_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `video_progress` (Video İzleme Takibi)
```sql
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  video_id UUID REFERENCES training_videos(id),
  user_id UUID REFERENCES users(id),
  watched_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, video_id)
);
```

#### `notifications`, `audit_logs`, `db_backups`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  related_training_id UUID REFERENCES trainings(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE db_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  backup_type VARCHAR(20) CHECK (backup_type IN ('auto', 'manual')),
  file_url TEXT NOT NULL,
  file_size_mb DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'completed',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 İndeksler
```sql
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_org_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX idx_trainings_org ON trainings(organization_id);
CREATE INDEX idx_trainings_dates ON trainings(start_date, end_date);
CREATE INDEX idx_assignments_user ON training_assignments(user_id);
CREATE INDEX idx_assignments_training ON training_assignments(training_id);
CREATE INDEX idx_assignments_status ON training_assignments(status);
CREATE INDEX idx_attempts_assignment ON exam_attempts(assignment_id);
CREATE INDEX idx_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
```

### 2.3 Rol Yetkilendirme Özeti (RLS)

| Rol | Erişim Kapsamı |
|-----|---------------|
| `super_admin` | Tüm tablolar, tüm organizasyonlar — RLS bypass |
| `admin` | Yalnızca kendi `organization_id`'sine ait kayıtlar |
| `staff` | Yalnızca kendine atanan kayıtlar |

---

## 3. KULLANICI AKIŞLARI

### 3.1 Personel Eğitim Akışı

```
[Personel Girişi]
       │
       ▼
[Dashboard — Atanan Eğitimler + Takvim]
       │
       ▼
[Eğitime Tıkla]
       │
       ▼
┌─── DENEME 1 ────────────────────────────┐
│  [ÖN SINAV] (Süreli)                    │
│       ↓                                  │
│  [EĞİTİM VİDEOLARI]                     │
│  • Hızlandırma ENGELLİ                  │
│  • Tüm videolar izlenmeli               │
│       ↓                                  │
│  [SON SINAV] (Süreli, sorular KARIŞIK)  │
│       ↓                                  │
│  GEÇTİ → BAŞARILI                       │
│  KALDI → Deneme 2'ye geç               │
└──────────────────────────────────────────┘

┌─── DENEME 2 & 3 (Ön sınav YOK) ────────┐
│  [EĞİTİM VİDEOLARI] → [SON SINAV]      │
│  GEÇTİ → BAŞARILI                       │
│  3. denemede de kaldı → KİLİTLENDİ     │
│  (Admin yeni deneme hakkı verebilir)    │
└──────────────────────────────────────────┘
```

### 3.2 Admin Eğitim Oluşturma Akışı

```
[Yeni Eğitim] → ADIM 1: Bilgiler → ADIM 2: Videolar
             → ADIM 3: Sorular  → ADIM 4: Personel Atama
             → Önizle & Yayınla → Personellere Bildirim
```

---

## 4. SAYFA YAPISI VE ÖZELLİKLER

---

### 4.0 🔵 SÜPER ADMİN PANELİ (Proje Sahibi)

> Bu panel yalnızca proje sahibine özel, izole bir rota grubunda çalışır (`/(super-admin)/`). Hiçbir hastane admini veya personel bu panele erişemez.

#### Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR: Platform Adı | 🔔 | Tema | Avatar (Süper Admin)    │
├────────────┬─────────────────────────────────────────────────┤
│  SIDEBAR   │  6 STAT KARTI                                   │
│            │  [Toplam Hastane] [Aktif Abonelik] [Askıya Al.] │
│  - Dashboard│  [Toplam Personel] [Aktif Eğitim] [Gelir (₺)] │
│  - Hastaneler├─────────────────────────────────────────────── │
│  - Abonelikler│  Grafik: Aylık yeni kayıt + abonelik trendi  │
│  - Raporlar ├──────────────────┬──────────────────────────── │
│  - Ayarlar  │  Son Kayıt Olan  │  Aboneliği Sona Yaklaşan   │
│  - Audit Log│  Hastaneler (5)  │  Hastaneler (5)             │
└────────────┴──────────────────┴──────────────────────────────┘
```

#### Hastane Yönetimi (`/(super-admin)/hospitals`)
- **Liste:** TanStack Table — Hastane adı, kod, aktif personel sayısı, eğitim sayısı, abonelik planı, durum badge (Aktif / Trial / Askıda / Süresi Doldu)
- **Filtreler:** Plan, Durum, Kayıt Tarihi, Arama (isim/kod)
- **Yeni Hastane Ekleme:**
  - Hastane bilgileri (ad, kod, adres, logo, iletişim)
  - Hastane Admin kullanıcısı oluştur (ad, email, şifre)
  - Abonelik planı ve bitiş tarihi seç
  - E-posta ile giriş bilgilerini gönder
- **Hastane Detay (`/(super-admin)/hospitals/[id]`):**
  - Genel istatistikler (personel, eğitim, tamamlanma oranı)
  - Abonelik bilgisi ve geçmişi
  - Admin kullanıcıları listesi
  - Son aktiviteler
  - **Aksiyon Butonları:** Düzenle | Askıya Al | Aktive Et | Abonelik Düzenle

#### Abonelik & Lisans Yönetimi (`/(super-admin)/subscriptions`)
- Plan listesi: Tüm planlar + fiyatları (Başlangıç / Profesyonel / Kurumsal)
- Hastane bazlı abonelik durumu tablosu
- **Plan Oluşturma/Düzenleme:**
  - Ad, açıklama, limitler (personel, eğitim, depolama)
  - Aylık/Yıllık fiyat, özellik listesi (JSONB)
- **Abonelik Güncelleme:** Plan değiştir, bitiş tarihi uzat, trial başlat, iptal et
- **Durum Badge Renkleri:** Yeşil=Aktif | Mavi=Trial | Turuncu=Süresi Yakın | Kırmızı=Süresi Doldu | Gri=Askıda

#### Global Raporlar (`/(super-admin)/reports`)
- Platform geneli tamamlanma oranı
- En aktif/pasif hastaneler karşılaştırması
- Abonelik geliri özeti (aylık/yıllık)
- **Export:** Excel + PDF

#### Platform Ayarları (`/(super-admin)/settings`)
- Global SMTP e-posta yapılandırması
- Platform adı, logo, renk temaları
- Varsayılan depolama limitleri
- Bakım modu toggle
- API key yönetimi

#### Platform Audit Log (`/(super-admin)/audit-logs`)
- Tüm hastanelerdeki tüm sistem işlemleri
- Filtreler: Hastane, Kullanıcı, İşlem Türü, Tarih
- Şüpheli aktivite tespiti (çok sayıda başarısız giriş, toplu silme vb.)

---

### 4.1 ⚪ PERSONEL PANELİ (Son Kullanıcı)

#### Dashboard
- 4 stat kart: Atanan / Devam Eden / Tamamlanan / Başarısız
- Yaklaşan eğitimler (deadline uyarısı)
- Son aktiviteler, mini takvim, bildirim feed'i

#### Eğitimlerim
- Filtreler: Durum, Kategori, Tarih Aralığı
- Her kart: Başlık, Durum badge, Kalan Deneme, Progress bar

#### Eğitim Detay
- Açıklama, video listesi, sınav bilgileri
- Deneme geçmişi (her denemede alınan puan)
- "Eğitime Başla" / "Devam Et" butonu

#### Sınav Sayfası
```
┌──────────────────────────────────────────────────┐
│  Eğitim Adı | Ön Sınav | Soru 3/10 | ⏱ 12:45   │
│  ─────────────────────────────────── progress ─  │
├───────────────────────────────────┬──────────────┤
│  SORU METNİ                       │  SORULAR     │
│  A) Şık  B) Şık  C) Şık  D) Şık  │  NAVİGASYON  │
│  [← Önceki]  [Sonraki →]         │  1✅ 2✅ 3● │
│              [Sınavı Bitir]       │  4○ 5○ ...  │
└───────────────────────────────────┴──────────────┘
```

#### Video İzleme Sayfası
```
┌────────────────────────────────┬──────────────────┐
│  VİDEO PLAYER (özel)           │  VİDEO LİSTESİ   │
│  • Hızlandırma YOK             │  ✅ Video 1       │
│  • İleri sarma YOK             │  ▶ Video 2 (aktif)│
│  • Download YOK                │  ○ Video 3       │
│  • Heartbeat her 10 sn         │  [Son Sınava Git]│
└────────────────────────────────┴──────────────────┘
```

#### Takvim
- Aylık/Haftalık/Günlük görünüm
- Renk kodları: Yeşil (tamamlandı), Turuncu (devam), Kırmızı (yaklaşan), Gri (kilitli)

#### Bildirimler
- Okundu/Okunmadı durumu, toplu okundu işareti

#### Profilim
- Kişisel bilgiler, şifre, tema tercihi, bildirim tercihleri

---

### 4.2 🟢 HASTANE ADMİN PANELİ (Tenant Admin)

> Her hastane admini yalnızca kendi `organization_id`'sine ait verileri görür ve yönetir. Süper Admin paneline erişimi yoktur.

#### Dashboard
```
┌─────────────────────────────────────────────────┐
│  TOPBAR: Başlık | Arama | Bildirim | Tema | Avatar│
├────────────┬────────────────────────────────────┤
│  SIDEBAR   │  BANNER: Dikkat gerektiren bildirim │
│            ├──────────┬──────────┬──────────────┤
│  - Logo    │ Stat 1   │ Stat 2   │ Stat 3       │
│  - Nav     ├──────────┴──────────┴──────────────┤
│    grupları│  Grafik: Tamamlanma Trendi (geniş)  │
│  ───────  ├──────────────────┬─────────────────┤
│  Settings  │  Top Performers  │  Son Aktiviteler│
│  User Info │  (5 personel)    │                 │
└────────────┴──────────────────┴─────────────────┘
```

#### Eğitim Yönetimi
- Liste: Filtreler (Durum, Kategori, Tarih, Oluşturan) + TanStack Table
- Oluşturma/Düzenleme: 4 adımlı wizard (Bilgiler → Videolar → Sorular → Atama)
- Detay: Stat kartları + Sekmeler (Personel Listesi / Videolar / Sorular)
- Her personel için: Kaçıncı denemede, ön/son puan, tamamlama tarihi
- Filtreler + Excel/PDF export

#### Personel Yönetimi
- Liste: Filtreler (Departman, Unvan, Durum) + Arama (isim, TC, email)
- Toplu import (Excel), yeni personel ekleme
- Detay: Tüm eğitimler, her deneme puanları, başarı oranı, zaman çizelgesi
- Yeni deneme hakkı verme butonu (kilitli eğitimler için)

#### Raporlar (6 Tür)
1. Genel Özet — Filtreler: Tarih, Departman, Kategori
2. Eğitim Bazlı — Filtreler: Eğitim, Departman, Durum, Puan Aralığı
3. Personel Bazlı — Filtreler: Personel, Tarih, Durum
4. Departman Bazlı — Karşılaştırmalı başarı oranları
5. Başarısızlık Raporu — 3 denemede geçemeyen personeller
6. Süre Analiz Raporu — Ortalama izleme ve sınav süreleri

**Her raporda:** Tablo ↔ Grafik toggle | [📥 Excel] [📄 PDF] [🖨 Yazdır]

#### Bildirimler Yönetimi
- Otomatik bildirim ayarları, şablonlar, geçmiş
- Manuel bildirim gönderme (tekli / toplu)

#### İşlem Geçmişi (Audit Log)
- Tüm sistem işlemleri — Kim, ne zaman, ne yaptı, eski/yeni değer
- Filtreler: Kullanıcı, İşlem Türü, Tarih, Modül

#### Veritabanı Yedekleme
- Otomatik (günlük/haftalık) + Manuel yedek
- İndirme, geri yükleme, yedek geçmişi

#### Ayarlar
- Varsayılan baraj puanı/deneme hakkı, SMTP, logo/marka, tema

---

## 5. VIDEO HIZLANDIRMA ENGELLEME STRATEJİSİ

### 5.1 Frontend Kontrolleri
```
- HTML5 Video API: playbackRate = 1.0 (sabit, değiştirilemez)
- playbackRate değişikliği event listener ile engelleme
- Sağ tık menüsü devre dışı (video üzerinde)
- Keyboard shortcut engelleme (hızlandırma tuşları)
- Video progress bar'da ileri sarma engeli
- Picture-in-Picture modu devre dışı
- DevTools açık mı kontrolü
```

### 5.2 Backend Kontrolleri
```
- Video izleme süresi sunucu tarafında doğrulama
- Periyodik heartbeat (her 10 saniye izleme bilgisi gönderme)
- İzleme süresi < video süresi ise tamamlanmadı sayılır
- Anormal hız tespiti (çok kısa sürede tamamlama)
- Signed URL ile video erişimi (paylaşılamaz, 2 saat süreli)
```

---

## 6. SINAV SİSTEMİ DETAYLARI

### 6.1 Soru Karıştırma
```
ÖN SINAV → Sorular orijinal sırada, şıklar orijinal sırada
SON SINAV → Sorular KARIŞIK + Şıklar KARIŞIK
           (Seed: attempt_id + user_id — deterministik shuffle)
```

### 6.2 Puanlama
```
Toplam Puan    = Doğru Cevap Sayısı × Soru Puanı (varsayılan: 10)
Yüzdelik Puan = (Alınan Puan / Toplam Puan) × 100
Baraj Puanı   = Admin'in belirlediği minimum geçme puanı (varsayılan: 70)
```

### 6.3 Sınav Zamanlayıcı
```
- Süre Redis'te tutulur (manipülasyon engeli)
- Başlangıç zamanı sunucuda kaydedilir
- Frontend sadece geri sayım gösterir
- Süre dolunca otomatik teslim (backend zorlamalı)
- Sayfa yenilemede kalan süre korunur
- İnternet kesintisinde süre akmaya devam eder
```

---

## 7. BİLDİRİM SİSTEMİ

### 7.1 Bildirim Türleri
| Olay | Alan | Yöntem |
|------|------|--------|
| Yeni eğitim atandı | Personel | Uygulama içi + E-posta |
| Bitiş tarihi 3 gün kaldı | Personel | Uygulama içi + E-posta |
| Bitiş tarihi 1 gün kaldı | Personel | Uygulama içi + E-posta |
| Bitiş tarihi güncellendi | Personel | Uygulama içi |
| Yeni deneme hakkı verildi | Personel | Uygulama içi + E-posta |
| Sınav sonucu (başarılı/başarısız) | Personel | Uygulama içi |
| 3 deneme hakkı tükendi | Admin | Uygulama içi |
| Tamamlanma oranı düşük | Admin | Uygulama içi |

### 7.2 Realtime Bildirimler
- Supabase Realtime (WebSocket) ile anlık bildirim
- Bildirim çanı (okunmamış sayacı) + dropdown menü

---

## 8. UI/UX TASARIM STANDARTLARI & STİL REHBERİ

> Bu bölüm, LMS panelinin profesyonel, akılda kalıcı ve production-ready olmasını garanti eder.
> Generic "AI slop" estetikten tamamen kaçınılacaktır.

### 8.1 Tasarım Felsefesi

**Seçilen Estetik:** `Industrial / Utilitarian` + `Dark Cinematic` karışımı — kasıtlı güzel, dekoratif değil.

### 8.2 Tipografi Sistemi

**Font Eşleştirmesi:**
| Kullanım | Font | Ağırlık |
|----------|------|---------|
| Display / Heading | **Syne** | 700-800 |
| Body / Paragraf | **DM Sans** | 400-600 |
| Mono / Kod / Veri | **JetBrains Mono** | 400-500 |

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

h1 { font-size: clamp(2.5rem, 5vw + 1rem, 3.5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; }
h2 { font-size: clamp(1.8rem, 3vw + 0.5rem, 2.5rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; }
h3 { font-size: clamp(1.3rem, 2vw + 0.5rem, 1.75rem); font-weight: 700; line-height: 1.2; }
p  { font-size: clamp(1rem, 1vw + 0.5rem, 1.125rem); line-height: 1.6; }
.label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
```

### 8.3 Renk & Tema Sistemi (Tam CSS)

```css
:root {
  /* ── AYDINLIK TEMA ── */
  --color-primary: #1a6b4e;
  --color-primary-hover: #145a41;
  --color-primary-light: #e8f5ef;
  --color-primary-rgb: 26, 107, 78;
  --color-secondary: #2c3e50;
  --color-accent: #e67e22;
  --color-accent-hover: #d35400;

  --color-bg: #f8f9fa;
  --color-bg-rgb: 248, 249, 250;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-border-hover: #d1d5db;

  --color-success: #059669;  --color-success-bg: #ecfdf5;
  --color-warning: #d97706;  --color-warning-bg: #fffbeb;
  --color-error: #dc2626;    --color-error-bg: #fef2f2;
  --color-info: #2563eb;     --color-info-bg: #eff6ff;

  --space-xs:4px; --space-sm:8px; --space-md:16px; --space-lg:24px;
  --space-xl:32px; --space-2xl:48px; --space-3xl:64px; --space-4xl:96px;

  --radius-sm:4px; --radius-md:8px; --radius-lg:12px;
  --radius-xl:16px; --radius-2xl:24px; --radius-full:9999px;

  --shadow-sm: 0 1px 2px rgba(26,26,46,.04), 0 1px 3px rgba(26,26,46,.06);
  --shadow-md: 0 4px 6px rgba(26,26,46,.04), 0 2px 12px rgba(26,26,46,.08);
  --shadow-lg: 0 8px 16px rgba(26,26,46,.06), 0 4px 24px rgba(26,26,46,.1);
  --shadow-xl: 0 16px 32px rgba(26,26,46,.08), 0 8px 48px rgba(26,26,46,.12);
  --shadow-card-hover: 0 12px 28px rgba(26,107,78,.08), 0 4px 16px rgba(26,26,46,.06);

  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --transition-fast: 150ms cubic-bezier(0.16,1,0.3,1);
  --transition-base: 250ms cubic-bezier(0.16,1,0.3,1);
  --ease-out-expo: cubic-bezier(0.16,1,0.3,1);
  --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
}

/* ── KARANLIK TEMA ── */
[data-theme="dark"], .dark {
  --color-primary: #34d399;
  --color-primary-hover: #6ee7b7;
  --color-primary-light: rgba(52,211,153,.1);
  --color-primary-rgb: 52, 211, 153;
  --color-accent: #f59e0b;

  --color-bg: #0c0f14;
  --color-bg-rgb: 12, 15, 20;
  --color-surface: #151921;
  --color-surface-elevated: #1c2130;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-border: #1e293b;
  --color-border-hover: #334155;

  --color-success: #34d399;  --color-success-bg: rgba(52,211,153,.1);
  --color-warning: #fbbf24;  --color-warning-bg: rgba(251,191,36,.1);
  --color-error: #f87171;    --color-error-bg: rgba(248,113,113,.1);
  --color-info: #60a5fa;     --color-info-bg: rgba(96,165,250,.1);

  --shadow-sm: 0 1px 2px rgba(0,0,0,.2), 0 1px 3px rgba(0,0,0,.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,.2), 0 2px 12px rgba(0,0,0,.3);
  --shadow-lg: 0 8px 16px rgba(0,0,0,.25), 0 4px 24px rgba(0,0,0,.35);
  --shadow-card-hover: 0 12px 28px rgba(52,211,153,.06), 0 4px 16px rgba(0,0,0,.3);
}
```

### 8.4 Bileşen Standartları (CSS)

```css
/* Butonlar */
.btn-primary {
  display:inline-flex; align-items:center; gap:8px;
  padding:12px 24px; font-family:var(--font-body); font-size:14px; font-weight:600;
  color:white; background:var(--color-primary); border:none; border-radius:var(--radius-md);
  cursor:pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
  /* ASLA transition-all kullanma */
}
.btn-primary:hover { background:var(--color-primary-hover); transform:translateY(-1px); box-shadow:var(--shadow-md); }
.btn-primary:active { transform:translateY(0); }
.btn-primary:focus-visible { outline:2px solid var(--color-primary); outline-offset:3px; }

.btn-ghost { padding:12px 24px; font-weight:600; color:var(--color-text-primary);
  background:transparent; border:1.5px solid var(--color-border); border-radius:var(--radius-md);
  transition: border-color var(--transition-fast), color var(--transition-fast); }
.btn-ghost:hover { border-color:var(--color-primary); color:var(--color-primary); }

/* Kartlar */
.card { background:var(--color-surface); border:1px solid var(--color-border);
  border-radius:var(--radius-lg); padding:var(--space-xl);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base); }
.card:hover { transform:translateY(-2px); box-shadow:var(--shadow-card-hover); border-color:var(--color-primary); }

.stat-card { border-left:4px solid var(--color-primary); }

.training-card { position:relative; overflow:hidden; }
.training-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:4px;
  background:var(--color-primary); transform:scaleX(0); transform-origin:left;
  transition: transform 0.4s var(--ease-out-expo); }
.training-card:hover::before { transform:scaleX(1); }

/* Sidebar */
.sidebar { position:fixed; top:0; left:0; width:280px; height:100vh;
  background:var(--color-surface); border-right:1px solid var(--color-border);
  padding:var(--space-lg); z-index:50; overflow-y:auto; }

.nav-item { display:flex; align-items:center; gap:var(--space-sm); padding:10px 16px;
  border-radius:var(--radius-md); color:var(--color-text-secondary); font-weight:500;
  transition: background var(--transition-fast), color var(--transition-fast); }
.nav-item:hover, .nav-item.active { background:var(--color-primary-light); color:var(--color-primary); }
.nav-item.active { font-weight:600; }

.topbar { position:sticky; top:0; z-index:40; padding:var(--space-md) var(--space-lg);
  backdrop-filter:blur(12px); background:rgba(var(--color-bg-rgb),.85);
  border-bottom:1px solid var(--color-border); }

/* Input */
.input { width:100%; padding:12px 16px; font-family:var(--font-body); font-size:14px;
  color:var(--color-text-primary); background:var(--color-surface);
  border:1.5px solid var(--color-border); border-radius:var(--radius-md); outline:none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }
.input:focus { border-color:var(--color-primary); box-shadow:0 0 0 3px rgba(var(--color-primary-rgb),.12); }
.input.error { border-color:var(--color-error); }

/* Badge */
.badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px;
  font-size:12px; font-weight:600; border-radius:var(--radius-full); letter-spacing:.02em; }
.badge-success { background:var(--color-success-bg); color:var(--color-success); }
.badge-warning { background:var(--color-warning-bg); color:var(--color-warning); }
.badge-error   { background:var(--color-error-bg);   color:var(--color-error); }
.badge-info    { background:var(--color-info-bg);     color:var(--color-info); }
```

### 8.5 Animasyon Sistemi

```css
@keyframes fadeInUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes scaleIn   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
@keyframes slideInLeft { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }

.animate-in { opacity:0; animation:fadeInUp .6s var(--ease-out-expo) forwards; }
.stagger-1{animation-delay:.05s} .stagger-2{animation-delay:.1s} .stagger-3{animation-delay:.15s}
.stagger-4{animation-delay:.2s}  .stagger-5{animation-delay:.25s} .stagger-6{animation-delay:.3s}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
}
```

### 8.6 Arka Plan & Görsel Derinlik

```css
/* Aydınlık */
.app-bg {
  background:
    radial-gradient(ellipse at 10% 20%, rgba(26,107,78,.03) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, rgba(230,126,34,.02) 0%, transparent 50%),
    var(--color-bg);
}
/* Karanlık */
.dark .app-bg {
  background:
    radial-gradient(ellipse at 10% 20%, rgba(52,211,153,.03) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, rgba(245,158,11,.02) 0%, transparent 50%),
    var(--color-bg);
}
/* Grain texture */
.grain-overlay::after { content:''; position:fixed; top:0; left:0; width:100%; height:100%;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events:none; z-index:9999; }
```

### 8.7 Anti-Pattern Listesi

| YAPMA | YAP |
|-------|-----|
| Inter, Roboto, Arial kullanma | Syne + DM Sans + JetBrains Mono |
| Mor gradient + beyaz arka plan | Kurumsal yeşil + turuncu accent |
| Varsayılan Tailwind renkleri | Custom CSS variables |
| `transition-all` kullanma | Spesifik property'leri animate et |
| Her şeyi animate etme | Sadece yüksek etkili anlara odaklan |
| Flat shadow her yerde | Katmanlı, renk tonlu shadow sistemi |
| Düz beyaz/siyah arka plan | Gradient mesh + grain texture |
| 12 farklı rastgele font-size | Type scale sistemi (1.25 ratio) |
| Aynı z-plane'de tüm yüzeyler | 3 katmanlı derinlik (base/elevated/floating) |
| `outline:none` (focus kaldırma) | Custom focus-visible stili |

### 8.8 Son Kontrol Listesi
- [ ] Tüm linkler çalışıyor
- [ ] Mobil / tablet / desktop test edildi
- [ ] Lighthouse: Performance >90, Accessibility >90
- [ ] Tüm görsellerde alt text var
- [ ] Favicon + meta tag'ler ekli
- [ ] Her sayfada unique `<title>` ve `<meta description>`
- [ ] 404 sayfası tasarlandı
- [ ] Form validation çalışıyor
- [ ] HTTPS aktif, console'da hata yok
- [ ] Font'lar `font-display: swap` ile yükleniyor
- [ ] Animasyonlar `prefers-reduced-motion` saygı gösteriyor
- [ ] Her tıklanabilir elemanda hover + focus-visible + active state var
- [ ] Aydınlık/karanlık tema her sayfada test edildi
- [ ] Loading, empty, error state'leri tüm sayfalarda var

---

## 9. GÜVENLİK & VERİ KORUMA

### 9.1 Kimlik Doğrulama & Yetkilendirme
- Supabase Auth ile JWT tabanlı authentication
- Row Level Security (RLS) tüm tablolarda aktif
- RBAC: super_admin > admin > staff
- Oturum süresi yönetimi (idle timeout)
- Rate limiting (brute force koruması)

### 9.2 Veri Güvenliği
- HTTPS zorunlu (SSL/TLS)
- Şifreler bcrypt ile hashlenmiş
- SQL injection koruması (Prisma ORM parametrik sorgular)
- XSS koruması (React + CSP headers)
- CSRF koruması
- CORS yapılandırması (sadece izin verilen domainler)

### 9.3 Video Güvenliği
- AWS S3 Signed URL (süreli erişim, 2 saat)
- CloudFront Signed Cookies
- Hotlink koruması (Referer kontrolü)
- Download engeli (sağ tık devre dışı + no-download header)

---

## 10. YEDEKLEME STRATEJİSİ

### 10.1 Otomatik Yedekleme
```
- Supabase: Günlük otomatik yedek (Pro plan: 7 günlük)
- Ek yedek: pg_dump ile haftalık → AWS S3
- Video yedek: AWS S3 Cross-Region Replication
- Yedek şifreleme: AES-256
```

### 10.2 Manuel Yedekleme
```
- Admin panelinden tek tıkla yedek alma
- Yedek indirme (şifreli .sql.gz)
- Yedekten geri yükleme (admin onayı gerekli)
```

### 10.3 Audit Log
```
- Tüm CRUD işlemleri loglanır
- Eski/yeni değer kaydı (JSONB)
- IP adresi + user agent kaydı
- Log verileri 1 yıl saklanır, CSV export edilebilir
```

---

## 11. PROJE KLASÖR YAPISI

```
hospital-lms/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── trainings/[id]/{edit,questions,videos,stats}/
│   │   │   ├── staff/[id]/
│   │   │   ├── reports/{training,staff,department,failure}/
│   │   │   ├── notifications/  audit-logs/  backups/  settings/
│   │   ├── (staff)/
│   │   │   ├── dashboard/
│   │   │   ├── my-trainings/[id]/{pre-exam,videos,post-exam}/
│   │   │   ├── calendar/  notifications/  profile/
│   │   └── api/
│   │       ├── auth/  trainings/  exams/  videos/
│   │       ├── reports/  notifications/  backups/  upload/
│   ├── components/
│   │   ├── ui/           # shadcn/ui + 21st.dev bileşenleri
│   │   ├── admin/        # Admin'e özel
│   │   ├── staff/        # Personele özel
│   │   ├── shared/       # VideoPlayer, ExamTimer, DataTable,
│   │   │                 # FilterBar, ExportButtons, NotificationBell, ThemeToggle
│   │   └── layouts/      # AdminLayout, StaffLayout
│   ├── lib/
│   │   ├── supabase/     # client.ts, server.ts, middleware.ts
│   │   ├── aws/          # s3.ts, cloudfront.ts
│   │   └── utils/        # exam.ts, export.ts, date.ts, validation.ts
│   ├── hooks/            # useAuth, useExamTimer, useVideoPlayer, useNotifications
│   ├── store/            # authStore, examStore, notificationStore
│   ├── types/            # database.ts, training.ts, exam.ts, user.ts
│   └── styles/globals.css
├── prisma/schema.prisma + migrations/
├── tests/unit/  integration/  e2e/
├── .env.local  .env.example
├── next.config.ts  tailwind.config.ts  tsconfig.json
└── package.json
```

---

## 12. API ENDPOINT YAPISI

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş |
| POST | `/api/auth/logout` | Çıkış |
| PUT | `/api/auth/change-password` | Şifre değiştirme |
| GET/POST | `/api/trainings` | Eğitim listesi / Yeni eğitim |
| GET/PUT/DELETE | `/api/trainings/:id` | Eğitim CRUD |
| GET | `/api/trainings/:id/stats` | Eğitim istatistikleri |
| POST | `/api/trainings/:id/assign` | Personel ata |
| POST | `/api/videos/upload` | Video yükle (S3 presigned URL) |
| GET | `/api/videos/:id/stream` | Video stream URL |
| POST | `/api/videos/:id/progress` | İzleme ilerlemesi |
| POST | `/api/videos/:id/heartbeat` | İzleme heartbeat |
| POST | `/api/exams/start` | Sınav başlat |
| GET | `/api/exams/:attemptId/questions` | Soruları getir (karışık) |
| POST | `/api/exams/:attemptId/answer` | Cevap kaydet |
| POST | `/api/exams/:attemptId/submit` | Sınavı teslim et |
| GET | `/api/exams/:attemptId/result` | Sonuç görüntüle |
| GET/POST | `/api/staff` | Personel listesi / Ekle |
| GET/PUT | `/api/staff/:id` | Personel CRUD |
| POST | `/api/staff/:id/grant-attempt` | Yeni deneme hakkı ver |
| POST | `/api/staff/import` | Toplu import |
| GET | `/api/reports/summary` | Genel özet |
| GET | `/api/reports/training/:id` | Eğitim bazlı |
| GET | `/api/reports/staff/:id` | Personel bazlı |
| GET | `/api/reports/department` | Departman raporu |
| GET | `/api/reports/export/excel` | Excel export |
| GET | `/api/reports/export/pdf` | PDF export |
| GET/PUT | `/api/notifications` | Bildirimler |
| POST | `/api/backups/create` | Manuel yedek |

---

## 13. PERFORMANS OPTİMİZASYONU

- **Next.js SSR/SSG:** Statik sayfalar build time'da, dinamik server-side
- **TanStack Query:** API cache, stale-while-revalidate
- **Lazy Loading:** Sayfa ve bileşen bazlı code splitting
- **Image Optimization:** Next.js Image, WebP format
- **Video:** HLS adaptif streaming
- **Veritabanı:** İndeksler, connection pooling (Supabase PgBouncer)
- **CDN:** CloudFront ile statik varlıklar + video cache
- **Redis:** Sınav zamanlayıcı, oturum cache

---

## 14. ÇEVİRİM ORTAMI DEĞİŞKENLERİ (.env)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
AWS_CLOUDFRONT_DOMAIN=
AWS_CLOUDFRONT_KEY_PAIR_ID=
AWS_CLOUDFRONT_PRIVATE_KEY=

# Redis
REDIS_URL=

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# App
NEXT_PUBLIC_APP_URL=
JWT_SECRET=
```

---

## 15. GELİŞTİRME TAKVİMİ

| Faz | Süre | Kapsam |
|-----|------|--------|
| **Faz 1: Altyapı** | 2 hafta | Proje kurulumu, DB şeması, Auth sistemi (3 rol), layout'lar (SuperAdminLayout, AdminLayout, StaffLayout) |
| **Faz 2: Süper Admin Paneli** | 2 hafta | Hastane yönetimi, abonelik planları, global dashboard, platform ayarları |
| **Faz 3: Hastane Admin — Eğitim** | 3 hafta | Eğitim CRUD, video yükleme, soru yönetimi, personel atama |
| **Faz 4: Personel — Sınav** | 3 hafta | Sınav sistemi, video oynatıcı (hızlandırma engelli), deneme akışı |
| **Faz 5: Raporlama** | 2 hafta | Admin raporları, süper admin global raporlar, Excel/PDF export |
| **Faz 6: Bildirimler** | 1 hafta | Realtime bildirimler, e-posta, takvim |
| **Faz 7: Güvenlik & Optimizasyon** | 1 hafta | Video güvenliği, performans, audit log, RLS doğrulama |
| **Faz 8: Test & Yayın** | 2 hafta | Test, bug fix, multi-tenant deployment |
| **TOPLAM** | **~16 hafta** | |

---

## 16. AI (CLAUDE) ÇALIŞMA KURALLARI

> Bu bölüm, Claude'un Antigravity IDE içinde verimli, güvenli ve minimal çalışmasını zorunlu kılar.

### 16.1 ALTIN KURAL: "DOKUNMA, BOZMA"

```
Bir düzeltme istendiğinde:
✅ Sadece belirtilen sorunu düzelt
✅ Sadece ilgili dosya(lar)da değişiklik yap
✅ Sadece hatalı satırları/blokları değiştir

❌ Çalışan kodu "iyileştirme" adıyla değiştirme
❌ İlgisiz dosyalara dokunma
❌ Stil, format veya yapı değişikliği yapma (istenmemişse)
❌ Çalışan import'ları, değişken isimlerini değiştirme
❌ "Refactoring" yapma (açıkça istenmemişse)
```

### 16.2 REVİZYON PROTOKOLÜ

```
ADIM 1 — ANALİZ (değişiklik yapmadan önce):
  • Hatanın hangi dosya(lar)ı etkilediğini belirle
  • Etkilenen dosyaların listesini kullanıcıya bildir
  • Yan etkileri düşün, emin değilsen sor

ADIM 2 — KAPSAM BELİRLE:
  • Sadece hatanın olduğu dosya
  • ZORUNLU ise bağımlı dosyalar (kullanıcıya bildir)
  • Diğer her şeye DOKUNMA

ADIM 3 — MİNİMAL DEĞİŞİKLİK:
  • Mümkün olan en küçük değişikliği yap
  • Dosyanın tamamını yeniden yazma
  • Diff bazlı düzenle: sadece değişen bloğu uygula
```

### 16.3 DOSYA DOKUNMA KARAR AĞACI

```
Hata bildirildi
│
├── Hata hangi dosyada? → [dosya_A.tsx]
│   ├── Sadece dosya_A.tsx yeterli mi?
│   │   ├── EVET → Sadece dosya_A.tsx'i düzenle
│   │   └── HAYIR → Bağımlı dosyaları listele, ONAY AL
│
└── Başka hata/iyileştirme fark ettin mi?
    ├── EVET → Kullanıcıya BILDIR, sor
    │          Onay gelirse düzelt, gelmezse DOKUNMA
    └── HAYIR → Devam et
```

### 16.4 YASAK DAVRANIŞLAR

| # | Yasak | Açıklama |
|---|-------|----------|
| 1 | Dosya yeniden yazma | Bir satır için dosyanın tamamını silip yeniden oluşturma |
| 2 | Sessiz refactoring | İstenmeden değişken ismi, yapı veya import sırası değiştirme |
| 3 | Stil kayması | Çalışan CSS/Tailwind class'larını "daha iyi" diye değiştirme |
| 4 | Bağımlılık değişikliği | İstenmeden paket ekleme veya güncelleme |
| 5 | Zincirleme değişiklik | 3+ dosyayı önceden onay almadan değiştirme |
| 6 | Varsayımsal düzeltme | Kullanıcının bildirmediği "hatayı" kendi başına düzeltme |
| 7 | Test bozma | Geçen testleri düzeltme sırasında kırma |
| 8 | Konfigürasyon dokunma | `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` vb. |

### 16.5 TOKEN VERİMLİLİĞİ

```
✅ Büyük dosyaları parçalar halinde oluştur (<500 satır per turn)
✅ Tekrar eden pattern'lerde "yukarıdaki gibi devam et" kullan
✅ Değişmeyen dosyaları tekrar gösterme
✅ "Devam et" dendiğinde kaldığın yerden devam et
✅ Ortak mantığı utility fonksiyonlarına çıkar (DRY)
✅ Tip tanımlarını merkezi types/ dizininde tut

❌ Aynı kodu farklı dosyalarda tekrar etme
❌ Uzun açıklama yorumları yazma (gereksizse)
❌ Kullanılmayan import bırakma
❌ Projenin tamamını her seferinde özetleme
```

### 16.6 DEĞİŞİKLİK RAPORU FORMATI

Her değişiklik sonrası şu formatı kullan:

```
📝 DEĞİŞİKLİK RAPORU
━━━━━━━━━━━━━━━━━━━━
Değiştirilen dosya(lar):
  1. src/components/ExamTimer.tsx  → [satır 45-52] zamanlayıcı düzeltildi
  2. src/lib/utils/exam.ts         → [satır 12] yanlış formül düzeltildi
Dokunulmayan dosyalar: Diğer tüm dosyalar korundu
Yan etki: Yok
```

### 16.7 ÇOKLU DOSYA ONAY PROTOKOLÜ

3+ dosya değişecekse:
```
1. DUR — hemen değişiklik yapma
2. LİSTELE — etkilenecek dosyaları ve değişiklikleri özetle
3. ONAYLA — "tamam, devam et" onayı al
4. UYGULA — sonra değişiklikleri uygula
5. RAPORLA — değişiklik raporu ver
```

### 16.8 KENDİ KENDİNİ KONTROL LİSTESİ

Her düzeltme sonrası:
```
□ Sadece istenilen değişikliği yaptım mı?
□ Başka dosyalara gereksiz dokundum mu?
□ Çalışan bir kodu bozmuş olabilir miyim?
□ Import'larda gereksiz değişiklik var mı?
□ CSS/stil değişikliği istenmeden yaptım mı?
□ Yeni bağımlılık ekledim mi? (İstenmemişse kaldır)
□ Değişikliğimi net ve kısa raporladım mı?
```

---

## 17. SONUÇ

Bu doküman, farklı hastanelere pazarlanabilen, çoklu kiracı (multi-tenant) mimarisine sahip kurumsal bir SaaS LMS sisteminin eksiksiz teknik spesifikasyonunu ve Google Antigravity IDE'de Claude ile çalışma kurallarını içermektedir.

**Panel Mimarisi:**
```
Süper Admin (Proje Sahibi)  →  Tüm platform yönetimi + abonelik
Hastane Admin (Tenant)       →  Kendi hastanesinin LMS yönetimi
Personel (Son Kullanıcı)     →  Eğitim izleme + sınav
```

**Stack:** Next.js 15 + Fastify + Supabase (PostgreSQL) + AWS S3/CloudFront + shadcn/ui + 21st.dev MCP

**Hedef:** Premium, production-ready, birden fazla hastaneye pazarlanabilir SaaS LMS sistemi.

---

*Son güncelleme: Mart 2026 | Platform: Google Antigravity IDE | pnpm ile kurulum*
