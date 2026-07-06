import React, { useState, useRef } from 'react';
import { uid, uploadImage } from '../lib/data';
import { DEFAULT_QUESTION, parseQuestions, questionStatus } from '../lib/questionUtils';

function BankForm({ values, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-field">
        <label>Nombre del banco <span style={{ color: '#EF4444' }}>*</span></label>
        <input type="text" placeholder="Ej. Banco de Matemática 3ro BGU" value={values.name} onChange={e => onChange({...values, name: e.target.value})} autoFocus />
      </div>
      <div className="form-field">
        <label>Área o Tema</label>
        <input type="text" placeholder="Ej. Álgebra" value={values.area} onChange={e => onChange({...values, area: e.target.value})} />
      </div>
      <div className="form-field">
        <label>Descripción</label>
        <textarea placeholder="Descripción del contenido..." value={values.description} onChange={e => onChange({...values, description: e.target.value})} rows={3} style={{ resize: 'vertical' }} />
      </div>
    </div>
  );
}

export default function BanksView({ data, user, setView, saveRows, deleteRows }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [newBank, setNewBank] = useState({ name: '', area: '', description: '' });
  const [editBank, setEditBank] = useState({ name: '', area: '', description: '' });
  const [search, setSearch] = useState('');
  const isTeacher = user?.role === 'teacher';

  // --- Bank List Mode ---
  const filteredBanks = (data.banks || []).filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.area && b.area.toLowerCase().includes(search.toLowerCase()))
  );

  function handleCreateBank() {
    if (!newBank.name.trim()) return;
    const bank = {
      id: uid('bank'),
      name: newBank.name.trim(),
      area: newBank.area.trim(),
      description: newBank.description.trim(),
      created_at: new Date().toISOString()
    };
    saveRows('question_banks', bank);
    setNewBank({ name: '', area: '', description: '' });
    setShowCreateModal(false);
  }

  function handleEditBank() {
    if (!editBank.name.trim()) return;
    saveRows('question_banks', {
      id: editBank.id,
      name: editBank.name.trim(),
      area: editBank.area.trim(),
      description: editBank.description.trim(),
      created_at: editBank.created_at
    });
    setShowEditModal(null);
  }

  function handleDeleteBank(bankId) {
    const bankQuestionIds = data.questions.filter(q => q.bank_id === bankId).map(q => q.id);
    if (bankQuestionIds.length) deleteRows('questions', bankQuestionIds);
    deleteRows('question_banks', bankId);
    setShowDeleteConfirm(null);
  }

  if (selectedBank) {
    return <BankDetailView bank={selectedBank} onBack={() => setSelectedBank(null)} data={data} saveRows={saveRows} deleteRows={deleteRows} />;
  }

  return (
    <section className="courses-dashboard fade-in">
      <div className="courses-header-section">
        <div className="courses-header-text">
          <p className="eyebrow" style={{ color: 'var(--color-primary)', fontWeight: '700', marginBottom: '0.25rem' }}>ADMINISTRACIÓN</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#0F172A' }}>Bancos de preguntas</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>Organiza preguntas por áreas o temas para usarlas en múltiples evaluaciones.</p>
        </div>
      </div>
      
      <div className="courses-toolbar-new">
        <div className="filter-group">
          <label style={{ visibility: 'hidden' }}>Buscar</label>
          <div className="toolbar-search-new">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar bancos..." />
          </div>
        </div>
        
        {isTeacher && (
          <button className="btn-primary new-course-btn" style={{ marginLeft: 'auto', marginBottom: '2px' }} onClick={() => setShowCreateModal(true)}>
            + Nuevo banco
          </button>
        )}
      </div>
      
      <div className="courses-grid-new list">
        {filteredBanks.length ? (
          filteredBanks.map(bank => {
            const qCount = data.questions.filter(q => q.bank_id === bank.id).length;
            return (
              <div key={bank.id} className="course-card-new layout-list" style={{ padding: '1rem 1.5rem' }}>
                <div className="card-content-list" style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedBank(bank)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>{bank.name}</h3>
                    {bank.area && <span className="eval-badge purple" style={{ fontSize: '0.65rem' }}>{bank.area}</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{bank.description || 'Sin descripción'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.25rem', color: '#168bd8' }}>{qCount}</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Preguntas</div>
                  </div>
                  {isTeacher && (
                    <div className="card-actions">
                      <button onClick={(e) => { e.stopPropagation(); setShowEditModal(bank); }} title="Editar banco" className="icon-btn-small">✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(bank); }} title="Eliminar banco" className="icon-btn-small delete">🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="emptyState">
            <span className="emptyIcon">🔍</span>
            <p>No se encontraron bancos de preguntas.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header"><h2>Crear nuevo banco</h2><button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button></div>
            <div className="modal-body"><BankForm values={newBank} onChange={setNewBank} /></div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreateBank} disabled={!newBank.name.trim()}>Crear banco</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header"><h2>Editar banco</h2><button className="modal-close" onClick={() => setShowEditModal(null)}>&times;</button></div>
            <div className="modal-body"><BankForm values={editBank} onChange={setEditBank} /></div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleEditBank} disabled={!editBank.name.trim()}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ color: '#DC2626' }}>Eliminar banco</h2><button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
              <p>¿Seguro que deseas eliminar <strong>"{showDeleteConfirm.name}"</strong>?</p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Se eliminarán todas las preguntas que contiene. Esta acción no afecta las evaluaciones que ya las sortearon (sus intentos quedan), pero ya no se usarán a futuro.</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }} onClick={() => handleDeleteBank(showDeleteConfirm.id)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// --- Detail View: Manage Questions in Bank ---
function BankDetailView({ bank, onBack, data, saveRows, deleteRows }) {
  const allQs = data.questions.filter(q => q.bank_id === bank.id);
  const [questions, setQuestions] = useState(allQs);
  const [toast, setToast] = useState(null);
  
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleCsvUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { format, questions: parsed } = parseQuestions(ev.target.result);
      if (!parsed.length) { showToast('Formato no reconocido o texto vacío'); return; }
      
      const newQs = parsed.map(q => ({
        id: uid('q'),
        bank_id: bank.id,
        quiz_id: null,
        prompt: q.statement,
        options: q.options,
        answer_index: q.correctIndex,
        explanation: q.feedback,
        points: q.points || 1,
        image: q.image || null,
        created_at: new Date().toISOString()
      }));
      
      saveRows('questions', newQs);
      setQuestions([...questions, ...newQs]);
      showToast(`✓ ${parsed.length} preguntas importadas (${format})`);
    };
    reader.readAsText(file);
  };

  const handleAddSingle = () => {
    const defaultQ = DEFAULT_QUESTION();
    const newQ = {
      id: uid('q'),
      bank_id: bank.id,
      quiz_id: null,
      prompt: defaultQ.statement,
      options: defaultQ.options,
      answer_index: defaultQ.correctIndex,
      explanation: defaultQ.feedback,
      points: 1,
      created_at: new Date().toISOString()
    };
    saveRows('questions', newQ);
    setQuestions([...questions, newQ]);
    showToast('Pregunta añadida');
  };

  const handleDeleteQ = (qId) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    deleteRows('questions', qId);
    setQuestions(questions.filter(q => q.id !== qId));
    showToast('Pregunta eliminada');
  };

  const csvInputRef = useRef(null);

  return (
    <section className="evaluations-view fade-in">
      <input ref={csvInputRef} type="file" accept=".txt,.json" hidden onChange={(e) => handleCsvUpload(e.target.files?.[0])} />
      
      {toast && (
        <div className="alert-toast success fade-in" style={{ bottom: 20, right: 20, top: 'auto', zIndex: 9999 }}>
          {toast}
        </div>
      )}

      <div className="eval-header-section" style={{ paddingBottom: '1rem' }}>
        <button className="eval-btn-text" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem', padding: 0 }}>
          <span>&larr;</span> Volver a bancos
        </button>
        <div className="eval-header-text">
          <h1>{bank.name}</h1>
          <p>{bank.area && <span className="eval-badge purple" style={{ marginRight: '0.5rem' }}>{bank.area}</span>} {bank.description || 'Gestor de preguntas'}</p>
        </div>
        <div className="eval-global-actions" style={{ marginTop: '1rem' }}>
          <button className="eval-btn-outline" onClick={() => csvInputRef.current?.click()}>
            Carga masiva (TXT/JSON)
          </button>
          <button className="eval-btn-primary" onClick={handleAddSingle}>
            + Pregunta individual
          </button>
        </div>
      </div>

      <div className="eval-layout" style={{ marginTop: '1rem' }}>
        <div className="eval-main-column" style={{ width: '100%' }}>
          {questions.length === 0 ? (
            <div className="eval-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ color: '#64748B' }}>Este banco está vacío</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Agrega preguntas individualmente o usa la carga masiva.</p>
            </div>
          ) : (
            <div className="eval-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} style={{ display: 'flex', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>P{idx + 1}: {q.prompt}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
                        {q.options && q.options.map((opt, i) => (
                          <div key={i} style={{ color: i === q.answer_index ? '#10B981' : 'inherit', fontWeight: i === q.answer_index ? 'bold' : 'normal' }}>
                            {String.fromCharCode(65+i)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="text-red" onClick={() => handleDeleteQ(q.id)} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
