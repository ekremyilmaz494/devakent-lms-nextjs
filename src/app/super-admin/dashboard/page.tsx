"use client";

import { useEffect, useState } from "react";
import { Building2, CreditCard, Users, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

type DashboardData = {
  stats: {
    totalHospitals: number;
    activeHospitals: number;
    activeSubscriptions: number;
    suspendedSubscriptions: number;
    totalStaff: number;
    activeTrainings: number;
    totalRevenue: number;
  };
  monthlyTrend: { month: string; count: number }[];
  recentHospitals: Array<{
    id: string;
    name: string;
    code: string | null;
    city: string;
    createdAt: string;
    staffCount: number;
    trainingCount: number;
    plan: string;
    status: string;
  }>;
  expiringSubscriptions: Array<{
    id: string;
    hospitalId: string;
    hospitalName: string;
    planName: string;
    endDate: string;
    daysRemaining: number;
  }>;
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 dark:text-green-400",
  TRIAL: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  EXPIRING: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  EXPIRED: "bg-red-500/10 text-red-700 dark:text-red-400",
  SUSPENDED: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  NO_SUBSCRIPTION: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  TRIAL: "Deneme",
  EXPIRING: "Yaklaşan",
  EXPIRED: "Dolmuş",
  SUSPENDED: "Askıda",
  NO_SUBSCRIPTION: "Plan Yok",
};

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/super-admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Veri yüklenemedi</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Toplam Hastane",
      value: data.stats.totalHospitals.toString(),
      icon: Building2,
    },
    {
      label: "Aktif Abonelik",
      value: data.stats.activeSubscriptions.toString(),
      icon: CreditCard,
    },
    {
      label: "Askıda",
      value: data.stats.suspendedSubscriptions.toString(),
      icon: AlertTriangle,
    },
    {
      label: "Toplam Personel",
      value: data.stats.totalStaff.toLocaleString("tr-TR"),
      icon: Users,
    },
    {
      label: "Aktif Eğitim",
      value: data.stats.activeTrainings.toString(),
      icon: TrendingUp,
    },
    {
      label: "Toplam Gelir",
      value: `₺${data.stats.totalRevenue.toLocaleString("tr-TR")}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Platform Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Tüm hastanelerin genel durumu ve platform istatistikleri.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {stat.label}
              </p>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <stat.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className="mt-2 font-mono text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Trend Chart */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-base font-bold mb-4">
          Aylık Yeni Hastane Kayıtları
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Hospitals */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-base font-bold mb-4">
            Son Kayıt Olan Hastaneler
          </h3>
          <div className="space-y-3">
            {data.recentHospitals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Henüz hastane kaydı yok
              </p>
            ) : (
              data.recentHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{hospital.name}</p>
                      <Badge className={statusColors[hospital.status]}>
                        {statusLabels[hospital.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hospital.city} • {hospital.code || "Kod yok"} • {hospital.plan}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {hospital.staffCount} Personel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hospital.trainingCount} Eğitim
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring Subscriptions */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-heading text-base font-bold mb-4">
            Aboneliği Sona Yaklaşan Hastaneler
          </h3>
          <div className="space-y-3">
            {data.expiringSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Süresi yaklaşan abonelik yok
              </p>
            ) : (
              data.expiringSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/5 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sub.hospitalName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub.planName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {sub.daysRemaining} gün
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sub.endDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
