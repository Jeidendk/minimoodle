import React, { useState } from 'react';
import '../styles.css';

export default function CommunicationView({ setView }) {
  const [activeTab, setActiveTab] = useState('recibidos');

  const messages = [
    { id: 1, sender: 'Coordinación Académica', subject: 'Aviso de mantenimiento de plataforma', snippet: 'Estimados docentes, les informamos que el día...', time: '10:30 AM', unread: true },
    { id: 2, sender: 'Juan Sebastián Cruz', subject: 'Duda sobre la tarea 1', snippet: 'Profesor, tengo una consulta respecto a la rúbrica...', time: 'Ayer', unread: true },
    { id: 3, sender: 'Lucía Valentina Torres', subject: 'Justificación por inasistencia', snippet: 'Adjunto el certificado médico correspondiente a...', time: 'Lun', unread: false },
    { id: 4, sender: 'María Fernanda López', subject: 'Revisión de examen final', snippet: 'Podría indicarme en qué pregunta me equivoqué...', time: 'Dom', unread: false },
  ];

  return (
    <section className="evaluations-view">
      {/* HEADER ROW */}
      <div className="eval-header-section" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div style={{ flexShrink: 0, paddingRight: '1rem' }}>
          <div className="eval-breadcrumb">CENTRO DE MENSAJES</div>
          <div className="eval-header-text">
            <h1 style={{ fontSize: '1.8rem' }}>Comunicación</h1>
            <p>Mantente en contacto con estudiantes y administración.</p>
          </div>
        </div>

        <div className="eval-top-metrics" style={{ flex: 1, margin: 0, padding: '0.4rem', border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="eval-top-metric-card" style={{ flex: 1, background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
             <div className="eval-metric-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
             </div>
             <div>
               <span className="eval-metric-label">Bandeja de entrada</span>
               <span className="eval-metric-value">124</span>
               <span className="eval-metric-sub">2 sin leer</span>
             </div>
          </div>
          <div className="eval-top-metric-card" style={{ flex: 1, background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
             <div className="eval-metric-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
             </div>
             <div>
               <span className="eval-metric-label">Enviados</span>
               <span className="eval-metric-value">85</span>
               <span className="eval-metric-sub">Este mes</span>
             </div>
          </div>
          <div className="eval-top-metric-card" style={{ flex: 1.5, background: 'transparent', border: 'none', boxShadow: 'none' }}></div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="eval-layout">
        
        {/* LEFT COLUMN: INBOX */}
        <div className="eval-main-column">
          <div className="eval-panel no-padding grades-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div className="grades-panel-header" style={{ padding: '0.75rem 1rem', margin: '-0.75rem -0.75rem 1rem -0.75rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Bandeja de mensajes</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="grades-tabs">
                  <button className={`grades-tab ${activeTab === 'recibidos' ? 'active' : ''}`} onClick={() => setActiveTab('recibidos')}>Recibidos</button>
                  <button className={`grades-tab ${activeTab === 'enviados' ? 'active' : ''}`} onClick={() => setActiveTab('enviados')}>Enviados</button>
                  <button className={`grades-tab ${activeTab === 'borradores' ? 'active' : ''}`} onClick={() => setActiveTab('borradores')}>Borradores</button>
                </div>
              </div>
            </div>

            <div className="grades-filters">
              <div className="eval-form-group flex-2">
                <div className="eval-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" className="eval-input" placeholder="Buscar mensajes..." />
                </div>
              </div>
              <div className="eval-form-group">
                <div className="eval-select-wrapper">
                  <select defaultValue="all"><option value="all">Todos los cursos</option></select>
                </div>
              </div>
            </div>

            <div className="grades-table-container">
              <table className="grades-table" style={{ cursor: 'pointer' }}>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id} style={{ background: msg.unread ? '#F8FAFC' : 'white' }}>
                      <td style={{ width: '40px', paddingRight: 0 }}>
                         <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                           {msg.sender.charAt(0)}
                         </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: msg.unread ? 800 : 600, color: 'var(--color-text)' }}>{msg.sender}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: msg.unread ? 600 : 400 }}>{msg.subject}</div>
                      </td>
                      <td className="text-left" style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>
                        {msg.snippet}
                      </td>
                      <td className="text-right" style={{ color: 'var(--color-muted)', fontSize: '0.65rem' }}>
                        {msg.time}
                        {msg.unread && <div style={{ width: '8px', height: '8px', background: '#2563EB', borderRadius: '50%', display: 'inline-block', marginLeft: '0.5rem' }}></div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN: COMPOSER */}
        <div className="eval-sidebar-column">
          <div className="eval-panel">
            <div className="eval-panel-header-flex">
              <h2>Redactar mensaje</h2>
            </div>
            <div className="eval-form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Para:</label>
              <div className="eval-select-wrapper">
                <select defaultValue="all">
                  <option value="all">Todos los estudiantes (Razonamiento Matemático)</option>
                  <option value="1">Seleccionar alumno individual...</option>
                </select>
              </div>
            </div>
            <div className="eval-form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Asunto:</label>
              <input type="text" className="eval-input" placeholder="Escribe un asunto..." />
            </div>
            <div className="eval-form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Mensaje:</label>
              <div className="eval-textarea-wrapper">
                <textarea className="eval-input" rows="8" placeholder="Escribe tu mensaje aquí..." style={{ resize: 'vertical' }}></textarea>
              </div>
            </div>
            <div className="eval-global-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
               <button className="eval-btn-outline">Guardar borrador</button>
               <button className="eval-btn-primary" style={{ background: '#2563EB' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                 Enviar mensaje
               </button>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
