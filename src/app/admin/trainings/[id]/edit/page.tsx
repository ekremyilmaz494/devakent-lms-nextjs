"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { WizardLayout } from "@/components/admin/training-wizard/wizard-layout";
import { Step1Info } from "@/components/admin/training-wizard/step-1-info";
import { Step2Videos } from "@/components/admin/training-wizard/step-2-videos";
import { Step3Questions } from "@/components/admin/training-wizard/step-3-questions";
import { Step4Assign } from "@/components/admin/training-wizard/step-4-assign";
import { useTrainingWizard } from "@/store/training-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const WIZARD_STEPS = [
  {
    id: 0,
    title: "Temel Bilgiler",
    description: "Eğitim detayları",
  },
  {
    id: 1,
    title: "Videolar",
    description: "İçerik yükleme",
  },
  {
    id: 2,
    title: "Sorular",
    description: "Sınav oluşturma",
  },
  {
    id: 3,
    title: "Atama",
    description: "Personel seçimi",
  },
];

export default function EditTrainingPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  const {
    currentStep,
    setCurrentStep,
    isStepComplete,
    info,
    videos,
    questions,
    assignment,
    loadTraining,
  } = useTrainingWizard();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({
    0: true, // For edit mode, assume all steps are valid initially
    1: true,
    2: true,
    3: true,
  });

  // Load existing training
  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const response = await fetch(`/api/trainings/${trainingId}`);
        if (!response.ok) {
          throw new Error("Eğitim bulunamadı");
        }
        const data = await response.json();
        loadTraining(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTraining();
  }, [trainingId, loadTraining]);

  const handleStepValid = (step: number) => {
    setStepValidity((prev) => ({ ...prev, [step]: true }));
  };

  const handleNext = async () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - submit
      await handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Prepare payload
      const payload = {
        info: {
          title: info.title,
          description: info.description,
          category: info.category,
          thumbnail: info.thumbnail,
          passingScore: info.passingScore,
          maxAttempts: info.maxAttempts,
          examDuration: info.examDuration,
          startDate: info.startDate?.toISOString(),
          endDate: info.endDate?.toISOString(),
        },
        videos: {
          videos: videos.map((v) => ({
            title: v.title,
            description: v.description,
            videoUrl: v.videoUrl,
            videoKey: v.videoKey,
            durationSeconds: v.durationSeconds,
            sortOrder: v.sortOrder,
          })),
        },
        questions: {
          questions: questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            points: q.points,
            sortOrder: q.sortOrder,
            options: q.options.map((opt) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              sortOrder: opt.sortOrder,
            })),
          })),
        },
        // Note: Assignment is typically not updated in edit mode
        // but can be done via separate assign endpoint
      };

      const response = await fetch(`/api/trainings/${trainingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Eğitim güncellenemedi");
      }

      // Success - redirect to training detail
      router.push(`/admin/trainings/${trainingId}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error updating training:", err);
      setError(err.message || "Bir hata oluştu");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/trainings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Link>
        </Button>
      </div>
    );
  }

  const canGoNext = stepValidity[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/trainings/${trainingId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Eğitimi Düzenle
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          {info.title || "Eğitim bilgilerini güncelleyin"}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Wizard */}
      <WizardLayout
        currentStep={currentStep}
        steps={WIZARD_STEPS}
        onNext={handleNext}
        onPrev={handlePrev}
        onStepClick={handleStepClick}
        isStepComplete={isStepComplete}
        canGoNext={canGoNext}
        canGoPrev={currentStep > 0}
        isLastStep={isLastStep}
        nextLabel={isLastStep ? "Değişiklikleri Kaydet" : "Sonraki"}
        isSubmitting={isSubmitting}
      >
        {currentStep === 0 && <Step1Info onValid={() => handleStepValid(0)} />}
        {currentStep === 1 && <Step2Videos onValid={() => handleStepValid(1)} />}
        {currentStep === 2 && <Step3Questions onValid={() => handleStepValid(2)} />}
        {currentStep === 3 && <Step4Assign onValid={() => handleStepValid(3)} />}
      </WizardLayout>
    </div>
  );
}
