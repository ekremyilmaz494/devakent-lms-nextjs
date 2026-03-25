"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlayCircle,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrainingAssignment {
  id: string;
  trainingId: string;
  status: string;
  currentAttempt: number;
  maxAttempts: number;
  assignedAt: string;
  completedAt?: string | null;
  progress?: number; // Progress percentage
  training: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    category?: string | null;
    passingScore: number;
    examDuration: number;
    startDate: string;
    endDate: string;
    _count: {
      videos: number;
      questions: number;
    };
  };
}

export default function StaffTrainings() {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filter !== "all") params.set("status", filter);

        const response = await fetch(`/api/staff/my-trainings?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Eğitimler yüklenemedi");
        }

        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; icon: any; className: string }> = {
      assigned: {
        label: "Başlanmadı",
        icon: Clock,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
      in_progress: {
        label: "Devam Ediyor",
        icon: PlayCircle,
        className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      },
      passed: {
        label: "Tamamlandı",
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      failed: {
        label: "Başarısız",
        icon: XCircle,
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
      locked: {
        label: "Kilitli",
        icon: Lock,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
    };

    const variant = variants[status] || variants.assigned;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={cn("flex items-center gap-1", variant.className)}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  const stats = {
    total: assignments.length,
    notStarted: assignments.filter((a) => a.status === "assigned").length,
    inProgress: assignments.filter((a) => a.status === "in_progress").length,
    completed: assignments.filter((a) => a.status === "passed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Eğitimlerim</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Size atanan eğitimleri görüntüleyin ve tamamlayın
          </p>
        </div>

        {/* Filter */}
        <Select value={filter} onValueChange={(value) => setFilter(value || "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="assigned">Başlanmadı</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
            <SelectItem value="passed">Tamamlandı</SelectItem>
            <SelectItem value="locked">Kilitli</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Başlanmadı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Devam Ediyor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tamamlandı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Training Cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col">
              <div className="h-40 w-full rounded-t-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Award className="h-16 w-16 text-primary/30" />
              </div>

              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {getStatusBadge(assignment.status)}
                  {assignment.training.category && (
                    <Badge variant="secondary">{assignment.training.category}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{assignment.training.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {assignment.training.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PlayCircle className="h-4 w-4" />
                    <span>{assignment.training._count.videos} video</span>
                    <span>•</span>
                    <Target className="h-4 w-4" />
                    <span>{assignment.training._count.questions} soru</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Sınav: {assignment.training.examDuration} dk</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Kalan deneme: {assignment.maxAttempts - assignment.currentAttempt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Bitiş: {format(new Date(assignment.training.endDate), "dd MMM yyyy", { locale: tr })}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {assignment.status === "in_progress" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>İlerleme</span>
                      <span>{assignment.progress || 0}%</span>
                    </div>
                    <Progress value={assignment.progress || 0} className="h-2" />
                  </div>
                )}

                <Button
                  asChild
                  className="w-full"
                  disabled={assignment.status === "locked"}
                  variant={assignment.status === "locked" ? "outline" : "default"}
                >
                  <Link href={`/staff/my-trainings/${assignment.trainingId}`}>
                    {assignment.status === "assigned" && "Eğitime Başla"}
                    {assignment.status === "in_progress" && "Devam Et"}
                    {assignment.status === "passed" && "Tamamlandı"}
                    {assignment.status === "locked" && "Kilitli - Admin ile İletişime Geçin"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
