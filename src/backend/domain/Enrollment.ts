export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  completedLessons: string[];
  progress: number;
  enrolledAt: Date;
  lastAccessedAt: Date;
}
