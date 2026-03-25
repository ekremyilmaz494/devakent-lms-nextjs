import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Phone, Briefcase, Activity, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import StaffToggleButton from "./toggle-button";
import StaffTabs from "./staff-tabs";

interface StaffData {
  staff: { id: string; name: string; email: string; tcNo: string | null; title: string | null; department: string | null; phone: string | null; hospital: string | null; isActive: boolean; joinedAt: string; lastLoginAt: string | null };
  overview: { totalAssignments: number; completed: number; inProgress: number; notStarted: number; failed: number; completionRate: number };
  examPerformance: { totalExams: number; passed: number; failed: number; averageScore: number; passRate: number; recentExams: Array<any> };
  videoActivity: { totalVideosWatched: number; completedVideos: number; totalWatchTimeMinutes: number };
  progressOverTime: Array<{ month: string; started: number; completed: number }>;
  completedTrainings: Array<{ trainingId: string; trainingTitle: string; category: string | null; completedAt: string; passingScore: number; examScore: number | null; examAttempts: number; allAttempts: Array<{ attemptNumber: number; score: number; isPassed: boolean; completedAt: string }> }>;
  allAssignments: Array<{ id: string; trainingId: string; trainingTitle: string; status: string; currentAttempt: number; maxAttempts: number; category: string | null; assignedAt: string; completedAt: string | null; passingScore: number; allAttempts: Array<{ attemptNumber: number; score: number; isPassed: boolean; completedAt: string }> }>;
  categoryPerformance: Array<{ category: string; completedCount: number; averageScore: number }>;
  certificates: Array<{ id: string; certificateNo: string; status: string; createdAt: string; pdfUrl: string | null }>;
}

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const { id: staffId } = await params;

  // Fetch staff analytics data
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";
  const response = await fetch(`${baseUrl}/api/analytics/staff/${staffId}`, {
    headers: {
      cookie: `next-auth.session-token=${session.user.id}`, // Pass session for auth
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Personel Bulunamadı</h1>
          <p className="text-gray-600 mt-2">Bu personele ait bilgiler yüklenemedi.</p>
          <Link href="/admin/staff">
            <Button className="mt-4">Personel Listesine Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const data: StaffData = await response.json();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/staff" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Personel Listesi
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{data.staff.name}</h1>
            <Badge variant={data.staff.isActive ? "default" : "destructive"} className="flex items-center gap-1">
              {data.staff.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
              {data.staff.isActive ? "Aktif" : "Pasif"}
            </Badge>
          </div>
        </div>
        <StaffToggleButton
          staffId={data.staff.id}
          isActive={data.staff.isActive}
          staffName={data.staff.name}
        />
      </div>

      {/* Personal Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kişisel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-posta
            </div>
            <div className="font-medium">{data.staff.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              TC Kimlik No
            </div>
            <div className="font-medium">{data.staff.tcNo || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Ünvan
            </div>
            <div className="font-medium">{data.staff.title || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Departman
            </div>
            <div className="font-medium">{data.staff.department || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefon
            </div>
            <div className="font-medium">{data.staff.phone || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Son Giriş
            </div>
            <div className="font-medium">
              {data.staff.lastLoginAt ? new Date(data.staff.lastLoginAt).toLocaleDateString("tr-TR") : "Hiç giriş yapmadı"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Atama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.overview.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ortalama Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.examPerformance.averageScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Başarı Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.completionRate}%</div>
            <Progress value={data.overview.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <StaffTabs data={data} />
    </div>
  );
}
