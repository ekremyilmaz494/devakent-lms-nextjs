"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface WizardLayoutProps {
  currentStep: number;
  steps: WizardStep[];
  children: ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  onStepClick?: (step: number) => void;
  isStepComplete?: (step: number) => boolean;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  isLastStep?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  isSubmitting?: boolean;
}

export function WizardLayout({
  currentStep,
  steps,
  children,
  onNext,
  onPrev,
  onStepClick,
  isStepComplete,
  canGoNext = true,
  canGoPrev = true,
  isLastStep = false,
  nextLabel = "Sonraki",
  prevLabel = "Önceki",
  isSubmitting = false,
}: WizardLayoutProps) {
  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <Card className="p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCurrent = currentStep === step.id;
              const isComplete = isStepComplete?.(step.id) ?? false;
              const isPast = currentStep > step.id;
              const isClickable = isPast || isComplete;

              return (
                <li key={step.id} className="relative flex-1">
                  {/* Connector Line */}
                  {index !== 0 && (
                    <div
                      className={cn(
                        "absolute left-0 top-5 -ml-px h-0.5 w-full -translate-y-1/2",
                        isPast || isComplete
                          ? "bg-primary"
                          : "bg-border"
                      )}
                      style={{ width: "calc(100% - 2.5rem)" }}
                    />
                  )}

                  {/* Step Button */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "group relative flex w-full flex-col items-start gap-2",
                      isClickable && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Circle */}
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                          isCurrent &&
                            "border-primary bg-primary text-primary-foreground shadow-md",
                          isComplete &&
                            !isCurrent &&
                            "border-primary bg-primary text-primary-foreground",
                          !isCurrent &&
                            !isComplete &&
                            "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {isComplete && !isCurrent ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {step.id + 1}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex flex-col items-start text-left">
                        <span
                          className={cn(
                            "text-sm font-medium transition-colors",
                            isCurrent && "text-primary",
                            !isCurrent && "text-foreground"
                          )}
                        >
                          {step.title}
                        </span>
                        <span className="hidden text-xs text-muted-foreground md:block">
                          {step.description}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">{children}</div>

      {/* Navigation Buttons */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {canGoPrev && currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {prevLabel}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Adım {currentStep + 1} / {steps.length}
            </span>
            <Button
              type="button"
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                  İşleniyor...
                </>
              ) : (
                <>
                  {nextLabel}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
