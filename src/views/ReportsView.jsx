import React, { useState } from 'react';

export default function ReportsView({ setView }) {
  const [activeTab, setActiveTab] = useState('rendimiento');

  return (
    <section className="courses-dashboard fade-in">
      {/* HEADER ROW */}
      <div className="courses-header-section" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div className="courses-header-text">
          <div className="eyebrow">ANÁLISIS INSTITUCIONAL</div>
          <h1>Reportes</h1>
          <p>Visualiza el progreso general y toma decisiones informadas.</p>
        </div>

        {/* TOP METRICS IN HEADER */}
        <div className="courses-metrics" style={{ flex: 1 }}>
          <div className="metric-card-small">
            <div className="eval-metric-icon" style={{ background: '#EFF6FF', color: 'var(--color-primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Promedio Institucional</span>
              <span className="eval-metric-value">8.4 / 10</span>
              <span className="eval-metric-sub" style={{ color: 'var(--color-success)', fontWeight: 600 }}>↑ 0.2 este semestre</span>
            </div>
          </div>
          
          <div className="metric-card-small">
            <div className="eval-metric-icon" style={{ background: '#ECFDF5', color: 'var(--color-success)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Tasa de Aprobación</span>
              <span className="eval-metric-value">92%</span>
              <span className="eval-metric-sub">Meta: 95%</span>
            </div>
          </div>

          <div className="metric-card-small">
            <div className="eval-metric-icon" style={{ background: '#FFF7ED', color: 'var(--color-warning)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Evaluaciones</span>
              <span className="eval-metric-value">1,450</span>
              <span className="eval-metric-sub">Completadas</span>
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
              <h2 style={{ fontSize: '1.2rem' }}>Informes detallados</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="eval-global-actions">
                  <button className="eval-btn-outline" style={{ background: 'var(--color-card)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Descargar CSV
                  </button>
                </div>
                
                <div className="grades-tabs">
                  <button className={`grades-tab ${activeTab === 'rendimiento' ? 'active' : ''}`} onClick={() => setActiveTab('rendimiento')}>Rendimiento por curso</button>
                  <button className={`grades-tab ${activeTab === 'asistencia' ? 'active' : ''}`} onClick={() => setActiveTab('asistencia')}>Asistencia y participación</button>
                </div>
              </div>
            </div>

            <div className="grades-filters">
              <div className="eval-form-group">
                <div className="eval-select-wrapper">
                  <select defaultValue="2025"><option value="2025">Ciclo 2025 - I</option></select>
                </div>
              </div>
              <div className="eval-form-group flex-2">
                <div className="eval-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" className="eval-input" placeholder="Buscar asignatura..." />
                </div>
              </div>
            </div>

            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th className="text-left">Curso</th>
                    <th>Estudiantes</th>
                    <th>Promedio</th>
                    <th>Aprobados</th>
                    <th>En riesgo</th>
                    <th>Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-left" style={{ fontWeight: 600 }}>Razonamiento Matemático</td>
                    <td style={{ textAlign: 'center' }}>28</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>8.7</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>82%</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-danger)' }}>11%</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>↑</td>
                  </tr>
                  <tr>
                    <td className="text-left" style={{ fontWeight: 600 }}>Física Cuántica Básica</td>
                    <td style={{ textAlign: 'center' }}>22</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>7.2</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>65%</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-danger)' }}>25%</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-danger)' }}>↓</td>
                  </tr>
                  <tr>
                    <td className="text-left" style={{ fontWeight: 600 }}>Literatura Universal</td>
                    <td style={{ textAlign: 'center' }}>35</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>9.1</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>95%</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-danger)' }}>2%</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>↑</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="eval-sidebar-column">
          <div className="eval-panel" style={{ marginBottom: '1rem' }}>
            <div className="eval-panel-header-flex">
              <h2>Top Rendimiento</h2>
            </div>
            <div className="eval-validations">
              <div className="gr-student-card" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <div style={{ width: '32px', height: '32px', background: '#DCFCE7', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
                <div style={{ flex: 1 }}>
                  <strong>Diego Alejandro Rojas</strong>
                  <span>Promedio: 9.8</span>
                </div>
              </div>
              <div className="gr-student-card" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <div style={{ width: '32px', height: '32px', background: '#F1F5F9', color: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</div>
                <div style={{ flex: 1 }}>
                  <strong>Sofía Camila Herrera</strong>
                  <span>Promedio: 9.5</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="eval-panel">
            <div className="eval-panel-header-flex">
              <h2>Atención temprana</h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>Estudiantes con bajo rendimiento sostenido.</p>
            <div className="eval-validations">
              <div className="gr-student-card" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <div style={{ width: '32px', height: '32px', background: '#FEF2F2', color: 'var(--color-danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>!</div>
                <div style={{ flex: 1 }}>
                  <strong>Juan Sebastián Cruz</strong>
                  <span>Promedio: 5.9</span>
                </div>
              </div>
            </div>
            <button className="eval-btn-outline" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Ver todos (8)</button>
          </div>
        </div>
        
      </div>
    </section>
  );
}
