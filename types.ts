export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., "10:05"
  videoId: string; // YouTube ID
  isLocked: boolean;
  // removed isCompleted from Lesson definition as it belongs to Enrollment now
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  totalDuration: string;
  studentsCount: number;
  lessons: Lesson[];
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  completedLessons: string[]; // Array of Lesson IDs
  progress: number; // Percentage 0-100
  enrolledAt: string; // ISO Date string
  lastAccessedAt: string; // ISO Date string
}

// Service Response Wrapper (for future error handling consistency)
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}