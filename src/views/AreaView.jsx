import React from 'react';
import { hasSupabase } from '../lib/data';

export default function AreaView({ data, user, goCourse, goQuiz }) {
  // Use available data or mock data for the static visual parts
  const publishedQuizzes = data.quizzes.filter((quiz) => quiz.published);
  const completedQuizIds = new Set(data.attempts.filter((attempt) => attempt.student_id === user.id).map((attempt) => attempt.quiz_id));
  const nextQuiz = publishedQuizzes.find((quiz) => !completedQuizIds.has(quiz.id));
  
  const isTeacher = user?.role === 'teacher';

  return (
    <section className="dashboard-teacher fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner-inline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem', background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' }}>
        
        <div className="welcome-text" style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#0F172A' }}>
            Hola, {user?.full_name?.split(' ')[0] || 'Estudiante'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            ¡Que tengas un excelente día académico! Aquí tienes un resumen de tu actividad.
          </p>
        </div>
        
        {/* Metric Cards - Conditional based on role */}
        <div className="metrics-row-inline" style={{ display: 'flex', gap: '1rem', flex: isTeacher ? '2' : '1', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          
          {/* Cursos inscritos (Both) */}
          <div className="metric-card-new" style={{ padding: '1rem', flex: '1', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div className="metric-icon blue-bg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" opacity="0.3"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <div className="metric-info" style={{ flex: 1 }}>
               <h4 style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Cursos inscritos</h4>
               <div className="metric-value" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', lineHeight: '1' }}>{data.courses.length || 4}</div>
             </div>
          </div>
          
          {/* Evaluaciones pendientes (Teacher Only) */}
          {isTeacher && (
            <div className="metric-card-new" style={{ padding: '1rem', flex: '1', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div className="metric-icon cyan-bg">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                   <polyline points="9 15 11 17 15 13"></polyline>
                 </svg>
               </div>
               <div className="metric-info" style={{ flex: 1 }}>
                 <h4 style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Evaluaciones</h4>
                 <div className="metric-value" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', lineHeight: '1' }}>7</div>
                 <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>Por calificar</p>
               </div>
            </div>
          )}

          {/* Progreso general (Both) */}
          <div className="metric-card-new" style={{ padding: '1rem', flex: '1', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div className="metric-icon green-bg">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                 <polyline points="16 7 22 7 22 13"></polyline>
               </svg>
             </div>
             <div className="metric-info" style={{ flex: 1 }}>
               <h4 style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Progreso general</h4>
               <div className="metric-value" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', lineHeight: '1' }}>68%</div>
             </div>
          </div>
          
          {/* Estudiantes activos (Teacher Only) */}
          {isTeacher && (
            <div className="metric-card-new" style={{ padding: '1rem', flex: '1', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div className="metric-icon orange-bg">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                   <circle cx="9" cy="7" r="4"></circle>
                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                 </svg>
               </div>
               <div className="metric-info" style={{ flex: 1 }}>
                 <h4 style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Estudiantes activos</h4>
                 <div className="metric-value" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', lineHeight: '1' }}>86</div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Layout depends on role */}
      <div className={`dashboard-grid-${isTeacher ? '4' : '3'}`}>
        
        {/* Siguiente actividad sugerida (Both) */}
        <div className="panel-new col-span-1">
          <h3 className="panel-title-new">Siguiente actividad sugerida</h3>
          <div className="activity-card-inner">
             <div className="activity-header">
                <div className="course-icon teal">R</div>
                <div className="activity-header-text">
                   <h4>Razonamiento Matemático</h4>
                   <p>Unidad 2: Proporciones y porcentajes</p>
                </div>
             </div>
             <p className="activity-desc">Resuelve ejercicios aplicando proporciones y porcentajes en contextos reales.</p>
             <div className="activity-footer-new">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  25 min estimados
                </span>
                <button className="btn-primary-new small-btn">Comenzar ahora →</button>
             </div>
          </div>
        </div>

        {/* Mis cursos (Both) */}
        <div className="panel-new col-span-1">
          <div className="panel-header">
             <h3 className="panel-title-new">Mis cursos</h3>
             <a href="#" className="link-action" onClick={(e)=>{e.preventDefault(); goCourse && goCourse(null)}}>Ver todos</a>
          </div>
          <div className="courses-list-new">
             <div className="course-progress-item">
                <div className="course-icon blue small">R</div>
                <div className="course-progress-info">
                   <div className="course-progress-text">
                      <span>Razonamiento Matemático</span>
                      <span className="percent">68%</span>
                   </div>
                   <div className="progress-bar-bg"><div className="progress-bar-fill blue" style={{ width: '68%' }}></div></div>
                </div>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             <div className="course-progress-item">
                <div className="course-icon purple small">C</div>
                <div className="course-progress-info">
                   <div className="course-progress-text">
                      <span>Comprensión Lectora</span>
                      <span className="percent">72%</span>
                   </div>
                   <div className="progress-bar-bg"><div className="progress-bar-fill purple" style={{ width: '72%' }}></div></div>
                </div>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             <div className="course-progress-item">
                <div className="course-icon green small">CN</div>
                <div className="course-progress-info">
                   <div className="course-progress-text">
                      <span>Ciencias Naturales</span>
                      <span className="percent">54%</span>
                   </div>
                   <div className="progress-bar-bg"><div className="progress-bar-fill green" style={{ width: '54%' }}></div></div>
                </div>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
          </div>
        </div>

        {/* Agenda (Both) */}
        <div className="panel-new col-span-1 flex-col">
          <div className="panel-header">
             <h3 className="panel-title-new">Agenda / Próximas clases</h3>
          </div>
          <div className="agenda-list flex-1">
             <div className="agenda-item">
                <div className="agenda-date"><span>MAY</span><strong>22</strong></div>
                <div className="agenda-details">
                   <div className="agenda-time">09:00 - 10:30</div>
                   <div className="agenda-title">Razonamiento Matemático</div>
                   <div className="agenda-loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Aula 101</div>
                </div>
             </div>
             <div className="agenda-item">
                <div className="agenda-date"><span>MAY</span><strong>22</strong></div>
                <div className="agenda-details">
                   <div className="agenda-time">11:00 - 12:30</div>
                   <div className="agenda-title">Comprensión Lectora</div>
                   <div className="agenda-loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Virtual</div>
                </div>
             </div>
          </div>
          <a href="#" className="view-more center bold-teal" style={{ marginTop: 'auto' }}>Ver agenda completa →</a>
        </div>

        {/* Actividad reciente (Teacher only) */}
        {isTeacher && (
          <div className="panel-new col-span-1">
            <div className="panel-header">
               <h3 className="panel-title-new">Actividad reciente de estudiantes</h3>
               <a href="#" className="link-action">Ver todo</a>
            </div>
            <div className="recent-list-new">
               <div className="recent-activity-item">
                  <div className="recent-avatar" style={{ backgroundColor: '#FCE7F3', color: '#BE185D' }}>MF</div>
                  <div className="recent-activity-text">
                     <strong>María Fernanda López</strong>
                     <span>Completó: Quiz Proporciones</span>
                     <small>Hoy, 10:12 a. m.</small>
                  </div>
                  <div className="status-badge bg-green">95%</div>
               </div>
               <div className="recent-activity-item">
                  <div className="recent-avatar" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>CA</div>
                  <div className="recent-activity-text">
                     <strong>Carlos Andrés Ruiz</strong>
                     <span>Entregó: Tarea 2</span>
                     <small>Ayer, 08:45 p. m.</small>
                  </div>
                  <div className="status-badge bg-blue">Entregado</div>
               </div>
               <div className="recent-activity-item">
                  <div className="recent-avatar" style={{ backgroundColor: '#E0E7FF', color: '#4338CA' }}>JS</div>
                  <div className="recent-activity-text">
                     <strong>Juan Sebastián Pérez</strong>
                     <span>Inició: Evaluación Parcial 1</span>
                     <small>Ayer, 04:18 p. m.</small>
                  </div>
                  <div className="status-badge bg-purple">En curso</div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Teacher-only Bottom Grid */}
      {isTeacher && (
        <div className="dashboard-grid-3" style={{ marginTop: '1.5rem' }}>
          
          {/* Rendimiento estudiantil */}
          <div className="panel-new col-span-1 flex-col">
            <div className="panel-header">
               <h3 className="panel-title-new">Rendimiento estudiantil</h3>
               <select className="simple-select"><option>Esta semana</option></select>
            </div>
            <div className="chart-legend">
               <span><span className="dot teal"></span> Calificaciones</span>
               <span><span className="dot blue"></span> Participación</span>
            </div>
            <div className="chart-bars flex-1">
               <div className="chart-y-axis">
                 <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
               </div>
               <div className="chart-plot-area">
                 {/* simplified mock chart */}
                 {[48, 58, 65, 60, 62, 80, 65].map((val, i) => (
                   <div className="chart-bar-group" key={i}>
                     <div className="bar-pair">
                       <div className="bar teal" style={{ height: `${val}%` }}></div>
                       <div className="bar blue" style={{ height: `${val - 15}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Pendientes */}
          <div className="panel-new col-span-1">
            <div className="panel-header">
               <h3 className="panel-title-new">Tareas pendientes</h3>
            </div>
            <div className="pending-list">
               <div className="pending-item">
                 <div className="pending-icon teal-bg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg></div>
                 <div className="pending-text">
                   <strong>Calificar tareas</strong>
                   <span>3 entregas pendientes</span>
                 </div>
                 <div className="pending-badge red">3</div>
               </div>
               <div className="pending-item">
                 <div className="pending-icon blue-bg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                 <div className="pending-text">
                   <strong>Revisar foros</strong>
                   <span>5 publicaciones nuevas</span>
                 </div>
                 <div className="pending-badge orange">5</div>
               </div>
               <div className="pending-item">
                 <div className="pending-icon gray-bg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                 <div className="pending-text">
                   <strong>Programar evaluaciones</strong>
                   <span>1 evaluación pendiente</span>
                 </div>
                 <div className="pending-badge purple">1</div>
               </div>
            </div>
          </div>

          {/* Anuncios */}
          <div className="panel-new col-span-1">
            <div className="panel-header">
               <h3 className="panel-title-new">Anuncios de administración</h3>
            </div>
            <div className="announcements-list">
               <div className="announcement-item">
                 <div className="ann-icon teal-bg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></div>
                 <div className="ann-text">
                   <strong>Reunión de docentes</strong>
                   <p>Reunión general este viernes 24 de mayo.</p>
                   <span>Hace 2 horas</span>
                 </div>
               </div>
               <div className="announcement-item">
                 <div className="ann-icon orange-bg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                 <div className="ann-text">
                   <strong>Encuesta de satisfacción</strong>
                   <p>Tu opinión es importante.</p>
                   <span>Hace 2 días</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}
