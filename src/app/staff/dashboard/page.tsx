"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, CheckCircle, XCircle, Calendar, Award, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface DashboardData {
  stats: { total: number; completed: number; inProgress: number; failed: number };
  upcomingDeadlines: Array<{ id: string; trainingId: string; title: string; category: string | null; endDate: string; daysRemaining: number; status: string; progress: number }>;
  recentActivities: Array<{ id: string; trainingId: string; title: string; completedAt: string; category: string | null }>;
  certificates: Array<{ id: string; certificateNo: string; status: string; createdAt: string; approvedAt: string | null }>;
}

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff/dashboard").then(r => r.json()).then(setData).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!data || !data.stats) return <div className="text-center py-12"><p className="text-muted-foreground">Veri yüklenemedi.</p></div>;

  const stats = [
    { label: "Atanan Eğitimler", value: (data.stats?.total ?? 0).toString(), icon: BookOpen, color: "text-blue-500" },
    { label: "Devam Eden", value: (data.stats?.inProgress ?? 0).toString(), icon: Clock, color: "text-orange-500" },
    { label: "Tamamlanan", value: (data.stats?.completed ?? 0).toString(), icon: CheckCircle, color: "text-green-500" },
    { label: "Başarısız", value: (data.stats?.failed ?? 0).toString(), icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Eğitim durumunuzu takip edin.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card animate-fade-in-up rounded-lg border border-border bg-card p-6 opacity-0" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{stat.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Button asChild variant="outline" className="h-auto py-6">
          <Link href="/staff/my-trainings"><div className="text-center w-full"><BookOpen className="h-6 w-6 mx-auto mb-2" /><div className="font-semibold">Eğitimlerim</div></div></Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6">
          <Link href="/staff/profile"><div className="text-center w-full"><Award className="h-6 w-6 mx-auto mb-2" /><div className="font-semibold">Sertifikalarım</div></div></Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Yaklaşan Bitiş Tarihleri</CardTitle></CardHeader>
          <CardContent>
            {data.upcomingDeadlines.length === 0 ? <div className="text-center py-8"><p className="text-sm text-muted-foreground">Yaklaşan deadline yok</p></div> : (
              <div className="space-y-4">
                {data.upcomingDeadlines.map((d) => (
                  <div key={d.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1"><h4 className="font-medium">{d.title}</h4>{d.category && <Badge variant="secondary" className="mt-1">{d.category}</Badge>}</div>
                      <div className="text-right"><div className={`text-sm font-semibold ${d.daysRemaining <= 2 ? "text-red-500" : d.daysRemaining <= 5 ? "text-orange-500" : "text-green-500"}`}>{d.daysRemaining} gün</div><p className="text-xs text-muted-foreground">kaldı</p></div>
                    </div>
                    <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">İlerleme</span><span className="font-medium">{d.progress}%</span></div><Progress value={d.progress} /></div>
                    <Button asChild variant="link" className="mt-2 p-0 h-auto" size="sm"><Link href={`/staff/my-trainings/${d.trainingId}`}>Devam Et <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />Son Tamamlananlar</CardTitle></CardHeader>
            <CardContent>
              {data.recentActivities.length === 0 ? <div className="text-center py-8"><p className="text-sm text-muted-foreground">Henüz tamamlanmış eğitim yok</p></div> : (
                <div className="space-y-3">
                  {data.recentActivities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1"><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground mt-1">{new Date(a.completedAt).toLocaleDateString("tr-TR")}</p></div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Sertifikalarım</CardTitle></CardHeader>
            <CardContent>
              {data.certificates.length === 0 ? <div className="text-center py-8"><p className="text-sm text-muted-foreground">Henüz sertifika yok</p></div> : (
                <div className="space-y-3">
                  {data.certificates.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1"><p className="font-medium text-sm font-mono">{c.certificateNo}</p><p className="text-xs text-muted-foreground mt-1">{new Date(c.createdAt).toLocaleDateString("tr-TR")}</p></div>
                      <Badge variant={c.status === "APPROVED" ? "default" : c.status === "PENDING" ? "secondary" : "destructive"}>{c.status === "APPROVED" ? "Onaylandı" : c.status === "PENDING" ? "Bekliyor" : "Reddedildi"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
