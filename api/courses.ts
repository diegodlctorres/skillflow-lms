import { VercelRequest, VercelResponse } from '@vercel/node';
import { CourseController } from '../src/backend/infrastructure/controllers/CourseController.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (req.query.id) {
      return CourseController.getById(req, res);
    }
    return CourseController.getAll(req, res);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
