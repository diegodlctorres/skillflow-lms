import { CourseCompletionSubscriber } from '../CourseCompletionSubscriber';
import { LessonCompletedEvent } from '../../../domain/events/LessonCompletedEvent';
import { CourseCompletedEvent } from '../../../domain/events/CourseCompletedEvent';
import { InMemoryEventBus } from '../../../infrastructure/events/InMemoryEventBus';
import { PrismaEnrollmentRepository } from '../../../infrastructure/repositories/PrismaEnrollmentRepository';

// Mock dependencies
jest.mock('../../../infrastructure/events/InMemoryEventBus');
jest.mock('../../../infrastructure/repositories/PrismaEnrollmentRepository');

describe('CourseCompletionSubscriber', () => {
  let subscriber: CourseCompletionSubscriber;
  let mockEventBus: any;
  let mockEnrollmentRepository: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup EventBus mock
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
    };
    (InMemoryEventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);

    // Setup Repository mock
    mockEnrollmentRepository = {
      findByStudentAndCourse: jest.fn(),
    };
    (PrismaEnrollmentRepository as jest.Mock).mockImplementation(() => mockEnrollmentRepository);

    // Initialize subscriber
    subscriber = new CourseCompletionSubscriber();
  });

  it('should subscribe to LessonCompleted event on initialization', () => {
    expect(mockEventBus.subscribe).toHaveBeenCalledWith('LessonCompleted', expect.any(Function));
  });

  it('should publish CourseCompletedEvent when progress is 100%', async () => {
    // Arrange
    const event = new LessonCompletedEvent('student-1', 'course-1', 'lesson-1');
    mockEnrollmentRepository.findByStudentAndCourse.mockResolvedValue({
      studentId: 'student-1',
      courseId: 'course-1',
      progress: 100,
    });

    // Act
    // We need to access the private handler or simulate the event bus call.
    // Since we mocked subscribe, we can grab the callback passed to it.
    const callback = mockEventBus.subscribe.mock.calls[0][1];
    await callback(event);

    // Assert
    expect(mockEnrollmentRepository.findByStudentAndCourse).toHaveBeenCalledWith('student-1', 'course-1');
    expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(CourseCompletedEvent));
    
    const publishedEvent = mockEventBus.publish.mock.calls[0][0];
    expect(publishedEvent.studentId).toBe('student-1');
    expect(publishedEvent.courseId).toBe('course-1');
  });

  it('should NOT publish CourseCompletedEvent when progress is less than 100%', async () => {
    // Arrange
    const event = new LessonCompletedEvent('student-1', 'course-1', 'lesson-1');
    mockEnrollmentRepository.findByStudentAndCourse.mockResolvedValue({
      studentId: 'student-1',
      courseId: 'course-1',
      progress: 50,
    });

    // Act
    const callback = mockEventBus.subscribe.mock.calls[0][1];
    await callback(event);

    // Assert
    expect(mockEnrollmentRepository.findByStudentAndCourse).toHaveBeenCalledWith('student-1', 'course-1');
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });
});
