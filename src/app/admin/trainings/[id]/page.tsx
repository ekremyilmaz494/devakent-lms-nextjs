"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Edit,
  ArrowLeft,
  Users,
  Video,
  HelpCircle,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { TrainingWithRelations } from "@/types/training";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  const [training, setTraining] = useState<TrainingWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const response = await fetch(`/api/trainings/${trainingId}`);
        if (!response.ok) {
          throw new Error("Eğitim bulunamadı");
        }
        const data = await response.json();
        setTraining(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTraining();
  }, [trainingId]);

  // Fetch assignments when tab is clicked
  const handleFetchAssignments = async () => {
    if (assignmentsData) return; // Already loaded

    setIsLoadingAssignments(true);
    try {
      const response = await fetch(`/api/trainings/${trainingId}/assignments`);
      if (!response.ok) {
        throw new Error("Atama bilgileri alınamadı");
      }
      const data = await response.json();
      setAssignmentsData(data);
    } catch (err: any) {
      console.error("Error fetching assignments:", err);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  // Fetch analytics when tab is clicked
  const handleFetchAnalytics = async () => {
    if (analyticsData) return; // Already loaded

    setIsLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/trainings/${trainingId}/analytics`);
      if (!response.ok) {
        throw new Error("Analiz bilgileri alınamadı");
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">{error || "Eğitim bulunamadı"}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/trainings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      DRAFT: {
        label: "Taslak",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
      PUBLISHED: {
        label: "Yayında",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      ARCHIVED: {
        label: "Arşiv",
        className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      },
    };

    const variant = variants[training.status] || variants.DRAFT;

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const totalAssigned = training._count?.assignments || 0;
  const assignmentStats = {
    total: totalAssigned,
    inProgress: 0, // Calculate from assignments
    completed: 0,
    passed: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/trainings">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold tracking-tight">
                  {training.title}
                </h1>
                {getStatusBadge(training.status)}
              </div>
              {training.category && (
                <p className="text-sm text-muted-foreground mt-1">{training.category}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/trainings/${trainingId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atanan Personel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {assignmentStats.completed} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{training._count?.videos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {training.videos?.reduce((sum, v) => sum + v.durationSeconds, 0) || 0} saniye
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soru</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{training._count?.questions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Geçme puanı: %{training.passingScore}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignmentStats.total > 0
                ? Math.round((assignmentStats.passed / assignmentStats.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {assignmentStats.passed} / {assignmentStats.total} başarılı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="assignments">Atanan Personel</TabsTrigger>
          <TabsTrigger value="analytics">Analizler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eğitim Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Açıklama</h3>
                <p className="text-sm leading-relaxed">{training.description}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tarih Aralığı
                  </h3>
                  <p className="text-sm">
                    {format(new Date(training.startDate), "dd MMMM yyyy", { locale: tr })} -{" "}
                    {format(new Date(training.endDate), "dd MMMM yyyy", { locale: tr })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Sınav Süresi
                  </h3>
                  <p className="text-sm">{training.examDuration} dakika</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Geçme Puanı
                  </h3>
                  <p className="text-sm">%{training.passingScore}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Maksimum Deneme
                  </h3>
                  <p className="text-sm">{training.maxAttempts} deneme</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Videolar ({training.videos?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {training.videos && training.videos.length > 0 ? (
                <div className="space-y-3">
                  {training.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {video.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.floor(video.durationSeconds / 60)} dk{" "}
                          {video.durationSeconds % 60} sn
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Henüz video eklenmemiş
                </p>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Sorular ({training.questions?.length || 0})</CardTitle>
              <CardDescription>
                Toplam Puan: {training.questions?.reduce((sum, q) => sum + q.points, 0) || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {training.questions && training.questions.length > 0 ? (
                <div className="space-y-4">
                  {training.questions.map((question, index) => (
                    <div key={question.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{question.questionText}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Puan: {question.points}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 ml-11">
                        {question.options.map((opt, optIndex) => (
                          <div
                            key={opt.id}
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                              opt.isCorrect &&
                                "border-green-600 bg-green-50 dark:bg-green-950/20"
                            )}
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1">{opt.optionText}</span>
                            {opt.isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Henüz soru eklenmemiş
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" onFocus={handleFetchAssignments}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Atanan Personel</CardTitle>
                  <CardDescription>
                    Bu eğitime atanan tüm personeller ve ilerleme durumları
                  </CardDescription>
                </div>
                {assignmentsData && (
                  <Button variant="outline" size="sm" onClick={handleFetchAssignments}>
                    Yenile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : assignmentsData && assignmentsData.assignments.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Tamamlanma Oranı</p>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {assignmentsData.summary.completionRate}%
                      </p>
                      <Progress
                        value={assignmentsData.summary.completionRate}
                        className="mt-2 h-2"
                      />
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Ortalama Puan</p>
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {assignmentsData.summary.averageScore}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        100 üzerinden
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Başarılı</p>
                        <Users className="h-4 w-4 text-success" />
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {assignmentsData.summary.passed} / {assignmentsData.summary.total}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignmentsData.summary.failed} başarısız
                      </p>
                    </div>
                  </div>

                  {/* Assignments Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Personel</TableHead>
                          <TableHead>Departman</TableHead>
                          <TableHead className="text-center">Durum</TableHead>
                          <TableHead className="text-center">Deneme</TableHead>
                          <TableHead className="text-center">İlk Puan</TableHead>
                          <TableHead className="text-center">Son Puan</TableHead>
                          <TableHead className="text-right">Son Aktivite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentsData.assignments.map((assignment: any) => {
                          const getStatusBadge = (status: string) => {
                            const variants: Record<
                              string,
                              { label: string; className: string }
                            > = {
                              assigned: {
                                label: "Atandı",
                                className: "bg-blue-100 text-blue-700",
                              },
                              in_progress: {
                                label: "Devam Ediyor",
                                className: "bg-yellow-100 text-yellow-700",
                              },
                              passed: {
                                label: "Geçti",
                                className: "bg-green-100 text-green-700",
                              },
                              failed: {
                                label: "Kaldı",
                                className: "bg-red-100 text-red-700",
                              },
                              locked: {
                                label: "Kilitli",
                                className: "bg-gray-100 text-gray-700",
                              },
                            };

                            const variant = variants[status] || variants.assigned;

                            return (
                              <Badge variant="outline" className={variant.className}>
                                {variant.label}
                              </Badge>
                            );
                          };

                          return (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={assignment.user.avatarUrl || undefined}
                                      alt={assignment.user.name}
                                    />
                                    <AvatarFallback>
                                      {assignment.user.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{assignment.user.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {assignment.user.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {assignment.user.department || "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(assignment.status)}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-mono text-sm">
                                  {assignment.totalAttempts} / {assignment.maxAttempts}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-mono text-sm font-medium">
                                  {assignment.firstScore || "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={cn(
                                    "font-mono text-sm font-bold",
                                    assignment.passed
                                      ? "text-green-600"
                                      : "text-red-600"
                                  )}
                                >
                                  {assignment.latestScore || "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-xs text-muted-foreground">
                                {format(
                                  new Date(assignment.lastActivityAt),
                                  "dd MMM yyyy HH:mm",
                                  { locale: tr }
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Bu eğitime henüz personel atanmamış
                  </p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href={`/admin/trainings/${trainingId}/edit`}>
                      Personel Ata
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" onFocus={handleFetchAnalytics}>
          {isLoadingAnalytics ? (
            <div className="space-y-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-96" />
            </div>
          ) : analyticsData && analyticsData.questionAnalytics.length > 0 ? (
            <div className="space-y-6">
              {/* Score Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Puan Dağılımı</CardTitle>
                  <CardDescription>
                    Personellerin sınav puanları dağılımı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Personel Sayısı" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Time and Attempt Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ortalama Süre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {analyticsData.timeAnalytics.averageMinutes} dk
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min: {analyticsData.timeAnalytics.minMinutes} dk, Max:{" "}
                      {analyticsData.timeAnalytics.maxMinutes} dk
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ortalama Deneme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {analyticsData.attemptAnalytics.averageAttempts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Toplam {analyticsData.attemptAnalytics.totalAttempts} deneme
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Toplam Katılım</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {analyticsData.attemptAnalytics.totalAssignments}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Personel atandı
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Question Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Soru Bazlı Analiz</CardTitle>
                  <CardDescription>
                    Her sorunun doğru/yanlış cevap oranları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analyticsData.questionAnalytics.map((qa: any, index: number) => (
                      <div key={qa.questionId} className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                              </span>
                              <p className="text-sm font-medium">{qa.questionText}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Doğru</p>
                              <p className="text-sm font-bold text-green-600">
                                {qa.correctPercentage}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Yanlış</p>
                              <p className="text-sm font-bold text-red-600">
                                {qa.incorrectPercentage}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Cevap</p>
                              <p className="text-sm font-mono">{qa.totalAnswers}</p>
                            </div>
                          </div>
                        </div>

                        {/* Option Stats */}
                        <div className="ml-8 grid gap-2 sm:grid-cols-2">
                          {qa.optionStats.map((opt: any) => (
                            <div
                              key={opt.optionId}
                              className={cn(
                                "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                                opt.isCorrect &&
                                  "border-green-600 bg-green-50 dark:bg-green-950/20"
                              )}
                            >
                              <span className="flex-1">{opt.optionText}</span>
                              <span className="font-mono text-xs text-muted-foreground ml-2">
                                {opt.selectionPercentage}% ({opt.selectionCount})
                              </span>
                              {opt.isCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Henüz analiz verileri mevcut değil. Personeller sınavı tamamladıkça
                  burada analizleri görebilirsiniz.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
