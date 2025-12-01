import React from 'react';
import { Lesson } from '../types';
import { PlayCircle, Lock, CheckCircle2, Clock } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId: string;
  completedLessonIds: string[];
  onSelectLesson: (lesson: Lesson) => void;
  isEnrolled: boolean;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
  isEnrolled
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Contenido del Curso</h3>
        <p className="text-xs text-slate-500 mt-1">{lessons.length} lecciones</p>
      </div>

      <div className="overflow-y-auto flex-grow">
        {lessons.map((lesson, index) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          // Unlock if it's the first lesson, OR previous lesson is completed, OR the lesson itself is completed
          // Simplified: Logic for locking can be complex. For now, rely on lesson.isLocked from mock OR allow all if enrolled.
          // Let's stick to the visual representation requested.
          const isLocked = !isEnrolled && lesson.isLocked;

          return (
            <button
              key={lesson.id}
              onClick={() => !isLocked && onSelectLesson(lesson)}
              disabled={isLocked}
              className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-l-4 border-transparent
                ${isActive ? 'bg-primary-50 border-l-primary-600' : 'hover:bg-slate-50'}
                ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="mt-1 flex-shrink-0 text-slate-400">
                {isCompleted ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : isLocked ? (
                  <Lock size={18} />
                ) : isActive ? (
                  <PlayCircle size={18} className="text-primary-600 animate-pulse" />
                ) : (
                  <span className="text-xs font-mono font-medium bg-slate-100 w-5 h-5 flex items-center justify-center rounded-full">
                    {index + 1}
                  </span>
                )}
              </div>

              <div className="flex-grow">
                <h4 className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-slate-700'}`}>
                  {lesson.title}
                </h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{lesson.duration}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};