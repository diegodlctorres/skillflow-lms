export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoId: string;
  isLocked: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  level: string;
  totalDuration: string;
  studentsCount: number;
  lessons: Lesson[];
  updatedAt: Date;
}
