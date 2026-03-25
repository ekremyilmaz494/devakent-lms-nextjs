"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Award,
  BarChart3,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ReportsData {
  platformStats: {
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    avgScore: number;
  };
  hospitalStats: Array<{
    hospitalId: string;
    hospitalName: string;
    hospitalCity: string;
    totalStaff: number;
    totalTrainings: number;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    avgScore: number;
  }>;
  mostActiveHospitals: Array<{
    hospitalName: string;
    totalEnrollments: number;
  }>;
  monthlyCompletions: Array<{
    month: string;
    count: number;
  }>;
  topTrainings: Array<{
    id: string;
    title: string;
    hospitalName: string;
    completions: number;
    avgScore: number;
  }>;
}

export default function SuperAdminReports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/super-admin/reports");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Reports fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Veri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Platform Raporları
        </h1>
        <p className="text-sm text-muted-foreground">
          Tüm hastaneler için detaylı performans raporları ve istatistikler.
        </p>
      </div>

      {/* Platform Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
              <p className="text-2xl font-bold">
                {data.platformStats.totalEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamamlanan</p>
              <p className="text-2xl font-bold">
                {data.platformStats.completedEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamamlanma Oranı</p>
              <p className="text-2xl font-bold">
                %{data.platformStats.completionRate}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ortalama Puan</p>
              <p className="text-2xl font-bold">
                {data.platformStats.avgScore}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Completions Trend */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Aylık Tamamlanma Trendi
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyCompletions}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Active Hospitals */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">En Aktif Hastaneler</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.mostActiveHospitals}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="hospitalName"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={100}
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
              <Bar
                dataKey="totalEnrollments"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Trainings */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold">En Popüler Eğitimler</h2>
          </div>
          <div className="space-y-3">
            {data.topTrainings.map((training, idx) => (
              <div
                key={training.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{training.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {training.hospitalName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {training.completions} tamamlama
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ort: {training.avgScore} puan
                  </p>
                </div>
              </div>
            ))}
            {data.topTrainings.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Henüz veri yok
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hospital Performance Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Hastane Performans Tablosu</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Hastane
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Şehir
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Personel
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Eğitimler
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Kayıtlar
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Tamamlanan
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Tamamlanma %
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Ort. Puan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.hospitalStats.map((hospital) => (
                <tr
                  key={hospital.hospitalId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {hospital.hospitalName}
                  </td>
                  <td className="px-4 py-3 text-sm">{hospital.hospitalCity}</td>
                  <td className="px-4 py-3 text-sm">{hospital.totalStaff}</td>
                  <td className="px-4 py-3 text-sm">
                    {hospital.totalTrainings}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {hospital.totalEnrollments}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {hospital.completedEnrollments}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${hospital.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {hospital.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        hospital.avgScore >= 80
                          ? "text-green-600"
                          : hospital.avgScore >= 60
                            ? "text-orange-600"
                            : "text-red-600"
                      }`}
                    >
                      {hospital.avgScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.hospitalStats.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Henüz veri bulunmuyor
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
