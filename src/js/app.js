import { icon } from './icons.js';

/* ============================================================
   Configuración y estado compartido (localStorage)
   ============================================================ */
const SETTINGS_KEY = 'linguaflow-settings';
const STATE_KEY = 'linguaflow-state';
const ONBOARDING_KEY = 'linguaflow-onboarding-completed';

const READING_RATES = { lenta: 0.75, normal: 0.95, rapida: 1.2 };

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        // El almacenamiento puede no estar disponible; la app sigue funcionando sin persistencia.
    }
}

const defaultAppState = {
    user: { name: 'Alex', xp: 0, streak: 0, totalMinutes: 0 },
    lessonProgress: {}, // { [lessonKey]: { completed, score, xpEarned } }
};

function loadState() {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (!raw) return structuredClone(defaultAppState);
        const parsed = JSON.parse(raw);
        return {
            user: { ...defaultAppState.user, ...parsed.user },
            lessonProgress: parsed.lessonProgress || {},
        };
    } catch (error) {
        return structuredClone(defaultAppState);
    }
}

function saveState(state) {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
        // Sin almacenamiento disponible: la app sigue funcionando en memoria.
    }
}

function recordLessonResult(lessonKey, { score, xpEarned }) {
    const state = loadState();
    const today = new Date().toISOString().slice(0, 10);
    const alreadyToday = state.user.lastStudyDate === today;
    state.lessonProgress[lessonKey] = {
        completed: true,
        score,
        xpEarned,
        date: today,
    };
    state.user.xp += xpEarned;
    state.user.totalMinutes += 4;
    if (!alreadyToday) {
        const wasYesterday = isYesterday(state.user.lastStudyDate, today);
        state.user.streak = wasYesterday ? (state.user.streak || 0) + 1 : 1;
        state.user.lastStudyDate = today;
    }
    saveState(state);
    return state;
}

function isYesterday(dateStr, todayStr) {
    if (!dateStr) return false;
    const prev = new Date(dateStr);
    const today = new Date(todayStr);
    const diffDays = Math.round((today - prev) / 86400000);
    return diffDays === 1;
}

const XP_THRESHOLDS = [
    { level: 'A2', from: 0, to: 100 },
    { level: 'B1', from: 100, to: 300 },
    { level: 'B2', from: 300, to: 600 },
    { level: 'C1', from: 600, to: 900 },
];

function getLevelFromXp(xp) {
    const band = XP_THRESHOLDS.find(b => xp < b.to) || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
    return band.level;
}

function getXpProgress(xp) {
    const band = XP_THRESHOLDS.find(b => xp < b.to) || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
    const current = Math.max(0, xp - band.from);
    const needed = band.to - band.from;
    return { current, needed, level: band.level };
}

// Aplica la configuración guardada (alto contraste, etc.) en cada página,
// para que la experiencia sea predecible y coherente en todo el sitio.
function applyStoredSettings() {
    const settings = loadSettings();
    document.body.classList.toggle('high-contrast', Boolean(settings.altoContraste));
    return settings;
}

/* ============================================================
   Hidratación de iconos estáticos: <span data-icon="home" data-icon-label="…">
   ============================================================ */
function initIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.dataset.icon;
        const label = el.dataset.iconLabel;
        const size = el.dataset.iconSize ? Number(el.dataset.iconSize) : undefined;
        el.innerHTML = icon(name, { label, size });
    });
}

/* ============================================================
   Renderizado de estadísticas compartidas (topbar, tarjetas)
   ============================================================ */
function renderSharedStats() {
    const state = loadState();
    const completedCount = Object.values(state.lessonProgress).filter(p => p.completed).length;

    document.querySelectorAll('[data-stat="streak"]').forEach(el => {
        el.textContent = String(state.user.streak || 0);
        el.closest('[aria-label]')?.setAttribute('aria-label', `Racha de ${state.user.streak || 0} días`);
    });
    document.querySelectorAll('[data-stat="xp"]').forEach(el => {
        el.textContent = String(state.user.xp || 0);
        el.closest('[aria-label]')?.setAttribute('aria-label', `${state.user.xp || 0} puntos de experiencia`);
    });
    document.querySelectorAll('[data-stat="level"]').forEach(el => {
        el.textContent = getLevelFromXp(state.user.xp);
    });
    document.querySelectorAll('[data-stat="lessons-completed"]').forEach(el => {
        el.textContent = String(completedCount);
    });
    document.querySelectorAll('[data-stat="total-time"]').forEach(el => {
        const h = Math.floor((state.user.totalMinutes || 0) / 60);
        const m = (state.user.totalMinutes || 0) % 60;
        el.textContent = `${h}h ${m}m`;
    });
    document.querySelectorAll('[data-stat="name"]').forEach(el => {
        el.textContent = state.user.name || 'Alex';
    });

    const totalLessons = Object.keys(LESSON_TITLES).length;
    const scores = Object.values(state.lessonProgress).filter(p => p.completed).map(p => p.score);
    const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const overallPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

    document.querySelectorAll('[data-stat="average-score"]').forEach(el => { el.textContent = `${averageScore}%`; });
    document.querySelectorAll('[data-stat="overall-percent"]').forEach(el => { el.textContent = `${overallPercent}%`; });
    const overallBar = document.getElementById('progreso-b1');
    if (overallBar) {
        overallBar.value = overallPercent;
        overallBar.setAttribute('aria-label', `${overallPercent} por ciento del nivel B1 completado`);
    }

    const xpProgress = getXpProgress(state.user.xp || 0);
    const xpBar = document.getElementById('xp-progress');
    if (xpBar) {
        xpBar.max = xpProgress.needed;
        xpBar.value = xpProgress.current;
        xpBar.setAttribute('aria-label', `Progreso del nivel ${getLevelFromXp(state.user.xp)}: ${xpProgress.current} de ${xpProgress.needed} puntos de experiencia`);
    }
    const xpBarText = document.getElementById('xp-progress-text');
    if (xpBarText) {
        xpBarText.textContent = `${xpProgress.current} de ${xpProgress.needed} XP. Completa lecciones B1 para avanzar de nivel.`;
    }

    return { state, completedCount };
}

