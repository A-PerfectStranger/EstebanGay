const SETTINGS_KEY = 'linguaflow-settings';

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

// Aplica la configuración guardada (alto contraste, etc.) en cada página,
// para que la experiencia sea predecible y coherente en todo el sitio.
function applyStoredSettings() {
    const settings = loadSettings();
    document.body.classList.toggle('high-contrast', Boolean(settings.altoContraste));
    return settings;
}

const lessons = {
    'present-perfect': {
        title: 'Present Perfect',
        explanation: 'Present Perfect se usa para hablar de experiencias de vida, acciones recientes o acciones que conectan el pasado con el presente. Ejemplo: I have never been to Canada.',
        questions: [
            {
                instruction: 'Completa la oración: I _____ never been to Canada.',
                options: ['have', 'has', 'did'],
                answer: 'have',
                feedback: 'Correcto. Se usa “have” con I, you, we y they.'
            },
            {
                instruction: 'Elige la oración correcta en Present Perfect.',
                options: ['She has visited London twice.', 'She visited London twice yesterday.', 'She have visited London twice.'],
                answer: 'She has visited London twice.',
                feedback: 'Correcto. “She has visited” expresa experiencia.'
            },
            {
                instruction: 'Completa: They _____ already finished their homework.',
                options: ['has', 'have', 'did'],
                answer: 'have',
                feedback: 'Correcto. “They have already finished” usa Present Perfect.'
            }
        ]
    },
    'present-perfect-vs-past-simple': {
        title: 'Present Perfect vs Past Simple',
        explanation: 'Usa Past Simple cuando el tiempo ya terminó, como yesterday o last year. Usa Present Perfect cuando la experiencia importa más que el momento exacto.',
        questions: [
            {
                instruction: 'Elige la opción correcta: I _____ my keys yesterday.',
                options: ['have lost', 'lost', 'has lost'],
                answer: 'lost',
                feedback: 'Correcto. “Yesterday” indica un tiempo terminado, por eso usamos Past Simple.'
            },
            {
                instruction: 'Elige la opción correcta: I _____ that movie three times.',
                options: ['have seen', 'saw yesterday', 'has seen'],
                answer: 'have seen',
                feedback: 'Correcto. Habla de una experiencia sin momento exacto.'
            },
            {
                instruction: 'Completa: She _____ to Quito in 2022.',
                options: ['has moved', 'moved', 'have moved'],
                answer: 'moved',
                feedback: 'Correcto. “In 2022” es un tiempo específico del pasado.'
            }
        ]
    },
    'future-forms': {
        title: 'Future Forms',
        explanation: 'En B1 se usan varias formas de futuro: will para decisiones rápidas, going to para planes o evidencias, y present continuous para arreglos confirmados.',
        questions: [
            {
                instruction: 'Completa: Look at those clouds. It _____ rain.',
                options: ['will', 'is going to', 'rains'],
                answer: 'is going to',
                feedback: 'Correcto. Hay evidencia visible: las nubes.'
            },
            {
                instruction: 'Elige la opción correcta para un arreglo confirmado: I _____ my doctor at 5 p.m.',
                options: ['am seeing', 'will see', 'see usually'],
                answer: 'am seeing',
                feedback: 'Correcto. Present continuous puede expresar planes confirmados.'
            },
            {
                instruction: 'Completa una decisión espontánea: I am tired. I think I _____ take a taxi.',
                options: ['am going to', 'will', 'am taking every day'],
                answer: 'will',
                feedback: 'Correcto. “Will” funciona para decisiones tomadas en el momento.'
            }
        ]
    },
    'first-conditional': {
        title: 'First Conditional',
        explanation: 'First Conditional habla de situaciones reales o posibles en el futuro: If + present simple, will + verb.',
        questions: [
            {
                instruction: 'Completa: If it rains, we _____ stay at home.',
                options: ['will', 'would', 'are'],
                answer: 'will',
                feedback: 'Correcto. First Conditional usa will en el resultado.'
            },
            {
                instruction: 'Elige la oración correcta.',
                options: ['If I see him, I will tell him.', 'If I will see him, I tell him.', 'If I saw him, I will tell him.'],
                answer: 'If I see him, I will tell him.',
                feedback: 'Correcto. Después de if se usa presente simple.'
            },
            {
                instruction: 'Completa: She will pass the exam if she _____ hard.',
                options: ['studies', 'will study', 'studied'],
                answer: 'studies',
                feedback: 'Correcto. La condición va en presente simple.'
            }
        ]
    },
    'second-conditional': {
        title: 'Second Conditional',
        explanation: 'Second Conditional expresa situaciones hipotéticas: If + past simple, would + verb.',
        questions: [
            {
                instruction: 'Completa: If I had more time, I _____ travel more.',
                options: ['will', 'would', 'am'],
                answer: 'would',
                feedback: 'Correcto. En Second Conditional usamos would.'
            },
            {
                instruction: 'Elige la oración correcta.',
                options: ['If I were you, I would study more.', 'If I am you, I would study more.', 'If I was you, I will study more.'],
                answer: 'If I were you, I would study more.',
                feedback: 'Correcto. “If I were you” es la forma recomendada.'
            },
            {
                instruction: 'Completa: She would buy a car if she _____ enough money.',
                options: ['has', 'had', 'will have'],
                answer: 'had',
                feedback: 'Correcto. La condición usa past simple.'
            }
        ]
    },
    'passive-voice': {
        title: 'Passive Voice',
        explanation: 'Passive Voice se forma con be más participio pasado. Se usa cuando la acción o el resultado son más importantes que la persona que realiza la acción.',
        questions: [
            {
                instruction: 'Completa: The book _____ written in 1998.',
                options: ['was', 'were', 'did'],
                answer: 'was',
                feedback: 'Correcto. “The book was written” está en voz pasiva.'
            },
            {
                instruction: 'Transforma a pasiva: People speak English here.',
                options: ['English is spoken here.', 'English speaks here.', 'English was speak here.'],
                answer: 'English is spoken here.',
                feedback: 'Correcto. Present passive: is/are + participio.'
            },
            {
                instruction: 'Completa: The emails _____ sent yesterday.',
                options: ['was', 'were', 'are send'],
                answer: 'were',
                feedback: 'Correcto. “Emails” es plural: were sent.'
            }
        ]
    },
    'reported-speech': {
        title: 'Reported Speech',
        explanation: 'Reported Speech sirve para contar lo que alguien dijo. Normalmente el tiempo verbal retrocede: am cambia a was, will cambia a would, present simple cambia a past simple.',
        questions: [
            {
                instruction: 'Directo: “I am tired.” Reportado: She said she _____ tired.',
                options: ['is', 'was', 'will be'],
                answer: 'was',
                feedback: 'Correcto. “Am” cambia a “was”.'
            },
            {
                instruction: 'Directo: “I will call you.” Reportado: He said he _____ call me.',
                options: ['would', 'will', 'can'],
                answer: 'would',
                feedback: 'Correcto. “Will” cambia a “would”.'
            },
            {
                instruction: 'Directo: “I like coffee.” Reportado: She said she _____ coffee.',
                options: ['likes', 'liked', 'will like'],
                answer: 'liked',
                feedback: 'Correcto. Present simple cambia a past simple.'
            }
        ]
    },
    'relative-clauses': {
        title: 'Relative Clauses',
        explanation: 'Las relative clauses agregan información. Usa who para personas, which para cosas y where para lugares.',
        questions: [
            {
                instruction: 'Completa: This is the teacher _____ helped me.',
                options: ['who', 'which', 'where'],
                answer: 'who',
                feedback: 'Correcto. “Who” se usa para personas.'
            },
            {
                instruction: 'Completa: This is the phone _____ I bought yesterday.',
                options: ['where', 'who', 'which'],
                answer: 'which',
                feedback: 'Correcto. “Which” se usa para cosas.'
            },
            {
                instruction: 'Completa: Quito is the city _____ I study.',
                options: ['where', 'who', 'which'],
                answer: 'where',
                feedback: 'Correcto. “Where” se usa para lugares.'
            }
        ]
    },
    'phrasal-verbs': {
        title: 'Phrasal Verbs',
        explanation: 'Los phrasal verbs combinan un verbo con una partícula. Por ejemplo, give up significa rendirse y look after significa cuidar.',
        questions: [
            {
                instruction: 'Elige el significado de “give up”.',
                options: ['rendirse', 'encender', 'buscar'],
                answer: 'rendirse',
                feedback: 'Correcto. “Give up” significa rendirse o dejar de intentar.'
            },
            {
                instruction: 'Completa: Can you _____ the lights? It is dark.',
                options: ['turn on', 'give up', 'look after'],
                answer: 'turn on',
                feedback: 'Correcto. “Turn on” significa encender.'
            },
            {
                instruction: 'Completa: I have to _____ my little brother.',
                options: ['look after', 'turn off', 'find out'],
                answer: 'look after',
                feedback: 'Correcto. “Look after” significa cuidar.'
            }
        ]
    },
    'travel-and-tourism': {
        title: 'Travel and Tourism',
        explanation: 'Esta lección practica vocabulario de viajes, reservas, alojamiento y turismo para situaciones reales.',
        questions: [
            {
                instruction: 'Completa: I need to book a _____ for two nights.',
                options: ['hotel room', 'boarding pass', 'suitcase'],
                answer: 'hotel room',
                feedback: 'Correcto. “Book a hotel room” significa reservar una habitación.'
            },
            {
                instruction: 'Elige la frase adecuada en el aeropuerto.',
                options: ['Where is the boarding gate?', 'Where is the kitchen?', 'Where is the homework?'],
                answer: 'Where is the boarding gate?',
                feedback: 'Correcto. “Boarding gate” es la puerta de embarque.'
            },
            {
                instruction: 'Completa: We went on a guided _____ around the city.',
                options: ['tour', 'ticket', 'passport'],
                answer: 'tour',
                feedback: 'Correcto. “Guided tour” significa visita guiada.'
            }
        ]
    },
    'work-and-careers': {
        title: 'Work and Careers',
        explanation: 'Esta lección practica vocabulario para entrevistas, habilidades, experiencia laboral y crecimiento profesional.',
        questions: [
            {
                instruction: 'Completa: I have five years of work _____.',
                options: ['experience', 'meeting', 'salary'],
                answer: 'experience',
                feedback: 'Correcto. “Work experience” significa experiencia laboral.'
            },
            {
                instruction: 'Elige una habilidad profesional.',
                options: ['problem solving', 'boarding gate', 'weather forecast'],
                answer: 'problem solving',
                feedback: 'Correcto. “Problem solving” es una habilidad laboral.'
            },
            {
                instruction: 'Completa: She applied _____ a software internship.',
                options: ['for', 'at', 'on'],
                answer: 'for',
                feedback: 'Correcto. La expresión es “apply for a job”.'
            }
        ]
    },
    'technology-and-media': {
        title: 'Technology and Media',
        explanation: 'Esta lección trabaja vocabulario sobre tecnología, redes sociales, medios digitales y hábitos en línea.',
        questions: [
            {
                instruction: 'Completa: I uploaded the file to the _____.',
                options: ['cloud', 'keyboard', 'screen'],
                answer: 'cloud',
                feedback: 'Correcto. “Cloud” se refiere al almacenamiento en línea.'
            },
            {
                instruction: 'Elige la palabra relacionada con redes sociales.',
                options: ['post', 'passport', 'platform'],
                answer: 'post',
                feedback: 'Correcto. “Post” es una publicación en redes sociales.'
            },
            {
                instruction: 'Completa: You should create a strong _____ for your account.',
                options: ['password', 'boarding pass', 'receipt'],
                answer: 'password',
                feedback: 'Correcto. “Password” significa contraseña.'
            }
        ]
    }
};

function getLessonFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('lesson') || 'present-perfect';
    return lessons[key] ? key : 'present-perfect';
}

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

    const title = document.getElementById('practice-title');
    const description = document.getElementById('practice-description');
    const heading = document.getElementById('exercise-heading');
    const instruction = document.getElementById('exercise-instruction');
    const answersContainer = document.getElementById('answers-container');
    const feedback = document.getElementById('feedback');
    const nextButton = document.getElementById('next-question');
    const checkButton = document.getElementById('check-answer');
    const counter = document.getElementById('exercise-counter');
    const progress = document.getElementById('lesson-progress');
    const explanation = document.getElementById('lesson-explanation');
    const readButton = document.getElementById('readLesson');

    const readableMode = mode === 'repaso' ? 'Repaso' : mode === 'continuar' ? 'Continuación' : 'Práctica';
    title.textContent = `${readableMode} B1: ${lesson.title}`;
    description.textContent = `Esta lección tiene ${lesson.questions.length} ejercicios. Puedes navegar con teclado y recibir retroalimentación inmediata.`;
    explanation.textContent = lesson.explanation;

    function renderQuestion() {
        const question = lesson.questions[currentQuestion];
        answered = false;
        heading.textContent = `Ejercicio ${currentQuestion + 1}`;
        instruction.textContent = question.instruction;
        counter.textContent = `Ejercicio ${currentQuestion + 1} de ${lesson.questions.length}`;
        progress.value = currentQuestion + 1;
        progress.max = lesson.questions.length;
        progress.setAttribute('aria-label', `Progreso: ejercicio ${currentQuestion + 1} de ${lesson.questions.length}`);
        feedback.textContent = '';
        checkButton.disabled = false;
        nextButton.disabled = true;
        nextButton.textContent = currentQuestion === lesson.questions.length - 1 ? 'Finalizar lección' : 'Siguiente ejercicio';

        answersContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const id = `answer-${currentQuestion}-${index}`;
            const label = document.createElement('label');
            label.className = 'answer-option';
            label.setAttribute('for', id);

            const input = document.createElement('input');
            input.type = 'radio';
            input.id = id;
            input.name = 'answer';
            input.value = option;
            input.tabIndex = 0;

            const span = document.createElement('span');
            span.textContent = option;

            label.appendChild(input);
            label.appendChild(span);
            answersContainer.appendChild(label);
        });

        const firstInput = answersContainer.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (answered) return;

        const selected = document.querySelector('input[name="answer"]:checked');
        const question = lesson.questions[currentQuestion];

        if (!selected) {
            feedback.textContent = 'Selecciona una respuesta antes de continuar.';
            feedback.style.color = '#8a5a00';
            return;
        }

        answered = true;
        checkButton.disabled = true;
        nextButton.disabled = false;

        if (selected.value === question.answer) {
            score += 1;
            feedback.textContent = question.feedback;
            feedback.style.color = '#087f5b';
        } else {
            feedback.textContent = `Inténtalo otra vez en el repaso. La respuesta correcta es: ${question.answer}.`;
            feedback.style.color = '#b00020';
        }

        nextButton.focus();
    });

    nextButton.addEventListener('click', () => {
        if (currentQuestion < lesson.questions.length - 1) {
            currentQuestion += 1;
            renderQuestion();
        } else {
            const percentage = Math.round((score / lesson.questions.length) * 100);
            document.querySelector('.exercise-card').innerHTML = `
                <h2 tabindex="-1" id="final-title">Lección finalizada</h2>
                <p aria-live="polite">Obtuviste ${score} de ${lesson.questions.length} respuestas correctas. Resultado: ${percentage}%.</p>
                <div class="practice-actions">
                    <a class="secondary-button" href="practica.html?lesson=${lessonKey}&mode=repaso" aria-label="Repetir la lección ${lesson.title}">↻ Repetir lección</a>
                    <a class="primary-button form-button" href="lecciones.html" aria-label="Volver al listado de lecciones">Volver a lecciones</a>
                </div>
            `;
            const finalTitle = document.getElementById('final-title');
            if (finalTitle) finalTitle.focus();
        }
    });

    if (readButton && 'speechSynthesis' in window) {
        readButton.addEventListener('click', () => {
            const utterance = new SpeechSynthesisUtterance(`${lesson.title}. ${lesson.explanation}`);
            utterance.lang = 'es-ES';
            utterance.rate = READING_RATES[settings?.lectura] || READING_RATES.normal;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        });
    } else if (readButton) {
        readButton.disabled = true;
        readButton.setAttribute('aria-label', 'Lectura por voz no disponible en este navegador');
    }

    renderQuestion();
}

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
        if (status) {
            status.textContent = 'Configuración guardada correctamente.';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const settings = applyStoredSettings();
    initPractice(settings);
    initSettings(settings);
});
