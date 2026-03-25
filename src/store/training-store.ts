import { create } from "zustand";
import type {
  TrainingInfoFormData,
  VideoFormData,
  QuestionFormData,
  AssignmentFormData,
} from "@/types/training";

interface TrainingWizardState {
  // Wizard state
  currentStep: number;
  completedSteps: number[];

  // Form data
  info: Partial<TrainingInfoFormData>;
  videos: VideoFormData[];
  questions: QuestionFormData[];
  assignment: Partial<AssignmentFormData>;

  // Actions
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;

  // Form data actions
  setInfo: (data: Partial<TrainingInfoFormData>) => void;
  setVideos: (videos: VideoFormData[]) => void;
  addVideo: (video: VideoFormData) => void;
  removeVideo: (index: number) => void;
  updateVideo: (index: number, video: VideoFormData) => void;
  reorderVideos: (startIndex: number, endIndex: number) => void;

  setQuestions: (questions: QuestionFormData[]) => void;
  addQuestion: (question: QuestionFormData) => void;
  removeQuestion: (index: number) => void;
  updateQuestion: (index: number, question: QuestionFormData) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;

  setAssignment: (data: Partial<AssignmentFormData>) => void;

  // Reset
  reset: () => void;

  // Load existing training (for edit)
  loadTraining: (training: any) => void;
}

const initialState = {
  currentStep: 0,
  completedSteps: [],
  info: {},
  videos: [],
  questions: [],
  assignment: {},
};

export const useTrainingWizard = create<TrainingWizardState>((set, get) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),

  isStepComplete: (step) => get().completedSteps.includes(step),

  // Info
  setInfo: (data) =>
    set((state) => ({
      info: { ...state.info, ...data },
    })),

  // Videos
  setVideos: (videos) => set({ videos }),

  addVideo: (video) =>
    set((state) => ({
      videos: [...state.videos, { ...video, sortOrder: state.videos.length }],
    })),

  removeVideo: (index) =>
    set((state) => ({
      videos: state.videos
        .filter((_, i) => i !== index)
        .map((video, i) => ({ ...video, sortOrder: i })),
    })),

  updateVideo: (index, video) =>
    set((state) => ({
      videos: state.videos.map((v, i) => (i === index ? video : v)),
    })),

  reorderVideos: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.videos);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        videos: result.map((video, i) => ({ ...video, sortOrder: i })),
      };
    }),

  // Questions
  setQuestions: (questions) => set({ questions }),

  addQuestion: (question) =>
    set((state) => ({
      questions: [
        ...state.questions,
        { ...question, sortOrder: state.questions.length },
      ],
    })),

  removeQuestion: (index) =>
    set((state) => ({
      questions: state.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, sortOrder: i })),
    })),

  updateQuestion: (index, question) =>
    set((state) => ({
      questions: state.questions.map((q, i) => (i === index ? question : q)),
    })),

  reorderQuestions: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.questions);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        questions: result.map((q, i) => ({ ...q, sortOrder: i })),
      };
    }),

  // Assignment
  setAssignment: (data) =>
    set((state) => ({
      assignment: { ...state.assignment, ...data },
    })),

  // Reset
  reset: () => set(initialState),

  // Load existing training
  loadTraining: (training) => {
    set({
      info: {
        title: training.title,
        description: training.description,
        category: training.category || undefined,
        thumbnail: training.thumbnail || undefined,
        passingScore: training.passingScore,
        maxAttempts: training.maxAttempts,
        examDuration: training.examDuration,
        startDate: new Date(training.startDate),
        endDate: new Date(training.endDate),
      },
      videos: training.videos || [],
      questions:
        training.questions?.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          sortOrder: q.sortOrder,
          options: q.options || [],
        })) || [],
      assignment: {
        userIds: training.assignments?.map((a: any) => a.userId) || [],
      },
      completedSteps: [0, 1, 2, 3], // Mark all steps as complete for edit mode
    });
  },
}));

// Separate store for list filters
interface TrainingListState {
  filters: {
    status?: string;
    category?: string;
    search?: string;
  };
  setFilter: (key: string, value: string | undefined) => void;
  clearFilters: () => void;
}

export const useTrainingList = create<TrainingListState>((set) => ({
  filters: {},

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () => set({ filters: {} }),
}));
