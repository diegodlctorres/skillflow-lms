import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Mock Data (Translated)
  const MOCK_USER = {
    id: 'student-1',
    name: 'Alejandro Dev',
    email: 'alex@skillflow.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  };

  const MOCK_COURSES = [
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
    },
    {
      id: 'c4',
      title: 'Node.js: De Cero a Experto',
      description: 'Aprende Node.js desde las bases hasta el despliegue. Express, MongoDB, JWT y WebSockets.',
      instructor: 'Fernando Herrera',
      thumbnailUrl: 'https://picsum.photos/id/60/800/600',
      level: 'Intermedio',
      totalDuration: '12h 30m',
      studentsCount: 2100,
      updatedAt: new Date('2023-11-10'),
      lessons: [
        { id: 'l4-1', title: 'Introducción a Node.js', duration: '08:00', videoId: 'yEHCfRWz-EI', isLocked: false },
        { id: 'l4-2', title: 'File System y Streams', duration: '15:30', videoId: 'U8XF6AFGqlc', isLocked: false },
        { id: 'l4-3', title: 'Rest API con Express', duration: '20:00', videoId: 'GGTKTspKse0', isLocked: true },
      ]
    },
    {
      id: 'c5',
      title: 'Python para Data Science',
      description: 'Domina el análisis de datos con Python, Pandas, Matplotlib y Seaborn. Introducción a Machine Learning.',
      instructor: 'Midudev',
      thumbnailUrl: 'https://picsum.photos/id/100/800/600',
      level: 'Principiante',
      totalDuration: '8h 00m',
      studentsCount: 1500,
      updatedAt: new Date('2023-10-05'),
      lessons: [
        { id: 'l5-1', title: 'Variables y Tipos de Datos', duration: '10:00', videoId: 'Kp4Mvapo5kc', isLocked: false },
        { id: 'l5-2', title: 'Introducción a Pandas', duration: '18:45', videoId: 'gtjxAH8uaDs', isLocked: false },
        { id: 'l5-3', title: 'Visualización de Datos', duration: '14:20', videoId: 'a9UrKTVEeZA', isLocked: true },
      ]
    },
    {
      id: 'c6',
      title: 'Diseño UI/UX Moderno',
      description: 'Aprende a diseñar interfaces hermosas y funcionales. Teoría del color, tipografía y prototipado en Figma.',
      instructor: 'Laura Silva',
      thumbnailUrl: 'https://picsum.photos/id/180/800/600',
      level: 'Principiante',
      totalDuration: '5h 15m',
      studentsCount: 3200,
      updatedAt: new Date('2023-09-15'),
      lessons: [
        { id: 'l6-1', title: 'Introducción al Diseño UI', duration: '12:00', videoId: 'c9Wg6Cb_YlU', isLocked: false },
        { id: 'l6-2', title: 'Psicología del Color', duration: '09:30', videoId: 'AvgCkHrcj90', isLocked: false },
        { id: 'l6-3', title: 'Prototipado en Figma', duration: '25:00', videoId: '4W4LvNYpAnY', isLocked: true },
      ]
    },
    {
      id: 'c7',
      title: 'DevOps con Docker y Kubernetes',
      description: 'Automatiza tus despliegues. Contenedores, orquestación, CI/CD pipelines y monitoreo.',
      instructor: 'Nana Janashia',
      thumbnailUrl: 'https://picsum.photos/id/250/800/600',
      level: 'Avanzado',
      totalDuration: '10h 45m',
      studentsCount: 950,
      updatedAt: new Date('2023-11-20'),
      lessons: [
        { id: 'l7-1', title: '¿Qué es Docker?', duration: '15:00', videoId: 'fqMOX6JJhGo', isLocked: false },
        { id: 'l7-2', title: 'Creando tu primer contenedor', duration: '12:00', videoId: 'gAkwW2tuIqE', isLocked: false },
        { id: 'l7-3', title: 'Arquitectura de Kubernetes', duration: '22:15', videoId: 's_o8dwzRlu4', isLocked: true },
      ]
    }
  ];

  // 1. Create User
  await prisma.user.upsert({
    where: { email: MOCK_USER.email },
    update: {},
    create: MOCK_USER,
  });

  console.log('User seeded');

  // 2. Create Courses and Lessons
  for (const course of MOCK_COURSES) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {},
      create: {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnailUrl: course.thumbnailUrl,
        level: course.level,
        totalDuration: course.totalDuration,
        studentsCount: course.studentsCount,
        updatedAt: course.updatedAt,
        lessons: {
          create: course.lessons.map(l => ({
            id: l.id,
            title: l.title,
            duration: l.duration,
            videoId: l.videoId,
            isLocked: l.isLocked,
          }))
        }
      }
    });
  }

  console.log('Courses and Lessons seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
