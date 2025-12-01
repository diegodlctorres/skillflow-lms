import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaEnrollmentRepository } from '../repositories/PrismaEnrollmentRepository';
import { InMemoryEventBus } from '../events/InMemoryEventBus';
import { LessonCompletedEvent } from '../../domain/events/LessonCompletedEvent';

const enrollmentRepository = new PrismaEnrollmentRepository();

export class EnrollmentController {
  static async getStudentEnrollments(req: VercelRequest, res: VercelResponse) {
    const { studentId } = req.query;
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ data: null, error: 'Missing studentId' });
    }

    try {
      const enrollments = await enrollmentRepository.findByStudentId(studentId);
      res.status(200).json({ data: enrollments, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: null, error: 'Internal Server Error' });
    }
  }

  static async getEnrollment(req: VercelRequest, res: VercelResponse) {
    const { studentId, courseId } = req.query;
    if (!studentId || typeof studentId !== 'string' || !courseId || typeof courseId !== 'string') {
      return res.status(400).json({ data: null, error: 'Missing parameters' });
    }

    try {
      const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
      res.status(200).json({ data: enrollment, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: null, error: 'Internal Server Error' });
    }
  }

  static async enroll(req: VercelRequest, res: VercelResponse) {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ data: null, error: 'Missing parameters' });
    }

    try {
      const existing = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
      if (existing) {
        return res.status(400).json({ data: existing, error: 'Ya estás inscrito' });
      }

      const enrollment = await enrollmentRepository.create(studentId, courseId);
      res.status(200).json({ data: enrollment, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: null, error: 'Internal Server Error' });
    }
  }

  static async markLessonCompleted(req: VercelRequest, res: VercelResponse) {
    const { studentId, courseId, lessonId, totalLessons } = req.body;
    
    // Note: In a real app, we should fetch course to get totalLessons, but for simplicity we accept it or fetch it.
    // Let's fetch the enrollment first.
    try {
      const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
      if (!enrollment) {
        return res.status(404).json({ data: null, error: 'Inscripción no encontrada' });
      }

      if (!enrollment.completedLessons.includes(lessonId)) {
        const newCompleted = [...enrollment.completedLessons, lessonId];
        const progress = Math.round((newCompleted.length / totalLessons) * 100);
        
        const updated = await enrollmentRepository.updateProgress(studentId, courseId, newCompleted, progress);
        
        // Publish Domain Event
        const eventBus = InMemoryEventBus.getInstance();
        const event = new LessonCompletedEvent(studentId, courseId, lessonId);
        await eventBus.publish(event);

        return res.status(200).json({ data: updated, error: null });
      }

      return res.status(200).json({ data: enrollment, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: null, error: 'Internal Server Error' });
    }
  }
}
