import React from 'react';
import { formatDate } from '../utils/helpers';

export function AttemptRow({ attempt, data }) {
  const quiz = data.quizzes.find((item) => item.id === attempt.quiz_id);
  const percent = Math.round((attempt.score / Math.max(attempt.total, 1)) * 100);
  
  return (
    <div className="attemptMini">
      <div className="attemptMiniInfo">
        <strong>{quiz?.title || "Cuestionario"}</strong>
        <span>{formatDate(attempt.submitted_at)}</span>
      </div>
      <div className={`attemptMiniScore ${percent >= 70 ? 'good' : percent >= 40 ? 'average' : 'poor'}`}>
        {attempt.score}/{attempt.total}
      </div>
    </div>
  );
}

export function AttemptTableRow({ attempt, data }) {
  const quiz = data.quizzes.find((item) => item.id === attempt.quiz_id);
  const percent = Math.round((attempt.score / Math.max(attempt.total, 1)) * 100);
  
  return (
    <tr>
      <td>
        <div className="td-user">
          <span className="avatar tiny-avatar">ES</span>
          {attempt.student_name}
        </div>
      </td>
      <td>{quiz?.title || "Cuestionario"}</td>
      <td>
        <span className={`score-badge ${percent >= 70 ? 'good' : percent >= 40 ? 'average' : 'poor'}`}>
          {attempt.score}/{attempt.total} ({percent}%)
        </span>
      </td>
      <td>{formatDate(attempt.submitted_at)}</td>
    </tr>
  );
}
