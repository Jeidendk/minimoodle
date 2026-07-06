import React from 'react';

export default function ResultView({ data, quiz, user, setView }) {
  if (!quiz) return <p>Resultado no disponible.</p>;
  
  const attempt = data.attempts
    .filter((item) => item.quiz_id === quiz.id && item.student_id === user.id)
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];

  // Use the exact questions the student saw (bank draws differ per attempt).
  const attemptIds = attempt?.question_ids;
  const questions = (Array.isArray(attemptIds) && attemptIds.length)
    ? attemptIds.map((id) => data.questions.find((q) => q.id === id)).filter(Boolean)
    : data.questions.filter((question) => question.quiz_id === quiz.id);
  const percent = attempt ? Math.round((attempt.score / Math.max(attempt.total, 1)) * 100) : 0;
  
  const isPassed = percent >= 70;

  return (
    <section className="fade-in">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Resultados de la evaluación</p>
          <h1>{quiz.title}</h1>
        </div>
      </div>
      
      <div className="panel resultPanel">
        <div className={`scoreSummary ${isPassed ? 'passed' : 'failed'}`}>
          <div className="scoreCircle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${percent}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{percent}%</text>
            </svg>
          </div>
          <div className="scoreDetails">
            <h2>{isPassed ? '¡Buen trabajo!' : 'Necesitas repasar'}</h2>
            <p className="score-text">Obtuviste <strong>{attempt?.score || 0}</strong> de <strong>{attempt?.total || 0}</strong> puntos posibles.</p>
          </div>
        </div>
        
        <h3 className="sectionStripe mt-4">REVISIÓN DE PREGUNTAS</h3>
        
        <div className="feedback-list">
          {questions.map((question, index) => {
            const selected = Number(attempt?.answers?.[question.id]);
            const ok = selected === Number(question.answer_index);
            return (
              <article className={`feedback-card ${ok ? "ok" : "bad"}`} key={question.id}>
                <div className="feedback-header">
                  <span className="feedback-badge">
                    {ok ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Correcta</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Incorrecta</>
                    )}
                  </span>
                  <strong>Pregunta {index + 1}</strong>
                </div>
                <p className="feedback-prompt">{question.prompt}</p>

                <div className="feedback-options">
                  {question.options.map((opt, i) => {
                    const isCorrect = i === Number(question.answer_index);
                    const isChosen = i === selected;
                    let cls = 'review-opt';
                    if (isCorrect) cls += ' correct';
                    else if (isChosen) cls += ' chosen-wrong';
                    return (
                      <div className={cls} key={i}>
                        <span className="review-opt-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="review-opt-text">{opt}</span>
                        {isCorrect && (
                          <span className="review-opt-tag correct-tag">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Correcta
                          </span>
                        )}
                        {isChosen && !isCorrect && (
                          <span className="review-opt-tag wrong-tag">Tu respuesta</span>
                        )}
                        {isChosen && isCorrect && (
                          <span className="review-opt-tag your-tag">Tu respuesta</span>
                        )}
                      </div>
                    );
                  })}
                  {isNaN(selected) && <p className="review-unanswered">No respondiste esta pregunta.</p>}
                </div>

                {question.explanation && (
                  <div className="feedback-explanation">
                    <div className="explanation-title">Explicación del docente:</div>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        
        <div className="result-actions">
          <button className="primary" onClick={() => setView("courses")}>Volver a mis cursos</button>
        </div>
      </div>
    </section>
  );
}
