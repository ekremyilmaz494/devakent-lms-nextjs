"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Activity, TrendingUp, CheckCircle } from "lucide-react";
import ProgressChart from "./progress-chart";
import CategoryChart from "./category-chart";
import GrantAttemptButton from "./grant-attempt-button";

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

export default function StaffTabs({ data }: { data: StaffData }) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
        <TabsTrigger value="trainings">Eğitimler</TabsTrigger>
        <TabsTrigger value="performance">Performans</TabsTrigger>
        <TabsTrigger value="certificates">Sertifikalar</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        {/* Exam Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Sınav Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Toplam Sınav</div>
                <div className="text-xl font-bold">{data.examPerformance.totalExams}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Başarılı</div>
                <div className="text-xl font-bold text-green-600">{data.examPerformance.passed}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Başarısız</div>
                <div className="text-xl font-bold text-red-600">{data.examPerformance.failed}</div>
              </div>
            </div>

            {/* Recent Exams */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Son Sınavlar</h4>
              {data.examPerformance.recentExams.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz sınav tamamlanmadı</p>
              ) : (
                data.examPerformance.recentExams.map((exam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{exam.trainingTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        Deneme {exam.attemptNumber} • {new Date(exam.completedAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold">{exam.score}</div>
                      <Badge variant={exam.isPassed ? "default" : "destructive"}>
                        {exam.isPassed ? "Geçti" : "Kaldı"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Video İzleme Aktivitesi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">İzlenen Video</div>
              <div className="text-xl font-bold">{data.videoActivity.totalVideosWatched}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tamamlanan</div>
              <div className="text-xl font-bold text-green-600">{data.videoActivity.completedVideos}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Toplam Süre</div>
              <div className="text-xl font-bold">{data.videoActivity.totalWatchTimeMinutes} dk</div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Over Time Chart */}
        {data.progressOverTime.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Zaman İçinde İlerleme (Son 90 Gün)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart data={data.progressOverTime} />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Trainings Tab */}
      <TabsContent value="trainings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tüm Eğitim Atamaları</CardTitle>
          </CardHeader>
          <CardContent>
            {data.allAssignments.length === 0 ? (
              <p className="text-muted-foreground">Henüz atama yapılmadı</p>
            ) : (
              <div className="space-y-4">
                {data.allAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{assignment.trainingTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.category || "Kategori belirtilmemiş"} • Geçme Puanı: {assignment.passingScore}
                        </p>
                      </div>
                      <Badge
                        variant={
                          assignment.status === "passed"
                            ? "default"
                            : assignment.status === "locked"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {assignment.status === "passed"
                          ? "Geçti"
                          : assignment.status === "failed"
                          ? "Başarısız"
                          : assignment.status === "locked"
                          ? "Kilitli"
                          : assignment.status === "ready_for_exam"
                          ? "Sınava Hazır"
                          : assignment.status === "in_progress"
                          ? "Devam Ediyor"
                          : "Atandı"}
                      </Badge>
                    </div>

                    {/* Attempt Info */}
                    <div className="text-sm text-muted-foreground">
                      Deneme: {assignment.currentAttempt} / {assignment.maxAttempts}
                    </div>

                    {/* All Attempts */}
                    {assignment.allAttempts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Sınav Denemeleri</h4>
                        <div className="grid gap-2">
                          {assignment.allAttempts.map((attempt) => (
                            <div
                              key={attempt.attemptNumber}
                              className="flex items-center justify-between p-2 bg-muted rounded"
                            >
                              <div className="text-sm">
                                <span className="font-medium">Deneme {attempt.attemptNumber}</span>
                                <span className="text-muted-foreground ml-2">
                                  {new Date(attempt.completedAt).toLocaleDateString("tr-TR")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{attempt.score}</span>
                                <Badge variant={attempt.isPassed ? "default" : "destructive"} className="text-xs">
                                  {attempt.isPassed ? "Geçti" : "Kaldı"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grant Attempt Button for Locked Trainings */}
                    {assignment.status === "locked" && (
                      <GrantAttemptButton
                        assignmentId={assignment.id}
                        trainingTitle={assignment.trainingTitle}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Performance Tab */}
      <TabsContent value="performance" className="space-y-4">
        {/* Category Performance */}
        {data.categoryPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kategoriye Göre Performans</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart data={data.categoryPerformance} />
            </CardContent>
          </Card>
        )}

        {/* Completed Trainings */}
        <Card>
          <CardHeader>
            <CardTitle>Tamamlanan Eğitimler</CardTitle>
          </CardHeader>
          <CardContent>
            {data.completedTrainings.length === 0 ? (
              <p className="text-muted-foreground">Henüz tamamlanmış eğitim yok</p>
            ) : (
              <div className="space-y-3">
                {data.completedTrainings.map((training) => (
                  <div key={training.trainingId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{training.trainingTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {training.category || "Kategori belirtilmemiş"}
                        </p>
                      </div>
                      <Badge className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Tamamlandı
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Final Puanı</div>
                        <div className="font-bold text-lg">{training.examScore || "-"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Geçme Puanı</div>
                        <div className="font-medium">{training.passingScore}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Deneme Sayısı</div>
                        <div className="font-medium">{training.examAttempts}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Certificates Tab */}
      <TabsContent value="certificates" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sertifikalar</CardTitle>
          </CardHeader>
          <CardContent>
            {data.certificates.length === 0 ? (
              <p className="text-muted-foreground">Henüz sertifika yok</p>
            ) : (
              <div className="space-y-3">
                {data.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <div className="font-medium">Sertifika No: {cert.certificateNo}</div>
                      <div className="text-sm text-muted-foreground">
                        Oluşturulma: {new Date(cert.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          cert.status === "APPROVED"
                            ? "default"
                            : cert.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {cert.status === "APPROVED"
                          ? "Onaylandı"
                          : cert.status === "PENDING"
                          ? "Beklemede"
                          : "Reddedildi"}
                      </Badge>
                      {cert.pdfUrl && (
                        <Button size="sm" asChild>
                          <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                            İndir
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