/* ============================================================
   Contenido de lecciones
   Cada lección tiene 4 ejercicios con tipos variados:
   multiple-choice · fill-blank · word-order · speaking
   ============================================================ */
const lessons = {
    'present-perfect': {
        title: 'Present Perfect',
        topic: 'Gramática',
        explanation: 'Present Perfect se usa para hablar de experiencias de vida, acciones recientes o acciones que conectan el pasado con el presente. Ejemplo: I have never been to Canada.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa la oración: I _____ never been to Canada.', options: ['have', 'has', 'did'], answer: 'have', feedback: 'Correcto. Se usa "have" con I, you, we y they.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'She [BLANK] visited London twice.', wordBank: ['has', 'have', 'did', 'is'], answer: 'has', feedback: 'Correcto. "She has visited" expresa experiencia.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['already', 'they', 'have', 'finished', 'their homework'], answer: 'they have already finished their homework', feedback: 'Correcto. "They have already finished" usa Present Perfect.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'I have been to Paris three times.', acceptedAnswers: ['I have been to Paris 3 times.'], feedback: 'Buen trabajo practicando la pronunciación de Present Perfect.' },
        ],
    },
    'present-perfect-vs-past-simple': {
        title: 'Present Perfect vs Past Simple',
        topic: 'Gramática',
        explanation: 'Usa Past Simple cuando el tiempo ya terminó, como yesterday o last year. Usa Present Perfect cuando la experiencia importa más que el momento exacto.',
        questions: [
            { type: 'multiple-choice', instruction: 'Elige la opción correcta: I _____ my keys yesterday.', options: ['have lost', 'lost', 'has lost'], answer: 'lost', feedback: 'Correcto. "Yesterday" indica un tiempo terminado, por eso usamos Past Simple.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'I [BLANK] that movie three times.', wordBank: ['have seen', 'saw', 'has seen', 'seeing'], answer: 'have seen', feedback: 'Correcto. Habla de una experiencia sin momento exacto.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['she', 'in 2022', 'moved', 'to Quito'], answer: 'she moved to Quito in 2022', feedback: 'Correcto. "In 2022" es un tiempo específico del pasado.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'I lost my keys yesterday.', acceptedAnswers: [], feedback: 'Recuerda pronunciar claramente el sonido final de "lost".' },
        ],
    },
    'future-forms': {
        title: 'Future Forms',
        topic: 'Gramática',
        explanation: 'En B1 se usan varias formas de futuro: will para decisiones rápidas, going to para planes o evidencias, y present continuous para arreglos confirmados.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: Look at those clouds. It _____ rain.', options: ['will', 'is going to', 'rains'], answer: 'is going to', feedback: 'Correcto. Hay evidencia visible: las nubes.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la opción correcta para un arreglo confirmado.', sentence: 'I [BLANK] my doctor at 5 p.m.', wordBank: ['am seeing', 'will see', 'see', 'saw'], answer: 'am seeing', feedback: 'Correcto. Present continuous puede expresar planes confirmados.' },
            { type: 'word-order', instruction: 'Ordena las palabras: una decisión espontánea.', words: ['I', 'take', 'will', 'a taxi'], answer: 'I will take a taxi', feedback: 'Correcto. "Will" funciona para decisiones tomadas en el momento.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'It is going to rain this afternoon.', acceptedAnswers: [], feedback: 'Buen ritmo practicando "going to".' },
        ],
    },
    'first-conditional': {
        title: 'First Conditional',
        topic: 'Gramática',
        explanation: 'First Conditional habla de situaciones reales o posibles en el futuro: If + present simple, will + verb.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: If it rains, we _____ stay at home.', options: ['will', 'would', 'are'], answer: 'will', feedback: 'Correcto. First Conditional usa will en el resultado.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'She will pass the exam if she [BLANK] hard.', wordBank: ['studies', 'will study', 'studied', 'study'], answer: 'studies', feedback: 'Correcto. La condición va en presente simple.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['I', 'him', 'if', 'see', 'I will tell him'], answer: 'if I see him I will tell him', feedback: 'Correcto. Después de if se usa presente simple.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'If it rains, we will stay at home.', acceptedAnswers: [], feedback: 'Muy bien practicando el condicional real.' },
        ],
    },
    'second-conditional': {
        title: 'Second Conditional',
        topic: 'Gramática',
        explanation: 'Second Conditional expresa situaciones hipotéticas: If + past simple, would + verb.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: If I had more time, I _____ travel more.', options: ['will', 'would', 'am'], answer: 'would', feedback: 'Correcto. En Second Conditional usamos would.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'She would buy a car if she [BLANK] enough money.', wordBank: ['had', 'has', 'will have', 'have'], answer: 'had', feedback: 'Correcto. La condición usa past simple.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['I were you', 'if', 'I would study more'], answer: 'if I were you I would study more', feedback: 'Correcto. "If I were you" es la forma recomendada.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'If I had more time, I would travel more.', acceptedAnswers: [], feedback: 'Buen trabajo con la entonación hipotética.' },
        ],
    },
    'passive-voice': {
        title: 'Passive Voice',
        topic: 'Gramática',
        explanation: 'Passive Voice se forma con be más participio pasado. Se usa cuando la acción o el resultado son más importantes que la persona que realiza la acción.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: The book _____ written in 1998.', options: ['was', 'were', 'did'], answer: 'was', feedback: 'Correcto. "The book was written" está en voz pasiva.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'The emails [BLANK] sent yesterday.', wordBank: ['were', 'was', 'are', 'send'], answer: 'were', feedback: 'Correcto. "Emails" es plural: were sent.' },
            { type: 'word-order', instruction: 'Transforma a pasiva: ordena las palabras.', words: ['English', 'is', 'here', 'spoken'], answer: 'English is spoken here', feedback: 'Correcto. Present passive: is/are + participio.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'The book was written in 1998.', acceptedAnswers: [], feedback: 'Buena pronunciación de "written".' },
        ],
    },
    'reported-speech': {
        title: 'Reported Speech',
        topic: 'Gramática',
        explanation: 'Reported Speech sirve para contar lo que alguien dijo. Normalmente el tiempo verbal retrocede: am cambia a was, will cambia a would, present simple cambia a past simple.',
        questions: [
            { type: 'multiple-choice', instruction: 'Directo: "I am tired." Reportado: She said she _____ tired.', options: ['is', 'was', 'will be'], answer: 'was', feedback: 'Correcto. "Am" cambia a "was".' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'He said he [BLANK] call me.', wordBank: ['would', 'will', 'can', 'could'], answer: 'would', feedback: 'Correcto. "Will" cambia a "would".' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['she', 'liked', 'coffee', 'said', 'she'], answer: 'she said she liked coffee', feedback: 'Correcto. Present simple cambia a past simple.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'She said she liked coffee.', acceptedAnswers: [], feedback: 'Buen trabajo reportando lo que alguien dijo.' },
        ],
    },
    'relative-clauses': {
        title: 'Relative Clauses',
        topic: 'Gramática',
        explanation: 'Las relative clauses agregan información. Usa who para personas, which para cosas y where para lugares.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: This is the teacher _____ helped me.', options: ['who', 'which', 'where'], answer: 'who', feedback: 'Correcto. "Who" se usa para personas.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'This is the phone [BLANK] I bought yesterday.', wordBank: ['which', 'where', 'who', 'when'], answer: 'which', feedback: 'Correcto. "Which" se usa para cosas.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['Quito', 'is', 'the city', 'I study', 'where'], answer: 'Quito is the city where I study', feedback: 'Correcto. "Where" se usa para lugares.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'This is the teacher who helped me.', acceptedAnswers: [], feedback: 'Buena claridad al pronunciar "who helped".' },
        ],
    },
    'phrasal-verbs': {
        title: 'Phrasal Verbs',
        topic: 'Vocabulario',
        explanation: 'Los phrasal verbs combinan un verbo con una partícula. Por ejemplo, give up significa rendirse y look after significa cuidar.',
        questions: [
            { type: 'multiple-choice', instruction: 'Elige el significado de "give up".', options: ['rendirse', 'encender', 'buscar'], answer: 'rendirse', feedback: 'Correcto. "Give up" significa rendirse o dejar de intentar.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'Can you [BLANK] the lights? It is dark.', wordBank: ['turn on', 'give up', 'look after', 'turn off'], answer: 'turn on', feedback: 'Correcto. "Turn on" significa encender.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['I', 'to', 'my little brother', 'have', 'look after'], answer: 'I have to look after my little brother', feedback: 'Correcto. "Look after" significa cuidar.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'I have to look after my little brother.', acceptedAnswers: [], feedback: 'Buen trabajo pronunciando el phrasal verb completo.' },
        ],
    },
    'travel-and-tourism': {
        title: 'Travel and Tourism',
        topic: 'Vocabulario',
        explanation: 'Esta lección practica vocabulario de viajes, reservas, alojamiento y turismo para situaciones reales.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: I need to book a _____ for two nights.', options: ['hotel room', 'boarding pass', 'suitcase'], answer: 'hotel room', feedback: 'Correcto. "Book a hotel room" significa reservar una habitación.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'Where is the boarding [BLANK]?', wordBank: ['gate', 'kitchen', 'homework', 'window'], answer: 'gate', feedback: 'Correcto. "Boarding gate" es la puerta de embarque.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['we', 'a guided tour', 'around the city', 'went on'], answer: 'we went on a guided tour around the city', feedback: 'Correcto. "Guided tour" significa visita guiada.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'Where is the boarding gate?', acceptedAnswers: [], feedback: 'Buena entonación de pregunta.' },
        ],
    },
    'work-and-careers': {
        title: 'Work and Careers',
        topic: 'Vocabulario',
        explanation: 'Esta lección practica vocabulario para entrevistas, habilidades, experiencia laboral y crecimiento profesional.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: I have five years of work _____.', options: ['experience', 'meeting', 'salary'], answer: 'experience', feedback: 'Correcto. "Work experience" significa experiencia laboral.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'Problem [BLANK] is a valuable professional skill.', wordBank: ['solving', 'gate', 'weather', 'salary'], answer: 'solving', feedback: 'Correcto. "Problem solving" es una habilidad laboral.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['she', 'for', 'applied', 'a software internship'], answer: 'she applied for a software internship', feedback: 'Correcto. La expresión es "apply for a job".' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'I have five years of work experience.', acceptedAnswers: [], feedback: 'Buen trabajo pronunciando "experience".' },
        ],
    },
    'technology-and-media': {
        title: 'Technology and Media',
        topic: 'Vocabulario',
        explanation: 'Esta lección trabaja vocabulario sobre tecnología, redes sociales, medios digitales y hábitos en línea.',
        questions: [
            { type: 'multiple-choice', instruction: 'Completa: I uploaded the file to the _____.', options: ['cloud', 'keyboard', 'screen'], answer: 'cloud', feedback: 'Correcto. "Cloud" se refiere al almacenamiento en línea.' },
            { type: 'fill-blank', instruction: 'Completa la oración con la palabra correcta.', sentence: 'You should create a strong [BLANK] for your account.', wordBank: ['password', 'boarding pass', 'receipt', 'platform'], answer: 'password', feedback: 'Correcto. "Password" significa contraseña.' },
            { type: 'word-order', instruction: 'Ordena las palabras para formar una oración correcta.', words: ['a', 'is', 'post', 'social media publication'], answer: 'a post is a social media publication', feedback: 'Correcto. "Post" es una publicación en redes sociales.' },
            { type: 'speaking', instruction: 'Pronuncia la siguiente oración en voz alta.', prompt: 'I uploaded the file to the cloud.', acceptedAnswers: [], feedback: 'Buena pronunciación de "cloud".' },
        ],
    },
};

