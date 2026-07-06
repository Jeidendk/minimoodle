import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import { loadData, seed, writeLocalState, supabase, uid } from "./lib/data";
import Header from "./components/Header";
import AreaView from "./views/AreaView";
import CoursesView from "./views/CoursesView";
import CourseView from "./views/CourseView";
import QuizView from "./views/QuizView";
import ResultView from "./views/ResultView";
import TeacherView from "./views/TeacherView";
import AttemptsView from "./views/AttemptsView";
import LoginView from "./views/LoginView";
import EvaluationsView from "./views/EvaluationsView";
import StudentsView from "./views/StudentsView";
import GradesView from "./views/GradesView";
import CommunicationView from "./views/CommunicationView";
import ReportsView from "./views/ReportsView";
import SettingsView from "./views/SettingsView";

const SESSION_KEY = "minimoodle:session";

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("area");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [courseSort, setCourseSort] = useState("name");
  const [courseLayout, setCourseLayout] = useState("cards");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      const stored = loadStoredSession();
      if (stored?.cedula) {
        const profile = d.profiles.find((p) => p.cedula === stored.cedula);
        if (profile) setUser(profile);
      }
    }).catch((err) => setError(err.message || "No se pudo cargar la información."));
  }, []);

  useEffect(() => {
    if (data && !supabase) writeLocalState(data);
  }, [data]);

  const selectedCourse = data?.courses.find((course) => course.id === selectedCourseId);
  const selectedQuiz = data?.quizzes.find((quiz) => quiz.id === selectedQuizId);

  function handleLogin(cedula, remember = true) {
    if (!data) return false;
    const profile = data.profiles.find((p) => p.cedula === cedula);
    if (profile) {
      setUser(profile);
      setView("area");
      try {
        const payload = JSON.stringify({ cedula });
        if (remember) {
          localStorage.setItem(SESSION_KEY, payload);
          sessionStorage.removeItem(SESSION_KEY);
        } else {
          sessionStorage.setItem(SESSION_KEY, payload);
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {}
      return true;
    }
    return false;
  }

  function handleLogout() {
    setUser(null);
    setView("area");
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  function nav(target) {
    if (target === "courses" || target === "area") {
      setSelectedCourseId(null);
      setSelectedQuizId(null);
    }
    setView(target);
    setGlobalSearchOpen(false);
  }

  function goCourse(courseId) {
    setSelectedCourseId(courseId);
    setSelectedQuizId(null);
    setView("course");
  }

  function goQuiz(quizId) {
    setSelectedQuizId(quizId);
    setView("quiz");
  }

  function upsertLocal(table, rows) {
    const list = Array.isArray(rows) ? rows : [rows];
    setData((current) => {
      const incoming = new Map(list.map((row) => [row.id, row]));
      const arr = current[table] || [];
      const updated = arr.map((item) => incoming.get(item.id) || item);
      const existingIds = new Set(updated.map((item) => item.id));
      const fresh = list.filter((row) => !existingIds.has(row.id));
      return { ...current, [table]: [...fresh, ...updated] };
    });
  }

  function removeLocal(table, idList) {
    setData((current) => ({
      ...current,
      [table]: (current[table] || []).filter((item) => !idList.includes(item.id))
    }));
  }

  async function saveRows(table, rows) {
    const list = Array.isArray(rows) ? rows : [rows];
    if (!list.length) return;
    // Optimistic local update first so the UI always reflects the change.
    upsertLocal(table, list);
    if (!supabase) return;
    const { error: saveError } = await supabase.from(table).upsert(list);
    if (saveError) {
      // DB not migrated / table missing: keep the local change, just warn.
      console.warn(`[minimoodle] no se pudo guardar en "${table}":`, saveError.message);
      return;
    }
    setData(await loadData());
  }

  async function deleteRows(table, ids) {
    const idList = Array.isArray(ids) ? ids : [ids];
    if (!idList.length) return;
    removeLocal(table, idList);
    if (!supabase) return;
    const { error: delError } = await supabase.from(table).delete().in('id', idList);
    if (delError) {
      console.warn(`[minimoodle] no se pudo eliminar en "${table}":`, delError.message);
      return;
    }
    setData(await loadData());
  }

  async function submitAttempt(answers, questionIds) {
    // Score against the exact question set the student saw (works for bank draws + shuffles).
    const ids = Array.isArray(questionIds) && questionIds.length
      ? questionIds
      : data.questions.filter((q) => q.quiz_id === selectedQuiz.id).map((q) => q.id);
    const idSet = new Set(ids);
    const quizQuestions = data.questions.filter((question) => idSet.has(question.id));
    const total = quizQuestions.reduce((sum, question) => sum + Number(question.points || 1), 0);
    const score = quizQuestions.reduce((sum, question) => {
      return sum + (Number(answers[question.id]) === Number(question.answer_index) ? Number(question.points || 1) : 0);
    }, 0);
    const attempt = {
      id: uid("attempt"),
      quiz_id: selectedQuiz.id,
      student_id: user.id,
      student_name: user.full_name,
      answers,
      question_ids: ids,
      score,
      total,
      submitted_at: new Date().toISOString()
    };
    setData((current) => ({ ...current, attempts: [attempt, ...current.attempts] }));
    if (supabase) {
      const { error: attemptError } = await supabase.from("attempts").insert(attempt);
      if (attemptError) console.warn('[minimoodle] no se pudo guardar intento:', attemptError.message);
      else setData(await loadData());
    }
    setView("result");
  }

  if (!data) return (
    <main className="loading-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {error ? (
        <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', maxWidth: '400px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Error de Conexión</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : (
        <>
          <div className="loader"></div>
          <p>Cargando MiniMoodle...</p>
        </>
      )}
    </main>
  );

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Header
        user={user}
        view={view}
        handleLogout={handleLogout}
        nav={nav}
        globalSearchOpen={globalSearchOpen}
        setGlobalSearchOpen={setGlobalSearchOpen}
        courseSearch={courseSearch}
        setCourseSearch={setCourseSearch}
      />
      
      {error && (
        <div className="alert-toast error fade-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
          <button onClick={() => setError("")}>&times;</button>
        </div>
      )}
      
      <main className="shell">
        <div className="container">
          {view === "area" && <AreaView data={data} user={user} goCourse={goCourse} goQuiz={goQuiz} />}
          {view === "courses" && (
            <CoursesView
              data={data}
              user={user}
              search={courseSearch}
              setSearch={setCourseSearch}
              filter={courseFilter}
              setFilter={setCourseFilter}
              sort={courseSort}
              setSort={setCourseSort}
              layout={courseLayout}
              setLayout={setCourseLayout}
              goCourse={goCourse}
              saveRows={saveRows}
              deleteRows={deleteRows}
            />
          )}
          {view === "course" && <CourseView data={data} course={selectedCourse} user={user} goQuiz={goQuiz} setView={setView} saveRows={saveRows} deleteRows={deleteRows} />}
          {view === "quiz" && <QuizView data={data} quiz={selectedQuiz} user={user} submitAttempt={submitAttempt} setView={setView} />}
          {view === "result" && <ResultView data={data} quiz={selectedQuiz} user={user} setView={setView} />}
          {view === "teacher" && <EvaluationsView data={data} user={user} setView={setView} saveRows={saveRows} goCourse={goCourse} />}
          {view === "grades" && <GradesView setView={setView} />}
          {view === "students" && <StudentsView data={data} user={user} setView={setView} saveRows={saveRows} deleteRows={deleteRows} />}
          {view === "attempts" && <AttemptsView data={data} setView={setView} />}
          {view === "communication" && <CommunicationView setView={setView} />}
          {view === "reports" && <ReportsView setView={setView} />}
          {view === "settings" && <SettingsView user={user} setView={setView} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
