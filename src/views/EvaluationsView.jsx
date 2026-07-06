import React, { useState, useEffect, useMemo, useRef } from 'react';
import { uid, uploadImage } from '../lib/data';
import { DEFAULT_QUESTION, parseAiken, parseAsterisk, parseJson, parseQuestions, questionStatus } from '../lib/questionUtils';

const TYPES = ['Cuestionario', 'Examen', 'Práctica'];
const ANSWER_TYPES = ['Opción múltiple', 'Verdadero/Falso', 'Respuesta corta'];
const DIFFICULTIES = ['Fácil', 'Media', 'Difícil'];
const STORAGE_KEY = 'minimoodle:evaluation';

const DEFAULT_CONFIG = {
  courseId: '',
  sectionId: '',
  title: 'Evaluación diagnóstica',
  type: 'Cuestionario',
  opensAt: '26/05/2025 08:00',
  closesAt: '02/06/2025 23:59',
  timeLimit: '25 min',
  showResults: true,
  allowRetry: false,
  status: 'Borrador',
  // Question source
  origen: 'own',            // 'own' = preguntas propias | 'bank' = sortear de banco global
  bankIds: [],              // multiple selected bank ids
  bankName: '',             // name for a new bank
  questionCount: 10,        // how many to draw per attempt (bank mode)
  minutesPerQuestion: 1,    // 1 min per question
  shuffleQuestions: true,   // random order of questions per attempt
  shuffleOptions: true,     // random order of options per attempt
};

function renderMd(text) {
  if (!text) return '';
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escape(text)
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+?)_/g, '<em>$1</em>');
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}


