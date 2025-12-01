import { Course, ServiceResponse } from '../types';

// Mock Data
const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Modern React Patterns & Performance',
    description: 'Master advanced component patterns, hooks optimization, and rendering strategies for scalable applications.',
    instructor: 'Sarah Drasner',
    thumbnailUrl: 'https://picsum.photos/id/1/800/600',
    level: 'Advanced',
    totalDuration: '4h 30m',
    studentsCount: 1240,
    updatedAt: new Date('2023-10-15'),
    lessons: [
      { id: 'l1-1', title: 'Introduction to Rendering', duration: '05:20', videoId: 'hQAHSlTtcmY', isLocked: false },
      { id: 'l1-2', title: 'Understanding useMemo', duration: '12:45', videoId: '95B8mnhh85k', isLocked: false },
      { id: 'l1-3', title: 'Component Composition', duration: '08:30', videoId: '3XaXKiXtNjw', isLocked: false },
      { id: 'l1-4', title: 'Custom Hooks Architecture', duration: '15:10', videoId: 'J-g9ZJha8c8', isLocked: true },
    ]
  },
  {
    id: 'c2',
    title: 'Event-Driven Architecture in Node.js',
    description: 'Build scalable backends using event emitters, message queues, and hexagonal architecture principles.',
    instructor: 'Matteo Collina',
    thumbnailUrl: 'https://picsum.photos/id/20/800/600',
    level: 'Intermediate',
    totalDuration: '6h 15m',
    studentsCount: 890,
    updatedAt: new Date('2023-11-02'),
    lessons: [
      { id: 'l2-1', title: 'Monolith vs Microservices', duration: '10:00', videoId: 'y881t8ilMyc', isLocked: false },
      { id: 'l2-2', title: 'Designing Events', duration: '14:20', videoId: 'STKCRSUsyP0', isLocked: true },
    ]
  },
  {
    id: 'c3',
    title: 'Tailwind CSS Mastery',
    description: 'Stop fighting CSS. Learn to build beautiful, responsive, and maintainable user interfaces rapidly.',
    instructor: 'Adam Wathan',
    thumbnailUrl: 'https://picsum.photos/id/4/800/600',
    level: 'Beginner',
    totalDuration: '3h 45m',
    studentsCount: 3500,
    updatedAt: new Date('2023-09-20'),
    lessons: [
      { id: 'l3-1', title: 'Utility-First Fundamentals', duration: '06:15', videoId: 'mr15Xzb1Ook', isLocked: false },
    ]
  }
];

/**
 * Simulates a network delay to mimic async backend calls.
 */
const simulateNetworkDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const courseService = {
  /**
   * Fetch all available courses.
   */
  async getAllCourses(): Promise<ServiceResponse<Course[]>> {
    await simulateNetworkDelay();
    // Simulate randomness or errors here if needed for testing
    return { data: MOCK_COURSES, error: null };
  },

  /**
   * Fetch a single course by ID.
   */
  async getCourseById(courseId: string): Promise<ServiceResponse<Course>> {
    await simulateNetworkDelay(500); // Faster than full list
    const course = MOCK_COURSES.find(c => c.id === courseId);
    
    if (!course) {
      return { data: null, error: 'Course not found' };
    }
    
    return { data: course, error: null };
  }
};