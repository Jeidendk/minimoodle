export const DEFAULT_QUESTION = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  statement: 'Si un cuaderno cuesta $4 y compras 3 cuadernos, ¿cuánto pagas en total?',
  image: '',
  answerType: 'Opción múltiple',
  difficulty: 'Media',
  points: 1,
  options: ['$7', '$10', '$12', '$14'],
  correctIndex: 2,
  feedback: 'Cada cuaderno cuesta $4. Al comprar 3 cuadernos: $4 x 3 = $12.',
});

export function parseAiken(text) {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const out = [];
  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;
    const answerLineIdx = lines.findIndex(l => /^answer\s*:/i.test(l) || /^respuesta\s*:/i.test(l));
    if (answerLineIdx === -1) continue;
    const answerLetter = lines[answerLineIdx].split(':')[1]?.trim().toUpperCase()[0];
    if (!answerLetter) continue;
    const optionLines = lines.slice(0, answerLineIdx).filter(l => /^[A-Z][\.\)]\s+/.test(l));
    const statementLines = lines.slice(0, answerLineIdx).filter(l => !/^[A-Z][\.\)]\s+/.test(l));
    if (!statementLines.length || optionLines.length < 2) continue;
    const options = optionLines.map(l => l.replace(/^[A-Z][\.\)]\s+/, ''));
    const correctIndex = answerLetter.charCodeAt(0) - 65;
    if (correctIndex < 0 || correctIndex >= options.length) continue;
    out.push({
      ...DEFAULT_QUESTION(),
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      statement: statementLines.join(' '),
      options,
      correctIndex,
      feedback: '',
    });
  }
  return out;
}

export function parseAsterisk(text) {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const out = [];
  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    const optLines = lines.filter(l => /^[-•]\s+/.test(l));
    const stmtLines = lines.filter(l => !/^[-•]\s+/.test(l));
    if (!stmtLines.length || optLines.length < 2) continue;
    let correctIndex = -1;
    const options = optLines.map((l, i) => {
      const stripped = l.replace(/^[-•]\s+/, '');
      if (/^\*(?!\*)/.test(stripped)) { correctIndex = i; return stripped.slice(1).trim(); }
      return stripped;
    });
    if (correctIndex === -1) continue;
    out.push({
      ...DEFAULT_QUESTION(),
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      statement: stmtLines.join(' '),
      options,
      correctIndex,
      feedback: '',
    });
  }
  return out;
}

export function parseJson(text) {
  try {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return [];
    return arr.map(q => ({
      ...DEFAULT_QUESTION(),
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      statement: String(q.pregunta || q.statement || ''),
      options: Array.isArray(q.opciones || q.options) ? (q.opciones || q.options).map(String) : [],
      correctIndex: Number(q.correcta ?? q.correctIndex ?? -1),
      feedback: String(q.retro || q.feedback || ''),
      points: Number(q.puntos || q.points || 1),
    })).filter(q => q.statement && q.options.length >= 2 && q.correctIndex >= 0);
  } catch { return []; }
}

export function parseQuestions(text) {
  const t = text.trim();
  if (!t) return { format: null, questions: [] };
  if (t.startsWith('[') || t.startsWith('{')) {
    const j = parseJson(t);
    if (j.length) return { format: 'JSON', questions: j };
  }
  if (/^answer\s*:/im.test(t) || /^respuesta\s*:/im.test(t)) {
    const a = parseAiken(t);
    if (a.length) return { format: 'Aiken', questions: a };
  }
  if (/^[-•]\s/m.test(t)) {
    const s = parseAsterisk(t);
    if (s.length) return { format: 'Simple', questions: s };
  }
  for (const [name, fn] of [['Aiken', parseAiken], ['Simple', parseAsterisk], ['JSON', parseJson]]) {
    const res = fn(t);
    if (res.length) return { format: name, questions: res };
  }
  return { format: null, questions: [] };
}

export function questionStatus(q) {
  if (!q.statement.trim() || q.options.some(o => !o.trim()) || q.options.length < 2) return 'Borrador';
  if (q.correctIndex == null || q.correctIndex < 0) return 'Borrador';
  return 'Completa';
}
