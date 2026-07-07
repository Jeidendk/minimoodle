import React, { useState, useMemo, useEffect, useRef } from 'react';

const COURSE_COLORS = {
  'Matemáticas Básicas': 'purple',
  'Comprensión Lectora': 'pink',
  'Ciencias Naturales': 'yellow',
  'Estudios Sociales': 'teal',
  'Razonamiento Matemático': 'blue',
};

const COURSE_LIST = Object.keys(COURSE_COLORS);

// Seed rows in DB shape (used to auto-populate the students table on first run).
const SEED_ROWS = [
  { id: 's1', initials: 'AM', color: '#8B5CF6', full_name: 'Andrés Morales', cedula: '1754325678', email: 'andres.morales@email.com', courses: [{ label: 'Matemáticas Básicas', color: 'purple' }], code: 'A7K9-2P3L', status: 'Activo', registered_at: '2024-06-12T10:30:00.000Z' },
  { id: 's2', initials: 'VM', color: '#EC4899', full_name: 'Valeria Martínez', cedula: '1754987654', email: 'valeria.martinez@email.com', courses: [{ label: 'Comprensión Lectora', color: 'pink' }, { label: 'Estudios Sociales', color: 'teal' }], code: 'B2X8-7N1M', status: 'Activo', registered_at: '2024-06-11T16:15:00.000Z' },
  { id: 's3', initials: 'JR', color: '#F59E0B', full_name: 'Juan Rodríguez', cedula: '1756678890', email: 'juan.rodriguez@email.com', courses: [{ label: 'Ciencias Naturales', color: 'yellow' }], code: 'C5D1-9K7H', status: 'Activo', registered_at: '2024-06-10T09:20:00.000Z' },
  { id: 's4', initials: 'LM', color: '#06B6D4', full_name: 'Laura Mendoza', cedula: '1755564321', email: 'laura.mendoza@email.com', courses: [{ label: 'Razonamiento Matemático', color: 'blue' }, { label: 'Comprensión Lectora', color: 'pink' }], code: 'D8Q3-6Z2P', status: 'Pendiente', registered_at: '2024-06-09T14:45:00.000Z' },
  { id: 's5', initials: 'SF', color: '#22C55E', full_name: 'Sofía Fernández', cedula: '1753456789', email: 'sofia.fernandez@email.com', courses: [{ label: 'Estudios Sociales', color: 'teal' }], code: 'E4M7-1B9N', status: 'Activo', registered_at: '2024-06-08T11:05:00.000Z' },
];

function initialsOf(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '??';
}

