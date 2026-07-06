import React, { useState } from 'react';
import { courseProgress, formatDate } from '../utils/helpers';
import { AttemptTableRow } from '../components/AttemptRow';
import { uid } from '../lib/data';

export default function CourseView({ data, course, user, goQuiz, setView, saveRows, deleteRows }) {
  const [tab, setTab] = useState("course");
  
  // Section Modal State
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: '', description: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  if (!course) return <p>Curso no encontrado.</p>;
  
  const isTeacher = user?.role === 'teacher';
  
  // Filter quizzes and attempts
  const quizzes = data.quizzes.filter((quiz) => quiz.course_id === course.id && (quiz.published || isTeacher));
  const attempts = data.attempts.filter((attempt) => quizzes.some((quiz) => quiz.id === attempt.quiz_id));
  const completed = courseProgress(course, data, user);

  // Get Sections
  const sections = data.sections?.filter(s => s.course_id === course.id).sort((a, b) => a.order - b.order) || [];
  
  // Find quizzes without a section
  const sectionIds = new Set(sections.map(s => s.id));
  const uncategorizedQuizzes = quizzes.filter(q => !q.section_id || !sectionIds.has(q.section_id));

  const getIcon = () => {
    if (course.id === 'ciencias') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      );
    } else if (course.id === 'lengua') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
    } else if (course.id === 'sociales') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      );
    } else {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const tabIcons = {
    course: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
    participants: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    grades: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    skills: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
  };

  // Section Management Methods
  const openCreateSection = () => {
    setEditingSectionId(null);
    setSectionForm({ title: '', description: '' });
    setShowSectionModal(true);
  };

  const openEditSection = (section) => {
    setEditingSectionId(section.id);
    setSectionForm({ title: section.title, description: section.description || '' });
    setShowSectionModal(true);
  };

  const handleSaveSection = () => {
    if (!sectionForm.title.trim()) return;
    
    if (editingSectionId) {
      saveRows('sections', {
        id: editingSectionId,
        course_id: course.id,
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim(),
        order: sections.find(s => s.id === editingSectionId)?.order || 0
      });
    } else {
      saveRows('sections', {
        id: uid('sec'),
        course_id: course.id,
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim(),
        order: sections.length,
        created_at: new Date().toISOString()
      });
    }
    setShowSectionModal(false);
  };

  const handleDeleteSection = (sectionId) => {
    deleteRows('sections', sectionId);
    setShowDeleteConfirm(null);
  };

  // Activity List Renderer
  const renderActivityList = (sectionQuizzes) => {
    if (!sectionQuizzes.length) {
      return (
        <div className="emptyState" style={{ padding: '2rem', margin: '1rem 0' }}>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>No hay actividades en esta sección.</p>
        </div>
      );
    }
    
    return (
      <div className="activityList">
        {sectionQuizzes.map((quiz) => (
          <button key={quiz.id} className="activity" onClick={() => goQuiz(quiz.id)}>
            <div className="activityIconWrapper">
              <span className="activityIcon">📝</span>
            </div>
            <div className="activityDetails">
              <strong>{quiz.title} {!quiz.published && <span className="eval-badge orange" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>Oculto</span>}</strong>
              <small>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {quiz.time_limit_minutes} min • Apertura: {formatDate(quiz.opens_at)}
              </small>
            </div>
            <span className="activityAction primary compact">Entrar</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="fade-in">
      <button className="linkButton" onClick={() => setView("courses")} style={{ marginBottom: "1rem" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Volver a mis cursos
      </button>
      
      <div className="course-view-header">
        <div className="cvh-left">
          <div className="cvh-icon-box" style={{ backgroundColor: course.color }}>
            {getIcon()}
          </div>
          <div className="cvh-text">
            <p className="eyebrow" style={{ color: "var(--color-primary)", textTransform: "uppercase" }}>{course.area}</p>
            <h1>{course.title}</h1>
          </div>
        </div>
        
        <div className="cvh-right">
          <div className="cv-progress-card">
            <div className="cv-progress-circle">
              <span className="cv-progress-text">{completed}%</span>
            </div>
            <div className="cv-progress-bar-container">
              <span className="cv-progress-label">{completed}% completado</span>
              <div className="cv-progress-track">
                <div className="cv-progress-fill" style={{ width: `${completed}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="teacherTabsContainer" style={{ margin: 0, border: 'none', borderRadius: 0, borderBottom: '1px solid var(--color-border)', boxShadow: 'none' }}>
          <div className="teacherTabs" style={{ padding: '0 1.5rem' }}>
            {[
              ["course", "Contenido"],
              ["participants", "Participantes"],
              ["grades", "Calificaciones"],
              ["skills", "Competencias"]
            ].map(([id, label]) => (
              <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)} style={{ borderRadius: 0, flex: 'none', padding: '1rem 1.5rem' }}>
                <span className="tab-icon">{tabIcons[id]}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="tabContent" style={{ padding: '2.5rem' }}>
          {tab === "course" && (
            <>
              <div className="heroCourse" style={{ borderLeft: `6px solid #F59E0B`, paddingLeft: '1.5rem', marginBottom: '3rem' }}>
                <div>
                  <p className="eyebrow" style={{ color: "var(--color-primary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>{course.parallel}</p>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Bienvenido a {course.title}</h2>
                  <p className="lead" style={{ color: 'var(--color-muted)' }}>{course.description}</p>
                </div>
              </div>
              
              {/* Dynamic Sections (Moodle Style) */}
              <div className="course-sections">
                {sections.map((section, idx) => {
                  const sectionQuizzes = quizzes.filter(q => q.section_id === section.id);
                  return (
                    <div key={section.id} className="course-section-block" style={{ marginBottom: '3rem' }}>
                      <div className="section-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="sectionStripe" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                          <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '1rem' }}>
                            {idx + 1}
                          </span> 
                          {section.title}
                        </h3>
                        
                        {isTeacher && (
                          <div className="section-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="eval-btn-text" onClick={() => openEditSection(section)} title="Editar sección" style={{ padding: '0.4rem', color: '#2563EB' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="eval-btn-text" onClick={() => setShowDeleteConfirm(section)} title="Eliminar sección" style={{ padding: '0.4rem', color: '#DC2626' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {section.description && (
                        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', marginLeft: '3rem', fontSize: '0.95rem' }}>{section.description}</p>
                      )}
                      
                      <div style={{ paddingLeft: '3rem' }}>
                        {renderActivityList(sectionQuizzes)}
                        
                        {isTeacher && (
                          <button 
                            className="linkButton" 
                            style={{ marginTop: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}
                            onClick={() => setView('teacher')}
                          >
                            + Agregar actividad o recurso
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Uncategorized / Default Section */}
                {uncategorizedQuizzes.length > 0 && (
                  <div className="course-section-block" style={{ marginBottom: '3rem', paddingTop: sections.length ? '2rem' : '0', borderTop: sections.length ? '1px dashed var(--color-border)' : 'none' }}>
                    <h3 className="sectionStripe" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '2rem' }}>
                      <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '1rem' }}>
                        *
                      </span> 
                      ACTIVIDADES GENERALES
                    </h3>
                    <div style={{ paddingLeft: '3rem' }}>
                      {renderActivityList(uncategorizedQuizzes)}
                    </div>
                  </div>
                )}
                
                {/* Global Empty State */}
                {sections.length === 0 && uncategorizedQuizzes.length === 0 && !isTeacher && (
                  <div className="emptyState" style={{ 
                    border: '1px dashed #FCD34D', backgroundColor: '#FFFBEB', borderRadius: '16px', padding: '3rem', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
                  }}>
                    <div style={{ color: '#F59E0B', marginBottom: '1rem' }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    <strong style={{ color: '#451A03', fontSize: '1rem', display: 'block' }}>Aún no hay contenido en este curso.</strong>
                    <p style={{ color: '#92400E', fontSize: '0.875rem' }}>El docente aún no ha publicado unidades ni evaluaciones.</p>
                  </div>
                )}
                
                {/* Add Section Button */}
                {isTeacher && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', padding: '2rem 0', borderTop: '1px dashed var(--color-border)' }}>
                    <button className="btn-primary" onClick={openCreateSection} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Agregar sección
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {tab === "participants" && <ParticipantsTab data={data} />}
          {tab === "grades" && <GradesTab attempts={attempts} data={data} />}
          {tab === "skills" && <SkillsTab course={course} quizzes={quizzes} />}
        </div>
      </div>

      {/* =================== SECTION MODAL (CREATE/EDIT) =================== */}
      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingSectionId ? 'Editar sección' : 'Nueva sección'}</h2>
              <button className="modal-close" onClick={() => setShowSectionModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-field">
                <label>Título de la sección <span style={{ color: '#EF4444' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ej. Unidad 1: Aritmética" 
                  value={sectionForm.title} 
                  onChange={e => setSectionForm({...sectionForm, title: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label>Descripción (Opcional)</label>
                <textarea 
                  placeholder="Descripción de los temas a tratar en esta sección..."
                  value={sectionForm.description} 
                  onChange={e => setSectionForm({...sectionForm, description: e.target.value})}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSectionModal(false)}>Cancelar</button>
              <button 
                className="btn-primary" 
                onClick={handleSaveSection}
                disabled={!sectionForm.title.trim()}
              >
                Guardar sección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== DELETE SECTION CONFIRM =================== */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ color: '#DC2626' }}>Eliminar sección</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </div>
              <p style={{ fontSize: '1rem', color: '#334155', marginBottom: '0.5rem' }}>
                ¿Estás seguro de que deseas eliminar <strong>"{showDeleteConfirm.title}"</strong>?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                Las evaluaciones de esta sección se moverán a "Actividades Generales".
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
              <button 
                className="btn-primary" 
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
                onClick={() => handleDeleteSection(showDeleteConfirm.id)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ParticipantsTab({ data }) {
  return (
    <div className="contentGrid fade-in">
      {data.profiles.map((profile) => (
        <article className="personCard" key={profile.id}>
          <span className={`avatar ${profile.role}`}>{profile.role === "teacher" ? "DO" : "ES"}</span>
          <div>
            <strong>{profile.full_name}</strong>
            <small className={`role-badge ${profile.role}`}>{profile.role === "teacher" ? "Docente" : "Estudiante"}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function GradesTab({ attempts, data }) {
  return (
    <div className="tablePanel cleanTable fade-in">
      <table>
        <thead>
          <tr><th>Estudiante</th><th>Cuestionario</th><th>Puntaje</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => <AttemptTableRow key={attempt.id} attempt={attempt} data={data} />)}
          {!attempts.length && <tr><td colSpan="4" style={{textAlign: "center", padding: "2rem"}}>Aún no hay calificaciones en este curso.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SkillsTab({ course, quizzes }) {
  const skills = [course.area, "Comprensión lectora", "Resolución de problemas", "Gestión del tiempo", "Autoevaluación"];
  return (
    <div className="skillsPanel fade-in">
      <div className="skills-intro">
        <h3>Competencias a desarrollar</h3>
        <p>Al completar este curso y sus {quizzes.length} evaluaciones, habrás trabajado en las siguientes áreas:</p>
      </div>
      <div className="skills-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
        {skills.map((skill) => <span key={skill} style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 600 }}>{skill}</span>)}
      </div>
    </div>
  );
}
