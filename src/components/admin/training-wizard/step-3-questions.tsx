"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useTrainingWizard } from "@/store/training-store";
import type { QuestionFormData, QuestionOptionFormData } from "@/types/training";
import { cn } from "@/lib/utils";

interface Step3QuestionsProps {
  onValid?: () => void;
}

export function Step3Questions({ onValid }: Step3QuestionsProps) {
  const { questions, addQuestion, removeQuestion, updateQuestion, markStepComplete } =
    useTrainingWizard();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuestionFormData>>({
    questionText: "",
    questionType: "multiple_choice",
    points: 10,
    sortOrder: 0,
    options: [
      { optionText: "", isCorrect: false, sortOrder: 0 },
      { optionText: "", isCorrect: false, sortOrder: 1 },
      { optionText: "", isCorrect: false, sortOrder: 2 },
      { optionText: "", isCorrect: false, sortOrder: 3 },
    ],
  });

  const isValid = questions.length >= 5;

  useEffect(() => {
    if (isValid) {
      markStepComplete(2);
      onValid?.();
    }
  }, [isValid, markStepComplete, onValid]);

  const handleAddOption = () => {
    if (currentQuestion.options && currentQuestion.options.length < 6) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [
          ...currentQuestion.options,
          {
            optionText: "",
            isCorrect: false,
            sortOrder: currentQuestion.options.length,
          },
        ],
      });
    }
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (currentQuestion.options && currentQuestion.options.length > 2) {
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options
          .filter((_, i) => i !== optionIndex)
          .map((opt, i) => ({ ...opt, sortOrder: i })),
      });
    }
  };

  const handleOptionChange = (
    optionIndex: number,
    field: keyof QuestionOptionFormData,
    value: any
  ) => {
    if (!currentQuestion.options) return;

    const newOptions = [...currentQuestion.options];

    // If marking as correct, unmark others
    if (field === "isCorrect" && value === true) {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === optionIndex;
      });
    } else {
      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        [field]: value,
      };
    }

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleSaveQuestion = () => {
    // Validation
    if (!currentQuestion.questionText || currentQuestion.questionText.length < 10) {
      alert("Soru metni en az 10 karakter olmalıdır");
      return;
    }

    if (!currentQuestion.options || currentQuestion.options.length < 2) {
      alert("En az 2 şık eklemelisiniz");
      return;
    }

    if (currentQuestion.options.some((opt) => !opt.optionText.trim())) {
      alert("Tüm şıkların metni dolu olmalıdır");
      return;
    }

    const correctCount = currentQuestion.options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      alert("Tam olarak 1 doğru cevap seçmelisiniz");
      return;
    }

    const questionData: QuestionFormData = {
      questionText: currentQuestion.questionText,
      questionType: currentQuestion.questionType || "multiple_choice",
      points: currentQuestion.points || 10,
      sortOrder: editingIndex !== null ? editingIndex : questions.length,
      options: currentQuestion.options,
    };

    if (editingIndex !== null) {
      updateQuestion(editingIndex, questionData);
      setEditingIndex(null);
    } else {
      addQuestion(questionData);
    }

    // Reset form
    setCurrentQuestion({
      questionText: "",
      questionType: "multiple_choice",
      points: 10,
      sortOrder: 0,
      options: [
        { optionText: "", isCorrect: false, sortOrder: 0 },
        { optionText: "", isCorrect: false, sortOrder: 1 },
        { optionText: "", isCorrect: false, sortOrder: 2 },
        { optionText: "", isCorrect: false, sortOrder: 3 },
      ],
    });
  };

  const handleEditQuestion = (index: number) => {
    setEditingIndex(index);
    setCurrentQuestion(questions[index]);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentQuestion({
      questionText: "",
      questionType: "multiple_choice",
      points: 10,
      sortOrder: 0,
      options: [
        { optionText: "", isCorrect: false, sortOrder: 0 },
        { optionText: "", isCorrect: false, sortOrder: 1 },
        { optionText: "", isCorrect: false, sortOrder: 2 },
        { optionText: "", isCorrect: false, sortOrder: 3 },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? "Soruyu Düzenle" : "Yeni Soru Ekle"}
          </CardTitle>
          <CardDescription>
            Çoktan seçmeli sorular oluşturun. En az 5 soru eklemelisiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Soru Metni</label>
            <Textarea
              placeholder="Sorunuzu buraya yazın..."
              rows={3}
              value={currentQuestion.questionText || ""}
              onChange={(e) =>
                setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              {(currentQuestion.questionText?.length || 0)} / 1000 karakter
            </p>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Puan</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={currentQuestion.points || 10}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  points: parseInt(e.target.value) || 10,
                })
              }
              className="w-32"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Şıklar</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={
                  !currentQuestion.options || currentQuestion.options.length >= 6
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Şık Ekle
              </Button>
            </div>

            {currentQuestion.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                {/* Correct Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={(checked) =>
                      handleOptionChange(index, "isCorrect", checked)
                    }
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>

                {/* Option Text */}
                <Input
                  placeholder={`Şık ${String.fromCharCode(65 + index)}`}
                  value={option.optionText}
                  onChange={(e) =>
                    handleOptionChange(index, "optionText", e.target.value)
                  }
                  className={cn(
                    "flex-1",
                    option.isCorrect && "border-green-600 bg-green-50 dark:bg-green-950/20"
                  )}
                />

                {/* Remove Button */}
                {currentQuestion.options && currentQuestion.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}

            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs">
                Doğru cevabı işaretleyin. Tam olarak 1 doğru cevap olmalıdır.
              </AlertDescription>
            </Alert>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSaveQuestion} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {editingIndex !== null ? "Güncelle" : "Soruyu Ekle"}
            </Button>
            {editingIndex !== null && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Eklenen Sorular ({questions.length})</CardTitle>
              <span className="text-sm text-muted-foreground">
                Toplam Puan: {questions.reduce((sum, q) => sum + q.points, 0)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{question.questionText}</p>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {question.options.map((opt, optIndex) => (
                          <div
                            key={optIndex}
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

                      <p className="text-xs text-muted-foreground">
                        Puan: {question.points}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditQuestion(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Alert */}
      {questions.length < 5 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            En az 5 soru eklemelisiniz. Şu an {questions.length} soru eklenmiş.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
