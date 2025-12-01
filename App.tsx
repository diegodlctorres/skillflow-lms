import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Compass, ChevronRight, AlertCircle, ArrowLeft, LogOut, User as UserIcon, CheckCircle, BookOpen } from 'lucide-react';
import { Course, Lesson, Enrollment } from './types';
import { courseService } from './services/courseService';
import { enrollmentService } from './services/enrollmentService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseCard } from './components/CourseCard';
import { Skeleton } from './components/Skeleton';
import { VideoPlayer } from './components/VideoPlayer';
import { LessonList } from './components/LessonList';
import { Toaster, toast } from 'sonner';

// --- Header ---
const Header: React.FC<{ onNavigate: (view: 'catalog' | 'my-learning') => void }> = ({ onNavigate }) => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 text-white p-1.5 rounded-lg">
            <Layout size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            SkillFlow<span className="text-primary-600">.</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => onNavigate('catalog')} className="text-primary-600 flex items-center gap-2 hover:text-primary-700 transition-colors">
            <Compass size={18} /> Catálogo
          </button>
          <button onClick={() => onNavigate('my-learning')} className="hover:text-slate-900 transition-colors">Mi Aprendizaje</button>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-slate-900 transition-colors p-2"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Iniciando sesión...' : <><UserIcon size={16} /> Modo Invitado</>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// --- View: Catalog ---
const CatalogView: React.FC<{ onSelectCourse: (id: string) => void }> = ({ onSelectCourse }) => {
  const { user, login } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: coursesData } = await courseService.getAllCourses();

      if (coursesData) {
        setCourses(coursesData);
        if (user) {
          const { data: enrollmentData } = await enrollmentService.getStudentEnrollments(user.id);
          if (enrollmentData) setEnrollments(enrollmentData);
        } else {
          setEnrollments([]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast.error('Por favor inicia sesión para inscribirte');
      await login();
      return;
    }

    setEnrollingId(courseId);
    const { data, error } = await enrollmentService.enroll(user.id, courseId);

    if (data) {
      setEnrollments(prev => [...prev, data]);
      toast.success('¡Inscripción Exitosa!', {
        description: 'Ahora puedes empezar a aprender.'
      });
    } else {
      toast.error('Inscripción Fallida', { description: error });
    }
    setEnrollingId(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Explorar Cursos</h1>
        <p className="text-slate-500 mt-2 text-lg">Domina nuevas habilidades con nuestras rutas guiadas por expertos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm h-96 flex flex-col gap-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <div className="mt-auto flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : (
          courses.map(course => {
            const enrollment = enrollments.find(e => e.courseId === course.id) || null;
            return (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollment}
                onClick={onSelectCourse}
                onEnroll={handleEnroll}
                isEnrolling={enrollingId === course.id}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// --- View: My Learning ---
const MyLearningView: React.FC<{ onSelectCourse: (id: string) => void }> = ({ onSelectCourse }) => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data: coursesData } = await courseService.getAllCourses();
      const { data: enrollmentData } = await enrollmentService.getStudentEnrollments(user.id);

      if (coursesData && enrollmentData) {
        const userCourseIds = enrollmentData.map(e => e.courseId);
        const filtered = coursesData.filter(c => userCourseIds.includes(c.id));
        setEnrolledCourses(filtered);
        setEnrollments(enrollmentData);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Inicia sesión para ver tu aprendizaje</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi Aprendizaje</h1>
        <p className="text-slate-500 mt-2 text-lg">Continúa donde lo dejaste.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm h-96 flex flex-col gap-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No estás inscrito en ningún curso</h3>
          <p className="text-slate-500 mt-2">Explora el catálogo para empezar a aprender.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments.find(e => e.courseId === course.id) || null}
              onClick={onSelectCourse}
              onEnroll={() => { }}
              isEnrolling={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- View: Player ---
const PlayerView: React.FC<{ courseId: string; onBack: () => void }> = ({ courseId, onBack }) => {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      setLoading(true);
      const { data: courseData } = await courseService.getCourseById(courseId);

      if (courseData) {
        setCourse(courseData);
        // Default to first lesson
        if (courseData.lessons.length > 0) {
          setActiveLesson(courseData.lessons[0]);
        }

        if (user) {
          const { data: enrollmentData } = await enrollmentService.getEnrollment(user.id, courseId);
          setEnrollment(enrollmentData);
        }
      }
      setLoading(false);
    };
    fetchContext();
  }, [courseId, user]);

  const handleLessonChange = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!user || !course || !activeLesson) return;

    setMarkingComplete(true);
    const { data } = await enrollmentService.markLessonAsCompleted(user.id, course, activeLesson.id);

    if (data) {
      setEnrollment(data);
      toast.success('¡Lección Completada!', {
        description: `Progreso guardado: ${data.progress}%`
      });
    }
    setMarkingComplete(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[480px] rounded-xl" />
          <Skeleton className="h-[480px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course || !activeLesson) return <div>Curso no encontrado</div>;

  const isLessonCompleted = enrollment?.completedLessons.includes(activeLesson.id);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-900 truncate">{course.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Content: Player */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-1 shadow-xl relative">
            <VideoPlayer videoId={activeLesson.videoId} title={activeLesson.title} />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">{activeLesson.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="font-medium text-primary-600">{course.instructor}</span>
                <span>•</span>
                <span>Lección {course.lessons.findIndex(l => l.id === activeLesson.id) + 1} de {course.lessons.length}</span>
              </div>
            </div>

            {/* Action Area */}
            {enrollment && (
              <button
                onClick={handleMarkComplete}
                disabled={isLessonCompleted || markingComplete}
                className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${isLessonCompleted
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
                  }
                    `}
              >
                {markingComplete ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLessonCompleted ? (
                  <CheckCircle size={18} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40" />
                )}
                {isLessonCompleted ? 'Completado' : 'Marcar como Completado'}
              </button>
            )}
          </div>

          <div className="prose prose-slate max-w-none pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Sobre esta lección</h3>
            <p className="text-slate-600">
              En esta lección, cubriremos los conceptos fundamentales requeridos para avanzar en el currículo de {course.title}.
            </p>
          </div>
        </div>

        {/* Sidebar: Lesson List */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
          <LessonList
            lessons={course.lessons}
            currentLessonId={activeLesson.id}
            completedLessonIds={enrollment?.completedLessons || []}
            onSelectLesson={handleLessonChange}
            isEnrolled={!!enrollment}
          />
        </div>
      </div>
    </div>
  );
};

// --- App Wrapper ---
const AppContent: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'player' | 'my-learning'>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    setView('player');
    window.scrollTo(0, 0);
  };

  const handleBackToCatalog = () => {
    setView('catalog');
    setSelectedCourseId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onNavigate={setView} />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'catalog' ? (
          <CatalogView onSelectCourse={handleSelectCourse} />
        ) : view === 'my-learning' ? (
          <MyLearningView onSelectCourse={handleSelectCourse} />
        ) : selectedCourseId ? (
          <PlayerView courseId={selectedCourseId} onBack={handleBackToCatalog} />
        ) : (
          <CatalogView onSelectCourse={handleSelectCourse} />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors duration={2000} closeButton />
      <AppContent />
    </AuthProvider>
  );
}