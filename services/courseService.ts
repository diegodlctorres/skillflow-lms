import { Course, ServiceResponse } from '../types';

// Mock Data
const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Patrones Modernos de React y Rendimiento',
    description: 'Domina patrones avanzados de componentes, optimización de hooks y estrategias de renderizado para aplicaciones escalables.',
    instructor: 'Sarah Drasner',
    thumbnailUrl: 'https://picsum.photos/id/1/800/600',
    level: 'Avanzado',
    totalDuration: '4h 30m',
    studentsCount: 1240,
    updatedAt: new Date('2023-10-15'),
    lessons: [
      { id: 'l1-1', title: 'Introducción al Renderizado', duration: '05:20', videoId: 'hQAHSlTtcmY', isLocked: false },
      { id: 'l1-2', title: 'Entendiendo useMemo', duration: '12:45', videoId: '95B8mnhh85k', isLocked: false },
      { id: 'l1-3', title: 'Composición de Componentes', duration: '08:30', videoId: '3XaXKiXtNjw', isLocked: false },
      { id: 'l1-4', title: 'Arquitectura de Custom Hooks', duration: '15:10', videoId: 'J-g9ZJha8c8', isLocked: true },
    ]
  },
  {
    id: 'c2',
    title: 'Arquitectura Orientada a Eventos en Node.js',
    description: 'Construye backends escalables usando event emitters, colas de mensajes y principios de arquitectura hexagonal.',
    instructor: 'Matteo Collina',
    thumbnailUrl: 'https://picsum.photos/id/20/800/600',
    level: 'Intermedio',
    totalDuration: '6h 15m',
    studentsCount: 890,
    updatedAt: new Date('2023-11-02'),
    lessons: [
      { id: 'l2-1', title: 'Monolito vs Microservicios', duration: '10:00', videoId: 'y881t8ilMyc', isLocked: false },
      { id: 'l2-2', title: 'Diseñando Eventos', duration: '14:20', videoId: 'STKCRSUsyP0', isLocked: true },
    ]
  },
  {
    id: 'c3',
    title: 'Maestría en Tailwind CSS',
    description: 'Deja de luchar contra CSS. Aprende a construir interfaces de usuario hermosas, responsivas y mantenibles rápidamente.',
    instructor: 'Adam Wathan',
    thumbnailUrl: 'https://picsum.photos/id/4/800/600',
    level: 'Principiante',
    totalDuration: '3h 45m',
    studentsCount: 3500,
    updatedAt: new Date('2023-09-20'),
    lessons: [
      { id: 'l3-1', title: 'Fundamentos Utility-First', duration: '06:15', videoId: 'mr15Xzb1Ook', isLocked: false },
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
    try {
      const response = await fetch('/api/courses');
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, error: 'Error al cargar cursos' };
    }
  },

  /**
   * Fetch a single course by ID.
   */
  async getCourseById(courseId: string): Promise<ServiceResponse<Course>> {
    try {
      const response = await fetch(`/api/courses?id=${courseId}`);
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching course:', error);
      return { data: null, error: 'Error al cargar el curso' };
    }
  }
};