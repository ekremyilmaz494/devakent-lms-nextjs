"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout } from "@/components/admin/training-wizard/wizard-layout";
import { Step1Info } from "@/components/admin/training-wizard/step-1-info";
import { Step2Videos } from "@/components/admin/training-wizard/step-2-videos";
import { Step3Questions } from "@/components/admin/training-wizard/step-3-questions";
import { Step4Assign } from "@/components/admin/training-wizard/step-4-assign";
import { useTrainingWizard } from "@/store/training-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

export default function NewTrainingPage() {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    isStepComplete,
    info,
    videos,
    questions,
    assignment,
    reset,
  } = useTrainingWizard();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  // Reset wizard on mount
  useEffect(() => {
    reset();
  }, [reset]);

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
        assignment: {
          userIds: assignment.userIds || [],
        },
      };

      const response = await fetch("/api/trainings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Eğitim oluşturulamadı");
      }

      const training = await response.json();

      // Success - redirect to training detail
      router.push(`/admin/trainings/${training.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error creating training:", err);
      setError(err.message || "Bir hata oluştu");
      setIsSubmitting(false);
    }
  };

  const canGoNext = stepValidity[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Yeni Eğitim Oluştur
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          4 adımda yeni eğitim oluşturun ve personellere atayın
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
        nextLabel={isLastStep ? "Eğitimi Oluştur" : "Sonraki"}
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
