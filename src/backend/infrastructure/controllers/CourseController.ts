import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaCourseRepository } from '../repositories/PrismaCourseRepository';

const courseRepository = new PrismaCourseRepository();

export class CourseController {
  static async getAll(req: VercelRequest, res: VercelResponse) {
    try {
      const courses = await courseRepository.findAll();
      res.status(200).json({ data: courses, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: null, error: 'Internal Server Error' });
    }
  }

  static async getById(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ data: null, error: 'Missing or invalid id' });
    }

    try {
      const course = await courseRepository.findById(id);
      if (!course) {
        return res.status(404).json({ data: null, error: 'Curso no encontrado' });
      }
      res.status(200).json({ data: course, error: null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: null, error: 'Internal Server Error' });
    }
  }
}