const LESSON_TITLES = {
    'present-perfect': 'Present Perfect',
    'present-perfect-vs-past-simple': 'Present Perfect vs Past Simple',
    'future-forms': 'Future Forms',
    'first-conditional': 'First Conditional',
    'second-conditional': 'Second Conditional',
    'passive-voice': 'Passive Voice',
    'reported-speech': 'Reported Speech',
    'relative-clauses': 'Relative Clauses',
    'phrasal-verbs': 'Phrasal Verbs',
    'travel-and-tourism': 'Travel and Tourism',
    'work-and-careers': 'Work and Careers',
    'technology-and-media': 'Technology and Media',
};

function getLessonFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('lesson') || 'present-perfect';
    return lessons[key] ? key : 'present-perfect';
}

/* ============================================================
   Utilidades de comparación de respuestas
   ============================================================ */
function normalise(s) {
    return String(s || '')
        .toLowerCase()
        .trim()
        .replace(/[.!?¡¿]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function answerMatches(userAnswer, question) {
    const candidates = [question.answer, ...(question.acceptedAnswers || [])].filter(Boolean);
    const target = normalise(userAnswer);
    return candidates.some(c => normalise(c) === target);
}

/* ============================================================
   Motor de práctica (estilo Duolingo)
   ============================================================ */
function initPractice(settings) {
    const quizForm = document.getElementById('quiz-form');
    if (!quizForm) return;

    const params = new URLSearchParams(window.location.search);
    const lessonKey = getLessonFromUrl();
    const mode = params.get('mode') || 'practica';
    const lesson = lessons[lessonKey];

    let currentQuestion = 0;
    let score = 0;
    let answered = false;
    let recognizer = null;

    const title = document.getElementById('practice-title');
    const description = document.getElementById('practice-description');
    const heading = document.getElementById('exercise-heading');
    const typeLabel = document.getElementById('exercise-type-label');
    const instruction = document.getElementById('exercise-instruction');
    const answersContainer = document.getElementById('answers-container');
    const feedbackPanel = document.getElementById('feedback-panel');
    const nextButton = document.getElementById('next-question');
    const checkButton = document.getElementById('check-answer');
    const segmentedProgress = document.getElementById('segmented-progress');
    const explanation = document.getElementById('lesson-explanation');
    const readButton = document.getElementById('readLesson');
    const pauseButton = document.getElementById('pause-lesson');
    const closeButton = document.getElementById('close-lesson');

    const readableMode = mode === 'repaso' ? 'Repaso' : mode === 'continuar' ? 'Continuación' : 'Práctica';
    title.textContent = `${readableMode} B1: ${lesson.title}`;
    description.textContent = `Esta lección tiene ${lesson.questions.length} ejercicios de distintos tipos. Puedes navegar con teclado y recibir retroalimentación inmediata.`;
    explanation.textContent = lesson.explanation;

    const TYPE_LABELS = {
        'multiple-choice': 'Selección múltiple',
        'fill-blank': 'Completa la oración',
        'word-order': 'Ordena las palabras',
        speaking: 'Pronunciación',
    };

    function buildSegments() {
        segmentedProgress.innerHTML = '';
        lesson.questions.forEach((_, i) => {
            const seg = document.createElement('span');
            seg.className = 'segment';
            seg.dataset.index = String(i);
            seg.innerHTML = '<span></span>';
            segmentedProgress.appendChild(seg);
        });
    }

    function updateSegments() {
        segmentedProgress.querySelectorAll('.segment').forEach((seg, i) => {
            seg.classList.toggle('filled', i < currentQuestion);
            seg.classList.toggle('current', i === currentQuestion);
        });
    }

    function showFeedback(isCorrect, correctText, feedbackText) {
        feedbackPanel.className = `feedback-panel visible ${isCorrect ? 'correct' : 'incorrect'}`;
        const titleIcon = isCorrect ? icon('check-circle') : icon('x-circle');
        const titleText = isCorrect ? '¡Correcto!' : 'Sigue practicando';
        let body = `<div class="feedback-title">${titleIcon}<span>${titleText}</span></div>`;
        if (!isCorrect) {
            body += `<p style="margin:0">La respuesta correcta es: <strong>${correctText}</strong></p>`;
        }
        body += `<div class="feedback-explanation">${icon('lightbulb')}<span>${feedbackText}</span></div>`;
        feedbackPanel.innerHTML = body;
        feedbackPanel.setAttribute('role', 'status');
        feedbackPanel.setAttribute('aria-live', 'assertive');
        feedbackPanel.focus?.();
    }

    function finishQuestion(isCorrect, correctText, feedbackText) {
        if (answered) return;
        answered = true;
        if (isCorrect) score += 1;
        showFeedback(isCorrect, correctText, feedbackText);
        checkButton.disabled = true;
        nextButton.disabled = false;
        nextButton.focus();
    }

    function renderMultipleChoice(q) {
        const fieldset = document.createElement('fieldset');
        fieldset.id = 'answers-fieldset';
        const legend = document.createElement('legend');
        legend.textContent = 'Selecciona una respuesta';
        fieldset.appendChild(legend);
        const wrap = document.createElement('div');
        wrap.id = 'answers-container-inner';
        q.options.forEach((option, index) => {
            const id = `answer-${currentQuestion}-${index}`;
            const label = document.createElement('label');
            label.className = 'answer-option';
            label.setAttribute('for', id);
            const input = document.createElement('input');
            input.type = 'radio';
            input.id = id;
            input.name = 'answer';
            input.value = option;
            const span = document.createElement('span');
            span.textContent = option;
            label.append(input, span);
            wrap.appendChild(label);
        });
        fieldset.appendChild(wrap);
        answersContainer.appendChild(fieldset);

        checkButton.hidden = false;
        checkButton.onclick = (e) => {
            e.preventDefault();
            if (answered) return;
            const selected = wrap.querySelector('input[name="answer"]:checked');
            if (!selected) {
                feedbackPanel.className = 'feedback-panel visible incorrect';
                feedbackPanel.innerHTML = `<div class="feedback-title">${icon('x-circle')}<span>Selecciona una respuesta antes de continuar.</span></div>`;
                return;
            }
            const isCorrect = selected.value === q.answer;
            wrap.querySelectorAll('.answer-option').forEach(opt => {
                const val = opt.querySelector('input').value;
                if (val === q.answer) opt.classList.add('is-correct');
                else if (opt.querySelector('input').checked) opt.classList.add('is-incorrect');
                opt.querySelector('input').disabled = true;
            });
            finishQuestion(isCorrect, q.answer, q.feedback);
        };
        const firstInput = wrap.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    function renderFillBlank(q) {
        const parts = q.sentence.split('[BLANK]');
        const sentenceEl = document.createElement('p');
        sentenceEl.className = 'blank-sentence';
        const slot = document.createElement('span');
        slot.className = 'blank-slot';
        slot.id = 'blank-slot';
        slot.setAttribute('aria-live', 'polite');
        slot.textContent = '____';
        sentenceEl.append(document.createTextNode(parts[0]), slot, document.createTextNode(parts[1] || ''));
        answersContainer.appendChild(sentenceEl);

        const bank = document.createElement('div');
        bank.className = 'word-bank';
        bank.setAttribute('role', 'group');
        bank.setAttribute('aria-label', 'Banco de palabras');
        let chosen = null;
        const shuffled = [...q.wordBank].sort(() => Math.random() - 0.5);
        shuffled.forEach(word => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'word-chip';
            chip.textContent = word;
            chip.addEventListener('click', () => {
                if (answered) return;
                bank.querySelectorAll('.word-chip').forEach(c => c.classList.remove('in-answer'));
                chosen = word;
                chip.classList.add('in-answer');
                slot.textContent = word;
            });
            bank.appendChild(chip);
        });
        answersContainer.appendChild(bank);

        checkButton.hidden = false;
        checkButton.onclick = (e) => {
            e.preventDefault();
            if (answered || !chosen) {
                if (!chosen) {
                    feedbackPanel.className = 'feedback-panel visible incorrect';
                    feedbackPanel.innerHTML = `<div class="feedback-title">${icon('x-circle')}<span>Elige una palabra del banco antes de continuar.</span></div>`;
                }
                return;
            }
            const isCorrect = answerMatches(chosen, q);
            slot.style.borderColor = isCorrect ? 'var(--green)' : 'var(--red)';
            bank.querySelectorAll('.word-chip').forEach(c => { c.disabled = true; });
            finishQuestion(isCorrect, q.answer, q.feedback);
        };
    }

    function renderWordOrder(q) {
        const answerRow = document.createElement('div');
        answerRow.className = 'answer-row';
        answerRow.setAttribute('aria-label', 'Tu oración');
        answerRow.setAttribute('aria-live', 'polite');
        const bank = document.createElement('div');
        bank.className = 'word-bank';
        bank.setAttribute('role', 'group');
        bank.setAttribute('aria-label', 'Palabras disponibles, toca en orden');

        let selected = [];
        const shuffled = [...q.words].sort(() => Math.random() - 0.5);
        const chips = new Map();

        function renderAnswerRow() {
            answerRow.innerHTML = '';
            selected.forEach((word, i) => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'word-chip in-answer';
                chip.textContent = word;
                chip.setAttribute('aria-label', `Quitar "${word}" de la oración`);
                chip.addEventListener('click', () => {
                    if (answered) return;
                    selected.splice(i, 1);
                    chips.get(word + i)?.classList.remove('placed');
                    renderAnswerRow();
                });
                answerRow.appendChild(chip);
            });
        }

        shuffled.forEach((word, idx) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'word-chip';
            chip.textContent = word;
            chip.addEventListener('click', () => {
                if (answered || chip.classList.contains('placed')) return;
                chip.classList.add('placed');
                selected.push(word);
                chips.set(word + (selected.length - 1), chip);
                renderAnswerRow();
            });
            bank.appendChild(chip);
        });

        answersContainer.append(answerRow, bank);

        checkButton.hidden = false;
        checkButton.onclick = (e) => {
            e.preventDefault();
            if (answered) return;
            if (selected.length === 0) {
                feedbackPanel.className = 'feedback-panel visible incorrect';
                feedbackPanel.innerHTML = `<div class="feedback-title">${icon('x-circle')}<span>Ordena al menos una palabra antes de continuar.</span></div>`;
                return;
            }
            const isCorrect = answerMatches(selected.join(' '), q);
            bank.querySelectorAll('.word-chip').forEach(c => { c.disabled = true; });
            finishQuestion(isCorrect, q.answer, q.feedback);
        };
    }

    function renderSpeaking(q) {
        const targetBox = document.createElement('div');
        targetBox.className = 'speaking-target';
        targetBox.innerHTML = `<strong lang="en">${q.prompt}</strong><p>Pronuncia la oración o escríbela si prefieres.</p>`;
        answersContainer.appendChild(targetBox);

        const controls = document.createElement('div');
        controls.className = 'speaking-controls';
        const listenBtn = document.createElement('button');
        listenBtn.type = 'button';
        listenBtn.className = 'listen-button';
        listenBtn.setAttribute('aria-label', 'Escuchar pronunciación');
        listenBtn.innerHTML = icon('volume-2');
        listenBtn.addEventListener('click', () => {
            if (!('speechSynthesis' in window)) return;
            const utter = new SpeechSynthesisUtterance(q.prompt);
            utter.lang = 'en-US';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        });

        const micBtn = document.createElement('button');
        micBtn.type = 'button';
        micBtn.className = 'mic-button';
        micBtn.id = 'mic-button';
        micBtn.setAttribute('aria-pressed', 'false');
        micBtn.innerHTML = icon('mic', { label: 'Grabar mi pronunciación' });
        controls.append(listenBtn, micBtn);
        answersContainer.appendChild(controls);

        const status = document.createElement('p');
        status.className = 'speaking-status';
        status.setAttribute('aria-live', 'polite');
        answersContainer.appendChild(status);

        const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
        let heardText = '';

        const details = document.createElement('details');
        details.className = 'speaking-fallback';
        const summary = document.createElement('summary');
        summary.textContent = '¿Prefieres escribir tu respuesta?';
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'speaking-text-input';
        textInput.setAttribute('aria-label', 'Escribe la oración en inglés');
        textInput.autocomplete = 'off';
        details.append(summary, textInput);
        answersContainer.appendChild(details);

        if (!SpeechRecognitionCtor) {
            micBtn.disabled = true;
            micBtn.setAttribute('aria-label', 'Micrófono no disponible en este navegador');
            status.textContent = 'El reconocimiento de voz no está disponible en este navegador. Escribe tu respuesta abajo.';
            details.open = true;
        } else {
            micBtn.addEventListener('click', () => {
                if (answered) return;
                recognizer = new SpeechRecognitionCtor();
                recognizer.lang = 'en-US';
                recognizer.interimResults = false;
                recognizer.maxAlternatives = 1;
                micBtn.setAttribute('aria-pressed', 'true');
                status.textContent = 'Escuchando… habla ahora.';
                recognizer.onresult = (event) => {
                    heardText = event.results[0][0].transcript;
                    textInput.value = heardText;
                    status.textContent = `Escuché: "${heardText}"`;
                };
                recognizer.onerror = () => {
                    status.textContent = 'No pude escucharte bien. Intenta de nuevo o escribe tu respuesta.';
                    details.open = true;
                };
                recognizer.onend = () => micBtn.setAttribute('aria-pressed', 'false');
                recognizer.start();
            });
        }

        checkButton.hidden = false;
        checkButton.onclick = (e) => {
            e.preventDefault();
            if (answered) return;
            const finalAnswer = textInput.value.trim() || heardText;
            if (!finalAnswer) {
                status.textContent = 'Graba tu voz o escribe la oración antes de continuar.';
                details.open = true;
                return;
            }
            const isCorrect = answerMatches(finalAnswer, { answer: q.prompt, acceptedAnswers: q.acceptedAnswers });
            finishQuestion(isCorrect, q.prompt, q.feedback);
        };
    }

    function renderQuestion() {
        const q = lesson.questions[currentQuestion];
        answered = false;
        heading.textContent = `Ejercicio ${currentQuestion + 1}`;
        typeLabel.innerHTML = `${icon(typeIconFor(q.type))}<span>${TYPE_LABELS[q.type] || 'Ejercicio'}</span>`;
        instruction.textContent = q.instruction;
        updateSegments();

        feedbackPanel.className = 'feedback-panel';
        feedbackPanel.innerHTML = '';
        checkButton.disabled = false;
        checkButton.hidden = true;
        nextButton.disabled = true;
        nextButton.innerHTML = `${icon('chevron-right', { size: 18 })}${currentQuestion === lesson.questions.length - 1 ? 'Finalizar lección' : 'Siguiente ejercicio'}`;

        answersContainer.innerHTML = '';
        answersContainer.classList.remove('slide-enter-right');
        void answersContainer.offsetWidth;
        answersContainer.classList.add('slide-enter-right');

        if (q.type === 'fill-blank') renderFillBlank(q);
        else if (q.type === 'word-order') renderWordOrder(q);
        else if (q.type === 'speaking') renderSpeaking(q);
        else renderMultipleChoice(q);
    }

    function typeIconFor(type) {
        return { 'multiple-choice': 'check-circle', 'fill-blank': 'target', 'word-order': 'shuffle', speaking: 'mic' }[type] || 'check-circle';
    }

    buildSegments();
    renderQuestion();

    nextButton.addEventListener('click', () => {
        if (currentQuestion < lesson.questions.length - 1) {
            currentQuestion += 1;
            renderQuestion();
        } else {
            const percentage = Math.round((score / lesson.questions.length) * 100);
            const xpEarned = Math.round(percentage / 5) + 10;
            recordLessonResult(lessonKey, { score: percentage, xpEarned });
            document.querySelector('.exercise-card').innerHTML = `
                <h2 tabindex="-1" id="final-title">${icon('trophy')} Lección finalizada</h2>
                <p aria-live="polite">Obtuviste ${score} de ${lesson.questions.length} respuestas correctas. Resultado: ${percentage}%. Ganaste ${xpEarned} XP.</p>
                <div class="practice-actions">
                    <a class="secondary-button" href="practica.html?lesson=${lessonKey}&mode=repaso" aria-label="Repetir la lección ${lesson.title}">${icon('rotate-ccw')} Repetir lección</a>
                    <a class="primary-button form-button" href="lecciones.html" aria-label="Volver al listado de lecciones">Volver a lecciones</a>
                </div>
            `;
            const finalTitle = document.getElementById('final-title');
            if (finalTitle) finalTitle.focus();
        }
    });

    if (readButton) {
        if ('speechSynthesis' in window) {
            readButton.addEventListener('click', () => {
                const utterance = new SpeechSynthesisUtterance(`${lesson.title}. ${lesson.explanation}`);
                utterance.lang = 'es-ES';
                utterance.rate = READING_RATES[settings?.lectura] || READING_RATES.normal;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            });
        } else {
            readButton.disabled = true;
            readButton.setAttribute('aria-label', 'Lectura por voz no disponible en este navegador');
        }
    }

    initPauseModal({ lessonTitle: lesson.title, lessonKey });
    if (pauseButton) pauseButton.addEventListener('click', () => openPauseModal());
    if (closeButton) closeButton.addEventListener('click', () => { window.location.href = 'lecciones.html'; });
}

