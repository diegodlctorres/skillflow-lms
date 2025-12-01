import { Enrollment } from '../domain/Enrollment';

export interface IEnrollmentRepository {
  findByStudentId(studentId: string): Promise<Enrollment[]>;
  findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null>;
  create(studentId: string, courseId: string): Promise<Enrollment>;
  updateProgress(studentId: string, courseId: string, completedLessons: string[], progress: number): Promise<Enrollment>;
}
