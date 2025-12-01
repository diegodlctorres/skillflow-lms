import { VercelRequest, VercelResponse } from '@vercel/node';
import { EnrollmentController } from '../src/backend/infrastructure/controllers/EnrollmentController.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (req.query.courseId) {
      return EnrollmentController.getEnrollment(req, res);
    }
    return EnrollmentController.getStudentEnrollments(req, res);
  }

  if (req.method === 'POST') {
    if (req.body.action === 'mark_complete') {
        return EnrollmentController.markLessonCompleted(req, res);
    }
    return EnrollmentController.enroll(req, res);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
