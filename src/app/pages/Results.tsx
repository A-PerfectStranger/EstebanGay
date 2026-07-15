import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { RotateCcw, ChevronRight, Home, Trophy, Clock, Target, Zap, XCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { getLessonById, getUnitForLesson } from '../data/lessons';
import { usePageTitle } from '../hooks/usePageTitle';

interface ResultState {
  score: number;
  stars: number;
  xpEarned: number;
  timeMinutes: number;
  errors: { exercise: { id: string; question?: string; correctAnswer: string; explanation: string }; userAnswer: string }[];
  totalExercises: number;
  correctCount: number;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-2 justify-center" role="img" aria-label={`Has ganado ${count} de 3 estrellas`}>
      {[1, 2, 3].map(i => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 400 }}
          aria-hidden="true"
          className={`text-3xl ${i <= count ? 'filter-none' : 'grayscale opacity-30'}`}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}

export function Results() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLesson, resetLesson } = useApp();
  const confettiFired = useRef(false);
  usePageTitle('Resultados de la lección');

  const resultData = location.state as ResultState | null;
  const lesson = lessonId ? getLessonById(lessonId) : null;
  const unit = lessonId ? getUnitForLesson(lessonId) : null;

  const score = resultData?.score ?? 0;
  const stars = resultData?.stars ?? 1;
  const xpEarned = resultData?.xpEarned ?? 0;
  const timeMinutes = resultData?.timeMinutes ?? 0;
  const errors = resultData?.errors ?? [];
  const correctCount = resultData?.correctCount ?? 0;
  const totalExercises = resultData?.totalExercises ?? 5;

  useEffect(() => {
    if (!confettiFired.current && score >= 70) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({
          particleCount: score === 100 ? 200 : 100,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        });
      }, 400);
    }
    if (lessonId && resultData) {
      completeLesson(lessonId, score, stars, xpEarned, timeMinutes);
    }
  }, []);

  const handleRetry = () => {
    if (lessonId) {
      resetLesson(lessonId);
      navigate(`/exercise/${lessonId}`, { replace: true });
    }
  };

  const handleNext = () => {
    navigate('/lessons');
  };

  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = score >= 80 ? 'from-green-400 to-emerald-500' : score >= 60 ? 'from-amber-400 to-orange-500' : 'from-red-400 to-rose-500';
  const scoreRing = score >= 80 ? 'ring-green-300' : score >= 60 ? 'ring-amber-300' : 'ring-red-300';
  const scoreMsg = score === 100 ? '¡Perfecto! 🏆' : score >= 80 ? '¡Excelente! 🎉' : score >= 60 ? '¡Bien hecho! 👍' : 'Sigue practicando 💪';

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/')} className="text-indigo-500">Ir al inicio</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button onClick={() => navigate('/')} aria-label="Volver al inicio" className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
          <Home className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="text-center">
          <p className="text-slate-600" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{unit?.title ?? ''}</p>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lesson.title}</h1>
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5 pb-10">
        {/* Score circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center"
        >
          <p className="text-slate-700 mb-3" role="status" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{scoreMsg}</p>

          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${scoreBg} ring-8 ${scoreRing} flex flex-col items-center justify-center shadow-lg mb-4`}
            role="img"
            aria-label={`Puntuación: ${score} por ciento de aciertos`}
          >
            <Trophy className="w-5 h-5 text-white/80 mb-0.5" aria-hidden="true" />
            <span className="text-white" aria-hidden="true" style={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1 }}>{score}%</span>
            <span className="text-white/80" aria-hidden="true" style={{ fontSize: '0.7rem', fontWeight: 500 }}>aciertos</span>
          </div>

          <StarDisplay count={stars} />
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-slate-100">
            <div className="flex justify-center mb-1.5">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{correctCount}/{totalExercises}</p>
            <p className="text-slate-600" style={{ fontSize: '0.68rem' }}>correctas</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-slate-100">
            <div className="flex justify-center mb-1.5">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <p className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{timeMinutes}m</p>
            <p className="text-slate-600" style={{ fontSize: '0.68rem' }}>tiempo</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-slate-100">
            <div className="flex justify-center mb-1.5">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <p className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.1rem' }}>+{xpEarned}</p>
            <p className="text-slate-600" style={{ fontSize: '0.68rem' }}>XP ganados</p>
          </div>
        </motion.div>

        {/* Error review */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
              <h2 className="text-slate-700" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                Errores a repasar ({errors.length})
              </h2>
            </div>
            <ul className="divide-y divide-slate-100 list-none">
              {errors.map((err, i) => (
                <li key={i} className="px-4 py-3">
                  <p className="text-slate-600 mb-1.5" style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                    {err.exercise.question ?? err.exercise.correctAnswer}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-red-700" style={{ fontSize: '0.78rem' }}>Tu respuesta: <span lang="en" style={{ fontWeight: 600 }}>"{err.userAnswer}"</span></span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-green-700" style={{ fontSize: '0.78rem' }}>Correcto: <span lang="en" style={{ fontWeight: 600 }}>"{err.exercise.correctAnswer}"</span></span>
                  </div>
                  <p className="text-slate-600 pl-5" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {err.exercise.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-3"
        >
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors shadow-sm"
            style={{ fontWeight: 600 }}
          >
            Continuar al siguiente nivel
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={handleRetry}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reintentar lección
          </button>
        </motion.div>
      </main>
    </div>
  );
}
