import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const TrainingStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type TrainingStatusType = keyof typeof TrainingStatus;

export const AssignmentStatus = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  PASSED: "passed",
  FAILED: "failed",
  LOCKED: "locked",
} as const;

export type AssignmentStatusType =
  (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingVideo {
  id: string;
  trainingId: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  videoKey: string;
  durationSeconds: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface Question {
  id: string;
  trainingId: string;
  questionText: string;
  questionType: string;
  points: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  options: QuestionOption[];
}

export interface Training {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  category?: string | null;
  passingScore: number;
  maxAttempts: number;
  examDuration: number;
  startDate: Date;
  endDate: Date;
  status: TrainingStatusType;
  hospitalId: string;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface TrainingWithRelations extends Training {
  videos: TrainingVideo[];
  questions: Question[];
  _count?: {
    assignments: number;
    videos: number;
    questions: number;
  };
}

export interface TrainingAssignment {
  id: string;
  trainingId: string;
  userId: string;
  status: AssignmentStatusType;
  currentAttempt: number;
  maxAttempts: number;
  assignedBy?: string | null;
  assignedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

// Step 1: Temel Bilgiler
export const trainingInfoSchema = z.object({
  title: z
    .string()
    .min(5, "Başlık en az 5 karakter olmalıdır")
    .max(500, "Başlık en fazla 500 karakter olabilir"),
  description: z
    .string()
    .min(20, "Açıklama en az 20 karakter olmalıdır")
    .max(5000, "Açıklama en fazla 5000 karakter olabilir"),
  category: z.string().optional(),
  thumbnail: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  passingScore: z
    .number()
    .min(0, "Geçme puanı 0-100 arasında olmalıdır")
    .max(100, "Geçme puanı 0-100 arasında olmalıdır"),
  maxAttempts: z
    .number()
    .min(1, "En az 1 deneme hakkı verilmelidir")
    .max(10, "En fazla 10 deneme hakkı verilebilir"),
  examDuration: z
    .number()
    .min(5, "Sınav süresi en az 5 dakika olmalıdır")
    .max(180, "Sınav süresi en fazla 180 dakika olabilir"),
  startDate: z.date({ required_error: "Başlangıç tarihi gereklidir" }),
  endDate: z.date({ required_error: "Bitiş tarihi gereklidir" }),
});

export type TrainingInfoFormData = z.infer<typeof trainingInfoSchema>;

// Step 2: Video
export const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Video başlığı en az 3 karakter olmalıdır"),
  description: z.string().optional(),
  videoUrl: z.string().url("Geçerli bir video URL'i giriniz"),
  videoKey: z.string(),
  durationSeconds: z.number().min(1, "Video süresi en az 1 saniye olmalıdır"),
  sortOrder: z.number().default(0),
});

export const videosSchema = z.object({
  videos: z
    .array(videoSchema)
    .min(1, "En az 1 video eklemelisiniz")
    .max(20, "En fazla 20 video ekleyebilirsiniz"),
});

export type VideoFormData = z.infer<typeof videoSchema>;
export type VideosFormData = z.infer<typeof videosSchema>;

// Step 3: Sorular
export const questionOptionSchema = z.object({
  id: z.string().optional(),
  optionText: z.string().min(1, "Şık metni boş olamaz"),
  isCorrect: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  questionText: z
    .string()
    .min(10, "Soru metni en az 10 karakter olmalıdır")
    .max(1000, "Soru metni en fazla 1000 karakter olabilir"),
  questionType: z.enum(["multiple_choice", "true_false"]).default("multiple_choice"),
  points: z.number().min(1, "Puan en az 1 olmalıdır").max(100, "Puan en fazla 100 olabilir").default(10),
  sortOrder: z.number().default(0),
  options: z
    .array(questionOptionSchema)
    .min(2, "En az 2 şık eklemelisiniz")
    .max(6, "En fazla 6 şık ekleyebilirsiniz")
    .refine(
      (options) => options.filter((opt) => opt.isCorrect).length === 1,
      "Tam olarak 1 doğru cevap seçmelisiniz"
    ),
});

export const questionsSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(5, "En az 5 soru eklemelisiniz")
    .max(100, "En fazla 100 soru ekleyebilirsiniz"),
});

export type QuestionOptionFormData = z.infer<typeof questionOptionSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type QuestionsFormData = z.infer<typeof questionsSchema>;

// Step 4: Atama
export const assignmentSchema = z.object({
  userIds: z
    .array(z.string())
    .min(1, "En az 1 personel seçmelisiniz")
    .max(500, "En fazla 500 personel seçebilirsiniz"),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;

// Tam form (tüm adımlar)
export const fullTrainingSchema = z.object({
  info: trainingInfoSchema,
  videos: videosSchema,
  questions: questionsSchema,
  assignment: assignmentSchema,
});

export type FullTrainingFormData = z.infer<typeof fullTrainingSchema>;

// ============================================================================
// FILTER & TABLE TYPES
// ============================================================================

export interface TrainingFilters {
  status?: TrainingStatusType;
  category?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  hospitalId?: string;
}

export interface TrainingListItem {
  id: string;
  title: string;
  category?: string | null;
  status: TrainingStatusType;
  startDate: Date;
  endDate: Date;
  videosCount: number;
  questionsCount: number;
  assignedCount: number;
  completedCount: number;
  averageScore?: number;
  createdAt: Date;
}

// ============================================================================
// STATS & ANALYTICS
// ============================================================================

export interface TrainingStats {
  totalTrainings: number;
  draftTrainings: number;
  publishedTrainings: number;
  archivedTrainings: number;
  totalAssignments: number;
  completedAssignments: number;
  averageCompletionRate: number;
  averageScore: number;
}

export interface TrainingDetailStats {
  totalAssigned: number;
  inProgress: number;
  completed: number;
  passed: number;
  failed: number;
  averageScore: number;
  averageAttempts: number;
  completionRate: number;
}
