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
    { id: "teacher-demo", full_name: "Docente Demo", email: "docente@minimoodle.local", role: "teacher", cedula: "1996202530", created_at: "2026-05-01T08:00:00.000Z" },
    { id: "student-demo", full_name: "Estudiante Demo", email: "estudiante@minimoodle.local", role: "student", cedula: "1234567890", created_at: "2026-05-01T08:00:00.000Z" }
  ],
  students: [],
  question_banks: [],
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
  if (!saved) return structuredClone(seed);
  const parsed = JSON.parse(saved);
  // Merge in any tables added after this state was first written.
  return { ...structuredClone(seed), ...parsed, students: parsed.students || [], banks: parsed.banks || [] };
}

export function writeLocalState(next) {
  localStorage.setItem(storageKey, JSON.stringify(next));
}

export function profilesToPlain(rows) {
  return rows.map((row) => ({ ...row }));
}

// Fetch one table; tolerate missing table / errors so a partially-migrated
// database never blocks the whole app (avoids "Invalid path specified").
async function safeSelect(table, orderCol, opts = {}) {
  try {
    let query = supabase.from(table).select("*");
    if (orderCol) query = query.order(orderCol, opts);
    const { data, error } = await query;
    if (error) {
      console.warn(`[minimoodle] tabla "${table}" no disponible:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[minimoodle] error leyendo "${table}":`, err?.message || err);
    return null;
  }
}

export async function loadData() {
  if (!supabase) return readLocalState();
  const [profiles, courses, sections, banks, quizzes, questions, attempts, students] = await Promise.all([
    safeSelect("profiles", "created_at"),
    safeSelect("courses", "created_at"),
    safeSelect("sections", "order"),
    safeSelect("question_banks", "created_at"),
    safeSelect("quizzes", "created_at"),
    safeSelect("questions", "created_at"),
    safeSelect("attempts", "submitted_at", { ascending: false }),
    safeSelect("students", "registered_at", { ascending: false })
  ]);
  return {
    profiles: profiles?.length ? profiles : seed.profiles,
    courses: courses?.length ? courses : seed.courses,
    sections: sections?.length ? sections : seed.sections,
    question_banks: banks || [],
    quizzes: quizzes?.length ? quizzes : seed.quizzes,
    questions: questions?.length ? questions : seed.questions,
    attempts: attempts?.length ? attempts : seed.attempts,
    students: students || []
  };
}

// ------------------------------------------------------------------
// Image upload: convert to webp then upload to Supabase Storage.
// Returns a public URL. Falls back to base64 dataURL if no Supabase
// or if conversion/upload fails.
// ------------------------------------------------------------------
export const IMAGE_BUCKET = "question-images";

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function toWebpBlob(file, { maxWidth = 1600, quality = 0.85 } = {}) {
  const img = await fileToImage(file);
  const scale = Math.min(1, maxWidth / (img.width || maxWidth));
  const w = Math.round((img.width || maxWidth) * scale);
  const h = Math.round((img.height || maxWidth) * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || null),
      "image/webp",
      quality
    );
  });
}

function blobToDataURL(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Upload an image File -> webp. Returns { url, storagePath|null, base64 }.
export async function uploadImage(file, folder = "questions") {
  let webp = null;
  try {
    webp = await toWebpBlob(file);
  } catch {
    webp = null;
  }
  const blob = webp || file;

  if (!supabase) {
    // Local mode: embed as base64 dataURL (webp when conversion worked).
    const dataUrl = await blobToDataURL(blob);
    return { url: dataUrl, storagePath: null };
  }

  const ext = webp ? "webp" : (file.name.split(".").pop() || "png");
  const path = `${folder}/${uid("img").replace(/[^a-z0-9-]/gi, "")}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: webp ? "image/webp" : file.type, upsert: true });
  if (error) {
    console.warn("[minimoodle] fallo subida a Storage, usando base64:", error.message);
    const dataUrl = await blobToDataURL(blob);
    return { url: dataUrl, storagePath: null };
  }
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, storagePath: path };
}
