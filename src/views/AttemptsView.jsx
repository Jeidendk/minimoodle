import React from 'react';
import { AttemptTableRow } from '../components/AttemptRow';

export default function AttemptsView({ data, setView }) {
  const totalAttempts = data.attempts.length;
  const avgScore = totalAttempts > 0
    ? (data.attempts.reduce((sum, a) => sum + ((a.score / (a.total || 1)) * 100), 0) / totalAttempts).toFixed(1)
    : 0;
  const uniqueStudents = new Set(data.attempts.map(a => a.student_id)).size;

  return (
    <section className="courses-dashboard fade-in">
      <div className="courses-header-section">
        <div className="courses-header-text">
          <div className="eyebrow">Registro general</div>
          <h1>Intentos de Estudiantes</h1>
          <p>Historial de todos los intentos realizados por los estudiantes en las evaluaciones.</p>
        </div>

        <div className="courses-metrics">
          <div className="metric-card-small">
            <div className="metric-icon-small" style={{ background: 'var(--color-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div className="metric-info-small">
              <span>{totalAttempts}</span>
              <label>Intentos totales</label>
            </div>
          </div>
          <div className="metric-card-small">
            <div className="metric-icon-small" style={{ background: 'var(--color-success)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <div className="metric-info-small">
              <span>{uniqueStudents}</span>
              <label>Estudiantes</label>
            </div>
          </div>
          <div className="metric-card-small">
            <div className="metric-icon-small" style={{ background: 'var(--color-warning)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div className="metric-info-small">
              <span>{avgScore}%</span>
              <label>Promedio general</label>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={() => setView("teacher")} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver a evaluaciones
        </button>
      </div>

      <div className="panel tablePanel" style={{ background: 'var(--color-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Cuestionario</th>
              <th>Calificación</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {data.attempts.map((attempt) => <AttemptTableRow key={attempt.id} attempt={attempt} data={data} />)}
            {!data.attempts.length && (
              <tr>
                <td colSpan="4">
                  <div className="emptyState inline">
                    <span className="emptyIcon">📭</span>
                    <p>Todavía no hay intentos registrados por los estudiantes.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
