import { createClient } from "@supabase/supabase-js";

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || window.MINIMOODLE_CONFIG?.supabaseUrl || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || window.MINIMOODLE_CONFIG?.supabaseAnonKey || ""
};

export const storageKey = "minimoodle-state-v3";
export const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);
export const supabase = hasSupabase ? createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

export const seed = {
  profiles: [
    { id: "teacher-demo", full_name: "Docente Demo", email: "docente@minimoodle.local", role: "teacher", cedula: "1996202530" },
    { id: "student-demo", full_name: "Estudiante Demo", email: "estudiante@minimoodle.local", role: "student", cedula: "1234567890" }
  ],
  courses: [
    {
      id: "matematica",
      title: "Razonamiento Matematico",
      parallel: "Ineval 3ro BGU",
      area: "Pruebas Ineval",
      color: "#168bd8",
      description: "Practica de patrones, proporcionalidad, funciones, estadistica y resolucion de problemas.",
      created_at: "2026-05-01T08:00:00.000Z"
    },
    {
      id: "lengua",
      title: "Comprension Lectora",
      parallel: "Ineval 3ro BGU",
      area: "Pruebas Ineval",
      color: "#d84f93",
      description: "Lectura critica, inferencias, vocabulario contextual y organizacion de ideas.",
      created_at: "2026-05-02T08:00:00.000Z"
    },
    {
      id: "ciencias",
      title: "Ciencias Naturales",
      parallel: "Ineval 3ro BGU",
      area: "Pruebas Ineval",
      color: "#d99d24",
      description: "Biologia, fisica, quimica basica y analisis de situaciones experimentales.",
      created_at: "2026-05-03T08:00:00.000Z"
    },
    {
      id: "sociales",
      title: "Estudios Sociales",
      parallel: "Ineval 3ro BGU",
      area: "Pruebas Ineval",
      color: "#52aaa8",
      description: "Historia, ciudadania, geografia y lectura de fuentes sociales.",
      created_at: "2026-05-04T08:00:00.000Z"
    }
  ],
  sections: [
    {
      id: "sec-mate-1",
      course_id: "matematica",
      title: "Unidad 1: Aritmética básica",
      description: "Operaciones fundamentales y resolución de problemas.",
      order: 0,
      created_at: "2026-05-01T08:00:00.000Z"
    },
    {
      id: "sec-mate-2",
      course_id: "matematica",
      title: "Unidad 2: Proporciones",
      description: "Razones, proporciones y regla de tres.",
      order: 1,
      created_at: "2026-05-01T08:10:00.000Z"
    },
    {
      id: "sec-lengua-1",
      course_id: "lengua",
      title: "Unidad 1: Vocabulario",
      description: "Sinónimos, antónimos y analogías.",
      order: 0,
      created_at: "2026-05-02T08:00:00.000Z"
    }
  ],
  quizzes: [
    {
      id: "quiz-mate-1",
      course_id: "matematica",
      title: "Simulador diagnostico - Matematica",
      instructions: "Responde con calma. Al finalizar veras tu puntaje y retroalimentacion.",
      opens_at: "2026-05-01T08:00:00.000Z",
      closes_at: "2026-12-31T23:59:00.000Z",
      time_limit_minutes: 25,
      published: true,
      created_at: "2026-05-01T09:00:00.000Z"
    },
    {
      id: "quiz-lengua-1",
      course_id: "lengua",
      title: "Comprension lectora - Ideas principales",
      instructions: "Lee cada pregunta y selecciona la opcion mas precisa.",
      opens_at: "2026-05-01T08:00:00.000Z",
      closes_at: "2026-12-31T23:59:00.000Z",
      time_limit_minutes: 20,
      published: true,
      created_at: "2026-05-02T09:00:00.000Z"
    }
  ],
  questions: [
    {
      id: "q1",
      quiz_id: "quiz-mate-1",
      prompt: "Si una sucesion aumenta de 4 en 4 y empieza en 7, cual es el quinto termino?",
      options: ["15", "19", "23", "27"],
      answer_index: 2,
      explanation: "La sucesion es 7, 11, 15, 19, 23.",
      points: 1,
      created_at: "2026-05-01T10:00:00.000Z"
    },
    {
      id: "q2",
      quiz_id: "quiz-mate-1",
      prompt: "Un estudiante responde correctamente 18 de 24 preguntas. Cual es su porcentaje de acierto?",
      options: ["65%", "70%", "75%", "80%"],
      answer_index: 2,
      explanation: "18 dividido para 24 es 0,75; es decir, 75%.",
      points: 1,
      created_at: "2026-05-01T10:03:00.000Z"
    },
    {
      id: "q3",
      quiz_id: "quiz-lengua-1",
      prompt: "La idea principal de un texto es:",
      options: ["Un dato secundario", "El mensaje central", "Una opinion aislada", "El ultimo parrafo"],
      answer_index: 1,
      explanation: "La idea principal expresa el mensaje central que organiza el texto.",
      points: 1,
      created_at: "2026-05-02T10:00:00.000Z"
    }
  ],
  attempts: []
};

export const bulkTemplate = [
  "pregunta|opcion_a|opcion_b|opcion_c|opcion_d|respuesta|retroalimentacion",
  "Cual es la idea central de un texto?|El titulo|El mensaje principal|Un ejemplo|Una fecha|B|La idea central organiza todo el contenido.",
  "Si 3 cuadernos cuestan 6 dolares, cuanto cuestan 5?|8|9|10|12|C|Cada cuaderno cuesta 2 dolares; 5 cuestan 10."
].join("\n");

export function uid(prefix) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;
}

export function readLocalState() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : structuredClone(seed);
}

export function writeLocalState(next) {
  localStorage.setItem(storageKey, JSON.stringify(next));
}

export function profilesToPlain(rows) {
  return rows.map((row) => ({ ...row }));
}

export async function loadData() {
  if (!supabase) return readLocalState();
  const [profiles, courses, sections, quizzes, questions, attempts] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("courses").select("*").order("created_at"),
    supabase.from("sections").select("*").order("order"),
    supabase.from("quizzes").select("*").order("created_at"),
    supabase.from("questions").select("*").order("created_at"),
    supabase.from("attempts").select("*").order("submitted_at", { ascending: false })
  ]);
  for (const result of [profiles, courses, sections, quizzes, questions, attempts]) {
    if (result.error) throw result.error;
  }
  return {
    profiles: profiles.data.length ? profiles.data : seed.profiles,
    courses: courses.data.length ? courses.data : seed.courses,
    sections: sections.data.length ? sections.data : seed.sections,
    quizzes: quizzes.data.length ? quizzes.data : seed.quizzes,
    questions: questions.data.length ? questions.data : seed.questions,
    attempts: attempts.data.length ? attempts.data : seed.attempts
  };
}