/* ============================================================
   Modal de pausa accesible (role=dialog, foco atrapado, Escape)
   ============================================================ */
let pauseModalEls = null;

function initPauseModal({ lessonTitle, lessonKey }) {
    const backdrop = document.getElementById('pause-modal');
    if (!backdrop) return;
    pauseModalEls = backdrop;
    document.getElementById('pause-lesson-title').textContent = lessonTitle;

    const resumeBtn = document.getElementById('pause-resume');
    const exitBtn = document.getElementById('pause-exit');
    const restartBtn = document.getElementById('pause-restart');

    resumeBtn.addEventListener('click', closePauseModal);
    exitBtn.addEventListener('click', () => { window.location.href = 'lecciones.html'; });
    restartBtn.addEventListener('click', () => {
        window.location.href = `practica.html?lesson=${lessonKey}&mode=repaso`;
    });

    backdrop.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closePauseModal(); return; }
        if (e.key === 'Tab') {
            const focusables = backdrop.querySelectorAll('button');
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
}

let lastFocusedBeforeModal = null;
function openPauseModal() {
    if (!pauseModalEls) return;
    lastFocusedBeforeModal = document.activeElement;
    pauseModalEls.classList.add('open');
    document.getElementById('pause-resume').focus();
}
function closePauseModal() {
    if (!pauseModalEls) return;
    pauseModalEls.classList.remove('open');
    if (lastFocusedBeforeModal instanceof HTMLElement) lastFocusedBeforeModal.focus();
}

