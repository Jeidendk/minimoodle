import React, { useState } from 'react';
import { parseBulkQuestions } from '../utils/helpers';
import { uid, bulkTemplate } from '../lib/data';

export default function TeacherView({ data, saveRows, setView }) {
  const [tab, setTab] = useState("bank");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseColor, setCourseColor] = useState("#168bd8");
  const [courseId, setCourseId] = useState(data.courses[0]?.id || "");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizMinutes, setQuizMinutes] = useState(30);
  const [quizPublished, setQuizPublished] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [optionsText, setOptionsText] = useState("Opción A\nOpción B\nOpción C\nOpción D");
  const [answerIndex, setAnswerIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [quizId, setQuizId] = useState(data.quizzes[0]?.id || "");
  const [bulkQuizId, setBulkQuizId] = useState(data.quizzes[0]?.id || "");
  const [bulkText, setBulkText] = useState(bulkTemplate);
  const [importMessage, setImportMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function addCourse(event) {
    event.preventDefault();
    if (!courseTitle.trim()) return;
    const row = {
      id: uid("course"),
      title: courseTitle.trim(),
      parallel: "Ineval 3ro BGU",
      area: "Pruebas Ineval",
      color: courseColor,
      description: courseDescription.trim() || "Nuevo curso de practica para evaluaciones.",
      created_at: new Date().toISOString()
    };
    await saveRows("courses", row);
    setCourseId(row.id);
    setCourseTitle("");
    setCourseDescription("");
    showFeedback("Curso creado exitosamente.");
  }

  async function addQuiz(event) {
    event.preventDefault();
    if (!quizTitle.trim() || !courseId) return;
    const row = {
      id: uid("quiz"),
      course_id: courseId,
      title: quizTitle.trim(),
      instructions: "Selecciona la mejor respuesta. Lee cada pregunta cuidadosamente antes de responder.",
      opens_at: new Date().toISOString(),
      closes_at: "2026-12-31T23:59:00.000Z",
      time_limit_minutes: Number(quizMinutes) || 30,
      published: quizPublished,
      created_at: new Date().toISOString()
    };
    await saveRows("quizzes", row);
    setQuizId(row.id);
    setBulkQuizId(row.id);
    setQuizTitle("");
    showFeedback("Cuestionario creado exitosamente.");
  }

  async function addQuestion(event) {
    event.preventDefault();
    const options = optionsText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!questionText.trim() || !quizId || options.length < 2) {
      showFeedback("Por favor completa todos los campos (mínimo 2 opciones).", false);
      return;
    }
    await saveRows("questions", {
      id: uid("question"),
      quiz_id: quizId,
      prompt: questionText.trim(),
      options,
      answer_index: Number(answerIndex),
      explanation: feedback.trim() || "Revisa el procedimiento y compara con la respuesta correcta.",
      points: 1,
      created_at: new Date().toISOString()
    });
    setQuestionText("");
    setFeedback("");
    showFeedback("Pregunta guardada exitosamente.");
  }

  async function importBulkQuestions(event) {
    event.preventDefault();
    const parsed = parseBulkQuestions(bulkText, bulkQuizId, uid);
    if (parsed.errors.length) {
      showFeedback(parsed.errors.join(" | "), false);
      return;
    }
    await saveRows("questions", parsed.questions);
    showFeedback(`${parsed.questions.length} preguntas importadas correctamente.`);
  }

  function downloadTemplate() {
    const blob = new Blob([bulkTemplate], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formato-banco-preguntas.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function showFeedback(msg, success = true) {
    setImportMessage(msg);
    setIsSuccess(success);
    setTimeout(() => setImportMessage(""), 4000);
  }

  // Define icons for tabs
  const tabIcons = {
    bank: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    manual: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
    quiz: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    course: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
  };

  return (
    <section className="fade-in">
      <div className="pageHeader" style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Panel Docente</h1>
        </div>
        <button className="secondaryButton" onClick={() => setView("attempts")} style={{ backgroundColor: 'white' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Ver todos los intentos
        </button>
      </div>
      
      <div className="teacherTabsContainer">
        <div className="teacherTabs">
          {[
            ["bank", "Importar Preguntas"],
            ["manual", "Pregunta Manual"],
            ["quiz", "Crear Cuestionario"],
            ["course", "Crear Curso"]
          ].map(([id, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              <span className="tab-icon">{tabIcons[id]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {importMessage && (
        <div className={`statusMessage ${isSuccess ? 'success' : 'error'} fade-in`}>
          {importMessage}
        </div>
      )}

      {tab === "bank" && (
        <div className="panel splitPanel fade-in">
          <form className="splitPanelLeft" onSubmit={importBulkQuestions}>
            <div className="import-header">
              <div className="import-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <div className="import-header-text">
                <h2>Importación masiva</h2>
                <p>Carga preguntas desde texto usando un formato separado por barras verticales (|).</p>
                <button type="button" className="secondaryButton compact" onClick={downloadTemplate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Descargar formato
                </button>
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label>Cuestionario de destino</label>
              <select className="select-input" value={bulkQuizId} onChange={(event) => setBulkQuizId(event.target.value)}>
                {data.quizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Datos a importar</label>
              <textarea className="bulkArea text-input" value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows="5" />
              <p className="form-help-bottom">Pega aquí varias preguntas en el formato correcto.</p>
            </div>
            
            <div className="formActions splitActions">
              <button type="button" className="secondaryButton" onClick={() => setBulkText(bulkTemplate)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Cargar ejemplo
              </button>
              <button className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Importar preguntas
              </button>
            </div>
          </form>

          <aside className="splitPanelRight">
            <div className="how-it-works">
              <div className="hiw-header">
                <div className="hiw-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </div>
                <h3>¿Cómo funciona?</h3>
              </div>
              
              <div className="hiw-steps">
                <div className="hiw-step">
                  <div className="step-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div className="step-number">1</div>
                  <div className="step-text">
                    <strong>Selecciona el cuestionario</strong>
                    <p>Elige el cuestionario de destino donde se cargarán las preguntas.</p>
                  </div>
                </div>
                
                <div className="hiw-step">
                  <div className="step-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div className="step-number">2</div>
                  <div className="step-text">
                    <strong>Pega el contenido</strong>
                    <p>Copia y pega tus preguntas en el formato indicado.</p>
                  </div>
                </div>
                
                <div className="hiw-step">
                  <div className="step-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </div>
                  <div className="step-number">3</div>
                  <div className="step-text">
                    <strong>Importa las preguntas</strong>
                    <p>Haz clic en "Importar preguntas" y valida los resultados.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
      
      {/* Other tabs remain essentially the same, just styled with panel formPanel */}
      {tab === "quiz" && (
        <form className="panel formPanel fade-in" onSubmit={addQuiz}>
          <h2>Crear nuevo cuestionario</h2>
          <p className="form-help">Añade una evaluación a un curso existente.</p>
          
          <div className="formGrid">
            <div className="form-group">
              <label>Curso asociado</label>
              <select className="select-input" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tiempo límite (minutos)</label>
              <input className="text-input" type="number" min="1" value={quizMinutes} onChange={(event) => setQuizMinutes(event.target.value)} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Título de la evaluación</label>
            <input className="text-input" value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} placeholder="Ej: Simulador Parcial 1" />
          </div>
          
          <label className="toggleLine">
            <div className="toggle-switch">
              <input type="checkbox" id="published-toggle" checked={quizPublished} onChange={(event) => setQuizPublished(event.target.checked)} />
              <label htmlFor="published-toggle"></label>
            </div>
            <span>Hacer visible para los estudiantes inmediatamente</span>
          </label>
          
          <div className="formActions">
            <button className="btn-primary">Crear cuestionario</button>
          </div>
        </form>
      )}
      
      {tab === "course" && (
        <form className="panel formPanel fade-in" onSubmit={addCourse}>
          <h2>Crear nuevo curso</h2>
          <p className="form-help">Define un nuevo espacio de aprendizaje para tus estudiantes.</p>
          
          <div className="formGrid">
            <div className="form-group">
              <label>Nombre del curso</label>
              <input className="text-input" value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} placeholder="Ej: Razonamiento Matemático" />
            </div>
            <div className="form-group">
              <label>Color representativo</label>
              <div className="color-picker-wrapper" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <input className="color-input" type="color" value={courseColor} onChange={(event) => setCourseColor(event.target.value)} style={{width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px'}} />
                <span className="color-hex" style={{fontWeight: 600, color: 'var(--color-muted)'}}>{courseColor}</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Descripción corta</label>
            <textarea className="text-input" rows="3" value={courseDescription} onChange={(event) => setCourseDescription(event.target.value)} placeholder="Describe el contenido principal del curso..." />
          </div>
          
          <div className="formActions">
            <button className="btn-primary">Crear curso</button>
          </div>
        </form>
      )}
      
      {tab === "manual" && (
        <form className="panel formPanel fade-in" onSubmit={addQuestion}>
          <h2>Agregar pregunta individual</h2>
          <p className="form-help">Crea una pregunta de opción múltiple paso a paso.</p>
          
          <div className="form-group">
            <label>Cuestionario de destino</label>
            <select className="select-input" value={quizId} onChange={(event) => setQuizId(event.target.value)}>
              {data.quizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Enunciado de la pregunta</label>
            <textarea className="text-input" rows="2" value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="Escribe la pregunta detalladamente..." />
          </div>
          
          <div className="form-group">
            <label>Opciones (una por línea)</label>
            <textarea className="text-input" rows="4" value={optionsText} onChange={(event) => setOptionsText(event.target.value)} />
          </div>
          
          <div className="formGrid">
            <div className="form-group">
              <label>Opción correcta</label>
              <select className="select-input" value={answerIndex} onChange={(event) => setAnswerIndex(event.target.value)}>
                {optionsText.split("\n").filter(Boolean).map((_, index) => <option key={index} value={index}>Opción {index + 1}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Retroalimentación</label>
              <input className="text-input" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Explicación para el estudiante..." />
            </div>
          </div>
          
          <div className="formActions">
            <button className="btn-primary">Guardar pregunta</button>
          </div>
        </form>
      )}
    </section>
  );
}
