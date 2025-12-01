import { ICourseRepository } from '../../ports/ICourseRepository';
import { Course } from '../../domain/Course';
import { prisma } from '../prisma';

export class PrismaCourseRepository implements ICourseRepository {
  async findAll(): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      include: { lessons: true },
    });
    return courses.map(c => ({
      ...c,
      lessons: c.lessons.map(l => ({
        ...l,
        isLocked: l.isLocked
      }))
    }));
  }

  async findById(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { lessons: true },
    });
    
    if (!course) return null;

    return {
      ...course,
      lessons: course.lessons.map(l => ({
        ...l,
        isLocked: l.isLocked
      }))
    };
  }
}
