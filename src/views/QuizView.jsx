import React, { useState, useMemo, useEffect } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizView({ data, quiz, user, submitAttempt, setView }) {
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(null); // { questions, optionOrders }
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [markedForReview, setMarkedForReview] = useState(new Set());

  const isBank = Boolean(quiz?.bank_id);
  const minutesPerQuestion = Number(quiz?.minutes_per_question) || 1;

  // Pool of questions available to this quiz (before draw/shuffle)
  const pool = useMemo(() => {
    if (!quiz) return [];
    if (isBank) return data.questions.filter((q) => q.bank_id === quiz.bank_id);
    return data.questions.filter((q) => q.quiz_id === quiz.id);
  }, [data, quiz, isBank]);

  // Questions this student already saw in OTHER simulators sharing this bank
  const seenIds = useMemo(() => {
    const set = new Set();
    if (!isBank || !user) return set;
    const sameBankQuizIds = new Set(
      data.quizzes.filter((q) => q.bank_id === quiz.bank_id && q.id !== quiz.id).map((q) => q.id)
    );
    data.attempts
      .filter((a) => a.student_id === user.id && sameBankQuizIds.has(a.quiz_id))
      .forEach((a) => (a.question_ids || []).forEach((id) => set.add(id)));
    return set;
  }, [data.attempts, data.quizzes, quiz, user, isBank]);

  // How many questions this attempt will have (question_count 0 = all)
  const drawCount = useMemo(() => {
    const want = Number(quiz?.question_count) || 0;
    return want > 0 ? Math.min(want, pool.length) : pool.length;
  }, [pool.length, quiz]);

  const totalMinutes = Math.max(1, drawCount * minutesPerQuestion);

  // Build the attempt session (random draw + shuffle) — runs once when starting
  function buildSession() {
    let picked;
    if (isBank) {
      const fresh = pool.filter((q) => !seenIds.has(q.id));
      // Prefer unseen; if not enough, top up with seen ones so the attempt still fills.
      const base = fresh.length >= drawCount ? fresh : [...fresh, ...pool.filter((q) => seenIds.has(q.id))];
      picked = shuffle(base).slice(0, drawCount);
    } else {
      // Own-mode quiz: draw drawCount random from its own questions (or all).
      picked = shuffle(pool).slice(0, drawCount);
    }
    if (quiz.shuffle_questions === false) {
      // keep original order of the drawn subset
      const order = new Map(pool.map((q, i) => [q.id, i]));
      picked = [...picked].sort((a, b) => order.get(a.id) - order.get(b.id));
    }
    const optionOrders = {};
    picked.forEach((q) => {
      const idxs = q.options.map((_, i) => i);
      optionOrders[q.id] = quiz.shuffle_options === false ? idxs : shuffle(idxs);
    });
    setSession({ questions: picked, optionOrders });
    setTimeLeft(totalMinutes * 60);
    setStarted(true);
  }

  const questions = session?.questions || [];

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [started, timeLeft]);

  // Auto-submit when time is up
  useEffect(() => {
    if (started && timeLeft === 0 && questions.length > 0) {
      submitAttempt(answers, questions.map((q) => q.id));
    }
  }, [started, timeLeft, questions, answers, submitAttempt]);

  if (!quiz) return <p>Cuestionario no encontrado.</p>;

  const finish = () => submitAttempt(answers, questions.map((q) => q.id));

  const answered = Object.keys(answers).length;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeLow = timeLeft < 300; // Less than 5 minutes

  const question = questions[currentQuestionIndex];

  // ---------------------------------------------------------------
  // START / INSTRUCTIONS SCREEN
  // ---------------------------------------------------------------
  if (!started) {
    const availableUnseen = isBank ? pool.filter((q) => !seenIds.has(q.id)).length : pool.length;
    const noQuestions = pool.length === 0;
    return (
      <section className="fade-in">
        <button className="linkButton" onClick={() => setView("course")} style={{ marginBottom: "1rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver al curso
        </button>

        <div className="quiz-start-card">
          <div className="quiz-start-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <p className="quiz-start-eyebrow">EVALUACIÓN</p>
          <h1 className="quiz-start-title">{quiz.title}</h1>
          {quiz.instructions && <p className="quiz-start-instructions">{quiz.instructions}</p>}

          <div className="quiz-start-facts">
            <div className="quiz-fact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <strong>{noQuestions ? 0 : drawCount}</strong>
              <span>Preguntas</span>
            </div>
            <div className="quiz-fact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <strong>{totalMinutes} min</strong>
              <span>Tiempo límite</span>
            </div>
            <div className="quiz-fact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
              <strong>{quiz.shuffle_questions === false ? 'Fijo' : 'Aleatorio'}</strong>
              <span>Orden</span>
            </div>
          </div>

          <ul className="quiz-start-rules">
            <li>Cada pregunta vale {minutesPerQuestion} min. El cronómetro inicia al presionar "Iniciar".</li>
            {quiz.shuffle_options !== false && <li>Las opciones aparecen en orden aleatorio.</li>}
            {isBank && <li>Tus preguntas se sortean de un banco; procuramos no repetir las que ya viste en otros simuladores.</li>}
            <li>Al terminar verás tu puntaje y la revisión con las respuestas correctas.</li>
          </ul>

          {noQuestions ? (
            <div className="quiz-start-empty">Este simulador aún no tiene preguntas configuradas.</div>
          ) : (
            <button className="btn-primary quiz-start-btn" onClick={buildSession}>
              Iniciar evaluación
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="5 3 19 12 5 21 5 3"></polyline></svg>
            </button>
          )}
          {isBank && !noQuestions && availableUnseen < drawCount && (
            <p className="quiz-start-note">Nota: quedan {availableUnseen} preguntas nuevas en el banco; algunas podrían repetirse para completar {drawCount}.</p>
          )}
        </div>
      </section>
    );
  }

  const toggleMark = (id) => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(id)) {
      newMarked.delete(id);
    } else {
      newMarked.add(id);
    }
    setMarkedForReview(newMarked);
  };

  return (
    <section className="fade-in">
      <button className="linkButton" onClick={() => setView("course")} style={{ marginBottom: "1rem" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Salir del cuestionario
      </button>
      
      <div className="pageHeader quiz-header" style={{ marginBottom: "2.5rem" }}>
        <div>
          <p className="eyebrow" style={{ textTransform: "uppercase", color: "var(--color-primary)" }}>Evaluación en progreso</p>
          <h1 style={{ fontWeight: 800, fontSize: '2rem' }}>{quiz.title}</h1>
        </div>
        <div className="quiz-meta-pills" style={{ display: 'flex', gap: '1rem' }}>
          <div className="countPill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--color-border)', backgroundColor: 'white', fontWeight: 600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Respondidas: {answered}/{questions.length}
          </div>
          <div className={`timerPill ${isTimeLow ? 'danger' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--color-border)', backgroundColor: 'white', fontWeight: 600, color: isTimeLow ? 'red' : 'inherit' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      
      <div className="splitPanel" style={{ background: 'transparent', border: 'none', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="splitPanelLeft" style={{ flex: 1, minWidth: '300px', background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>

           
           <div style={{ marginBottom: '2.5rem' }}>
             <p style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.75rem' }}>Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
             <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
             </div>
           </div>
           
           {question ? (
             <div className="question-content" style={{ flex: 1 }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2.5rem', color: 'var(--color-text)', lineHeight: 1.4 }}>{question.prompt}</h2>
               <div className="options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {(session?.optionOrders?.[question.id] || question.options.map((_, i) => i)).map((originalIndex, displayIndex) => {
                   const option = question.options[originalIndex];
                   const isSelected = Number(answers[question.id]) === originalIndex;
                   return (
                     <label key={originalIndex} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '12px', background: isSelected ? '#EEF2FF' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                       <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-muted)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>}
                       </div>
                       <input type="radio" name={question.id} style={{ display: 'none' }} checked={isSelected} onChange={() => setAnswers({ ...answers, [question.id]: originalIndex })} />
                       <span style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '1rem' }}>{option}</span>
                     </label>
                   );
                 })}
               </div>
             </div>
           ) : (
              <div className="emptyState" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Este cuestionario aún no tiene preguntas configuradas.</p>
              </div>
           )}

           {questions.length > 0 && (
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
               <button className="secondaryButton" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 Pregunta anterior
               </button>
               <button className="secondaryButton" style={{ border: 'none', background: 'transparent' }} onClick={() => toggleMark(question.id)}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                 {markedForReview.has(question.id) ? 'Desmarcar' : 'Marcar para revisar'}
               </button>
               <button className="btn-primary" onClick={() => {
                 if (currentQuestionIndex < questions.length - 1) {
                   setCurrentQuestionIndex(prev => prev + 1);
                 } else {
                   finish();
                 }
               }}>
                 {currentQuestionIndex < questions.length - 1 ? (
                   <>Siguiente pregunta <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></>
                 ) : (
                   'Finalizar evaluación'
                 )}
               </button>
             </div>
           )}
        </div>

        <aside className="splitPanelRight" style={{ flex: '0 0 350px', background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
           <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Navegación del cuestionario</h3>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
             {questions.map((q, i) => {
               const isCurrent = i === currentQuestionIndex;
               const isAnswered = answers[q.id] !== undefined;
               const isMarked = markedForReview.has(q.id);

               let bg = 'white';
               let border = '1px solid var(--color-border)';
               let color = 'var(--color-text)';
               let icon = null;

               if (isCurrent) {
                 bg = 'var(--color-primary)';
                 border = '1px solid var(--color-primary)';
                 color = 'white';
               } else if (isMarked) {
                 bg = '#FEF3C7';
                 border = '1px solid #F59E0B';
                 color = '#B45309';
                 icon = <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: '#F59E0B', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div>;
               } else if (isAnswered) {
                 bg = '#DCFCE7';
                 border = '1px solid #22C55E';
                 color = '#166534';
                 icon = <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: '#22C55E', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>;
               }

               return (
                 <button key={q.id} onClick={() => setCurrentQuestionIndex(i)} style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, background: bg, border: border, color: color, cursor: 'pointer', margin: '0 auto', transition: 'all 0.2s' }}>
                   {i + 1}
                   {icon}
                 </button>
               );
             })}
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)' }}></div> Actual</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div> Respondida</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'white' }}></div> Sin responder</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Marcada</div>
           </div>

           <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Progreso</span>
               <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{questions.length ? Math.round((answered / questions.length) * 100) : 0}%</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Respondidas</span>
               <span style={{ fontWeight: 700 }}>{answered}/{questions.length}</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg> Sin responder</span>
               <span style={{ fontWeight: 700 }}>{questions.length - answered}</span>
             </div>
             <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
               <div style={{ width: `${questions.length ? (answered / questions.length) * 100 : 0}%`, height: '100%', background: 'var(--color-primary)' }}></div>
             </div>
           </div>

           <button className="secondaryButton" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', background: 'white' }} onClick={finish}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
             Enviar evaluación
           </button>
        </aside>
      </div>
    </section>
  );
}
