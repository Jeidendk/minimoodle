import React from 'react';
import { AttemptTableRow } from '../components/AttemptRow';

export default function AttemptsView({ data, setView }) {
  return (
    <section className="fade-in">
      <button className="linkButton" onClick={() => setView("teacher")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Volver al panel docente
      </button>
      
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Registro general</p>
          <h1>Intentos de Estudiantes</h1>
        </div>
        <span className="countPill">{data.attempts.length} intentos totales</span>
      </div>
      
      <div className="panel tablePanel">
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
