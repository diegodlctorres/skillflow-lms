import { LessonCompletedEvent } from '../../domain/events/LessonCompletedEvent';
import { CourseCompletedEvent } from '../../domain/events/CourseCompletedEvent';
import { InMemoryEventBus } from '../../infrastructure/events/InMemoryEventBus';
import { PrismaEnrollmentRepository } from '../../infrastructure/repositories/PrismaEnrollmentRepository';

export class CourseCompletionSubscriber {
  constructor() {
    const eventBus = InMemoryEventBus.getInstance();
    eventBus.subscribe('LessonCompleted', this.onLessonCompleted.bind(this));
  }

  private async onLessonCompleted(event: LessonCompletedEvent): Promise<void> {
    console.log(`[Subscriber] Checking course completion for student ${event.studentId} in course ${event.courseId}`);
    
    const enrollmentRepository = new PrismaEnrollmentRepository();
    const enrollment = await enrollmentRepository.findByStudentAndCourse(event.studentId, event.courseId);

    if (enrollment && enrollment.progress === 100) {
      console.log(`[Subscriber] Course ${event.courseId} completed by ${event.studentId}! Publishing CourseCompletedEvent.`);
      
      const courseCompletedEvent = new CourseCompletedEvent(event.studentId, event.courseId);
      await InMemoryEventBus.getInstance().publish(courseCompletedEvent);
    }
  }
}
