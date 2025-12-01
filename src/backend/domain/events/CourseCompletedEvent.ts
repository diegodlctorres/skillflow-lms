import { DomainEvent } from './DomainEvent.js';

export class CourseCompletedEvent implements DomainEvent {
  eventName = 'CourseCompleted';
  occurredOn: Date;

  constructor(
    public readonly studentId: string,
    public readonly courseId: string
  ) {
    this.occurredOn = new Date();
  }
}
