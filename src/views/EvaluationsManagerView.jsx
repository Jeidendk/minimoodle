import React, { useState } from 'react';

export default function EvaluationsManagerView({ data, user, setView, setEditQuizId, deleteRows }) {
  const quizzes = data.quizzes || [];
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreateNew = () => {
    try { localStorage.removeItem('minimoodle:eval_state'); } catch {}
    setEditQuizId(null);
    setView('evaluation-editor');
  };

  const handleEdit = (quizId) => {
    setEditQuizId(quizId);
    setView('evaluation-editor');
  };

  const handleDelete = (quizId) => {
    if (confirm('¿Estás seguro de eliminar esta evaluación? Se borrarán todos los intentos asociados.')) {
      deleteRows('quizzes', quizId);
      showToast('Evaluación eliminada correctamente');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const getCourseName = (courseId) => {
    const course = data.courses?.find(c => c.id === courseId);
    return course ? course.title : 'Sin curso';
  };

  return (
    <section className="banks-view fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {toast && (
        <div className="alert-toast success fade-in" style={{ bottom: 20, right: 20, top: 'auto', zIndex: 9999 }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          GESTIÓN DE EVALUACIONES
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Mis Evaluaciones</h1>
            <p style={{ color: 'var(--color-muted)' }}>Crea y administra los cuestionarios y pruebas para tus cursos.</p>
          </div>
          <button className="eval-btn-primary" onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nueva evaluación
          </button>
        </div>
      </div>

      <div className="eval-layout" style={{ display: 'block' }}>
        {quizzes.length === 0 ? (
          <div className="eval-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <svg style={{ margin: '0 auto 1rem', color: '#94A3B8' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <h3 style={{ color: '#64748B', marginBottom: '0.5rem' }}>No has creado ninguna evaluación</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Empieza creando tu primer cuestionario para los estudiantes.</p>
            <button className="eval-btn-primary" onClick={handleCreateNew}>Crear evaluación</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {quizzes.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).map(quiz => {
              const qsCount = data.questions?.filter(q => q.quiz_id === quiz.id).length || 0;
              const isPublished = quiz.published;
              
              return (
                <div key={quiz.id} className="eval-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${isPublished ? '#10B981' : '#F59E0B'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className={`eval-badge ${isPublished ? 'green' : 'orange'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                        {isPublished ? 'Publicada' : 'Borrador'}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text)', marginBottom: '0.25rem', lineHeight: '1.3' }}>{quiz.title}</h3>
                      <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '500' }}>{getCourseName(quiz.course_id)}</p>
                    </div>
                  </div>
                  
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Apertura</strong>
                      {formatDate(quiz.open_time)}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Cierre</strong>
                      {formatDate(quiz.close_time)}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Preguntas</strong>
                      {qsCount} creadas
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', marginBottom: '2px' }}>Límite tiempo</strong>
                      {quiz.time_limit ? `${quiz.time_limit} min` : 'Sin límite'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <button className="eval-btn-outline" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleEdit(quiz.id)}>
                      Editar
                    </button>
                    <button className="eval-btn-outline" style={{ padding: '0.5rem', color: '#EF4444', borderColor: '#FCA5A5' }} onClick={() => handleDelete(quiz.id)} title="Eliminar evaluación">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
