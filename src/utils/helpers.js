export function courseProgress(course, data, user) {
  const courseQuizzes = data.quizzes.filter((quiz) => quiz.course_id === course.id && quiz.published !== false);
  if (!courseQuizzes.length) return 0;
  const completed = courseQuizzes.filter((quiz) => data.attempts.some((attempt) => attempt.quiz_id === quiz.id && attempt.student_id === user.id));
  return Math.round((completed.length / courseQuizzes.length) * 100);
}

export function parseBulkQuestions(text, quizId, uidFn) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  const questions = [];
  for (const [lineIndex, line] of lines.entries()) {
    if (lineIndex === 0 && line.toLowerCase().startsWith("pregunta")) continue;
    const delimiter = line.includes("|") ? "|" : line.includes(";") ? ";" : ",";
    const cells = line.split(delimiter).map((cell) => cell.trim());
    if (cells.length < 7) {
      errors.push(`Fila ${lineIndex + 1}: faltan columnas.`);
      continue;
    }
    const [prompt, ...rest] = cells;
    const answerRaw = rest[rest.length - 2];
    const explanation = rest[rest.length - 1];
    const options = rest.slice(0, -2).filter(Boolean);
    const answerIndex = parseAnswer(answerRaw, options.length);
    if (!prompt || options.length < 2 || answerIndex < 0) {
      errors.push(`Fila ${lineIndex + 1}: pregunta, opciones o respuesta no valida.`);
      continue;
    }
    questions.push({
      id: uidFn("question"),
      quiz_id: quizId,
      prompt,
      options,
      answer_index: answerIndex,
      explanation: explanation || "Revisa la retroalimentacion del docente.",
      points: 1,
      created_at: new Date().toISOString()
    });
  }
  if (!quizId) errors.push("Selecciona un cuestionario.");
  if (!questions.length && !errors.length) errors.push("No hay preguntas para importar.");
  return { questions, errors };
}

export function parseAnswer(value, optionCount) {
  const clean = String(value || "").trim().toUpperCase();
  if (/^\d+$/.test(clean)) {
    const numeric = Number(clean);
    return numeric >= 1 && numeric <= optionCount ? numeric - 1 : -1;
  }
  const letter = clean.charCodeAt(0) - 65;
  return letter >= 0 && letter < optionCount ? letter : -1;
}

export function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
