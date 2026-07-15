import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Play, Lock, CheckCircle2, ChevronRight, Flame, Clock, Trophy } from 'lucide-react';
import { useApp, getLevel, getXpProgress } from '../context/AppContext';
import { units, getLessonById } from '../data/lessons';
import { usePageTitle } from '../hooks/usePageTitle';

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${count} de 3 estrellas`}>
      {[1, 2, 3].map(i => (
        <span key={i} aria-hidden="true" className={`text-xs ${i <= count ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
}

// Zigzag positions (normalized 0..1) cycling per lesson
const ZIGZAG = [0.25, 0.65, 0.80, 0.40, 0.25, 0.70, 0.85, 0.35];

export function Dashboard() {
  const { state, isLessonLocked, getInProgressLesson } = useApp();
  const navigate = useNavigate();
  usePageTitle('Inicio');

  const level = getLevel(state.user.xp);
  const xpInfo = getXpProgress(state.user.xp);
  const continueLessonId = getInProgressLesson();
  const continueLesson = continueLessonId ? getLessonById(continueLessonId) : null;

  const hours = Math.floor(state.user.totalMinutes / 60);
  const mins = state.user.totalMinutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const completedCount = Object.values(state.lessonProgress).filter(p => p.completed).length;

  return (
    <div className="space-y-5 pb-4">
      {/* ── HERO GREETING ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-5 text-white shadow-lg"
      >
        <p className="text-indigo-100 mb-1" style={{ fontSize: '0.8rem' }}>Bienvenido/a de vuelta,</p>
        <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.4rem' }}>{state.user.name} <span aria-hidden="true">👋</span></h1>

        {/* Level progress */}
        <div className="bg-white/20 rounded-2xl p-3">
          <div className="flex justify-between items-center mb-1.5">
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Nivel {level}</span>
            <span style={{ fontSize: '0.72rem' }} className="text-indigo-100">{xpInfo.current} / {xpInfo.needed} XP</span>
          </div>
          <div
            className="h-2 bg-white/30 rounded-full overflow-hidden"
            role="progressbar"
            aria-label={`Progreso del nivel ${level}`}
            aria-valuenow={xpInfo.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${xpInfo.current} de ${xpInfo.needed} XP`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.percent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-indigo-100 mt-1.5" style={{ fontSize: '0.75rem' }}>
            {xpInfo.needed - xpInfo.current} XP para {getLevel(state.user.xp + (xpInfo.needed - xpInfo.current))}
          </p>
        </div>
      </motion.div>

      {/* ── STATS ROW ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-slate-100" role="group" aria-label={`${state.user.streak} días racha`}>
          <div className="flex justify-center mb-1.5">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
            </div>
          </div>
          <p className="text-slate-800" aria-hidden="true" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{state.user.streak}</p>
          <p className="text-slate-600" aria-hidden="true" style={{ fontSize: '0.75rem' }}>días racha</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-slate-100" role="group" aria-label={`${timeLabel} de tiempo total`}>
          <div className="flex justify-center mb-1.5">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" aria-hidden="true" />
            </div>
          </div>
          <p className="text-slate-800" aria-hidden="true" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{timeLabel}</p>
          <p className="text-slate-600" aria-hidden="true" style={{ fontSize: '0.75rem' }}>tiempo total</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-slate-100" role="group" aria-label={`${completedCount} lecciones completadas`}>
          <div className="flex justify-center mb-1.5">
            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            </div>
          </div>
          <p className="text-slate-800" aria-hidden="true" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{completedCount}</p>
          <p className="text-slate-600" aria-hidden="true" style={{ fontSize: '0.75rem' }}>lecciones</p>
        </div>
      </motion.div>

      {/* ── CONTINUE CARD ── */}
      {continueLesson && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate(`/exercise/${continueLesson.id}`)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all group text-left"
          >
            <div className={`w-12 h-12 ${continueLesson.colorClass} rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm`} aria-hidden="true">
              {continueLesson.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-indigo-700 mb-0.5" style={{ fontSize: '0.7rem', fontWeight: 600 }}>▶ CONTINUAR DONDE LO DEJASTE</p>
              <p className="text-slate-800 truncate" style={{ fontWeight: 600 }}>{continueLesson.title}</p>
              <p className="text-slate-600" style={{ fontSize: '0.75rem' }}>{continueLesson.subtitle}</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors flex-shrink-0" aria-hidden="true">
              <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors" />
            </div>
          </button>
        </motion.div>
      )}

      {/* ── LEARNING PATH ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-slate-700 mb-4" style={{ fontWeight: 700, fontSize: '1rem' }}>Ruta de Aprendizaje</h2>

        <div className="space-y-8">
          {units.map((unit) => {
            const allCompleted = unit.lessons.every(l => state.lessonProgress[l.id]?.completed);
            return (
              <div key={unit.id}>
                {/* Unit header */}
                <div className={`bg-gradient-to-r ${unit.gradientFrom} ${unit.gradientTo} rounded-2xl p-4 mb-5 flex items-center justify-between`}>
                  <div>
                    <p className="text-white" style={{ fontSize: '0.7rem', fontWeight: 600 }}>{unit.title} · {unit.level}</p>
                    <h3 className="text-white" style={{ fontWeight: 700 }}>{unit.subtitle}</h3>
                  </div>
                  {allCompleted && (
                    <div className="w-8 h-8 bg-white/30 rounded-xl flex items-center justify-center" role="img" aria-label="Unidad completada">
                      <CheckCircle2 className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Lesson path (zigzag) */}
                <div className="relative" style={{ minHeight: `${unit.lessons.length * 90}px` }}>
                  {/* SVG Curved path */}
                  <svg
                    className="absolute inset-0 w-full pointer-events-none"
                    style={{ height: `${unit.lessons.length * 90}px` }}
                    preserveAspectRatio="none"
                    viewBox={`0 0 100 ${unit.lessons.length * 90}`}
                    aria-hidden="true"
                  >
                    {unit.lessons.slice(0, -1).map((_, i) => {
                      const x1 = ZIGZAG[i % ZIGZAG.length] * 100;
                      const y1 = i * 90 + 32;
                      const x2 = ZIGZAG[(i + 1) % ZIGZAG.length] * 100;
                      const y2 = (i + 1) * 90 + 32;
                      return (
                        <path
                          key={i}
                          d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="2.5"
                          strokeDasharray="5 4"
                        />
                      );
                    })}
                  </svg>

                  {/* Lesson nodes */}
                  {unit.lessons.map((lesson, i) => {
                    const xPct = ZIGZAG[i % ZIGZAG.length];
                    const progress = state.lessonProgress[lesson.id];
                    const locked = isLessonLocked(lesson.id);
                    const completed = progress?.completed ?? false;
                    const inProgress = !completed && (progress?.exerciseIndex ?? 0) > 0;
                    const stars = progress?.stars ?? 0;

                    return (
                      <div
                        key={lesson.id}
                        className="absolute"
                        style={{ left: `calc(${xPct * 100}% - 32px)`, top: `${i * 90}px` }}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Node button */}
                          <button
                            onClick={() => !locked && navigate(`/exercise/${lesson.id}`)}
                            disabled={locked}
                            aria-label={`Lección: ${lesson.title}, nivel ${lesson.level}. ${
                              locked
                                ? 'Bloqueada, completa la lección anterior para desbloquearla'
                                : completed
                                ? `Completada con ${stars} de 3 estrellas`
                                : inProgress
                                ? 'En curso'
                                : 'Disponible'
                            }`}
                            className={`w-16 h-16 rounded-2xl shadow-md flex flex-col items-center justify-center transition-all ${
                              locked
                                ? 'bg-slate-200 cursor-not-allowed shadow-none'
                                : completed
                                ? `${lesson.colorClass} shadow-lg hover:scale-105 active:scale-95`
                                : inProgress
                                ? `${lesson.colorClass} opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 ring-4 ring-offset-2 ring-indigo-300`
                                : `${lesson.colorClass} opacity-75 hover:opacity-100 hover:scale-105 active:scale-95`
                            }`}
                          >
                            {locked ? (
                              <Lock className="w-6 h-6 text-slate-500" aria-hidden="true" />
                            ) : (
                              <span className="text-xl" aria-hidden="true">{lesson.emoji}</span>
                            )}
                            {inProgress && !locked && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5 animate-pulse" aria-hidden="true" />
                            )}
                          </button>

                          {/* Stars */}
                          {!locked && completed && <StarRow count={stars} />}
                          {!locked && inProgress && (
                            <div className="flex items-center gap-1 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                              <Play className="w-2.5 h-2.5 text-indigo-500 fill-indigo-500" aria-hidden="true" />
                              <span className="text-indigo-700" style={{ fontSize: '0.75rem', fontWeight: 600 }}>EN CURSO</span>
                            </div>
                          )}

                          {/* Label */}
                          <p
                            className={`text-center max-w-[90px] leading-tight ${locked ? 'text-slate-500' : 'text-slate-700'}`}
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            {lesson.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}