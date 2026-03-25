"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Award,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { CompletionTrendChart } from '@/components/dashboard/completion-trend-chart'
import { TopPerformers } from '@/components/dashboard/top-performers'
import { AlertBanner } from '@/components/dashboard/alert-banner'
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardData {
  overview: {
    totalTrainings: number;
    activeTrainings: number;
    totalStaff: number;
    totalAssignments: number;
    completedAssignments: number;
    inProgressAssignments: number;
    completionRate: number;
    failureRate: number;
  };
  certificates: {
    pending: number;
    approved: number;
  };
  activity: Array<{
    date: string;
    completions: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    email: string;
    department: string | null;
    completedTrainings: number;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Veri yüklenemedi.</p>
      </div>
    );
  }

  const stats = {
    activeStaff: data.overview.totalStaff,
    completedTrainings: data.overview.completedAssignments,
    averageScore: data.overview.completionRate,
    pendingCertificates: data.certificates.pending,
  };

  const trendData = data.activity.slice(-7).map((item) => ({
    day: new Date(item.date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }),
    tamamlanan: item.completions,
    devamEden: 0,
  }));

  const topPerformers = data.topPerformers.map((p) => ({
    id: p.id,
    name: p.name,
    department: p.department || "Belirtilmemiş",
    completedCount: p.completedTrainings,
    avatar: p.name.charAt(0),
    score: p.completedTrainings,
  }));

  const recentActivities = [] as any[]; // Şimdilik boş, gerekirse API eklenebilir

  const statCards = [
    {
      label: 'Aktif Personel',
      value: stats.activeStaff,
      change: 12,
      trend: 'up' as const,
      icon: Users,
      variant: 'default' as const,
    },
    {
      label: 'Tamamlanan Eğitim',
      value: stats.completedTrainings,
      change: 8,
      trend: 'up' as const,
      icon: GraduationCap,
      variant: 'success' as const,
    },
    {
      label: 'Ortalama Başarı',
      value: `${stats.averageScore}%`,
      change: 2.4,
      trend: 'up' as const,
      icon: TrendingUp,
      variant: 'info' as const,
    },
    {
      label: 'Bekleyen Sertifika',
      value: stats.pendingCertificates,
      change: -5,
      trend: 'down' as const,
      icon: Award,
      variant: 'warning' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Hastane eğitim yönetim panelinize hoş geldiniz.
        </p>
      </div>

      {/* Alert Banner */}
      {data.certificates.pending > 0 && (
        <AlertBanner
          type="warning"
          message={`${data.certificates.pending} personelin sertifika onayı bekliyor. Lütfen onayları kontrol edin.`}
          dismissible
        />
      )}

      {/* Hızlı Erişim Butonları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/admin/trainings/new">
            <div className="text-center w-full">
              <GraduationCap className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Yeni Eğitim</div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/admin/staff">
            <div className="text-center w-full">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Personel Yönetimi</div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/admin/analytics">
            <div className="text-center w-full">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Analytics</div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/admin/certificates">
            <div className="text-center w-full">
              <Award className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Sertifika Onayları</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms backwards`,
            }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts and Top Performers */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Completion Trend Chart */}
        <div
          className="col-span-7 rounded-xl border border-border bg-card p-6 lg:col-span-4"
          style={{
            animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 400ms backwards',
          }}
        >
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold">
              Tamamlama Trendi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Son 7 günlük eğitim tamamlama istatistikleri
            </p>
          </div>
          <CompletionTrendChart data={trendData} />
        </div>

        {/* Top Performers */}
        <div
          className="col-span-7 rounded-xl border border-border bg-card p-6 lg:col-span-3"
          style={{
            animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 500ms backwards',
          }}
        >
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold">
              En Başarılı Personeller
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu ayın en yüksek puanlı personelleri
            </p>
          </div>
          <TopPerformers performers={topPerformers} />
        </div>
      </div>

      {/* System Overview */}
      <div
        className="rounded-xl border border-border bg-card p-6"
        style={{
          animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 600ms backwards',
        }}
      >
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold">Sistem Özeti</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform genel durum bilgileri
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Toplam Eğitim</div>
            <div className="text-2xl font-bold">{data.overview.totalTrainings}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.overview.activeTrainings} aktif
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Devam Eden</div>
            <div className="text-2xl font-bold">{data.overview.inProgressAssignments}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Atama durumunda
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Başarı Oranı</div>
            <div className="text-2xl font-bold">{data.overview.completionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              Tamamlanma oranı
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
