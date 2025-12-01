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
    try {
      const response = await fetch(`/api/enrollments?studentId=${studentId}`);
      const json = await response.json();
      return json;
    } catch (error) {
       console.error('Error fetching enrollments:', error);
       return { data: [], error: 'Error al cargar inscripciones' };
    }
  },

  /**
   * Get a specific enrollment for a student and course.
   */
  async getEnrollment(studentId: string, courseId: string): Promise<ServiceResponse<Enrollment>> {
    try {
        const response = await fetch(`/api/enrollments?studentId=${studentId}&courseId=${courseId}`);
        const json = await response.json();
        return json;
    } catch (error) {
        return { data: null, error: 'Error al cargar inscripción' };
    }
  },

  /**
   * Enroll a student in a course.
   */
  async enroll(studentId: string, courseId: string): Promise<ServiceResponse<Enrollment>> {
    try {
        const response = await fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, courseId })
        });
        const json = await response.json();
        return json;
    } catch (error) {
        return { data: null, error: 'Error al inscribirse' };
    }
  },

  /**
   * Mark a lesson as completed and recalculate progress.
   */
  async markLessonAsCompleted(studentId: string, course: Course, lessonId: string): Promise<ServiceResponse<Enrollment>> {
    try {
        const response = await fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'mark_complete',
                studentId, 
                courseId: course.id, 
                lessonId,
                totalLessons: course.lessons.length
            })
        });
        const json = await response.json();
        return json;
    } catch (error) {
        return { data: null, error: 'Error al actualizar progreso' };
    }
  }
};