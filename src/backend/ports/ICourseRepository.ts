import { Course } from '../domain/Course';

export interface ICourseRepository {
  findAll(): Promise<Course[]>;
  findById(id: string): Promise<Course | null>;
}