/* ============================================================
   Filtros de lecciones
   ============================================================ */
const FILTER_SESSION_KEY = 'linguaflow-lesson-filters';

function initLessonFilters() {
    const filterButton = document.getElementById('toggle-filters');
    const filterPanel = document.getElementById('filter-panel');
    if (!filterButton || !filterPanel) return;

    const cards = Array.from(document.querySelectorAll('.lesson-card[data-lesson]'));
    const resultsEl = document.getElementById('filter-results');
    const emptyState = document.getElementById('lessons-empty-state');
    const list = document.getElementById('lessons-list');
    const categoryChips = Array.from(filterPanel.querySelectorAll('[data-filter-category]'));
    const statusChips = Array.from(filterPanel.querySelectorAll('[data-filter-status]'));
    const clearButton = document.getElementById('clear-filters');

    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(FILTER_SESSION_KEY) || '{}'); } catch { /* ignore */ }
    let state = { category: saved.category || 'all', status: saved.status || 'all' };

    filterButton.addEventListener('click', () => {
        const isOpen = filterPanel.classList.toggle('open');
        filterButton.setAttribute('aria-expanded', String(isOpen));
    });

    function persist() {
        try { sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    }

    function apply() {
        const { state: appState } = renderSharedStats();
        let visibleCount = 0;
        cards.forEach(card => {
            const category = card.dataset.category;
            const lessonKey = card.dataset.lesson;
            const completed = Boolean(appState.lessonProgress[lessonKey]?.completed);
            const matchesCategory = state.category === 'all' || category === state.category;
            const matchesStatus =
                state.status === 'all' ||
                (state.status === 'completadas' && completed) ||
                (state.status === 'pendientes' && !completed);
            const visible = matchesCategory && matchesStatus;
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        categoryChips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filterCategory === state.category)));
        statusChips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filterStatus === state.status)));

        resultsEl.textContent = `${visibleCount} ${visibleCount === 1 ? 'lección encontrada' : 'lecciones encontradas'}`;
        emptyState.hidden = visibleCount !== 0;
        list.hidden = visibleCount === 0;
        persist();
    }

    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => { state.category = chip.dataset.filterCategory; apply(); });
    });
    statusChips.forEach(chip => {
        chip.addEventListener('click', () => { state.status = chip.dataset.filterStatus; apply(); });
    });
    clearButton?.addEventListener('click', () => {
        state = { category: 'all', status: 'all' };
        apply();
        filterButton.focus();
    });

    apply();
}

