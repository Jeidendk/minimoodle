import React from 'react';
import { courseProgress } from '../utils/helpers';

export default function CourseCard({ course, attempts, quizzes, user, layout, onClick, onDelete, onEdit }) {
  const courseQuizzes = quizzes.filter((quiz) => quiz.course_id === course.id);
  const completed = courseProgress(course, { quizzes, attempts }, user);
  
  // Define icons based on course ID to match the image
  const getIcon = () => {
    if (course.id === 'ciencias') {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      );
    } else if (course.id === 'lengua') {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
    } else if (course.id === 'sociales') {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      );
    } else {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="14" x2="23" y2="14"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
      );
    }
  };

  // Convert hex to rgb for rgba background
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
  };

  const bgColor = `rgba(${hexToRgb(course.color)}, 0.15)`;
  
  // Mock data for visual fidelity
  const students = course.id === 'ciencias' ? 28 : course.id === 'lengua' ? 26 : course.id === 'sociales' ? 24 : 30;
  const resources = course.id === 'ciencias' ? 12 : course.id === 'lengua' ? 15 : course.id === 'sociales' ? 10 : 14;

  return (
    <div className={`course-card-new ${layout === "list" ? "list-mode" : ""}`}>
      <div className="course-card-border" style={{ backgroundColor: course.color }}></div>
      <div className="course-card-body">
        
        <div className="course-card-header-new">
          <div className="course-card-icon-new" style={{ backgroundColor: bgColor, color: course.color }}>
            {getIcon()}
          </div>
          <div className="course-card-title-box">
            <h3 className="course-card-title">{course.title}</h3>
            <span className="course-card-subtitle">Inaval 3ro BGU • Paralelo {course.paralleloNum ?? (course.id === 'lengua' ? 1 : course.id === 'matematica' ? 1 : 0)}</span>
          </div>
          {(onEdit || onDelete) && (
            <div className="course-card-actions">
              {onEdit && (
                <button 
                  className="course-card-edit-btn"
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  title="Editar curso"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              )}
              {onDelete && (
                <button 
                  className="course-card-delete-btn"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  title="Eliminar curso"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="course-card-stats">
          <div className="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{students} estudiantes</span>
          </div>
          <div className="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <polyline points="9 15 11 17 15 13"></polyline>
            </svg>
            <span>{courseQuizzes.length} {courseQuizzes.length === 1 ? 'evaluación' : 'evaluaciones'}</span>
          </div>
        </div>
        
        <div className="course-card-progress">
          <div className="progress-labels">
            <span>Progreso del curso</span>
            <span>{completed}%</span>
          </div>
          <div className="progress-bar-bg-new">
            <div className="progress-bar-fill-new" style={{ width: `${completed}%`, backgroundColor: course.color }}></div>
          </div>
        </div>

        <div className="course-card-dates">
          <div className="date-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div>
              <strong>Última actividad</strong>
              <span>No hay actividad aún</span>
            </div>
          </div>
          <div className="date-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div>
              <strong>Próxima clase</strong>
              <span>Sin programar</span>
            </div>
          </div>
        </div>

        <div className="course-card-resources">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Recursos disponibles <strong>{resources}</strong></span>
        </div>
        
        <button 
          className="course-card-button" 
          style={{ backgroundColor: bgColor, color: course.color }} 
          onClick={onClick}
        >
          Entrar al curso
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
