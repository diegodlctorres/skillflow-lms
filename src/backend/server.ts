import express from 'express';
import cors from 'cors';
import { CourseController } from './infrastructure/controllers/CourseController';
import { EnrollmentController } from './infrastructure/controllers/EnrollmentController';
import { CourseCompletionSubscriber } from './application/subscribers/CourseCompletionSubscriber';

// Initialize Subscribers
new CourseCompletionSubscriber();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock Vercel Request/Response for Controllers
const adaptRequest = (req: any) => req;
const adaptResponse = (res: any) => res;

// Courses Routes
app.get('/api/courses', async (req, res) => {
  if (req.query.id) {
    await CourseController.getById(adaptRequest(req), adaptResponse(res));
  } else {
    await CourseController.getAll(adaptRequest(req), adaptResponse(res));
  }
});

// Enrollments Routes
app.get('/api/enrollments', async (req, res) => {
  if (req.query.courseId) {
    await EnrollmentController.getEnrollment(adaptRequest(req), adaptResponse(res));
  } else {
    await EnrollmentController.getStudentEnrollments(adaptRequest(req), adaptResponse(res));
  }
});

app.post('/api/enrollments', async (req, res) => {
  if (req.body.action === 'mark_complete') {
    await EnrollmentController.markLessonCompleted(adaptRequest(req), adaptResponse(res));
  } else {
    await EnrollmentController.enroll(adaptRequest(req), adaptResponse(res));
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
