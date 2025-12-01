import { IEnrollmentRepository } from '../../ports/IEnrollmentRepository';
import { Enrollment } from '../../domain/Enrollment';
import { prisma } from '../prisma';

export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  async findByStudentId(studentId: string): Promise<Enrollment[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
    });
    return enrollments;
  }

  async findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
    return enrollment;
  }

  async create(studentId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        completedLessons: [],
        progress: 0,
      },
    });
    return enrollment;
  }

  async updateProgress(studentId: string, courseId: string, completedLessons: string[], progress: number): Promise<Enrollment> {
    const enrollment = await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      data: {
        completedLessons,
        progress,
        lastAccessedAt: new Date(),
      },
    });
    return enrollment;
  }
}