export default function EvaluationsView({ data, user, setView, saveRows, deleteRows, goCourse, editQuizId }) {
  const [activeTab, setActiveTab] = useState('individual');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState([DEFAULT_QUESTION(), { ...DEFAULT_QUESTION(), statement: '', options: ['', '', '', ''], correctIndex: -1 }, { ...DEFAULT_QUESTION(), statement: '', options: ['', '', '', ''], correctIndex: -1 }, { ...DEFAULT_QUESTION(), statement: '', options: ['', '', '', ''], correctIndex: -1 }]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBankData, setNewBankData] = useState({ name: '', area: '', description: '' });
  const [pasteText, setPasteText] = useState('');
  const imageInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const pastePreview = useMemo(() => parseQuestions(pasteText), [pasteText]);

  // Load initial data ONCE on mount
  useEffect(() => {
    if (editQuizId) {
      const quiz = data.quizzes?.find(q => q.id === editQuizId);
      if (quiz) {
        setConfig({
          title: quiz.title || '',
          courseId: quiz.course_id || '',
          sectionId: quiz.section_id || '',
          openTime: quiz.open_time ? quiz.open_time.slice(0, 16) : '',
          closeTime: quiz.close_time ? quiz.close_time.slice(0, 16) : '',
          timeLimit: quiz.time_limit || '',
          type: quiz.type || 'Cuestionario',
          questionsPerAttempt: quiz.questions_per_attempt || 20,
          shuffleQuestions: quiz.shuffle_questions !== false,
          shuffleOptions: quiz.shuffle_options !== false,
          showResults: quiz.show_results !== false,
          allowRetries: quiz.allow_retries !== false,
          status: quiz.published ? 'Publicada' : 'Borrador'
        });
        
        const quizQs = data.questions?.filter(q => q.quiz_id === editQuizId).sort((a,b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        if (quizQs && quizQs.length > 0) {
          setQuestions(quizQs.map(q => ({
            id: q.id,
            statement: q.prompt || '',
            options: q.options || ['', '', '', ''],
            correctIndex: typeof q.answer_index === 'number' ? q.answer_index : -1,
            feedback: q.explanation || '',
            points: q.points || 1,
            image: q.image || null,
            _db: true
          })));
        }
      }
    }
    // When editQuizId is null (new evaluation), we keep the default clean state.
    // No localStorage loading — the key prop on the component forces a clean remount.
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Set default course/section if empty
  useEffect(() => {
    if (data?.courses?.length && !config.courseId) {
      updateConfig({ courseId: data.courses[0].id });
    }
  }, [data?.courses, config.courseId]);

  useEffect(() => {
    if (config.courseId && data?.sections) {
      const courseSections = data.sections.filter(s => s.course_id === config.courseId);
      if (courseSections.length > 0 && !courseSections.some(s => s.id === config.sectionId)) {
        updateConfig({ sectionId: courseSections[0].id });
      }
    }
  }, [config.courseId, config.sectionId, data?.sections]);




  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const wrapSelection = (field, marker) => {
    const el = document.getElementById(`${field}-input`);
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = el.value.slice(0, start);
    const selected = el.value.slice(start, end) || 'texto';
    const after = el.value.slice(end);
    const newVal = `${before}${marker}${selected}${marker}${after}`;
    updateActive({ [field]: newVal });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    }, 0);
  };

  const activeQ = questions[activeIdx] || questions[0];
  const totalPoints = useMemo(() => questions.reduce((sum, q) => sum + Number(q.points || 0), 0), [questions]);
  const completeCount = useMemo(() => questions.filter(q => questionStatus(q) === 'Completa').length, [questions]);
  const avgPoints = questions.length ? Math.round(totalPoints / questions.length) : 0;
  
  const currentCourse = data?.courses?.find(c => c.id === config.courseId) || (data?.courses?.[0] || { id: '', title: 'Sin curso', parallel: '' });
  const sections = data?.sections?.filter(s => s.course_id === config.courseId) || [];
  const currentSection = sections.find(s => s.id === config.sectionId) || sections[0] || { title: 'Sin unidad' };

  const updateConfig = (patch) => setConfig((c) => ({ ...c, ...patch }));
  const updateActive = (patch) => setQuestions((qs) => qs.map((q, i) => i === activeIdx ? { ...q, ...patch } : q));

  const updateOption = (idx, value) => {
    updateActive({ options: activeQ.options.map((o, i) => i === idx ? value : o) });
  };

  const addOption = () => {
    if (activeQ.options.length >= 8) return;
    updateActive({ options: [...activeQ.options, ''] });
  };

  const removeOption = (idx) => {
    if (activeQ.options.length <= 2) return;
    const newOpts = activeQ.options.filter((_, i) => i !== idx);
    let newCorrect = activeQ.correctIndex;
    if (idx === activeQ.correctIndex) newCorrect = -1;
    else if (idx < activeQ.correctIndex) newCorrect -= 1;
    updateActive({ options: newOpts, correctIndex: newCorrect });
  };

  const addQuestion = () => {
    const q = { ...DEFAULT_QUESTION(), statement: '', options: ['', '', '', ''], correctIndex: -1, feedback: '' };
    setQuestions((qs) => [...qs, q]);
    setActiveIdx(questions.length);
    showToast('Pregunta agregada');
  };

  const duplicateQuestion = () => {
    const clone = { ...activeQ, id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    const newList = [...questions.slice(0, activeIdx + 1), clone, ...questions.slice(activeIdx + 1)];
    setQuestions(newList);
    setActiveIdx(activeIdx + 1);
    showToast('Pregunta duplicada');
  };

  const deleteQuestion = () => {
    if (questions.length <= 1) { showToast('Debe existir al menos una pregunta'); return; }
    if (!confirm('¿Eliminar esta pregunta?')) return;
    const newList = questions.filter((_, i) => i !== activeIdx);
    setQuestions(newList);
    setActiveIdx(Math.max(0, activeIdx - 1));
    showToast('Pregunta eliminada');
  };

  const moveQuestion = (dir) => {
    const target = activeIdx + dir;
    if (target < 0 || target >= questions.length) return;
    const list = [...questions];
    [list[activeIdx], list[target]] = [list[target], list[activeIdx]];
    setQuestions(list);
    setActiveIdx(target);
  };

  const nextQuestion = () => {
    if (activeIdx < questions.length - 1) setActiveIdx(activeIdx + 1);
    else { addQuestion(); }
    showToast('Pregunta guardada');
  };

  const saveDraft = () => {
    updateConfig({ status: 'Borrador' });
    publish(true);
  };

  const handleSaveAsBank = () => {
    if (questions.length === 0 || (questions.length === 1 && !questions[0].statement)) {
      showToast('No hay preguntas para guardar');
      return;
    }
    setShowBankModal(true);
  };

  const confirmSaveAsBank = () => {
    if (!newBankData.name.trim()) { showToast('El nombre del banco es obligatorio'); return; }
    
    // Create new bank
    const bankId = uid('bank');
    const bank = {
      id: bankId,
      name: newBankData.name.trim(),
      area: newBankData.area.trim(),
      description: newBankData.description.trim(),
      created_at: new Date().toISOString()
    };
    
    // Map current UI questions to DB format for the bank
    const qsToSave = questions.map(q => ({
      id: uid('q'),
      bank_id: bankId,
      quiz_id: null,
      prompt: q.statement,
      options: q.options,
      answer_index: q.correctIndex,
      explanation: q.feedback,
      points: q.points || 1,
      image: q.image || null,
      created_at: new Date().toISOString()
    }));
    
    // Save bank and questions
    saveRows('question_banks', bank);
    saveRows('questions', qsToSave);
    
    setShowBankModal(false);
    setNewBankData({ name: '', area: '', description: '' });
    showToast(`✓ Banco creado con ${qsToSave.length} preguntas`);
  };

  const validateQuestions = () => {
    const invalid = questions.findIndex(q => questionStatus(q) !== 'Completa');
    if (invalid !== -1) {
      setActiveIdx(invalid);
      showToast(`Falta completar la pregunta ${invalid + 1}`);
      return;
    }
  }

  const publish = (isDraft = false) => {
    if (!isDraft) {
      const invalid = questions.findIndex(q => questionStatus(q) !== 'Completa');
      if (invalid !== -1) {
        setActiveIdx(invalid);
        showToast(`Falta completar la pregunta ${invalid + 1}`);
        return;
      }
    }
    if (!config.title.trim()) { showToast('Falta título de la evaluación'); return; }
    if (!config.courseId) { showToast('Selecciona un curso primero'); return; }

    const isBank = config.origen === 'bank';
    let bankId = null;

    let finalBankId = null;
    let totalBankQs = 0;

    if (isBank) {
      if (!config.bankIds || config.bankIds.length === 0) {
        showToast('Selecciona al menos un banco de preguntas'); return;
      }
      finalBankId = config.bankIds.join(',');
      totalBankQs = data.questions.filter(q => config.bankIds.includes(q.bank_id)).length;
      
      const count = Number(config.questionCount) || 0;
      if (count < 1) { showToast('Indica cuántas preguntas se sortearán'); return; }
      if (count > totalBankQs) { showToast(`Los bancos tienen ${totalBankQs} preguntas; no puedes sortear ${count}`); return; }
    }

    const quizId = editQuizId || uid('quiz');
    const existingQuiz = editQuizId ? data.quizzes.find(q => q.id === editQuizId) : null;
    
    const mpq = Number(config.minutesPerQuestion) || 1;
    const requested = Number(config.questionCount) || 0;
    const drawCount = isBank ? requested : questions.length;

    const newQuiz = {
      id: quizId,
      course_id: config.courseId,
      section_id: config.sectionId,
      title: config.title.trim(),
      instructions: `Evaluación de tipo: ${config.type}.`,
      opens_at: config.openTime ? new Date(config.openTime).toISOString() : new Date().toISOString(),
      closes_at: config.closeTime ? new Date(config.closeTime).toISOString() : "2026-12-31T23:59:00.000Z",
      time_limit_minutes: Math.max(1, drawCount * mpq),
      bank_id: isBank ? finalBankId : null,
      question_count: requested > 0 ? drawCount : 0,
      minutes_per_question: mpq,
      shuffle_questions: config.shuffleQuestions !== false,
      shuffle_options: config.shuffleOptions !== false,
      published: !isDraft,
      created_at: existingQuiz?.created_at || new Date().toISOString()
    };

    if (saveRows) {
      saveRows('quizzes', newQuiz);
      if (!isBank) {
        if (editQuizId && deleteRows) {
          const existingIds = data.questions.filter(q => q.quiz_id === editQuizId).map(q => q.id);
          const currentIds = questions.filter(q => q._db).map(q => q.id);
          const toDelete = existingIds.filter(id => !currentIds.includes(id));
          if (toDelete.length > 0) deleteRows('questions', toDelete);
        }
        
        const newQuestions = questions.map((q) => ({
          id: q._db ? q.id : uid('q'),
          quiz_id: quizId,
          bank_id: null,
          prompt: q.statement,
          options: q.options,
          answer_index: q.correctIndex,
          explanation: q.feedback,
          points: q.points,
          image: q.image || null,
          created_at: q._db && editQuizId ? (data.questions.find(dbq => dbq.id === q.id)?.created_at || new Date().toISOString()) : new Date().toISOString()
        }));
        saveRows('questions', newQuestions);
      }
    }

    updateConfig({ status: isDraft ? 'Borrador' : 'Publicada' });
    showToast(isBank
      ? `✓ Simulador "${config.title}" ${isDraft ? 'guardado' : 'publicado'} (sortea ${drawCount} del banco)`
      : `✓ Evaluación "${config.title}" ${isDraft ? 'guardada' : 'publicada'}`);

    if (!isDraft) {
      setTimeout(() => {
        if (goCourse) goCourse(config.courseId);
        else setView('courses');
      }, 1500);
    }
    
    // Clear the local draft since it's now saved in the DB
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Load an existing bank's questions into the builder (for reuse/editing)
  const loadBank = (bankId) => {
    if (!bankId) { updateConfig({ bankId: '', bankName: '' }); return; }
    const bankQs = (data.questions || []).filter(q => q.bank_id === bankId);
    if (bankQs.length) {
      setQuestions(bankQs.map(q => ({
        id: `q_${q.id}`,
        dbId: q.id,
        statement: q.prompt,
        image: q.image || '',
        answerType: 'Opción múltiple',
        difficulty: 'Media',
        points: q.points || 1,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: Number(q.answer_index ?? -1),
        feedback: q.explanation || '',
      })));
      setActiveIdx(0);
    }
    updateConfig({ bankId, bankName: '' });
    showToast(`Banco cargado (${bankQs.length} preguntas)`);
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Imagen supera 5 MB'); return; }
    setUploading(true);
    showToast('Subiendo imagen...');
    try {
      const { url } = await uploadImage(file, 'questions');
      updateActive({ image: url });
      showToast(url.startsWith('data:') ? 'Imagen lista (local, webp)' : '✓ Imagen subida (webp)');
    } catch (err) {
      showToast('No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => updateActive({ image: '' });

  const importFromText = (text) => {
    const { format, questions: parsed } = parseQuestions(text);
    if (!parsed.length) { showToast('Formato no reconocido o texto vacío'); return 0; }
    setQuestions([...questions, ...parsed]);
    setActiveIdx(questions.length);
    setActiveTab('individual');
    showToast(`✓ ${parsed.length} preguntas importadas (${format})`);
    return parsed.length;
  };

  const handleCsvUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importFromText(ev.target.result);
    reader.readAsText(file);
  };

  const downloadTemplate = (format = 'aiken') => {
    const templates = {
      aiken:
`¿Cuánto es 2 + 2?
A. 3
B. 4
C. 5
D. 6
ANSWER: B

Selecciona la palabra en **negrita** correcta según _contexto_.
A. rápido
B. lento
C. correcto
D. incorrecto
ANSWER: C
`,
      simple:
`¿Cuánto es 2 + 2?
- 3
- *4
- 5
- 6

Selecciona la _correcta_ (usa **negrita** e _itálica_):
- opción normal
- *opción **correcta** marcada con *
- otra opción
`,
      json: JSON.stringify([
        { pregunta: '¿Cuánto es 2 + 2?', opciones: ['3','4','5','6'], correcta: 1, puntos: 4 },
        { pregunta: 'Palabra en **negrita** e _itálica_', opciones: ['a','b','correcta','d'], correcta: 2, puntos: 4 },
      ], null, 2),
    };
    const ext = { aiken: 'txt', simple: 'txt', json: 'json' }[format];
    const mime = { aiken: 'text/plain', simple: 'text/plain', json: 'application/json' }[format];
    const content = templates[format];
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `plantilla_preguntas_${format}.${ext}`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast(`Plantilla ${format.toUpperCase()} descargada`);
  };

  const optionLetter = (i) => String.fromCharCode(65 + i);
  const optionLabelClass = (i, isCorrect) => {
    if (isCorrect) return 'text-green';
    return ['', 'text-blue', '', 'text-purple'][i] || '';
  };

  const validations = useMemo(() => {
    const status = questionStatus(activeQ);
    return {
      correct: activeQ.correctIndex >= 0 && activeQ.options[activeQ.correctIndex]?.trim(),
      image: !!activeQ.image,
      complete: status === 'Completa',
    };
  }, [activeQ]);

  return (
    <section className="eval-view fade-in">
      {/* Hidden inputs for uploads */}
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif" hidden onChange={(e) => handleImageUpload(e.target.files?.[0])} />
      <input ref={csvInputRef} type="file" accept=".txt,.json" hidden onChange={(e) => handleCsvUpload(e.target.files?.[0])} />

      {/* HEADER */}
      <div className="eval-header">
        <div className="eval-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="eval-btn-outline" onClick={() => setView('teacher')} style={{ padding: '0.4rem 0.6rem', border: 'none', background: '#F1F5F9', color: '#475569' }} title="Volver a mis evaluaciones">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div>
            <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', letterSpacing: '1px' }}>Gestión de Evaluaciones</h4>
            <h1>{editQuizId ? 'Editar evaluación' : 'Crear evaluación'}</h1>
            <p>Configura, carga materiales, preguntas y respuestas para cada curso.</p>
          </div>
        </div>

        <div className="eval-top-metrics">
          <div className="eval-top-metric-card">
            <div className="eval-metric-icon blue-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" opacity="0.3"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
            </div>
            <div>
              <span className="eval-metric-label">Curso seleccionado</span>
              <strong className="eval-metric-value">{currentCourse.title}</strong>
              <span className="eval-metric-sub">{currentCourse.parallel}</span>
            </div>
          </div>

          <div className="eval-top-metric-card">
            <div className="eval-metric-icon cyan-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <span className="eval-metric-label">Preguntas</span>
              <strong className="eval-metric-value">{questions.length}</strong>
              <span className="eval-metric-sub">{completeCount} completas</span>
            </div>
          </div>

          <div className="eval-top-metric-card">
            <div className="eval-metric-icon orange-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            </div>
            <div>
              <span className="eval-metric-label">Puntaje total</span>
              <strong className="eval-metric-value">{totalPoints} puntos</strong>
              <span className="eval-metric-sub">Promedio: {avgPoints} pts por pregunta</span>
            </div>
          </div>

          <div className="eval-top-metric-card">
            <div className="eval-metric-icon green-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <span className="eval-metric-label">Estado</span>
              <strong className="eval-metric-value">{config.status}</strong>
              <span className="eval-metric-sub">{config.status === 'Publicada' ? 'Visible para estudiantes' : 'Aún no publicado'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="eval-layout">
        <div className="eval-main-column">
          {/* PANEL 1: Config */}
          <div className="eval-panel relative">
            <div className="eval-panel-header-flex">
              <h2>1. Configuración de la evaluación</h2>
              <div className="eval-global-actions">
                <button className="eval-btn-outline" onClick={handleSaveAsBank} title="Guardar estas preguntas como un banco reutilizable">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  Guardar como Banco
                </button>
                <button className="eval-btn-outline" onClick={saveDraft}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Guardar borrador
                </button>
                <button className="eval-btn-primary" onClick={publish}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  Publicar evaluación
                </button>
              </div>
            </div>

            <div className="eval-form-grid">
              <div className="eval-form-group">
                <label>Curso</label>
                <div className="eval-select-wrapper">
                  <select value={config.courseId} onChange={(e) => updateConfig({ courseId: e.target.value, sectionId: '' })}>
                    {data?.courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="eval-form-group">
                <label>Unidad / Tema</label>
                <div className="eval-select-wrapper">
                  <select value={config.sectionId} onChange={(e) => updateConfig({ sectionId: e.target.value })}>
                    {sections.length > 0 ? (
                      sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                    ) : (
                      <option value="">Sin unidades - Se creará en el curso</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="eval-form-group">
                <label>Título de la evaluación</label>
                <input type="text" className="eval-input" value={config.title} onChange={(e) => updateConfig({ title: e.target.value })} />
              </div>
              <div className="eval-form-group">
                <label>Tipo</label>
                <div className="eval-select-wrapper">
                  <select value={config.type} onChange={(e) => updateConfig({ type: e.target.value })}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="eval-form-group">
                <label>Fecha de apertura</label>
                <div className="eval-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <input type="text" className="eval-input" value={config.opensAt} onChange={(e) => updateConfig({ opensAt: e.target.value })} />
                </div>
              </div>
              <div className="eval-form-group">
                <label>Fecha de cierre</label>
                <div className="eval-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <input type="text" className="eval-input" value={config.closesAt} onChange={(e) => updateConfig({ closesAt: e.target.value })} />
                </div>
              </div>
              <div className="eval-form-group">
                <label>Minutos por pregunta</label>
                <div className="eval-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <input type="number" min="1" className="eval-input" value={config.minutesPerQuestion} onChange={(e) => updateConfig({ minutesPerQuestion: Number(e.target.value) || 1 })} />
                </div>
              </div>
              <div className="eval-form-group">
                <label>Tiempo total (automático)</label>
                <div className="eval-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <input type="text" className="eval-input" readOnly value={`${Math.max(1, (config.origen === 'bank' ? (Number(config.questionCount) || 0) : questions.length) * (Number(config.minutesPerQuestion) || 1))} min`} />
                </div>
              </div>

              <div className="eval-form-group">
                <label>Origen de preguntas</label>
                <div className="eval-select-wrapper">
                  <select value={config.origen} onChange={(e) => updateConfig({ origen: e.target.value })}>
                    <option value="own">Preguntas de esta evaluación</option>
                    <option value="bank">Sortear de un banco global</option>
                  </select>
                </div>
              </div>

              {config.origen === 'bank' ? (
                <div className="eval-form-group">
                  <label>Bancos de preguntas (puedes elegir varios)</label>
                  <div className="eval-multi-select" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', maxHeight: '150px', overflowY: 'auto', background: 'white' }}>
                    {(data.question_banks || []).length > 0 ? (data.question_banks || []).map((b) => (
                      <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={config.bankIds.includes(b.id)} 
                          onChange={(e) => {
                            const newIds = e.target.checked 
                              ? [...config.bankIds, b.id]
                              : config.bankIds.filter(id => id !== b.id);
                            updateConfig({ bankIds: newIds });
                          }} 
                        />
                        <span>{b.name}</span>
                        <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>({data.questions.filter(q => q.bank_id === b.id).length} preg)</span>
                      </label>
                    )) : (
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No hay bancos disponibles. Crea uno nuevo.</div>
                    )}
                  </div>
                  {config.bankIds.length === 0 && (
                     <div style={{ marginTop: '0.5rem' }}>
                       <label style={{ fontSize: '0.85rem' }}>O crea un nuevo banco al publicar:</label>
                       <input type="text" className="eval-input" value={config.bankName} placeholder="Nombre del nuevo banco" onChange={(e) => updateConfig({ bankName: e.target.value })} />
                     </div>
                  )}
                </div>
              ) : <div className="eval-form-group empty"></div>}

              {/* Questions-per-attempt works in BOTH modes: 0 = todas */}
              <div className="eval-form-group">
                <label>Preguntas por intento {config.origen === 'own' ? '(0 = todas)' : ''}</label>
                <input
                  type="number"
                  min={config.origen === 'bank' ? 1 : 0}
                  max={questions.length}
                  className="eval-input"
                  value={config.questionCount}
                  onChange={(e) => updateConfig({ questionCount: Math.max(0, Number(e.target.value) || 0) })}
                />
                <small style={{ color: 'var(--color-muted)', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>
                  Total disponible: {questions.length} · cada estudiante recibe {(() => {
                    const n = Number(config.questionCount) || 0;
                    return (n > 0 ? Math.min(n, questions.length) : questions.length);
                  })()} al azar
                </small>
              </div>

              <div className="eval-form-group toggle-group">
                <span>Mezclar preguntas (orden aleatorio)</span>
                <button type="button" className={`eval-toggle ${config.shuffleQuestions ? 'checked' : ''}`} onClick={() => updateConfig({ shuffleQuestions: !config.shuffleQuestions })}>
                  <div className="eval-toggle-knob"></div>
                </button>
              </div>
              <div className="eval-form-group toggle-group">
                <span>Mezclar opciones de cada pregunta</span>
                <button type="button" className={`eval-toggle ${config.shuffleOptions ? 'checked' : ''}`} onClick={() => updateConfig({ shuffleOptions: !config.shuffleOptions })}>
                  <div className="eval-toggle-knob"></div>
                </button>
              </div>
              <div className="eval-form-group toggle-group">
                <span>Mostrar resultados al finalizar</span>
                <button type="button" className={`eval-toggle ${config.showResults ? 'checked' : ''}`} onClick={() => updateConfig({ showResults: !config.showResults })}>
                  <div className="eval-toggle-knob"></div>
                </button>
              </div>
              <div className="eval-form-group toggle-group">
                <span>Permitir reintento</span>
                <button type="button" className={`eval-toggle ${config.allowRetry ? 'checked' : ''}`} onClick={() => updateConfig({ allowRetry: !config.allowRetry })}>
                  <div className="eval-toggle-knob"></div>
                </button>
              </div>
            </div>
          </div>

          {/* PANEL 2: Question Builder */}
          <div className="eval-panel no-padding">
            <div className="eval-tabs">
              <button className={`eval-tab ${activeTab === 'individual' ? 'active' : ''}`} onClick={() => setActiveTab('individual')}>Pregunta individual</button>
              <button className={`eval-tab ${activeTab === 'masiva' ? 'active' : ''}`} onClick={() => setActiveTab('masiva')}>Carga masiva</button>
              <button className={`eval-tab ${activeTab === 'banco' ? 'active' : ''}`} onClick={() => setActiveTab('banco')}>Importar de banco</button>
            </div>

            <div className="eval-tab-content">
              {activeTab === 'individual' && (
                <>
                  <div className="eval-question-header">
                    <div className="eval-qh-left">
                      <h3>Pregunta {activeIdx + 1}</h3>
                      <input
                        type="number"
                        className="eval-input"
                        style={{ width: 80, padding: '0.35rem 0.5rem' }}
                        value={activeQ.points}
                        min="1"
                        onChange={(e) => updateActive({ points: Number(e.target.value) || 1 })}
                      />
                      <span className="eval-badge purple">{activeQ.points} puntos</span>
                      <button
                        type="button"
                        className="eval-btn-text"
                        style={{ fontSize: '0.75rem', padding: 0 }}
                        title="Aplicar estos puntos a todas las preguntas"
                        onClick={() => {
                          const p = Number(activeQ.points) || 1;
                          setQuestions((qs) => qs.map((q) => ({ ...q, points: p })));
                          showToast(`Todas las preguntas: ${p} pto(s)`);
                        }}
                      >
                        Aplicar a todas
                      </button>
                    </div>
                    <div className="eval-qh-actions">
                      <button title="Subir" onClick={() => moveQuestion(-1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                      </button>
                      <button title="Bajar" onClick={() => moveQuestion(1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                      </button>
                      <button title="Duplicar" onClick={duplicateQuestion}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                      <button title="Eliminar" className="text-red" onClick={deleteQuestion}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className="eval-question-body">
                    <div className="eval-split-row">
                      <div className="eval-form-group flex-2">
                        <label>Enunciado de la pregunta</label>
                        <div className="md-toolbar">
                          <button type="button" title="Negrita — **texto**" onClick={() => wrapSelection('statement', '**')}><strong>B</strong></button>
                          <button type="button" title="Cursiva — _texto_" onClick={() => wrapSelection('statement', '_')}><em>I</em></button>
                          <span className="md-hint">Usa <code>**negrita**</code> y <code>_cursiva_</code></span>
                        </div>
                        <div className="eval-textarea-wrapper">
                          <textarea
                            id="statement-input"
                            className="eval-input"
                            rows="3"
                            maxLength="500"
                            value={activeQ.statement}
                            onChange={(e) => updateActive({ statement: e.target.value })}
                            placeholder="Escribe la pregunta..."
                          />
                          <span className="char-count">{activeQ.statement.length}/500</span>
                        </div>
                      </div>

                      <div className="eval-form-group flex-1">
                        <label>Imagen de la pregunta (opcional)</label>
                        <div className="eval-image-upload" onClick={() => !uploading && imageInputRef.current?.click()} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                          {uploading ? (
                            <div className="eval-upload-text">
                              <div className="loader" style={{ width: 22, height: 22, margin: '0 auto 0.4rem' }}></div>
                              <strong>Convirtiendo a webp y subiendo...</strong>
                            </div>
                          ) : activeQ.image ? (
                            <div className="eval-image-preview">
                              <img src={activeQ.image} alt="preview" />
                              <button className="remove-img" onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                          ) : (
                            <div className="eval-upload-text">
                              <strong>Arrastra o sube una imagen para la pregunta</strong>
                              <p>Se convierte a WebP automáticamente (máx. 5 MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="eval-split-row">
                      <div className="eval-form-group flex-1">
                        <label>Tipo de respuesta</label>
                        <div className="eval-select-wrapper">
                          <select value={activeQ.answerType} onChange={(e) => updateActive({ answerType: e.target.value })}>
                            {ANSWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="eval-form-group flex-1">
                        <label>Dificultad</label>
                        <div className="eval-select-wrapper">
                          <select value={activeQ.difficulty} onChange={(e) => updateActive({ difficulty: e.target.value })}>
                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex-1"></div>
                    </div>

                    <div className="eval-split-row" style={{ alignItems: 'stretch' }}>
                      <div className="eval-options-section" style={{ flex: 2 }}>
                        <div className="eval-options-header">
                          <span>Opciones de respuesta</span>
                          <span className="text-right">Respuesta correcta</span>
                        </div>

                        {activeQ.options.map((opt, i) => {
                          const isCorrect = i === activeQ.correctIndex;
                          return (
                            <div key={i} className={`eval-option-row ${isCorrect ? 'correct' : ''}`}>
                              <div className={`eval-opt-label ${optionLabelClass(i, isCorrect)}`}>{optionLetter(i)}</div>
                              <input
                                type="text"
                                className="eval-input"
                                value={opt}
                                placeholder={`Opción ${optionLetter(i)}`}
                                onChange={(e) => updateOption(i, e.target.value)}
                              />
                              <button
                                type="button"
                                className={`eval-radio ${isCorrect ? 'selected' : ''}`}
                                onClick={() => updateActive({ correctIndex: i })}
                                title="Marcar como correcta"
                              >
                                <div className="radio-inner"></div>
                              </button>
                              {activeQ.options.length > 2 && (
                                <button type="button" className="opt-remove" onClick={() => removeOption(i)} title="Eliminar opción">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              )}
                            </div>
                          );
                        })}

                        <button className="eval-btn-text" onClick={addOption} disabled={activeQ.options.length >= 8}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          Agregar otra opción
                        </button>
                      </div>

                      <div className="eval-form-group" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '1.2rem' }}>
                        <div>
                          <label>Retroalimentación / explicación (opcional)</label>
                          <div className="eval-textarea-wrapper">
                            <textarea
                              className="eval-input"
                              rows="4"
                              maxLength="500"
                              value={activeQ.feedback}
                              onChange={(e) => updateActive({ feedback: e.target.value })}
                              placeholder="Explicación mostrada al estudiante..."
                            />
                            <span className="char-count">{activeQ.feedback.length}/500</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <button className="eval-btn-outline" onClick={() => showToast('Pregunta guardada')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            Guardar pregunta
                          </button>
                          <button className="eval-btn-primary" onClick={nextQuestion}>
                            {activeIdx < questions.length - 1 ? 'Siguiente pregunta' : 'Nueva pregunta'}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'masiva' && (
                <div className="bulk-import" style={{ padding: '1.5rem' }}>
                  <div className="bulk-format-info">
                    <strong>Pega tus preguntas o sube un archivo — auto-detectamos el formato:</strong>
                    <div className="bulk-format-grid">
                      <div className="bulk-format-card">
                        <div className="bulk-format-head">
                          <span className="bulk-format-badge easy">MÁS FÁCIL</span>
                          <strong>Formato simple</strong>
                        </div>
                        <pre>{`¿Cuánto es 2 + 2?
- 3
- *4    ← marca correcta con *
- 5
- 6`}</pre>
                        <button className="eval-btn-text" onClick={() => downloadTemplate('simple')}>Descargar .txt</button>
                      </div>
                      <div className="bulk-format-card">
                        <div className="bulk-format-head">
                          <span className="bulk-format-badge">MOODLE</span>
                          <strong>Aiken (.txt)</strong>
                        </div>
                        <pre>{`¿Cuánto es 2 + 2?
A. 3
B. 4
C. 5
D. 6
ANSWER: B`}</pre>
                        <button className="eval-btn-text" onClick={() => downloadTemplate('aiken')}>Descargar .txt</button>
                      </div>
                      <div className="bulk-format-card">
                        <div className="bulk-format-head">
                          <span className="bulk-format-badge">DEV</span>
                          <strong>JSON</strong>
                        </div>
                        <pre>{`[{
  "pregunta": "¿2+2?",
  "opciones": ["3","4","5","6"],
  "correcta": 1
}]`}</pre>
                        <button className="eval-btn-text" onClick={() => downloadTemplate('json')}>Descargar .json</button>
                      </div>
                      <div className="bulk-format-card">
                        <div className="bulk-format-head">
                          <span className="bulk-format-badge easy">FORMATO</span>
                          <strong>Negrita e itálica</strong>
                        </div>
                        <pre>{`¿Cuál es correcto?
- ninguna
- *la **respuesta** _correcta_
- todas
`}</pre>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                          <code>**negrita**</code> · <code>_cursiva_</code>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', marginTop: '1.5rem' }}>
                    <div>
                      <label className="bulk-textarea-label">Pega aquí tus preguntas</label>
                      <textarea
                        className="eval-input bulk-textarea"
                        rows="14"
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={`Ejemplo:\n\n¿Cuánto es 2 + 2?\n- 3\n- *4\n- 5\n- 6\n\n¿Capital de Ecuador?\n- Guayaquil\n- Cuenca\n- *Quito\n- Loja`}
                      />
                      <div className="bulk-actions">
                        <button
                          className="eval-btn-primary"
                          disabled={!pastePreview.questions?.length}
                          onClick={() => { if (importFromText(pasteText)) setPasteText(''); }}
                        >
                          {pastePreview.questions?.length
                            ? `Importar ${pastePreview.questions.length} pregunta${pastePreview.questions.length === 1 ? '' : 's'}`
                            : 'Importar preguntas'}
                        </button>
                        <button className="eval-btn-outline" onClick={() => setPasteText('')} disabled={!pasteText}>Limpiar</button>
                      </div>
                    </div>

                    <div>
                      <label className="bulk-textarea-label">Vista previa</label>
                      <div className="bulk-preview">
                        {!pasteText && <p className="bulk-preview-empty">Escribe o pega texto para ver la vista previa.</p>}
                        {pasteText && !pastePreview.questions?.length && (
                          <p className="bulk-preview-empty error">Formato no reconocido. Revisa los ejemplos arriba.</p>
                        )}
                        {pastePreview.questions?.length > 0 && (
                          <>
                            <div className="bulk-preview-header">
                              <span className={`bulk-format-badge ${pastePreview.format === 'Simple' ? 'easy' : ''}`}>{pastePreview.format}</span>
                              <strong>{pastePreview.questions.length} pregunta{pastePreview.questions.length === 1 ? '' : 's'} detectada{pastePreview.questions.length === 1 ? '' : 's'}</strong>
                            </div>
                            <ul>
                              {pastePreview.questions.slice(0, 5).map((q, i) => (
                                <li key={i}>
                                  <strong>{i + 1}.</strong>{' '}
                                  <span dangerouslySetInnerHTML={{ __html: renderMd(q.statement.slice(0, 60)) + (q.statement.length > 60 ? '...' : '') }} />
                                  <span className="bulk-preview-correct" dangerouslySetInnerHTML={{ __html: '✓ ' + renderMd(q.options[q.correctIndex]) }} />
                                </li>
                              ))}
                              {pastePreview.questions.length > 5 && <li className="more">+ {pastePreview.questions.length - 5} más...</li>}
                            </ul>
                          </>
                        )}
                      </div>

                      <div className="bulk-file-drop" onClick={() => csvInputRef.current?.click()}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span>o sube un archivo <strong>.txt / .json</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'banco' && (
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Importar preguntas de un banco</h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Si quieres crear una evaluación fija (sin sorteo aleatorio), puedes copiar las preguntas de tus bancos directamente aquí.
                  </p>
                  
                  <div className="eval-form-group">
                    <label>Selecciona un banco</label>
                    <div className="eval-select-wrapper">
                      <select id="import-bank-select" className="eval-input" defaultValue="">
                        <option value="" disabled>Elige un banco...</option>
                        {(data.question_banks || []).map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({data.questions.filter(q => q.bank_id === b.id).length} preg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    className="eval-btn-primary" 
                    style={{ marginTop: '1rem' }}
                    onClick={() => {
                      const sel = document.getElementById('import-bank-select');
                      if (!sel || !sel.value) return;
                      const bankQs = data.questions.filter(q => q.bank_id === sel.value);
                      if (!bankQs.length) {
                        showToast('Este banco no tiene preguntas');
                        return;
                      }
                      // Clone questions and map to UI format
                      const newQs = bankQs.map(q => ({
                        id: uid('q'),
                        statement: q.prompt || '',
                        options: q.options || ['', '', '', ''],
                        correctIndex: typeof q.answer_index === 'number' ? q.answer_index : -1,
                        feedback: q.explanation || '',
                        points: q.points || 1,
                        image: q.image || null,
                        bank_id: null,
                        quiz_id: null
                      }));
                      setQuestions(prev => [...prev, ...newQs]);
                      showToast(`✓ ${newQs.length} preguntas importadas`);
                    }}
                  >
                    Importar preguntas al cuestionario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="eval-sidebar-column">
          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Vista previa
            </div>
            <div className="eval-preview-card">
              {activeQ.statement
                ? <p dangerouslySetInnerHTML={{ __html: renderMd(activeQ.statement) }} />
                : <p><em style={{ color: 'var(--color-muted)' }}>Sin enunciado</em></p>}
              <div className="eval-preview-content">
                <div className="eval-preview-options">
                  {activeQ.options.map((opt, i) => {
                    const isCorrect = i === activeQ.correctIndex;
                    return (
                      <div key={i} className={`eval-prev-opt ${isCorrect ? 'correct' : ''}`}>
                        <div className={`prev-radio ${isCorrect ? 'selected' : ''}`}><div className="radio-inner"></div></div>
                        {optionLetter(i)} <span className="prev-val" dangerouslySetInnerHTML={{ __html: opt ? renderMd(opt) : '—' }} />
                      </div>
                    );
                  })}
                </div>
                {activeQ.image && (
                  <div className="eval-preview-img">
                    <img src={activeQ.image} alt="preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header flex-between">
              <div className="flex-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line></svg>
                Estructura
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="eval-btn-text" 
                  onClick={() => {
                    if (questions.length === 0) return;
                    if (confirm('¿Estás seguro de eliminar TODAS las preguntas de esta evaluación?')) {
                      setQuestions([{ ...DEFAULT_QUESTION(), statement: '', options: ['', '', '', ''], correctIndex: -1 }]);
                      setActiveIdx(0);
                      showToast('Todas las preguntas fueron eliminadas');
                    }
                  }} 
                  style={{ padding: 0, color: '#EF4444' }} 
                  title="Vaciar cuestionario"
                >
                  Vaciar
                </button>
                <button className="eval-btn-text" onClick={addQuestion} style={{ padding: 0 }}>+ Agregar</button>
              </div>
            </div>
            <div className="eval-structure-list">
              {questions.map((q, i) => {
                const status = questionStatus(q);
                const color = status === 'Completa' ? 'green' : (q.statement ? 'orange' : 'gray');
                const label = status === 'Completa' ? 'Completa' : (q.statement ? 'Borrador' : 'Pendiente');
                return (
                  <div
                    key={q.id}
                    className={`eval-str-item ${i === activeIdx ? 'active' : ''}`}
                    onClick={() => { setActiveIdx(i); setActiveTab('individual'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <svg className="drag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    <div className={`str-num ${i === activeIdx ? 'blue' : ''}`}>{i + 1}</div>
                    <span className="str-title">Pregunta {i + 1}</span>
                    <span className="str-pts">{q.points} pts</span>
                    <span className={`str-status ${color}`}><div className="dot"></div> {label}</span>
                    <button 
                      className="text-red" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (questions.length <= 1) { showToast('Debe existir al menos una pregunta'); return; }
                        if (!confirm(`¿Eliminar la Pregunta ${i + 1}?`)) return;
                        const newList = questions.filter((_, idx) => idx !== i);
                        setQuestions(newList);
                        if (activeIdx >= newList.length) setActiveIdx(newList.length - 1);
                        showToast('Pregunta eliminada');
                      }} 
                      title="Eliminar pregunta" 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', marginLeft: 'auto' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header flex-between">
              <div className="flex-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Carga masiva
              </div>
              <button className="eval-link" onClick={() => setActiveTab('masiva')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: '0.8rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                Formatos y plantillas
              </button>
            </div>

            <div className="eval-upload-zone" onClick={() => csvInputRef.current?.click()} style={{ cursor: 'pointer' }}>
              <div className="eval-upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <div className="eval-upload-text">
                <strong>Subir archivo CSV / XLSX / ZIP</strong>
                <p>o haz clic para elegir</p>
              </div>
            </div>
            <p className="eval-side-help">Importa preguntas con imágenes, opciones y respuestas correctas en lote para ahorrar tiempo.</p>
          </div>

          <div className="eval-side-panel">
            <div className="eval-side-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Validaciones
            </div>
            <div className="eval-validations">
              <div className="eval-val-item">
                <ValidationIcon ok={validations.correct} />
                {validations.correct ? '1 respuesta correcta marcada' : 'Falta marcar respuesta correcta'}
              </div>
              <div className="eval-val-item">
                <ValidationIcon ok={validations.image} />
                {validations.image ? 'Imagen cargada' : 'Imagen opcional no cargada'}
              </div>
              <div className="eval-val-item">
                <ValidationIcon ok={validations.complete} />
                {validations.complete ? 'Campos obligatorios completos' : 'Faltan campos obligatorios'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="students-toast fade-in">{toast}</div>}

      {showBankModal && (
        <div className="modal-overlay" onClick={() => setShowBankModal(false)}>
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2>Guardar como Banco de Preguntas</h2>
              <button className="modal-close" onClick={() => setShowBankModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                Se copiarán las <strong>{questions.length}</strong> preguntas actuales a un nuevo banco para que puedas reutilizarlas en el futuro.
              </p>
              <div className="form-field">
                <label>Nombre del banco <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="eval-input" placeholder="Ej: Simulador 2" value={newBankData.name} onChange={e => setNewBankData({...newBankData, name: e.target.value})} autoFocus />
              </div>
              <div className="form-field">
                <label>Área o Tema (opcional)</label>
                <input type="text" className="eval-input" placeholder="Ej: Verbal" value={newBankData.area} onChange={e => setNewBankData({...newBankData, area: e.target.value})} />
              </div>
              <div className="form-field">
                <label>Descripción (opcional)</label>
                <textarea className="eval-input" rows="2" placeholder="Detalles del banco..." value={newBankData.description} onChange={e => setNewBankData({...newBankData, description: e.target.value})}></textarea>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setShowBankModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmSaveAsBank}>Guardar banco</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ValidationIcon({ ok }) {
  if (ok) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 12 14 8 10"></polyline></svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
  );
}
