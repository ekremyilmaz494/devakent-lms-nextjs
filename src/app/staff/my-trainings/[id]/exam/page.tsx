"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [examAttemptId, setExamAttemptId] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  // Exam data from API
  const [exam, setExam] = useState<{
    title: string;
    duration: number;
    passingScore: number;
    questions: Question[];
  } | null>(null);

  // Load exam on mount
  useEffect(() => {
    const startExam = async () => {
      try {
        const response = await fetch(`/api/trainings/${trainingId}/exam/start`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to start exam");
        }

        const data = await response.json();
        setExam(data.exam);
        setExamAttemptId(data.examAttempt.id);
        setTimeLeft(data.exam.duration * 60); // Convert minutes to seconds
        setIsLoading(false);
      } catch (error) {
        console.error("Error starting exam:", error);
        alert("Sınav başlatılamadı. Lütfen tekrar deneyin.");
        router.push(`/staff/my-trainings/${trainingId}`);
      }
    };

    startExam();
  }, [trainingId, router]);

  const totalQuestions = exam?.questions.length || 0;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      const confirmed = window.confirm(
        `${totalQuestions - answeredCount} soru cevaplanmadı. Yine de göndermek istiyor musunuz?`
      );
      if (!confirmed) return;
    }

    if (!examAttemptId) {
      alert("Sınav ID bulunamadı. Lütfen sayfayı yenileyin.");
      return;
    }

    setIsSubmitted(true);

    try {
      const response = await fetch(`/api/trainings/${trainingId}/exam/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examAttemptId,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit exam");
      }

      const data = await response.json();
      setResults(data.results);

      setTimeout(() => {
        setShowResults(true);
      }, 1000);
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Sınav gönderilemedi. Lütfen tekrar deneyin.");
      setIsSubmitted(false);
    }
  };

  // Loading state
  if (isLoading || !exam) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sınav yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && results) {

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/staff/my-trainings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold">Sınav Sonuçları</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                {results.passed ? (
                  <>
                    <div className="flex justify-center">
                      <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-heading text-3xl font-bold text-green-600 mb-2">
                        Tebrikler!
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Sınavı başarıyla tamamladınız
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-heading text-3xl font-bold text-red-600 mb-2">
                        Başarısız
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Geçme puanına ulaşamadınız
                      </p>
                    </div>
                  </>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Puanınız</p>
                    <p className="text-3xl font-bold">{results.score}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Doğru Cevap</p>
                    <p className="text-3xl font-bold">
                      {results.correctCount}/{results.totalQuestions}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Geçme Puanı</p>
                    <p className="text-3xl font-bold">{results.passingScore}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/staff/my-trainings">Eğitimlerime Dön</Link>
                  </Button>
                  {!results.isPassed && results.remainingAttempts > 0 && (
                    <Button onClick={() => router.push(`/staff/my-trainings/${trainingId}/exam`)}>
                      Tekrar Dene ({results.remainingAttempts} deneme hakkı)
                    </Button>
                  )}
                  {!results.isPassed && results.isLastAttempt && (
                    <p className="text-sm text-muted-foreground">
                      Deneme hakkınız dolmuştur.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam interface
  const question = exam.questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/staff/my-trainings/${trainingId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">
              Soru {currentQuestion + 1} / {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Kalan Süre</p>
            <p
              className={cn(
                "text-2xl font-bold font-mono",
                timeLeft < 300 && "text-destructive"
              )}
            >
              <Clock className="inline h-5 w-5 mr-1" />
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">İlerleme</span>
              <span className="font-medium">
                {answeredCount} / {totalQuestions} cevaplandı
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Question */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Soru {currentQuestion + 1}: {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                      answers[question.id] === option.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {!answers[question.id] && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Lütfen bir seçenek işaretleyin
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Önceki Soru
            </Button>

            {currentQuestion === totalQuestions - 1 ? (
              <Button onClick={handleSubmit} size="lg">
                Sınavı Bitir
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))
                }
              >
                Sonraki Soru
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sorular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "h-10 w-10 rounded-lg border text-sm font-medium transition-colors",
                      currentQuestion === index && "border-primary bg-primary text-primary-foreground",
                      answers[q.id] && currentQuestion !== index && "bg-green-100 dark:bg-green-950/30 border-green-200",
                      !answers[q.id] && currentQuestion !== index && "hover:bg-muted"
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
