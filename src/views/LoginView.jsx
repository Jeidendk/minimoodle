import React, { useState } from 'react';

export default function LoginView({ onLogin }) {
  const [cedula, setCedula] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cedula.trim()) {
      setError("Por favor ingresa tu cédula o código de acceso");
      return;
    }
    const success = onLogin(cedula.trim(), remember);
    if (!success) {
      setError("Cédula o código no encontrado. Verifica la información e intenta nuevamente.");
    }
  };

  return (
    <div className="login-container-new">
      <div className="login-overlay"></div>
      
      <div className="login-content-wrapper">
        <div className="login-left">
          <div className="brand-header-large">
            <div className="logo-hexagon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7.77V16.23L12 22L22 16.23V7.77L12 2Z" />
              </svg>
              <span className="logo-letter">S</span>
            </div>
            <div className="brand-text-large">
              <h1><span className="text-white">Sistema</span><span className="text-teal">Educativo</span></h1>
              <p>Plataforma Virtual</p>
            </div>
          </div>
          
          <p className="login-description">
            Tu plataforma educativa para aprender,<br/>enseñar y crecer juntos.
          </p>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <p>Aprendizaje<br/>colaborativo</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <p>Recursos<br/>digitales</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10"/>
                  <path d="M12 20V4"/>
                  <path d="M6 20v-6"/>
                </svg>
              </div>
              <p>Seguimiento<br/>académico</p>
            </div>
          </div>

          <div className="login-footer-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Acceso seguro a la plataforma</span>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card-new">
            <div className="login-header-new">
              <div className="logo-hexagon-small">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7.77V16.23L12 22L22 16.23V7.77L12 2Z" />
                </svg>
                <span className="logo-letter">S</span>
              </div>
              <h2>SistemaEducativo</h2>
              <p>Plataforma Virtual</p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form-new">
              <div className="form-group">
                <label htmlFor="cedula">Cédula o Código de Acceso</label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input 
                    id="cedula"
                    type="text" 
                    className="text-input-new"
                    value={cedula} 
                    onChange={(e) => {
                      setCedula(e.target.value);
                      setError("");
                    }}
                    placeholder="Ingresa tu cédula o código..."
                    autoFocus
                  />
                </div>
              </div>
              
              <label className="remember-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="remember-box"></span>
                <span className="remember-text">Mantener sesión activa</span>
              </label>

              {error && <div className="login-error fade-in">{error}</div>}

              <button type="submit" className="btn-primary-new full-width-btn">
                Ingresar
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </button>
            </form>
            
            <div className="login-divider">
              <span>Credenciales de prueba</span>
            </div>
            
            <div className="login-test-creds">
              <div className="cred-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cred-icon outline-teal">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="cred-label">Cédula de docente de prueba:</span>
                <strong className="cred-val">1996202530</strong>
              </div>
              <div className="cred-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="cred-icon fill-teal">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="cred-label">Cédula de estudiante de prueba:</span>
                <strong className="cred-val">1234567890</strong>
              </div>
            </div>

            <div className="login-help">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>¿Necesitas ayuda? Contacta a <a href="mailto:soporte@sistemaeducativo.edu">soporte@sistemaeducativo.edu</a></span>
            </div>
          </div>
        </div>
      </div>

      <div className="global-footer">
        <span>© 2024 Sistema Educativo. Todos los derechos reservados.</span>
        <span className="separator">|</span>
        <a href="#">Política de privacidad</a>
        <span className="separator">|</span>
        <a href="#">Términos de uso</a>
      </div>
    </div>
  );
}
