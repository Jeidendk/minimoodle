import React, { useState, useMemo } from 'react';

export default function GradesView({ data, setView }) {
  const [activeTab, setActiveTab] = useState("notas");
  const [selectedCourseId, setSelectedCourseId] = useState(data?.courses?.[0]?.id || "");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(6);
  const [page, setPage] = useState(1);

  // Derived data based on selected course
  const selectedCourse = useMemo(() => 
    data?.courses?.find(c => c.id === selectedCourseId) || null
  , [data, selectedCourseId]);

  const courseQuizzes = useMemo(() => 
    data?.quizzes?.filter(q => q.course_id === selectedCourseId) || []
  , [data, selectedCourseId]);

  // Find students enrolled in this course
  // Assuming data.students has a 'courses' array like [{ label: 'Razonamiento Matemático' }]
  const enrolledStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return (data?.students || []).filter(s => {
      const courseLabels = Array.isArray(s.courses) ? s.courses.map(c => c.label) : [];
      // Also match if the course list is empty just to show some data, 
      // or strictly match by course title
      return courseLabels.includes(selectedCourse.title) || courseLabels.length === 0; 
    });
  }, [data, selectedCourse]);

  // For each enrolled student, calculate their grades based on attempts
  const gradesData = useMemo(() => {
    return enrolledStudents.map(student => {
      // Find the profile for this student to get the correct student_id for attempts
      const profile = data?.profiles?.find(p => p.cedula === student.cedula);
      
      const studentGrades = {};
      let totalScore = 0;
      let totalPossible = 0;

      courseQuizzes.forEach(quiz => {
        // Find attempt for this student and quiz
        const attempt = profile 
          ? data?.attempts?.find(a => a.student_id === profile.id && a.quiz_id === quiz.id)
          : data?.attempts?.find(a => a.student_name === student.full_name && a.quiz_id === quiz.id); // Fallback by name

        if (attempt) {
          // Normalize score to 10
          const normalizedScore = attempt.total > 0 ? (Number(attempt.score) / Number(attempt.total)) * 10 : 0;
          studentGrades[quiz.id] = normalizedScore.toFixed(2);
          totalScore += normalizedScore;
          totalPossible += 10;
        } else {
          studentGrades[quiz.id] = "-";
        }
      });

      const finalAverage = totalPossible > 0 ? (totalScore / (courseQuizzes.length * 10)) * 10 : 0;
      let status = "Pendiente";
      if (totalPossible > 0) {
        if (finalAverage >= 7) status = "Aprobado";
        else if (finalAverage >= 5) status = "En revisión";
        else status = "En riesgo";
      }

      return {
        id: student.id,
        name: student.full_name || student.name,
        code: student.code || "-",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || "Estudiante")}&background=random`,
        grades: studentGrades,
        final: finalAverage.toFixed(2),
        status,
        hasAttempts: totalPossible > 0
      };
    });
  }, [enrolledStudents, courseQuizzes, data]);

  // Filtering and pagination
  const filteredData = useMemo(() => {
    return gradesData.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [gradesData, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const currentRows = filteredData.slice(start, start + perPage);

  // Stats
  const stats = useMemo(() => {
    const total = gradesData.length;
    const evaluated = gradesData.filter(g => g.hasAttempts).length;
    const approved = gradesData.filter(g => g.status === "Aprobado").length;
    const atRisk = gradesData.filter(g => g.status === "En riesgo" || g.status === "En revisión").length;
    const pending = gradesData.filter(g => g.status === "Pendiente").length;
    
    const validFinals = gradesData.filter(g => g.hasAttempts).map(g => parseFloat(g.final));
    const generalAvg = validFinals.length ? (validFinals.reduce((a,b)=>a+b,0) / validFinals.length).toFixed(2) : "0.00";

    return {
      total, evaluated, approved, atRisk, pending, generalAvg,
      pctApproved: total ? Math.round((approved/total)*100) : 0,
      pctAtRisk: total ? Math.round((atRisk/total)*100) : 0,
      pctPending: total ? Math.round((pending/total)*100) : 0
    };
  }, [gradesData]);

  return (
    <section className="courses-dashboard fade-in">
      
      {/* HEADER ROW */}
      <div className="courses-header-section" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div style={{ flexShrink: 0, paddingRight: '1rem' }}>
          <div className="eyebrow">GESTIÓN DE CALIFICACIONES</div>
          <div className="courses-header-text">
            <h1 style={{ fontSize: '1.8rem' }}>Calificaciones</h1>
            <p>Administra notas, revisa el progreso y publica resultados por curso.</p>
          </div>
        </div>
        
        {/* TOP METRICS IN HEADER */}
        <div className="courses-metrics" style={{ flex: 1, margin: 0, padding: '0.4rem', border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="metric-card-small" style={{ flex: 1.5 }}>
            <div className="eval-metric-icon" style={{ background: '#EFF6FF', color: 'var(--color-primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div>
              <span className="eval-metric-label">Curso seleccionado</span>
              <span className="eval-metric-value">{selectedCourse?.title || "Ninguno"}</span>
              <span className="eval-metric-sub">{selectedCourse?.parallel || "-"}</span>
            </div>
          </div>
          
          <div className="metric-card-small" style={{ flex: 1 }}>
            <div className="eval-metric-icon" style={{ background: '#ECFDF5', color: 'var(--color-success)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <span className="eval-metric-label">Estudiantes</span>
              <span className="eval-metric-value">{stats.total}</span>
              <span className="eval-metric-sub">{stats.evaluated} con notas</span>
            </div>
          </div>

          <div className="metric-card-small" style={{ flex: 1.2 }}>
            <div className="eval-metric-icon" style={{ background: '#FFF7ED', color: 'var(--color-warning)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Promedio general</span>
              <span className="eval-metric-value">{stats.generalAvg} / 10</span>
              <span className="eval-metric-sub" style={{ color: 'var(--color-success)', fontWeight: 600 }}>Actualizado</span>
            </div>
          </div>

          <div className="metric-card-small" style={{ flex: 1 }}>
            <div className="eval-metric-icon" style={{ background: '#FEF2F2', color: 'var(--color-danger)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Pendientes</span>
              <span className="eval-metric-value">{stats.pending}</span>
              <span className="eval-metric-sub">Por evaluar</span>
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
                  <button className="eval-btn-primary" style={{ background: 'var(--color-primary)' }}>
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
                <div className="eval-select-wrapper">
                  <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                    {data?.courses?.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="eval-form-group" style={{ flex: 1.5 }}>
                <label>Buscar estudiante</label>
                <div className="eval-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" className="eval-input" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th className="text-left">Estudiante</th>
                    <th className="text-left">Código</th>
                    {courseQuizzes.map((quiz, idx) => (
                      <th key={quiz.id} title={quiz.title}>
                        Eval {idx + 1} <br/><small>(10pts)</small>
                      </th>
                    ))}
                    {courseQuizzes.length === 0 && <th>Sin evaluaciones</th>}
                    <th>Promedio final <br/><small>(/10)</small></th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length === 0 ? (
                    <tr><td colSpan={5 + courseQuizzes.length} className="text-center" style={{padding: '2rem'}}>No hay datos para mostrar</td></tr>
                  ) : null}
                  {currentRows.map(row => (
                    <tr key={row.id}>
                      <td>
                        <div className="gr-student">
                          <img src={row.avatar} alt="avatar" />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="gr-code">{row.code}</td>
                      
                      {courseQuizzes.map(quiz => (
                        <td key={quiz.id} className="text-center">{row.grades[quiz.id]}</td>
                      ))}
                      {courseQuizzes.length === 0 && <td className="text-center">-</td>}

                      <td className="text-center font-bold" style={{ color: row.final >= 7 ? 'var(--color-primary)' : (row.hasAttempts ? 'var(--color-danger)' : 'inherit') }}>
                        {row.hasAttempts ? row.final : "-"}
                      </td>
                      <td className="text-center">
                        <div className={`gr-status ${row.status.toLowerCase().replace(' ', '-')}`}>
                          <div className="dot"></div> {row.status}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="gr-actions">
                          <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grades-footer">
              <div className="gr-pagination-info">Mostrando {start + 1}-{Math.min(start + perPage, filteredData.length)} de {filteredData.length} estudiantes</div>
              <div className="gr-pagination-controls">
                <button className="gr-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
                <button className="gr-page-btn active">{page}</button>
                <button className="gr-page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>&gt;</button>
              </div>
              <div className="eval-select-wrapper" style={{ width: '100px' }}>
                <select value={perPage} onChange={e => {setPerPage(Number(e.target.value)); setPage(1);}}>
                  <option value="6">6 por página</option>
                  <option value="12">12 por página</option>
                </select>
              </div>
            </div>

            <div className="grades-bottom-actions">
              <button className="eval-btn-outline" style={{ padding: '0.4rem 2rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Guardar cambios
              </button>
              <button className="eval-btn-primary" style={{ padding: '0.4rem 2rem', background: 'var(--color-primary)' }}>
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
                  <strong>{stats.total}</strong>
                  <span>Estudiantes</span>
                </div>
              </div>
              <div className="gr-donut-legend">
                <div className="gr-legend-item">
                  <div className="gr-legend-dot" style={{ background: 'var(--color-success)' }}></div>
                  <span className="gr-legend-label">Aprobados</span>
                  <span className="gr-legend-val">{stats.pctApproved}% ({stats.approved})</span>
                </div>
                <div className="gr-legend-item">
                  <div className="gr-legend-dot" style={{ background: 'var(--color-warning)' }}></div>
                  <span className="gr-legend-label">En riesgo/revisión</span>
                  <span className="gr-legend-val">{stats.pctAtRisk}% ({stats.atRisk})</span>
                </div>
                <div className="gr-legend-item">
                  <div className="gr-legend-dot" style={{ background: 'var(--color-danger)' }}></div>
                  <span className="gr-legend-label">Pendientes</span>
                  <span className="gr-legend-val">{stats.pctPending}% ({stats.pending})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              Vista del estudiante
            </div>
            
            {currentRows.length > 0 ? (
              <>
                <div className="gr-student-card">
                  <img src={currentRows[0].avatar} alt="student" />
                  <div>
                    <strong>{currentRows[0].name}</strong>
                    <span>{currentRows[0].code}</span>
                  </div>
                </div>

                <div className="gr-student-metrics">
                  <div className="gr-sm-box">
                    <span>Promedio actual</span>
                    <div className="gr-sm-val text-blue">{currentRows[0].hasAttempts ? currentRows[0].final : "-"} <small>/ 10</small></div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{padding: '1rem', color: '#666'}}>Selecciona un estudiante para ver sus detalles</div>
            )}
          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Validaciones
            </div>
            <div className="eval-validations">
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                {stats.evaluated} estudiantes con notas
              </div>
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                {stats.pending} pendientes
              </div>
              <div className="eval-val-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
                Promedios calculados automáticamente
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
