import React, { useState, useEffect, useRef } from 'react';

const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconCourse = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconEval = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg>;
const IconStudents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconGrades = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconReports = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const IconMore = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
const IconChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconContent = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconComm = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconMsg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconHelp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconLogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function Header({ 
  user = { role: 'teacher', full_name: 'Alejandro M.', cedula: '123456789' }, 
  view = 'students',
  handleLogout, 
  nav, 
  courseSearch, 
  setCourseSearch 
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  
  const canvasRef = useRef(null);
  const headerRef = useRef(null);

  const TEACHER_NAV = [
    { id: 'teacher', label: 'Evaluaciones', icon: <IconEval /> },
    { id: 'students', label: 'Estudiantes', icon: <IconStudents /> },
    { id: 'grades', label: 'Calificaciones', icon: <IconGrades /> },
    { id: 'attempts', label: 'Reportes', icon: <IconReports /> },
  ];

  const MORE_NAV = [
    { id: 'courses', label: 'Contenido', icon: <IconContent /> },
    { id: 'communication', label: 'Comunicación', icon: <IconComm /> },
    { id: 'reports', label: 'Reportes', icon: <IconReports /> },
    { id: 'settings', label: 'Ajustes', icon: <IconSettings /> },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let resizeObserver;

    const resizeCanvas = () => {
      if (!headerRef.current) return;
      canvas.width = headerRef.current.offsetWidth || 1000;
      canvas.height = headerRef.current.offsetHeight || 64;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor(canvas.width / 50); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 0.5
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.5)'; 
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - dist / 80)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(headerRef.current);
    }
    resizeCanvas();
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <header ref={headerRef} style={styles.header}>
      {/* Canvas de fondo animado */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Contenido principal */}
      <div style={styles.content}>
        
        {/* Logo */}
        <button type="button" style={styles.logoBtn} onClick={() => nav && nav("area")}>
          <div style={styles.logoIcon}>M</div>
          <div style={styles.logoText}>
            <span style={styles.logoTitle}>MiniMoodle</span>
            <span style={styles.logoSub}>PLATAFORMA VIRTUAL</span>
          </div>
        </button>

        {/* Separador */}
        <div style={styles.separator}></div>

        {/* Navegación Central */}
        <nav style={styles.nav}>
          {[
            { id: 'area', label: 'Inicio', icon: <IconHome /> },
            { id: 'courses', label: 'Cursos', icon: <IconCourse /> },
            ...(user?.role === "teacher" ? TEACHER_NAV : [])
          ].map(({ id, label, icon }) => {
            const isActive = view === id || (id === 'courses' && ["course", "quiz", "result"].includes(view));
            return (
              <button 
                key={id} type="button"
                onClick={() => nav && nav(id)}
                style={{
                  ...styles.navBtn,
                  ...(isActive ? styles.navBtnActive : {})
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(30,41,59,0.6)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}}
              >
                <span style={{ color: isActive ? '#818cf8' : '#64748b' }}>{icon}</span>
                {label}
              </button>
            );
          })}

          {/* Menú "Más" */}
          {user?.role === "teacher" && (
            <div style={{ position: 'relative' }}>
              <button 
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                style={{
                  ...styles.navBtn,
                  ...(moreOpen ? { background: '#1e293b', color: '#fff' } : {})
                }}
                onMouseEnter={e => { if (!moreOpen) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(30,41,59,0.6)'; }}}
                onMouseLeave={e => { if (!moreOpen) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}}
              >
                <IconMore /> Más <IconChevron />
              </button>
              {moreOpen && (
                <div style={styles.dropdown}>
                  {MORE_NAV.map(({ id, label, icon }) => (
                    <button 
                      key={id} type="button"
                      onClick={() => { nav && nav(id); setMoreOpen(false); }}
                      style={styles.dropdownItem}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(51,65,85,0.5)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
                    >
                      <span style={{ color: '#94a3b8' }}>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Lado Derecho */}
        <div style={styles.right}>
          
          {/* Buscador */}
          <div style={styles.searchWrap}>
            <div style={styles.searchIcon}><IconSearch /></div>
            <input
              type="text"
              value={courseSearch || ''}
              onChange={(e) => {
                if (setCourseSearch) setCourseSearch(e.target.value);
                if (view !== "courses" && nav) nav("courses");
              }}
              placeholder="Buscar cursos, alumnos..."
              style={styles.searchInput}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 1px #6366f1'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Iconos de Acción */}
          <div style={styles.actionIcons}>
            <button type="button" style={styles.iconBtn}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#1e293b'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            >
              <IconBell />
              <span style={styles.badge}>3</span>
            </button>
            <button type="button" style={styles.iconBtn}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#1e293b'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            >
              <IconMsg />
              <span style={{ ...styles.badge, background: '#6366f1' }}>2</span>
            </button>
            <button type="button" style={styles.iconBtn}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#1e293b'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            >
              <IconHelp />
            </button>
          </div>

          {/* Separador */}
          <div style={styles.separator}></div>

          {/* Perfil */}
          <div style={{ position: 'relative' }}>
            <button type="button" style={styles.profileBtn} onClick={() => setMenuOpen(!menuOpen)}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ position: 'relative' }}>
                <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style={styles.avatar} />
                <div style={styles.onlineDot}></div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>
                {user?.role === "teacher" ? "Docente" : "Estudiante"}
              </span>
              <span style={{ color: '#64748b' }}><IconChevron /></span>
            </button>

            {menuOpen && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileInfo}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>{user?.full_name || 'Usuario'}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', margin: 0 }}>{user?.cedula}</p>
                </div>
                <button type="button" style={styles.logoutBtn}
                  onClick={() => { if (handleLogout) handleLogout(); setMenuOpen(false); }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <IconLogOut /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'relative',
    width: '100%',
    height: '64px',
    background: '#0B1120',
    borderBottom: '1px solid rgba(30,41,59,0.8)',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
    overflow: 'visible',
    userSelect: 'none',
    zIndex: 100,
  },
  canvas: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
    opacity: 0.8,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: '100%',
    gap: '1rem',
  },
  logoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  logoIcon: {
    width: '36px', height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '1.25rem',
    boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
    transition: 'transform 0.2s',
  },
  logoText: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
  },
  logoTitle: {
    color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1, letterSpacing: '-0.02em',
  },
  logoSub: {
    fontSize: '9px', color: '#818cf8', fontWeight: 600, letterSpacing: '0.1em', marginTop: '4px',
  },
  separator: {
    width: '1px', height: '32px', background: '#1e293b', margin: '0 0.5rem',
  },
  nav: {
    display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1,
  },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.75rem', borderRadius: '6px',
    fontSize: '0.875rem', fontWeight: 500,
    color: '#94a3b8', background: 'transparent',
    border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  navBtnActive: {
    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    width: '192px', background: '#1e293b',
    border: '1px solid rgba(51,65,85,0.8)',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    padding: '6px 0', zIndex: 50,
  },
  dropdownItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.625rem 1rem', fontSize: '0.875rem',
    color: '#cbd5e1', background: 'transparent',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    textAlign: 'left',
  },
  right: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto',
  },
  searchWrap: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)',
    color: '#64748b', pointerEvents: 'none', display: 'flex',
  },
  searchInput: {
    width: '220px',
    background: 'rgba(30,41,59,0.6)',
    border: '1px solid #334155',
    color: '#e2e8f0', fontSize: '0.875rem',
    borderRadius: '999px',
    padding: '0.375rem 1rem 0.375rem 2.5rem',
    outline: 'none', transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  actionIcons: {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
  },
  iconBtn: {
    position: 'relative',
    padding: '0.5rem', color: '#94a3b8',
    background: 'transparent', border: 'none', cursor: 'pointer',
    borderRadius: '50%', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: '4px', right: '4px',
    width: '16px', height: '16px',
    background: '#f43f5e', color: '#fff',
    fontSize: '10px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', border: '2px solid #0B1120',
  },
  profileBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.25rem 0.5rem 0.25rem 0.25rem',
    borderRadius: '999px', background: 'transparent',
    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    border: '2px solid #334155', objectFit: 'cover',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: '10px', height: '10px',
    background: '#10b981', borderRadius: '50%',
    border: '2px solid #0B1120',
  },
  profileDropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    width: '224px', background: '#1e293b',
    border: '1px solid rgba(51,65,85,0.8)',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    padding: '0.5rem 0', zIndex: 50,
  },
  profileInfo: {
    padding: '0.5rem 1rem', marginBottom: '0.5rem',
    borderBottom: '1px solid rgba(51,65,85,0.5)',
  },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.5rem 1rem', fontSize: '0.875rem',
    color: '#f87171', background: 'transparent',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    textAlign: 'left',
  },
};