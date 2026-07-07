import React, { useState } from 'react';
import CourseCard from '../components/CourseCard';
import { uid } from '../lib/data';

const COURSE_COLORS = [
  '#168bd8', '#d84f93', '#d99d24', '#52aaa8', '#6D28D9', '#059669', '#DC2626', '#EA580C'
];

export default function CoursesView({ 
  data, user, search, setSearch, filter, setFilter, sort, setSort, layout, setLayout, goCourse, saveRows, deleteRows 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', parallel: '', area: '', description: '', color: COURSE_COLORS[0] });
  const [editCourse, setEditCourse] = useState({ title: '', parallel: '', area: '', description: '', color: COURSE_COLORS[0] });
  const isTeacher = user?.role === 'teacher';

  const filtered = data.courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === "all") return true;
    
    const attempts = data.attempts.filter(a => a.student_id === user.id);
    const courseQuizzes = data.quizzes.filter(q => q.course_id === c.id);
    const completedQuizzes = courseQuizzes.filter(q => attempts.some(a => a.quiz_id === q.id));
    
    if (filter === "completed") return courseQuizzes.length > 0 && completedQuizzes.length === courseQuizzes.length;
    if (filter === "in_progress") return completedQuizzes.length > 0 && completedQuizzes.length < courseQuizzes.length;
    if (filter === "not_started") return completedQuizzes.length === 0;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.title.localeCompare(b.title);
    return 0;
  });

  const totalCourses = data.courses.length;

  function handleCreateCourse() {
    if (!newCourse.title.trim()) return;
    const course = {
      id: uid('course'),
      title: newCourse.title.trim(),
      parallel: newCourse.parallel.trim() || 'General',
      area: newCourse.area.trim() || 'General',
      color: newCourse.color,
      description: newCourse.description.trim(),
      created_at: new Date().toISOString()
    };
    saveRows('courses', course);
    setNewCourse({ title: '', parallel: '', area: '', description: '', color: COURSE_COLORS[0] });
    setShowCreateModal(false);
  }

  function openEditModal(course) {
    setEditCourse({
      id: course.id,
      title: course.title || '',
      parallel: course.parallel || '',
      area: course.area || '',
      description: course.description || '',
      color: course.color || COURSE_COLORS[0],
      created_at: course.created_at
    });
    setShowEditModal(course);
  }

  function handleEditCourse() {
    if (!editCourse.title.trim()) return;
    saveRows('courses', {
      id: editCourse.id,
      title: editCourse.title.trim(),
      parallel: editCourse.parallel.trim() || 'General',
      area: editCourse.area.trim() || 'General',
      color: editCourse.color,
      description: editCourse.description.trim(),
      created_at: editCourse.created_at
    });
    setShowEditModal(null);
  }

  function handleDeleteCourse(courseId) {
    const courseQuizIds = data.quizzes.filter(q => q.course_id === courseId).map(q => q.id);
    const courseQuestionIds = data.questions.filter(q => courseQuizIds.includes(q.quiz_id)).map(q => q.id);
    const courseAttemptIds = data.attempts.filter(a => courseQuizIds.includes(a.quiz_id)).map(a => a.id);

    if (courseAttemptIds.length) deleteRows('attempts', courseAttemptIds);
    if (courseQuestionIds.length) deleteRows('questions', courseQuestionIds);
    if (courseQuizIds.length) deleteRows('quizzes', courseQuizIds);
    deleteRows('courses', courseId);
    setShowDeleteConfirm(null);
  }

  // Reusable form for create/edit
  function CourseForm({ values, onChange }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-field">
          <label>Nombre del curso <span style={{ color: '#EF4444' }}>*</span></label>
          <input 
            type="text" 
            placeholder="Ej. Razonamiento Matemático" 
            value={values.title} 
            onChange={e => onChange({...values, title: e.target.value})}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Paralelo</label>
            <input 
              type="text" 
              placeholder="Ej. 3ro BGU" 
              value={values.parallel} 
              onChange={e => onChange({...values, parallel: e.target.value})}
            />
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Área</label>
            <input 
              type="text" 
              placeholder="Ej. Matemáticas" 
              value={values.area} 
              onChange={e => onChange({...values, area: e.target.value})}
            />
          </div>
        </div>

        <div className="form-field">
          <label>Descripción</label>
          <textarea 
            placeholder="Describe brevemente el contenido del curso..."
            value={values.description} 
            onChange={e => onChange({...values, description: e.target.value})}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-field">
          <label>Color del curso</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {COURSE_COLORS.map(color => (
              <button 
                key={color}
                type="button"
                onClick={() => onChange({...values, color})}
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  backgroundColor: color, border: values.color === color ? '3px solid #0F172A' : '3px solid transparent',
                  cursor: 'pointer', transition: 'transform 0.15s ease',
                  transform: values.color === color ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="courses-dashboard fade-in">
      {/* Header & Metrics */}
      <div className="courses-header-section">
        <div className="courses-header-text">
          <p className="eyebrow" style={{ color: 'var(--color-primary)', fontWeight: '700', marginBottom: '0.25rem' }}>MIS CURSOS</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#0F172A' }}>Explorar cursos</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>Accede, organiza y monitorea todos los cursos que tienes asignados.</p>
        </div>
        
        <div className="courses-metrics">
          <div className="metric-card-small">
            <div className="metric-icon-small blue-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" opacity="0.3"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="metric-info-small">
              <span>Cursos totales</span>
              <strong>{totalCourses}</strong>
            </div>
          </div>
          <div className="metric-card-small">
            <div className="metric-icon-small green-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
            <div className="metric-info-small">
              <span>Cursos activos</span>
              <strong>{totalCourses}</strong>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Toolbar */}
      <div className="courses-toolbar-new">
        <div className="filter-group">
          <label style={{ visibility: 'hidden' }}>Buscar</label>
          <div className="toolbar-search-new">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Buscar cursos por nombre, paralelo..." 
            />
          </div>
        </div>
        
        <div className="filter-group">
          <label>Estado</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">🟢 Todos</option>
            <option value="not_started">⚪ No iniciados</option>
            <option value="in_progress">🟡 En progreso</option>
            <option value="completed">🟢 Completados</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por</label>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name">⇅ A - Z</option>
            <option value="progress">⇅ Progreso</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Vista</label>
          <div className="layout-toggle-new">
            <button className={layout === "cards" ? "active" : ""} onClick={() => setLayout("cards")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
            </button>
            <button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {isTeacher && (
          <button 
            className="btn-primary new-course-btn" 
            style={{ marginLeft: 'auto', marginBottom: '2px' }}
            onClick={() => setShowCreateModal(true)}
          >
            + Nuevo curso
          </button>
        )}
      </div>
      
      {/* Grid */}
      <div className={`courses-grid-new ${layout}`}>
        {sorted.length ? (
          sorted.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              attempts={data.attempts} 
              quizzes={data.quizzes} 
              user={user}
              layout={layout}
              onClick={() => goCourse(course.id)}
              onDelete={isTeacher ? () => setShowDeleteConfirm(course) : undefined}
              onEdit={isTeacher ? () => openEditModal(course) : undefined}
            />
          ))
        ) : (
          <div className="emptyState">
            <span className="emptyIcon">🔍</span>
            <p>No se encontraron cursos con esos filtros.</p>
            <button className="linkButton" onClick={() => { setSearch(""); setFilter("all"); }}>Limpiar filtros</button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-new">
        <span>Mostrando {sorted.length} de {totalCourses} cursos</span>
        <div className="pagination-controls">
          <button disabled>&lt;</button>
          <button className="active">1</button>
          <button disabled>&gt;</button>
        </div>
      </div>

      {/* =================== CREATE COURSE MODAL =================== */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Crear nuevo curso</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <CourseForm values={newCourse} onChange={setNewCourse} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreateCourse} disabled={!newCourse.title.trim()}>
                Crear curso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== EDIT COURSE MODAL =================== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Editar curso</h2>
              <button className="modal-close" onClick={() => setShowEditModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <CourseForm values={editCourse} onChange={setEditCourse} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleEditCourse} disabled={!editCourse.title.trim()}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== DELETE CONFIRM MODAL =================== */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ color: '#DC2626' }}>Eliminar curso</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>
              <p style={{ fontSize: '1rem', color: '#334155', marginBottom: '0.5rem' }}>
                ¿Estás seguro de que deseas eliminar el curso <strong>"{showDeleteConfirm.title}"</strong>?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                Se eliminarán todas las evaluaciones, preguntas e intentos asociados. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
              <button 
                className="btn-primary" 
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
                onClick={() => handleDeleteCourse(showDeleteConfirm.id)}
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
