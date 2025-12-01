import { Enrollment, ServiceResponse, Course } from '../types';

const STORAGE_KEY = 'skillflow_enrollments';

const simulateNetworkDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data from local storage
const getStoredEnrollments = (): Enrollment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to parse enrollments', e);
    return [];
  }
};

// Helper to save data
const saveEnrollments = (enrollments: Enrollment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
};

export const enrollmentService = {
  /**
   * Get all enrollments for a specific student.
   */
  async getStudentEnrollments(studentId: string): Promise<ServiceResponse<Enrollment[]>> {
    await simulateNetworkDelay(400); // Simulate fetch
    const allEnrollments = getStoredEnrollments();
    const studentEnrollments = allEnrollments.filter(e => e.studentId === studentId);
    return { data: studentEnrollments, error: null };
  },

  /**
   * Get a specific enrollment for a student and course.
   */
  async getEnrollment(studentId: string, courseId: string): Promise<ServiceResponse<Enrollment>> {
    // No delay here for snappier UI checks, or small delay
    const allEnrollments = getStoredEnrollments();
    const enrollment = allEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    return { data: enrollment || null, error: null };
  },

  /**
   * Enroll a student in a course.
   */
  async enroll(studentId: string, courseId: string): Promise<ServiceResponse<Enrollment>> {
    await simulateNetworkDelay(1000); // 1s delay as requested

    const allEnrollments = getStoredEnrollments();
    
    // Check if already enrolled
    const existing = allEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existing) {
      return { data: existing, error: 'Ya estás inscrito' };
    }

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      studentId,
      courseId,
      completedLessons: [],
      progress: 0,
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    allEnrollments.push(newEnrollment);
    saveEnrollments(allEnrollments);

    return { data: newEnrollment, error: null };
  },

  /**
   * Mark a lesson as completed and recalculate progress.
   */
  async markLessonAsCompleted(studentId: string, course: Course, lessonId: string): Promise<ServiceResponse<Enrollment>> {
    await simulateNetworkDelay(500);

    const allEnrollments = getStoredEnrollments();
    const index = allEnrollments.findIndex(e => e.studentId === studentId && e.courseId === course.id);

    if (index === -1) {
      return { data: null, error: 'Inscripción no encontrada' };
    }

    const enrollment = allEnrollments[index];

    // Idempotency check
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate progress
      const totalLessons = course.lessons.length;
      const completedCount = enrollment.completedLessons.length;
      enrollment.progress = Math.round((completedCount / totalLessons) * 100);
      enrollment.lastAccessedAt = new Date().toISOString();

      // Save
      allEnrollments[index] = enrollment;
      saveEnrollments(allEnrollments);
    }

    return { data: enrollment, error: null };
  }
};