/* ============================================================
   Configuración de accesibilidad
   ============================================================ */
function initSettings(settings) {
    const nombre = document.getElementById('nombre');
    const lectura = document.getElementById('lectura');
    const contrast = document.getElementById('alto-contraste');
    const guardarButton = document.getElementById('guardar-config');
    const status = document.getElementById('config-status');
    if (!contrast || !guardarButton) return;

    // Precarga los campos con lo último guardado, para que el estado sea comprensible y predecible.
    if (nombre && settings.nombre) nombre.value = settings.nombre;
    if (lectura && settings.lectura) lectura.value = settings.lectura;
    contrast.checked = Boolean(settings.altoContraste);

    // El alto contraste se aplica de inmediato: feedback visual instantáneo (perceptible).
    contrast.addEventListener('change', () => {
        document.body.classList.toggle('high-contrast', contrast.checked);
        saveSettings({ ...loadSettings(), altoContraste: contrast.checked });
    });

    guardarButton.addEventListener('click', () => {
        const updated = {
            ...loadSettings(),
            nombre: nombre ? nombre.value.trim() : undefined,
            lectura: lectura ? lectura.value : undefined,
            altoContraste: contrast.checked,
        };
        saveSettings(updated);
        const appState = loadState();
        if (nombre && nombre.value.trim()) {
            appState.user.name = nombre.value.trim();
            saveState(appState);
        }
        if (status) {
            status.textContent = 'Configuración guardada correctamente.';
        }
    });
}

