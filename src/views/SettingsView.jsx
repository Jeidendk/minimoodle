import React from 'react';

export default function SettingsView({ user, setView }) {
  return (
    <section className="courses-dashboard fade-in">
      {/* HEADER ROW */}
      <div className="courses-header-section">
        <div className="courses-header-text">
          <div className="eyebrow">CONFIGURACIÓN GENERAL</div>
          <h1>Ajustes</h1>
          <p>Administra las preferencias de tu cuenta y notificaciones.</p>
        </div>

        <div className="courses-metrics">
          <div className="metric-card-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button className="eval-btn-primary" style={{ background: 'var(--color-primary)', height: '100%' }}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="eval-layout">
        
        {/* LEFT COLUMN: SETTINGS FORM */}
        <div className="eval-main-column">
          <div className="eval-panel grades-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div className="grades-panel-header" style={{ paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Perfil y Preferencias</h2>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Información Personal</h3>
                <div className="eval-form-group" style={{ marginBottom: '1rem' }}>
                  <label>Nombre completo</label>
                  <input type="text" className="eval-input" defaultValue={user?.full_name || 'Profesor'} />
                </div>
                <div className="eval-form-group" style={{ marginBottom: '1rem' }}>
                  <label>Cédula / ID</label>
                  <input type="text" className="eval-input" defaultValue={user?.cedula || ''} disabled style={{ background: 'var(--color-bg)' }} />
                </div>
                <div className="eval-form-group" style={{ marginBottom: '1rem' }}>
                  <label>Correo electrónico</label>
                  <input type="email" className="eval-input" defaultValue="docente@minimoodle.edu" />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Preferencias de Plataforma</h3>
                <div className="eval-form-group" style={{ marginBottom: '1rem' }}>
                  <label>Idioma</label>
                  <div className="eval-select-wrapper">
                    <select defaultValue="es">
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                    </select>
                  </div>
                </div>
                <div className="eval-form-group" style={{ marginBottom: '1rem' }}>
                  <label>Zona Horaria</label>
                  <div className="eval-select-wrapper">
                    <select defaultValue="bogota">
                      <option value="bogota">(GMT-5) Bogotá, Lima, Quito</option>
                      <option value="mexico">(GMT-6) Ciudad de México</option>
                    </select>
                  </div>
                </div>
                <div className="eval-form-group" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="darkmode" />
                  <label htmlFor="darkmode" style={{ margin: 0 }}>Habilitar modo oscuro automático</label>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATIONS & SECURITY */}
        <div className="eval-sidebar-column">
          <div className="eval-panel" style={{ marginBottom: '1rem' }}>
            <div className="eval-panel-header-flex">
              <h2>Notificaciones</h2>
            </div>
            <div className="eval-form-group" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="notif1" defaultChecked />
              <label htmlFor="notif1" style={{ margin: 0, fontSize: '0.8rem' }}>Correos por nuevas entregas</label>
            </div>
            <div className="eval-form-group" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="notif2" defaultChecked />
              <label htmlFor="notif2" style={{ margin: 0, fontSize: '0.8rem' }}>Alertas de inasistencia</label>
            </div>
            <div className="eval-form-group" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="notif3" />
              <label htmlFor="notif3" style={{ margin: 0, fontSize: '0.8rem' }}>Resumen semanal de rendimiento</label>
            </div>
          </div>
          
          <div className="eval-panel">
            <div className="eval-panel-header-flex">
              <h2>Seguridad</h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>Actualizado hace 3 meses</p>
            <button className="eval-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Cambiar contraseña</button>
            <button className="eval-btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', color: 'var(--color-danger)', borderColor: '#FECACA' }}>Cerrar sesiones activas</button>
          </div>
        </div>
        
      </div>
    </section>
  );
}