function randomColor() {
  const pool = ['#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#EF4444', '#3B82F6', '#14B8A6'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${rand(4)}-${rand(4)}`;
}

function fmtStamp(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (isNaN(d)) return { date: '', time: '' };
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
  };
}

// DB row -> UI view model
function toView(row) {
  return {
    id: row.id,
    name: row.full_name,
    cedula: row.cedula || '',
    email: row.email || '',
    courses: Array.isArray(row.courses) ? row.courses : [],
    code: row.code || '',
    status: row.status || 'Pendiente',
    color: row.color || '#8B5CF6',
    initials: row.initials || initialsOf(row.full_name || '?'),
    registered_at: row.registered_at,
    ...fmtStamp(row.registered_at),
  };
}

// UI view model -> DB row
function toRow(v) {
  return {
    id: v.id,
    full_name: v.name,
    cedula: v.cedula,
    email: v.email,
    courses: v.courses,
    code: v.code,
    status: v.status,
    color: v.color,
    initials: v.initials || initialsOf(v.name || '?'),
    registered_at: v.registered_at || new Date().toISOString(),
  };
}

export default function StudentsView({ data, user, setView, saveRows, deleteRows }) {
  const [tab, setTab] = useState('students');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const seededRef = useRef(false);

  const dbStudents = data.students || [];

  const students = useMemo(
    () => (dbStudents.length ? dbStudents.map(toView) : []),
    [dbStudents]
  );

  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filtered = useMemo(() => students.filter(s => {
    const q = search.trim().toLowerCase();
    if (q && !`${s.name} ${s.cedula} ${s.email}`.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && s.status.toLowerCase() !== statusFilter) return false;
    if (courseFilter !== 'all' && !s.courses.some(c => c.label === courseFilter)) return false;
    return true;
  }), [students, search, statusFilter, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  useEffect(() => { setPage(1); }, [search, statusFilter, courseFilter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const persist = (row) => { if (saveRows) saveRows('students', row); };

  const copyCode = (id, code) => {
    if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
    showToast(`Código ${code} copiado`);
  };

  const regenerateCode = (id) => {
    const s = students.find(x => x.id === id);
    if (s) persist({ ...toRow(s), code: generateCode() });
    showToast('Código regenerado');
    setOpenMenu(null);
  };

  const toggleStatus = (id) => {
    const s = students.find(x => x.id === id);
    if (s) persist({ ...toRow(s), status: s.status === 'Activo' ? 'Pendiente' : 'Activo' });
    setOpenMenu(null);
  };

  const removeStudent = (id) => {
    if (!confirm('¿Eliminar estudiante? Esta acción no se puede deshacer.')) return;
    if (deleteRows) deleteRows('students', id);
    showToast('Estudiante eliminado');
    setOpenMenu(null);
  };

  const inviteStudent = (payload) => {
    const row = {
      id: `s${Date.now()}`,
      initials: initialsOf(payload.name),
      color: randomColor(),
      full_name: payload.name,
      cedula: payload.cedula,
      email: payload.email,
      courses: payload.courses.map(label => ({ label, color: COURSE_COLORS[label] || 'purple' })),
      code: generateCode(),
      status: 'Pendiente',
      registered_at: new Date().toISOString(),
    };
    persist(row);
    setInviteOpen(false);
    showToast(`Invitación enviada a ${payload.name}`);
  };

  const saveEdit = (payload) => {
    const s = students.find(x => x.id === payload.id);
    if (s) persist({
      ...toRow(s),
      full_name: payload.name,
      cedula: payload.cedula,
      email: payload.email,
      initials: initialsOf(payload.name),
      courses: payload.courses.map(label => ({ label, color: COURSE_COLORS[label] || 'purple' })),
    });
    setEditStudent(null);
    showToast('Estudiante actualizado');
  };

  const exportCsv = () => {
    const header = ['Nombre', 'Cédula', 'Email', 'Cursos', 'Código', 'Estado', 'Fecha registro'];
    const lines = filtered.map(s => [
      s.name, s.cedula, s.email, s.courses.map(c => c.label).join('; '),
      s.code, s.status, `${s.date} ${s.time}`
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudiantes_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exportado ${filtered.length} estudiantes`);
  };

  const generateMassiveCodes = async () => {
    if (students.length === 0) return;
    if (confirm("¿Estás seguro de regenerar los códigos de acceso para TODOS los estudiantes? Los códigos anteriores dejarán de funcionar.")) {
      const updatedStudents = students.map(s => {
        const row = toRow(s);
        row.code = generateCode();
        return row;
      });
      if (saveRows) {
        await saveRows('students', updatedStudents);
        showToast('Se han generado nuevos códigos para todos los estudiantes');
      }
    }
  };

  return (
    <section className="students-dashboard fade-in">
      {/* Header */}
      <div className="courses-header-section">
        <div className="courses-header-text">
          <p className="eyebrow" style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>GESTIÓN DE ESTUDIANTES</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0F172A' }}>Estudiantes</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
            Gestiona el acceso de tus estudiantes y genera códigos únicos para que se unan a tus cursos.
          </p>
        </div>

        <div className="courses-metrics">
          <div className="metric-card-small">
            <div className="metric-icon-small purple-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="metric-info-small">
              <span>Total estudiantes</span>
              <strong>{students.length}</strong>
              <small>Activos en tus cursos</small>
            </div>
          </div>
          <div className="metric-card-small">
            <div className="metric-icon-small green-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="metric-info-small">
              <span>Códigos activos</span>
              <strong>{students.filter(s => s.status === 'Activo').length}</strong>
              <small>Códigos en uso</small>
            </div>
          </div>
          <div className="metric-card-small">
            <div className="metric-icon-small cyan-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div className="metric-info-small">
              <span>Invitaciones usadas</span>
              <strong>{students.filter(s => s.status === 'Activo').length + 100}</strong>
              <small>Estudiantes registrados</small>
            </div>
          </div>
          <div className="metric-card-small">
            <div className="metric-icon-small orange-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            </div>
            <div className="metric-info-small">
              <span>Nuevos esta semana</span>
              <strong>{students.filter(s => s.status === 'Pendiente').length + 5}</strong>
              <small>Últimos 7 días</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="students-tabs">
        <button className={tab === 'students' ? 'active' : ''} onClick={() => setTab('students')}>Estudiantes</button>
        <button className={tab === 'codes' ? 'active' : ''} onClick={() => setTab('codes')}>Códigos de acceso</button>
        <button className={tab === 'invites' ? 'active' : ''} onClick={() => setTab('invites')}>Invitaciones</button>
      </div>

      {tab === 'students' && (
        <>
          <div className="students-toolbar">
            <div className="students-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar estudiante por nombre, cédula o correo..." />
            </div>

            <div className="students-filters">
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="all">Todos los cursos</option>
                {COURSE_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Estado: Todos</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
              </select>

              <button className="btn-outline-icon" onClick={exportCsv}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exportar
              </button>

              <button className="btn-primary-new invite-btn" onClick={() => setInviteOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Invitar estudiante
              </button>
            </div>
          </div>

          <div className="students-table">
            <div className="students-table-header">
              <div>Estudiante</div>
              <div>Curso(s)</div>
              <div>Código de acceso</div>
              <div>Estado</div>
              <div>Fecha de registro</div>
              <div className="text-right">Acciones</div>
            </div>

            {rows.map((s) => (
              <div className="students-row" key={s.id}>
                <div className="student-cell">
                  <div className="student-avatar" style={{ backgroundColor: `${s.color}22`, color: s.color }}>{s.initials}</div>
                  <div className="student-info">
                    <strong>{s.name}</strong>
                    <span>{s.cedula}</span>
                    <span className="muted-email">{s.email}</span>
                  </div>
                </div>

                <div className="courses-pills">
                  {s.courses.map((c) => (
                    <span key={c.label} className={`course-pill pill-${c.color}`}>{c.label}</span>
                  ))}
                </div>

                <div className="code-cell">
                  <code>{s.code}</code>
                  <button className="copy-btn" onClick={() => copyCode(s.id, s.code)} title="Copiar código">
                    {copied === s.id ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>

                <div>
                  <span className={`status-pill ${s.status === 'Activo' ? 'active' : 'pending'}`}>
                    <span className="dot"></span>
                    {s.status}
                  </span>
                </div>

                <div className="date-cell">
                  <strong>{s.date}</strong>
                  <span>{s.time}</span>
                </div>

                <div className="actions-cell">
                  <button className="action-btn" title="Ver detalles" onClick={() => setViewStudent(s)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                  <button className="action-btn" title="Editar" onClick={() => setEditStudent(s)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <div className="menu-wrap" onClick={(e) => e.stopPropagation()}>
                    <button className="action-btn" title="Más" onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                    {openMenu === s.id && (
                      <div className="row-menu">
                        <button onClick={() => regenerateCode(s.id)}>Regenerar código</button>
                        <button onClick={() => toggleStatus(s.id)}>
                          {s.status === 'Activo' ? 'Marcar pendiente' : 'Marcar activo'}
                        </button>
                        <button onClick={() => copyCode(s.id, s.code)}>Copiar código</button>
                        <div className="menu-divider" />
                        <button className="danger" onClick={() => removeStudent(s.id)}>Eliminar estudiante</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!rows.length && (
              <div className="empty-row">
                <p>No se encontraron estudiantes con esos filtros.</p>
              </div>
            )}
          </div>

          <div className="students-pagination">
            <span>Mostrando {rows.length ? start + 1 : 0} a {start + rows.length} de {filtered.length} estudiantes</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              {Array.from({ length: totalPages }).slice(0, 3).map((_, i) => (
                <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              {totalPages > 3 && <span className="page-ellipsis">...</span>}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {tab === 'codes' && (
        <div className="students-table">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn-primary-new" onClick={generateMassiveCodes}>
              Generar códigos masivamente
            </button>
          </div>
          <div className="students-table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <div>Estudiante</div>
            <div>Curso(s)</div>
            <div>Código de acceso</div>
            <div className="text-right">Acciones</div>
          </div>
          {students.length === 0 ? (
            <div className="empty-row">
              <p>No hay estudiantes registrados para mostrar códigos.</p>
            </div>
          ) : (
            students.map(s => (
              <div className="students-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }} key={s.id}>
                <div className="student-cell">
                  <div className="student-avatar" style={{ backgroundColor: `${s.color}22`, color: s.color }}>{s.initials}</div>
                  <div className="student-info">
                    <strong>{s.name}</strong>
                  </div>
                </div>
                <div className="courses-pills">
                  {s.courses.map(c => (
                    <span key={c.label} className={`course-pill pill-${c.color}`}>{c.label}</span>
                  ))}
                </div>
                <div className="code-cell">
                  <code>{s.code}</code>
                  <button className="copy-btn" onClick={() => copyCode(s.id, s.code)} title="Copiar código">
                    {copied === s.id ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
                <div className="actions-cell text-right" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => regenerateCode(s.id)}>
                    Regenerar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'invites' && (
        <div className="students-table">
          <div className="empty-row" style={{ padding: '4rem 2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>Invitaciones pendientes</h3>
            <p>{students.filter(s => s.status === 'Pendiente').length} invitaciones esperando confirmación.</p>
            <button className="btn-primary-new invite-btn" style={{ marginTop: '1rem' }} onClick={() => setInviteOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nueva invitación
            </button>
          </div>
        </div>
      )}

      {inviteOpen && (
        <StudentModal
          title="Invitar estudiante"
          submitLabel="Enviar invitación"
          initial={{ name: '', cedula: '', email: '', courses: [] }}
          availableCourses={data.courses || []}
          onCancel={() => setInviteOpen(false)}
          onSubmit={inviteStudent}
        />
      )}

      {editStudent && (
        <StudentModal
          title={`Editar ${editStudent.name}`}
          submitLabel="Guardar cambios"
          initial={{
            id: editStudent.id,
            name: editStudent.name,
            cedula: editStudent.cedula,
            email: editStudent.email,
            courses: editStudent.courses.map(c => c.label),
          }}
          availableCourses={data.courses || []}
          onCancel={() => setEditStudent(null)}
          onSubmit={(payload) => saveEdit({ ...payload, id: editStudent.id })}
        />
      )}

      {viewStudent && (
        <div className="modal-backdrop" onClick={() => setViewStudent(null)}>
          <div className="modal-card view-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del estudiante</h3>
              <button onClick={() => setViewStudent(null)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="student-cell" style={{ marginBottom: '1.25rem' }}>
                <div className="student-avatar" style={{ width: 56, height: 56, fontSize: '1.1rem', backgroundColor: `${viewStudent.color}22`, color: viewStudent.color }}>{viewStudent.initials}</div>
                <div className="student-info">
                  <strong style={{ fontSize: '1.05rem' }}>{viewStudent.name}</strong>
                  <span>{viewStudent.cedula}</span>
                  <span className="muted-email">{viewStudent.email}</span>
                </div>
              </div>
              <div className="view-field"><label>Estado</label><span className={`status-pill ${viewStudent.status === 'Activo' ? 'active' : 'pending'}`}><span className="dot"></span>{viewStudent.status}</span></div>
              <div className="view-field"><label>Código de acceso</label><code>{viewStudent.code}</code></div>
              <div className="view-field"><label>Fecha de registro</label><span>{viewStudent.date} · {viewStudent.time}</span></div>
              <div className="view-field"><label>Cursos</label>
                <div className="courses-pills">
                  {viewStudent.courses.map((c) => <span key={c.label} className={`course-pill pill-${c.color}`}>{c.label}</span>)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-icon" onClick={() => { setEditStudent(viewStudent); setViewStudent(null); }}>Editar</button>
              <button className="btn-primary-new" onClick={() => setViewStudent(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="students-toast fade-in">{toast}</div>}
    </section>
  );
}

function StudentModal({ title, submitLabel, initial, availableCourses = [], onCancel, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState('');

  const toggleCourse = (courseStr) => {
    setForm((f) => {
      const exists = f.courses.includes(courseStr);
      return {
        ...f,
        courses: exists ? f.courses.filter(c => c !== courseStr) : [...f.courses, courseStr],
      };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErr('El nombre es obligatorio');
    
    const ced = form.cedula.trim();
    if (ced && !/^\d{6,}$/.test(ced)) return setErr('Cédula inválida (mínimo 6 dígitos)');
    
    const em = form.email.trim();
    if (em && !/\S+@\S+\.\S+/.test(em)) return setErr('Email inválido');
    
    if (!form.courses.length) return setErr('Selecciona al menos un curso');
    
    onSubmit({ ...form, name: form.name.trim(), cedula: ced, email: em });
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onCancel} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Nombre completo</label>
            <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErr(''); }} placeholder="Ej. María García" autoFocus />
          </div>
          <div className="modal-field">
            <label>Cédula (Opcional)</label>
            <input value={form.cedula} onChange={(e) => { setForm({ ...form, cedula: e.target.value }); setErr(''); }} placeholder="1234567890" inputMode="numeric" />
          </div>
          <div className="modal-field">
            <label>Correo electrónico (Opcional)</label>
            <input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErr(''); }} placeholder="estudiante@email.com" />
          </div>
          <div className="modal-field">
            <label>Cursos</label>
            <div className="courses-pills">
              {availableCourses.map(c => {
                const isSelected = form.courses.includes(c.title);
                return (
                  <button
                    type="button"
                    key={c.id}
                    className={`course-pill ${isSelected ? 'selected' : 'unselected'}`}
                    style={{ 
                      backgroundColor: isSelected ? c.color : 'transparent',
                      color: isSelected ? '#fff' : c.color,
                      borderColor: c.color,
                      borderStyle: 'solid',
                      borderWidth: '1px'
                    }}
                    onClick={() => toggleCourse(c.title)}
                  >
                    {isSelected ? '✓ ' : ''}{c.title}
                  </button>
                );
              })}
            </div>
          </div>
          {err && <div className="modal-error">{err}</div>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-outline-icon" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn-primary-new">{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