/* ============================================================
   Onboarding (5 pasos, una sola página)
   ============================================================ */
const ONBOARDING_SLIDES = [
    {
        icon: 'star', theme: 'purple',
        title: '¡Bienvenido/a a LinguaFlow!',
        description: 'Aprende inglés nivel B1 con lecciones interactivas, feedback inmediato y un sistema de progreso motivador.',
        features: [
            { icon: 'zap', text: 'Aprende a tu propio ritmo' },
            { icon: 'star', text: 'Gana XP y sube de nivel' },
            { icon: 'bar-chart', text: 'Sigue tu progreso' },
        ],
    },
    {
        icon: 'target', theme: 'green',
        title: 'Tipos de ejercicios',
        description: 'Practica con actividades B1 variadas —incluida pronunciación en voz alta— que hacen el aprendizaje efectivo, entretenido y accesible.',
        features: [
            { icon: 'check-circle', text: 'Selección múltiple' },
            { icon: 'check-circle', text: 'Completa la oración' },
            { icon: 'check-circle', text: 'Ordena las palabras' },
            { icon: 'mic', text: 'Ejercicios de pronunciación' },
        ],
    },
    {
        icon: 'zap', theme: 'amber',
        title: 'Feedback inmediato',
        description: 'Después de cada respuesta recibirás una explicación clara para que entiendas el "por qué" de cada respuesta.',
        features: [
            { icon: 'check-circle', text: 'Correcto: refuerzo positivo' },
            { icon: 'lightbulb', text: 'Incorrecto: explicación gramatical' },
            { icon: 'check-circle', text: 'Se aceptan sinónimos y variantes' },
        ],
    },
    {
        icon: 'bar-chart', theme: 'rose',
        title: 'Tu ruta de aprendizaje',
        description: 'Sigue una ruta estructurada de nivel B1, desbloqueando lecciones y contenido a medida que avanzas.',
        features: [
            { icon: 'target', text: '12 lecciones B1 con 4 ejercicios cada una' },
            { icon: 'flame', text: 'Racha de días de estudio' },
            { icon: 'zap', text: 'Gana XP en cada lección' },
        ],
    },
    {
        icon: 'trophy', theme: 'purple',
        title: '¡Empecemos a aprender!',
        description: 'Todo listo para comenzar tu viaje hacia el dominio del inglés. ¡Recuerda que la constancia es la clave!',
        features: [
            { icon: 'clock', text: '5–10 min al día son suficientes' },
            { icon: 'pause', text: 'Pausa cuando quieras' },
            { icon: 'check-circle', text: 'Tu progreso se guarda siempre' },
        ],
    },
];

