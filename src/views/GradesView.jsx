import React, { useState } from 'react';
import '../styles.css';

const gradesData = [
  { id: 1, name: "María Fernanda López", code: "MAT2025001", quiz1: 8.5, tarea1: 9.2, part: 9.0, exam: 8.8, final: 8.86, status: "Aprobado", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Diego Alejandro Rojas", code: "MAT2025002", quiz1: 9.5, tarea1: 8.7, part: 9.5, exam: 9.0, final: 9.07, status: "Aprobado", avatar: "https://i.pravatar.cc/150?img=11" },
  { id: 3, name: "Lucía Valentina Torres", code: "MAT2025003", quiz1: 7.0, tarea1: 7.5, part: 8.0, exam: 7.8, final: 7.75, status: "Aprobado", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 4, name: "Carlos Andrés Morales", code: "MAT2025004", quiz1: 6.5, tarea1: 6.0, part: 7.0, exam: 6.2, final: 6.35, status: "En revisión", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 5, name: "Sofía Camila Herrera", code: "MAT2025005", quiz1: 9.0, tarea1: 9.5, part: 9.0, exam: 9.3, final: 9.23, status: "Aprobado", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: 6, name: "Juan Sebastián Cruz", code: "MAT2025006", quiz1: 5.5, tarea1: 6.0, part: 6.5, exam: 5.8, final: 5.92, status: "Pendiente", avatar: "https://i.pravatar.cc/150?img=14" },
];

export default function GradesView({ setView }) {
  const [activeTab, setActiveTab] = useState("notas");

  return (
    <section className="evaluations-view">
      
      {/* HEADER ROW */}
      <div className="eval-header-section" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div style={{ flexShrink: 0, paddingRight: '1rem' }}>
          <div className="eval-breadcrumb">GESTIÓN DE CALIFICACIONES</div>
          <div className="eval-header-text">
            <h1 style={{ fontSize: '1.8rem' }}>Calificaciones</h1>
            <p>Administra notas, revisa el progreso y publica resultados por curso.</p>
          </div>
        </div>
        
        {/* TOP METRICS IN HEADER */}
        <div className="eval-top-metrics" style={{ flex: 1, margin: 0, padding: '0.4rem', border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="eval-top-metric-card" style={{ flex: 1.5, background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="eval-metric-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div>
              <span className="eval-metric-label">Curso seleccionado</span>
              <span className="eval-metric-value">Razonamiento Matemático</span>
              <span className="eval-metric-sub">3er grado de secundaria</span>
            </div>
          </div>
          
          <div className="eval-top-metric-card" style={{ flex: 1, background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="eval-metric-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <span className="eval-metric-label">Estudiantes</span>
              <span className="eval-metric-value">28</span>
              <span className="eval-metric-sub">24 calificados</span>
            </div>
          </div>

          <div className="eval-top-metric-card" style={{ flex: 1.2, background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="eval-metric-icon" style={{ background: '#FFF7ED', color: '#F97316' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Promedio general</span>
              <span className="eval-metric-value">8.7 / 10</span>
              <span className="eval-metric-sub" style={{ color: '#16A34A', fontWeight: 600 }}>↑ 0.6 vs. periodo anterior</span>
            </div>
          </div>

          <div className="eval-top-metric-card" style={{ flex: 1, background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', borderRight: '1px solid var(--color-border)' }}>
            <div className="eval-metric-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Pendientes</span>
              <span className="eval-metric-value">4</span>
              <span className="eval-metric-sub">Por revisar</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="eval-layout">
        
        {/* LEFT COLUMN */}
        <div className="eval-main-column">
          <div className="eval-panel no-padding grades-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div className="grades-panel-header" style={{ padding: '0.75rem 1rem', margin: '-0.75rem -0.75rem 1rem -0.75rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>1. Libro de calificaciones</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="eval-global-actions">
                  <button className="eval-btn-outline" style={{ background: 'white' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Exportar reporte
                  </button>
                  <button className="eval-btn-primary" style={{ background: '#2563EB' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    Publicar calificaciones
                  </button>
                </div>
                
                <div className="grades-tabs">
                  <button className={`grades-tab ${activeTab === 'notas' ? 'active' : ''}`} onClick={() => setActiveTab('notas')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Libro de notas
                  </button>
                  <button className={`grades-tab ${activeTab === 'rubrica' ? 'active' : ''}`} onClick={() => setActiveTab('rubrica')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Rúbrica
                  </button>
                  <button className={`grades-tab ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg> Historial
                  </button>
                </div>
              </div>
            </div>

            <div className="grades-filters">
              <div className="eval-form-group">
                <label>Curso</label>
                <div className="eval-select-wrapper"><select defaultValue="mat"><option value="mat">Razonamiento Matemático</option></select></div>
              </div>
              <div className="eval-form-group">
                <label>Unidad / Tema</label>
                <div className="eval-select-wrapper"><select defaultValue="u2"><option value="u2">Unidad 2: Proporciones</option></select></div>
              </div>
              <div className="eval-form-group">
                <label>Evaluación</label>
                <div className="eval-select-wrapper"><select defaultValue="diag"><option value="diag">Evaluación diagnóstica</option></select></div>
              </div>
              <div className="eval-form-group">
                <label>Periodo</label>
                <div className="eval-select-wrapper"><select defaultValue="2025"><option value="2025">2025 - 1</option></select></div>
              </div>
              <div className="eval-form-group" style={{ flex: 1.5 }}>
                <label>Buscar estudiante</label>
                <div className="eval-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" className="eval-input" placeholder="Buscar por nombre o código..." />
                </div>
              </div>
            </div>

            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th className="text-left">Estudiante</th>
                    <th className="text-left">Código</th>
                    <th>Quiz 1 <br/><small>(15%)</small></th>
                    <th>Tarea 1 <br/><small>(20%)</small></th>
                    <th>Participación <br/><small>(10%)</small></th>
                    <th>Examen <br/><small>(55%)</small></th>
                    <th>Promedio final <br/><small>(/10)</small></th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gradesData.map(row => (
                    <tr key={row.id}>
                      <td>
                        <div className="gr-student">
                          <img src={row.avatar} alt="avatar" />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="gr-code">{row.code}</td>
                      <td className="text-center">{row.quiz1}</td>
                      <td className="text-center">{row.tarea1}</td>
                      <td className="text-center">{row.part}</td>
                      <td className="text-center">{row.exam}</td>
                      <td className="text-center font-bold" style={{ color: row.final >= 7 ? '#2563EB' : '#DC2626' }}>{row.final}</td>
                      <td className="text-center">
                        <div className={`gr-status ${row.status.toLowerCase().replace(' ', '-')}`}>
                          <div className="dot"></div> {row.status}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="gr-actions">
                          <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                          <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grades-footer">
              <div className="gr-pagination-info">Mostrando 1-6 de 28 estudiantes</div>
              <div className="gr-pagination-controls">
                <button className="gr-page-btn">&lt;</button>
                <button className="gr-page-btn active">1</button>
                <button className="gr-page-btn">2</button>
                <button className="gr-page-btn">3</button>
                <button className="gr-page-btn">4</button>
                <button className="gr-page-btn">5</button>
                <button className="gr-page-btn">&gt;</button>
              </div>
              <div className="eval-select-wrapper" style={{ width: '100px' }}>
                <select defaultValue="6"><option value="6">6 por página</option></select>
              </div>
            </div>

            <div className="grades-bottom-actions">
              <button className="eval-btn-outline" style={{ padding: '0.4rem 2rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Guardar cambios
              </button>
              <button className="eval-btn-primary" style={{ padding: '0.4rem 2rem', background: '#2563EB' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                Calcular promedio final
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="eval-sidebar-column">
          
          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Resumen del curso
            </div>
            <div className="gr-donut-container">
              <div className="gr-donut-chart">
                <div className="gr-donut-hole">
                  <strong>28</strong>
                  <span>Estudiantes</span>
                </div>
              </div>
              <div className="gr-donut-legend">
                <div className="gr-legend-item">
                  <div className="gr-legend-dot" style={{ background: '#10B981' }}></div>
                  <span className="gr-legend-label">Aprobados</span>
                  <span className="gr-legend-val">82% (23)</span>
                </div>
                <div className="gr-legend-item">
                  <div className="gr-legend-dot" style={{ background: '#F59E0B' }}></div>
                  <span className="gr-legend-label">En riesgo</span>
                  <span className="gr-legend-val">11% (3)</span>
                </div>
                <div className="gr-legend-item">
                  <div className="gr-legend-dot" style={{ background: '#EF4444' }}></div>
                  <span className="gr-legend-label">Pendientes</span>
                  <span className="gr-legend-val">7% (2)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              Vista del estudiante
            </div>
            
            <div className="gr-student-card">
              <img src="https://i.pravatar.cc/150?img=5" alt="student" />
              <div>
                <strong>Lucía Valentina Torres</strong>
                <span>MAT2025003</span>
              </div>
            </div>

            <div className="gr-student-metrics">
              <div className="gr-sm-box">
                <span>Promedio actual</span>
                <div className="gr-sm-val text-blue">7.75 <small>/ 10</small></div>
              </div>
              <div className="gr-sm-box">
                <span>Última evaluación</span>
                <div className="gr-sm-val">7.8 <small>/ 10</small></div>
                <span className="gr-sm-sub">Examen</span>
              </div>
            </div>

            <div className="gr-bar-chart">
              <div className="gr-bar-title">Progreso por evaluación</div>
              <div className="gr-bar-content">
                <div className="gr-bar-axis">
                  <span>10</span><span>5</span><span>0</span>
                </div>
                <div className="gr-bars">
                  <div className="gr-bar-col">
                    <div className="gr-bar-val">7.0</div>
                    <div className="gr-bar-fill-wrap"><div className="gr-bar-fill" style={{ height: '70%' }}></div></div>
                    <div className="gr-bar-label">Quiz 1</div>
                  </div>
                  <div className="gr-bar-col">
                    <div className="gr-bar-val">7.5</div>
                    <div className="gr-bar-fill-wrap"><div className="gr-bar-fill" style={{ height: '75%' }}></div></div>
                    <div className="gr-bar-label">Tarea 1</div>
                  </div>
                  <div className="gr-bar-col">
                    <div className="gr-bar-val">8.0</div>
                    <div className="gr-bar-fill-wrap"><div className="gr-bar-fill" style={{ height: '80%' }}></div></div>
                    <div className="gr-bar-label">Participación</div>
                  </div>
                  <div className="gr-bar-col">
                    <div className="gr-bar-val">7.8</div>
                    <div className="gr-bar-fill-wrap"><div className="gr-bar-fill" style={{ height: '78%' }}></div></div>
                    <div className="gr-bar-label">Examen</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Validaciones
            </div>
            <div className="eval-validations">
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                24 estudiantes con nota final
              </div>
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                4 evaluaciones pendientes
              </div>
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                Promedios calculados correctamente
              </div>
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                Listo para publicar
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
