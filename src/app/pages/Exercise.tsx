import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pause, CheckCircle2, XCircle, Lightbulb, ChevronRight, Volume2, Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLessonById, type ExerciseItem } from '../data/lessons';
import { PauseModal } from '../components/PauseModal';
import { usePageTitle } from '../hooks/usePageTitle';

// ─────────────────────────────────────────────
// Answer normalisation
// ─────────────────────────────────────────────
function normalise(s: string) {
  return s.toLowerCase().trim().replace(/[.!?]$/, '').trim().replace(/\s+/g, ' ');
}
function checkAnswer(userAns: string, correct: string, accepted?: string[]): boolean {
  const n = normalise(userAns);
  return [correct, ...(accepted ?? [])].map(normalise).includes(n);
}

// Shared text-answer submission logic for Translate & Speaking
function useTextAnswer(exercise: ExerciseItem, onAnswer: (answer: string) => void) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!value.trim() || submitted) return;
    setSubmitted(true);
    onAnswer(value.trim());
  };

  const isCorrect = checkAnswer(value, exercise.correctAnswer, exercise.acceptedAnswers);

  return { value, setValue, submitted, submit, isCorrect };
}

// ─────────────────────────────────────────────
// Multiple Choice
// ─────────────────────────────────────────────
function MultipleChoice({
  exercise,
  onAnswer,
}: Readonly<{
  exercise: ExerciseItem;
  onAnswer: (answer: string) => void;
}>) {
  const [selected, setSelected] = useState<string | null>(null);

  const pick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    onAnswer(opt);
  };

  return (
    <fieldset>
      {/* legend oculta: vincula las opciones a su pregunta para que un lector de
          pantalla anuncie el contexto al entrar al grupo, no solo el texto suelto
          de cada botón */}
      <legend className="sr-only">{exercise.question ?? exercise.instruction}</legend>
      <div className="space-y-3">
        {exercise.options!.map(opt => {
          const isChosenRight = selected === opt && opt === exercise.correctAnswer;
          const isChosenWrong = selected === opt && opt !== exercise.correctAnswer;
          const isRevealedCorrect = !!selected && !isChosenRight && opt === exercise.correctAnswer;

          let optionClass: string;
          let indicatorClass: string;
          if (isChosenRight || isRevealedCorrect) {
            optionClass = 'border-green-400 bg-green-50 text-green-800';
            indicatorClass = 'border-green-500 bg-green-500';
          } else if (isChosenWrong) {
            optionClass = 'border-red-400 bg-red-50 text-red-800';
            indicatorClass = 'border-red-400 bg-red-400';
          } else {
            optionClass = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-slate-700';
            indicatorClass = 'border-slate-300';
          }

          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={!!selected}
              aria-pressed={selected === opt}
              lang="en"
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${optionClass}`}
              style={{ fontWeight: 500 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${indicatorClass}`}
                >
                  {(isChosenRight || isRevealedCorrect) && <CheckCircle2 className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                  {isChosenWrong && <XCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                </div>
                {opt}
                {(isChosenRight || isRevealedCorrect) && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" aria-hidden="true" />}
                {isChosenWrong && <XCircle className="w-4 h-4 text-red-500 ml-auto" aria-hidden="true" />}
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// ─────────────────────────────────────────────
// Fill Blank
// ─────────────────────────────────────────────
function FillBlank({
  exercise,
  onAnswer,
}: Readonly<{
  exercise: ExerciseItem;
  onAnswer: (answer: string) => void;
}>) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const pick = (word: string) => {
    if (submitted) return;
    const newChosen = chosen === word ? null : word;
    setChosen(newChosen);
  };

  const submit = () => {
    if (!chosen || submitted) return;
    setSubmitted(true);
    onAnswer(chosen);
  };

  const parts = exercise.sentence!.split('[BLANK]');
  const isCorrect = chosen === exercise.correctAnswer;

  let blankClass: string;
  if (!chosen) {
    blankClass = 'border-dashed border-slate-300 bg-white text-slate-500';
  } else if (submitted && isCorrect) {
    blankClass = 'border-green-400 bg-green-100 text-green-800';
  } else if (submitted && !isCorrect) {
    blankClass = 'border-red-400 bg-red-100 text-red-800';
  } else {
    blankClass = 'border-indigo-400 bg-indigo-100 text-indigo-800';
  }

  return (
    <div className="space-y-5">
      {/* Sentence with blank */}
      <div className="bg-slate-50 rounded-2xl p-4 text-center" lang="en" style={{ fontSize: '1rem', lineHeight: 1.6, color: '#1e293b', fontWeight: 500 }}>
        {parts[0]}
        <span
          className={`inline-block min-w-[80px] px-3 py-0.5 mx-1 rounded-lg border-2 transition-colors ${blankClass}`}
          style={{ fontWeight: 600 }}
        >
          {chosen ?? '___'}
        </span>
        {parts[1]}
      </div>

      {/* Word bank */}
      <fieldset>
        {/* legend oculta: da contexto de la oración (con el hueco) a las palabras
            del banco, ya que este ejercicio no tiene un campo "question" propio */}
        <legend className="sr-only" lang="en">{exercise.sentence!.replace('[BLANK]', 'blank')}</legend>
        <div className="flex flex-wrap gap-2 justify-center" lang="en">
          {exercise.wordBank!.map(word => {
            const isChosenWord = chosen === word;
            let wordClass: string;
            if (isChosenWord && submitted) {
              wordClass = isCorrect ? 'border-green-400 bg-green-100 text-green-800' : 'border-red-400 bg-red-100 text-red-800';
            } else if (isChosenWord) {
              wordClass = 'border-indigo-400 bg-indigo-100 text-indigo-700';
            } else if (submitted) {
              wordClass = 'border-slate-200 bg-slate-100 text-slate-400 opacity-50';
            } else {
              wordClass = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50';
            }
            return (
              <button
                key={word}
                onClick={() => pick(word)}
                disabled={submitted}
                aria-pressed={isChosenWord}
                className={`px-4 py-2 rounded-xl border-2 transition-all ${wordClass}`}
                style={{ fontWeight: 500 }}
              >
                {word}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Submit */}
      {!submitted && (
        <button
          onClick={submit}
          disabled={!chosen}
          className={`w-full py-3.5 rounded-2xl transition-all ${
            chosen
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontWeight: 600 }}
        >
          Comprobar
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Word Order
// ─────────────────────────────────────────────
interface WordToken {
  word: string;
  id: number;
}

// Ficha de palabra que se autoenfoca al montar. Al mover una palabra entre el
// banco y la respuesta, el botón pulsado se destruye y aparece uno nuevo en la
// otra zona; sin esto el foco de teclado caería al <body> en cada movimiento
// (WCAG 2.4.3), obligando a una persona ciega a tabular desde el principio de
// la página para seguir ordenando. La key es el id estable (no el índice),
// porque algunas oraciones repiten una palabra dos veces en el mismo banco.
function WordChip({
  token,
  autoFocus,
  onClick,
  disabled,
  ariaLabel,
  className,
  fontWeight,
}: Readonly<{
  token: WordToken;
  autoFocus: boolean;
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  className: string;
  fontWeight: number;
}>) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      lang="en"
      aria-label={ariaLabel}
      className={className}
      style={{ fontWeight }}
    >
      {token.word}
    </button>
  );
}

function WordOrder({
  exercise,
  onAnswer,
}: Readonly<{
  exercise: ExerciseItem;
  onAnswer: (answer: string) => void;
}>) {
  const [available, setAvailable] = useState<WordToken[]>(
    () => (exercise.wordBank ?? []).map((word, id) => ({ word, id }))
  );
  const [selected, setSelected] = useState<WordToken[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastMovedId, setLastMovedId] = useState<number | null>(null);

  const addWord = (token: WordToken) => {
    if (submitted) return;
    setAvailable(a => a.filter(t => t.id !== token.id));
    setSelected(s => [...s, token]);
    setLastMovedId(token.id);
  };

  const removeWord = (token: WordToken) => {
    if (submitted) return;
    setSelected(s => s.filter(t => t.id !== token.id));
    setAvailable(a => [...a, token]);
    setLastMovedId(token.id);
  };

  const submit = () => {
    if (selected.length === 0 || submitted) return;
    setSubmitted(true);
    onAnswer(selected.map(t => t.word).join(' '));
  };

  const userAnswer = selected.map(t => t.word).join(' ');
  const isCorrect = checkAnswer(userAnswer, exercise.correctAnswer);

  let answerAreaClass: string;
  if (submitted) {
    answerAreaClass = isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50';
  } else {
    answerAreaClass = 'border-dashed border-slate-300';
  }

  return (
    <div className="space-y-5">
      {/* Answer area */}
      <fieldset>
        <legend className="sr-only">{`${exercise.instruction}. Tu respuesta actual`}</legend>
        <div
          className={`min-h-[3.5rem] bg-white rounded-2xl border-2 p-3 flex flex-wrap gap-2 transition-colors ${answerAreaClass}`}
        >
          {selected.length === 0 && (
            <span className="text-slate-500 self-center mx-auto" style={{ fontSize: '0.85rem' }}>
              Toca las palabras para ordenarlas
            </span>
          )}
          {selected.map((token, i) => {
            let selectedWordClass: string;
            if (submitted) {
              selectedWordClass = isCorrect ? 'border-green-400 bg-green-100 text-green-800' : 'border-red-300 bg-red-100 text-red-800';
            } else {
              selectedWordClass = 'border-indigo-300 bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
            }
            return (
              <WordChip
                key={token.id}
                token={token}
                autoFocus={token.id === lastMovedId}
                onClick={() => removeWord(token)}
                disabled={submitted}
                ariaLabel={`Quitar la palabra ${token.word} de tu respuesta, posición ${i + 1} de ${selected.length}`}
                className={`px-3 py-1.5 rounded-xl border-2 transition-all ${selectedWordClass}`}
                fontWeight={600}
              />
            );
          })}
        </div>
      </fieldset>

      {/* Separator */}
      <div className="h-px bg-slate-100" />

      {/* Word bank */}
      <fieldset>
        <legend className="sr-only">Banco de palabras disponibles</legend>
        <div className="flex flex-wrap gap-2" lang="en">
          {available.map(token => (
            <WordChip
              key={token.id}
              token={token}
              autoFocus={token.id === lastMovedId}
              onClick={() => addWord(token)}
              disabled={submitted}
              ariaLabel={`Añadir la palabra ${token.word} a tu respuesta`}
              className={`px-3 py-2 rounded-xl border-2 transition-all ${
                submitted
                  ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-40'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95'
              }`}
              fontWeight={500}
            />
          ))}
        </div>
      </fieldset>

      {/* Submit */}
      {!submitted && (
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className={`w-full py-3.5 rounded-2xl transition-all ${
            selected.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontWeight: 600 }}
        >
          Comprobar
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Translate
// ─────────────────────────────────────────────
function Translate({
  exercise,
  onAnswer,
}: Readonly<{
  exercise: ExerciseItem;
  onAnswer: (answer: string) => void;
}>) {
  const { value, setValue, submitted, submit, isCorrect } = useTextAnswer(exercise, onAnswer);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  let textareaClass: string;
  if (submitted) {
    textareaClass = isCorrect ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800';
  } else {
    textareaClass = 'border-slate-200 bg-white text-slate-800 focus:border-indigo-400';
  }

  return (
    <div className="space-y-4">
      {/* Phrase to translate */}
      <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 text-center">
        <p className="text-indigo-800" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{exercise.question}</p>
      </div>

      {/* Input */}
      <textarea
        ref={ref}
        value={value}
        onChange={e => !submitted && setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Escribe tu respuesta en inglés..."
        aria-label={`Escribe tu respuesta en inglés para: ${exercise.question}`}
        lang="en"
        disabled={submitted}
        className={`w-full rounded-2xl border-2 p-4 resize-none outline-none transition-colors placeholder:text-slate-500 ${textareaClass}`}
        rows={3}
        style={{ fontWeight: 500 }}
      />

      {/* Submit */}
      {!submitted && (
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`w-full py-3.5 rounded-2xl transition-all ${
            value.trim()
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontWeight: 600 }}
        >
          Comprobar
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Speaking (pronunciación) — con alternativa de texto siempre disponible
// ─────────────────────────────────────────────
function Speaking({
  exercise,
  onAnswer,
}: Readonly<{
  exercise: ExerciseItem;
  onAnswer: (answer: string) => void;
}>) {
  const { value, setValue, submitted, submit, isCorrect } = useTextAnswer(exercise, onAnswer);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  const SpeechRecognitionCtor =
    typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(exercise.correctAnswer);
    utter.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    if (!SpeechRecognitionCtor || submitted) return;
    const recognizer = new SpeechRecognitionCtor();
    recognizer.lang = 'en-US';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    setListening(true);
    setStatus('Escuchando… habla ahora.');
    recognizer.onresult = (event: any) => {
      const heard = event.results[0][0].transcript;
      setValue(heard);
      setStatus(`Escuché: "${heard}"`);
    };
    recognizer.onerror = () => {
      setStatus('No pude escucharte bien. Intenta de nuevo o escribe tu respuesta.');
      setShowFallback(true);
    };
    recognizer.onend = () => setListening(false);
    recognizer.start();
  };

  let fallbackInputClass: string;
  if (submitted) {
    fallbackInputClass = isCorrect ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800';
  } else {
    fallbackInputClass = 'border-slate-200 bg-white text-slate-800 focus:border-indigo-400';
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-2xl p-5 text-center">
        <p className="text-slate-800" lang="en" style={{ fontWeight: 700, fontSize: '1.15rem' }}>{exercise.correctAnswer}</p>
        <p className="text-slate-600 mt-1" style={{ fontSize: '0.78rem' }}>Pronuncia la oración o escríbela si prefieres.</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={speak}
          aria-label="Escuchar pronunciación"
          className="w-12 h-12 rounded-full bg-slate-100 text-indigo-600 flex items-center justify-center border border-slate-200"
        >
          <Volume2 className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={startListening}
          disabled={!SpeechRecognitionCtor || submitted}
          aria-pressed={listening}
          aria-label="Grabar mi pronunciación"
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
            SpeechRecognitionCtor ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-200 text-slate-400'
          }`}
        >
          <Mic className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      <p className="text-center text-slate-500 min-h-[1.2rem]" role="status" aria-live="polite" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
        {status || (!SpeechRecognitionCtor ? 'El reconocimiento de voz no está disponible en este navegador. Escribe tu respuesta abajo.' : '')}
      </p>

      {/* La alternativa de texto siempre está disponible: sin mic, sin permisos o sin soporte del navegador, el ejercicio sigue siendo accesible. */}
      <details open={showFallback || !SpeechRecognitionCtor} className="border-t border-slate-100 pt-3">
        <summary className="text-indigo-600 cursor-pointer" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
          ¿Prefieres escribir tu respuesta?
        </summary>
        <input
          type="text"
          value={value}
          onChange={e => !submitted && setValue(e.target.value)}
          disabled={submitted}
          aria-label="Escribe la oración en inglés"
          placeholder="Escribe la oración aquí..."
          className={`mt-3 w-full rounded-xl border-2 p-3 outline-none transition-colors ${fallbackInputClass}`}
        />
      </details>

      {!submitted && (
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`w-full py-3.5 rounded-2xl transition-all ${
            value.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontWeight: 600 }}
        >
          Comprobar
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Exercise heading — se autoenfoca al montar (nuevo ejercicio) para no perder
// el foco de teclado cuando el botón "Continuar" desaparece del DOM (WCAG 2.4.3).
// ─────────────────────────────────────────────
function ExerciseHeading({ instruction, autoFocus }: Readonly<{ instruction: string; autoFocus: boolean }>) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <h1 ref={ref} tabIndex={-1} className="text-slate-800 mb-1 outline-none" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
      {instruction}
    </h1>
  );
}

// ─────────────────────────────────────────────
// Feedback Panel
// ─────────────────────────────────────────────
function FeedbackPanel({
  isCorrect,
  exercise,
  userAnswer,
  isAlternate,
  onContinue,
}: Readonly<{
  isCorrect: boolean;
  exercise: ExerciseItem;
  userAnswer: string;
  isAlternate: boolean;
  onContinue: () => void;
}>) {
  let feedbackMessage: string;
  if (isCorrect && isAlternate) {
    feedbackMessage = '¡Tu respuesta también es correcta! ✨';
  } else if (isCorrect) {
    feedbackMessage = '¡Correcto! 🎉';
  } else {
    feedbackMessage = '¡Casi! Revisa la explicación';
  }

  // El botón que el usuario acaba de pulsar (Comprobar / opción de respuesta) se
  // deshabilita o desaparece del DOM al llegar aquí, así que el foco de teclado
  // cae al <body>. Lo recuperamos sobre "Continuar" para no perder el orden de
  // tabulación (WCAG 2.4.3) ni obligar a recorrer la página desde el principio.
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    continueBtnRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      role="status"
      aria-live="assertive"
      className={`fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl shadow-2xl border-t-4 ${
        isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
      }`}
    >
      <div className="max-w-2xl mx-auto px-5 py-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            {isCorrect
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-red-500" />
            }
          </div>
          <div className="flex-1">
            <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`} style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {feedbackMessage}
            </p>
            {!isCorrect && (
              <div className="mt-1 space-y-0.5">
                <p className="text-red-700" style={{ fontSize: '0.75rem' }}>Tu respuesta: <span lang="en" style={{ fontWeight: 600 }}>"{userAnswer}"</span></p>
                <p className="text-green-700" style={{ fontSize: '0.75rem' }}>Respuesta correcta: <span lang="en" style={{ fontWeight: 600 }}>"{exercise.correctAnswer}"</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className={`rounded-xl p-3 mb-4 flex gap-2 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-500'}`} />
          <p className={`${isCorrect ? 'text-green-800' : 'text-red-800'}`} style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
            {exercise.explanation}
          </p>
        </div>

        {/* Continue */}
        <button
          ref={continueBtnRef}
          onClick={onContinue}
          className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors ${
            isCorrect
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          style={{ fontWeight: 600 }}
        >
          Continuar
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Exercise Page
// ─────────────────────────────────────────────
type ExStatus = 'answering' | 'correct' | 'incorrect';

interface ErrorEntry {
  exercise: ExerciseItem;
  userAnswer: string;
}

export function Exercise() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { state, saveProgress, resetLesson } = useApp();

  const lesson = lessonId ? getLessonById(lessonId) : null;
  usePageTitle(lesson ? `${lesson.title} — Ejercicio` : 'Ejercicio');
  const savedProgress = lessonId ? state.lessonProgress[lessonId] : null;

  const [exerciseIdx, setExerciseIdx] = useState<number>(() => {
    if (!savedProgress || savedProgress.completed) return 0;
    return Math.min(savedProgress.exerciseIndex, (lesson?.exercises.length ?? 1) - 1);
  });
  const [status, setStatus] = useState<ExStatus>('answering');
  const [userAnswer, setUserAnswer] = useState('');
  const [isAlternate, setIsAlternate] = useState(false);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [exerciseKey, setExerciseKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // AnimatePresence (mode="wait") retrasa el montaje del siguiente ejercicio hasta
  // que el anterior termina de salir, así que fijar el foco en un efecto atado a
  // exerciseKey en este componente no sirve: el nodo nuevo aún no existe cuando se
  // ejecuta. ExerciseHeading se enfoca a sí mismo en su propio montaje en su lugar;
  // esta bandera solo evita el autofoco en la primera carga de la lección.
  const hasRenderedExerciseRef = useRef(false);
  const autoFocusHeading = hasRenderedExerciseRef.current;
  hasRenderedExerciseRef.current = true;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }, []);
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Start timer on mount; stop on unmount
  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause / resume
  useEffect(() => {
    if (isPaused) stopTimer(); else startTimer();
  }, [isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lesson || !lessonId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Lección no encontrada</p>
          <button onClick={() => navigate('/')} className="mt-3 text-indigo-500">Ir al inicio</button>
        </div>
      </div>
    );
  }

  const exercises = lesson.exercises;
  const current = exercises[exerciseIdx];
  const progress = (exerciseIdx / exercises.length) * 100;
  const timeLabel = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const handleAnswer = (answer: string) => {
    stopTimer();
    const correct = checkAnswer(answer, current.correctAnswer, current.acceptedAnswers);
    const alternate = correct && normalise(answer) !== normalise(current.correctAnswer);
    setUserAnswer(answer);
    setIsAlternate(alternate);
    setStatus(correct ? 'correct' : 'incorrect');
    if (correct) {
      setCorrectCount(c => c + 1);
    } else {
      setErrors(e => [...e, { exercise: current, userAnswer: answer }]);
    }
    saveProgress(lessonId, exerciseIdx);
  };

  const handleContinue = () => {
    const nextIdx = exerciseIdx + 1;
    if (nextIdx >= exercises.length) {
      // All done → navigate to results
      // correctCount & errors already reflect the last answer (state was updated before user clicked Continue)
      const finalScore = Math.round((correctCount / exercises.length) * 100);
      let stars: number;
      if (finalScore >= 90) {
        stars = 3;
      } else if (finalScore >= 60) {
        stars = 2;
      } else {
        stars = 1;
      }
      const baseXp = lesson.xpReward;
      const bonusXp = finalScore === 100 ? 25 : 0;
      const xpEarned = Math.round((finalScore / 100) * baseXp) + bonusXp;
      const timeMinutes = Math.max(1, Math.round(seconds / 60));
      navigate(`/results/${lessonId}`, {
        state: {
          score: finalScore,
          stars,
          xpEarned,
          timeMinutes,
          errors,
          totalExercises: exercises.length,
          correctCount,
        },
      });
    } else {
      setExerciseIdx(nextIdx);
      setStatus('answering');
      setUserAnswer('');
      setIsAlternate(false);
      setExerciseKey(k => k + 1);
      saveProgress(lessonId, nextIdx);
      startTimer();
    }
  };

  const handleExit = () => {
    saveProgress(lessonId, exerciseIdx);
    navigate('/lessons');
  };

  const handleRestart = () => {
    resetLesson(lessonId);
    setExerciseIdx(0);
    setStatus('answering');
    setUserAnswer('');
    setErrors([]);
    setCorrectCount(0);
    setSeconds(0);
    setExerciseKey(k => k + 1);
    setIsPaused(false);
    // timer will be restarted by the isPaused effect (false → startTimer)
  };

  const TYPE_LABELS: Record<string, string> = {
    'multiple-choice': '🔘 Selección múltiple',
    'fill-blank': '✏️ Completar oración',
    'word-order': '🔀 Ordenar palabras',
    'translate': '🌍 Traducción',
    'speaking': '🎤 Pronunciación',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <a href="#exercise-content" className="skip-link">Saltar al ejercicio</a>
      {/* ── TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Close */}
          <button
            onClick={handleExit}
            aria-label="Salir de la lección y volver a lecciones"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Progress bar */}
          <div
            className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"
            role="img"
            aria-label={`Progreso de la lección: ejercicio ${exerciseIdx + 1} de ${exercises.length}`}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Timer */}
          <span className="text-slate-500 flex-shrink-0" aria-label={`Tiempo transcurrido: ${timeLabel}`} style={{ fontWeight: 600, fontSize: '0.8rem', minWidth: '3rem', textAlign: 'right' }}>
            {timeLabel}
          </span>

          {/* Pause */}
          <button
            onClick={() => setIsPaused(true)}
            aria-label="Pausar lección"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Pause className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Exercise counter */}
        <div className="pb-2 px-4 flex justify-center">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {exercises.map((exercise, i) => {
              let dotClass: string;
              if (i < exerciseIdx) {
                dotClass = 'w-2 h-2 bg-indigo-400';
              } else if (i === exerciseIdx) {
                dotClass = 'w-3 h-3 bg-indigo-600';
              } else {
                dotClass = 'w-2 h-2 bg-slate-200';
              }
              return (
                <div
                  key={exercise.id}
                  className={`rounded-full transition-all duration-300 ${dotClass}`}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* ── EXERCISE AREA ── */}
      <main id="exercise-content" tabIndex={-1} className="flex-1 pt-[5.5rem] pb-6">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={exerciseKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Exercise type tag */}
              <div className="mb-3">
                <span className="text-slate-600" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  {TYPE_LABELS[current.type]} · {exerciseIdx + 1}/{exercises.length}
                </span>
              </div>

              {/* Instruction */}
              <ExerciseHeading instruction={current.instruction} autoFocus={autoFocusHeading} />

              {/* Question (for MC & translate show it; fill-blank/word-order show sentence) */}
              {current.question && current.type !== 'translate' && (
                <div className="bg-indigo-50 rounded-2xl p-4 mb-5 border border-indigo-100">
                  <p className="text-indigo-800" style={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 }}>
                    {current.question}
                  </p>
                </div>
              )}

              {/* Exercise component */}
              <div className={status !== 'answering' ? 'pb-44' : ''}>
                {current.type === 'multiple-choice' && (
                  <MultipleChoice key={exerciseKey} exercise={current} onAnswer={handleAnswer} />
                )}
                {current.type === 'fill-blank' && (
                  <FillBlank key={exerciseKey} exercise={current} onAnswer={handleAnswer} />
                )}
                {current.type === 'word-order' && (
                  <WordOrder key={exerciseKey} exercise={current} onAnswer={handleAnswer} />
                )}
                {current.type === 'translate' && (
                  <Translate key={exerciseKey} exercise={current} onAnswer={handleAnswer} />
                )}
                {current.type === 'speaking' && (
                  <Speaking key={exerciseKey} exercise={current} onAnswer={handleAnswer} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── FEEDBACK PANEL ── */}
      <AnimatePresence>
        {status !== 'answering' && (
          <FeedbackPanel
            isCorrect={status === 'correct'}
            exercise={current}
            userAnswer={userAnswer}
            isAlternate={isAlternate}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>

      {/* ── PAUSE MODAL ── */}
      <PauseModal
        isOpen={isPaused}
        lessonTitle={lesson.title}
        onResume={() => setIsPaused(false)}
        onExit={handleExit}
        onRestart={handleRestart}
      />
    </div>
  );
}