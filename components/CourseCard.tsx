import React from 'react';
import { Course, Enrollment } from '../types';
import { BookOpen, Users, Clock, PlayCircle, PlusCircle, CheckCircle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  enrollment: Enrollment | null;
  onClick: (id: string) => void;
  onEnroll: (courseId: string) => void;
  isEnrolling: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrollment,
  onClick,
  onEnroll,
  isEnrolling
}) => {

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll(course.id);
  };

  return (
    <div
      onClick={() => onClick(course.id)}
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-primary-700 shadow-sm">
          {course.level}
        </div>

        {/* Progress Overlay if enrolled */}
        {enrollment && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
          {course.description}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between text-slate-400 text-xs pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{course.studentsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{course.totalDuration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={14} />
              <span>{course.lessons.length}</span>
            </div>
          </div>

          {/* Action Button */}
          {enrollment ? (
            enrollment.progress === 100 ? (
              <button className="w-full py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 cursor-default">
                <CheckCircle size={16} />
                ¡Completado!
              </button>
            ) : (
              <button className="w-full py-2 bg-primary-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2">
                <PlayCircle size={16} />
                Continuar Aprendiendo ({enrollment.progress}%)
              </button>
            )
          ) : (
            <button
              onClick={handleEnrollClick}
              disabled={isEnrolling}
              className="w-full py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isEnrolling ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <PlusCircle size={16} />
              )}
              {isEnrolling ? 'Inscribiendo...' : 'Inscribirse Ahora'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};