function initOnboarding() {
    const root = document.getElementById('onboarding-root');
    if (!root) return;

    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
        window.location.replace('dashboard.html');
        return;
    }

    let current = 0;
    const heroIcon = document.getElementById('onboarding-hero-icon');
    const heroTitle = document.getElementById('onboarding-hero-title');
    const heroDesc = document.getElementById('onboarding-hero-desc');
    const heroCard = document.getElementById('onboarding-hero');
    const featureList = document.getElementById('onboarding-features');
    const dotsNav = document.getElementById('onboarding-dots');
    const backBtn = document.getElementById('onboarding-back');
    const nextBtn = document.getElementById('onboarding-next');
    const skipBtn = document.getElementById('onboarding-skip');

    function finish() {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        window.location.href = 'dashboard.html';
    }

    function renderDots() {
        dotsNav.innerHTML = '';
        ONBOARDING_SLIDES.forEach((slide, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', `Ir al paso ${i + 1} de ${ONBOARDING_SLIDES.length}: ${slide.title}`);
            if (i === current) btn.setAttribute('aria-current', 'step');
            const dot = document.createElement('span');
            dot.className = `dot${i === current ? ' active' : ''}`;
            btn.appendChild(dot);
            btn.addEventListener('click', () => { current = i; render(); });
            dotsNav.appendChild(btn);
        });
    }

    function render() {
        const slide = ONBOARDING_SLIDES[current];
        heroCard.className = `onboarding-hero theme-${slide.theme}`;
        heroIcon.innerHTML = icon(slide.icon, { size: 30 });
        heroTitle.textContent = slide.title;
        heroDesc.textContent = slide.description;
        featureList.innerHTML = '';
        slide.features.forEach(f => {
            const item = document.createElement('article');
            item.className = 'feature-item';
            item.tabIndex = 0;
            item.innerHTML = `${icon(f.icon)}<p>${f.text}</p>`;
            featureList.appendChild(item);
        });
        renderDots();
        backBtn.hidden = current === 0;
        nextBtn.innerHTML = current === ONBOARDING_SLIDES.length - 1
            ? `¡Comenzar! ${icon('chevron-right')}`
            : `Siguiente ${icon('chevron-right')}`;

        document.getElementById('onboarding-card').classList.remove('slide-enter-right');
        void document.getElementById('onboarding-card').offsetWidth;
        document.getElementById('onboarding-card').classList.add('slide-enter-right');
    }

    backBtn.addEventListener('click', () => { if (current > 0) { current -= 1; render(); } });
    nextBtn.addEventListener('click', () => {
        if (current < ONBOARDING_SLIDES.length - 1) { current += 1; render(); }
        else finish();
    });
    skipBtn.addEventListener('click', finish);

    render();
}

/* ============================================================
   Inicio
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const settings = applyStoredSettings();
    initIcons();
    renderSharedStats();
    initOnboarding();
    initPractice(settings);
    initSettings(settings);
    initLessonFilters();
});
