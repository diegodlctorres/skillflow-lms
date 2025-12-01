import { DomainEvent } from './DomainEvent.js';

export class LessonCompletedEvent implements DomainEvent {
  eventName = 'LessonCompleted';
  occurredOn: Date;

  constructor(
    public readonly studentId: string,
    public readonly courseId: string,
    public readonly lessonId: string
  ) {
    this.occurredOn = new Date();
  }
}
