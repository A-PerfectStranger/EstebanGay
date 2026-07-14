import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Zap, Star, MessageSquare, BarChart2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const slides = [
  {
    icon: '🌟',
    title: '¡Bienvenido/a a LinguaFlow!',
    description: 'Aprende inglés de manera efectiva con lecciones interactivas, feedback inmediato y un sistema de progresión motivador.',
    color: 'from-indigo-500 to-purple-600',
    features: [
      { icon: <Zap className="w-4 h-4" />, text: 'Aprende a tu propio ritmo' },
      { icon: <Star className="w-4 h-4" />, text: 'Gana XP y sube de nivel' },
      { icon: <BarChart2 className="w-4 h-4" />, text: 'Sigue tu progreso' },
    ],
  },
  {
    icon: '🎯',
    title: 'Tipos de ejercicios',
    description: 'Practica con ejercicios variados que hacen el aprendizaje efectivo y entretenido.',
    color: 'from-emerald-500 to-teal-600',
    features: [
      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Selección múltiple' },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Completa la oración' },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Ordena las palabras' },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Traduce al inglés' },
    ],
  },
  {
    icon: '⚡',
    title: 'Feedback inmediato',
    description: 'Después de cada respuesta recibirás una explicación detallada para que entiendas el "por qué" de cada respuesta.',
    color: 'from-orange-500 to-amber-600',
    features: [
      { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: 'Correcto: refuerzo positivo' },
      { icon: <MessageSquare className="w-4 h-4 text-orange-500" />, text: 'Incorrecto: explicación gramatical' },
      { icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, text: 'Se aceptan sinónimos y variantes' },
    ],
  },
  {
    icon: '🗺️',
    title: 'Tu ruta de aprendizaje',
    description: 'Sigue una ruta estructurada desde A1 hasta C1, desbloqueando niveles y contenido a medida que avanzas.',
    color: 'from-pink-500 to-rose-600',
    features: [
      { icon: <Zap className="w-4 h-4" />, text: 'Niveles A1 → C1' },
      { icon: <Star className="w-4 h-4" />, text: 'Gana 1–3 estrellas por lección' },
      { icon: <BarChart2 className="w-4 h-4" />, text: 'Racha de días de estudio' },
    ],
  },
  {
    icon: '🚀',
    title: '¡Empecemos a aprender!',
    description: 'Todo listo para comenzar tu viaje hacia el dominio del inglés. ¡Recuerda que la constancia es la clave!',
    color: 'from-indigo-600 to-violet-700',
    features: [
      { icon: <CheckCircle2 className="w-4 h-4" />, text: '5–10 min al día son suficientes' },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Pausa cuando quieras' },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Tu progreso se guarda siempre' },
    ],
  },
];

export function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { setOnboardingCompleted } = useApp();

  const finish = () => {
    setOnboardingCompleted();
    navigate('/', { replace: true });
  };

  const next = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1);
    else finish();
  };
  const prev = () => { if (current > 0) setCurrent(c => c - 1); };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Skip */}
      <button
        onClick={finish}
        aria-label="Saltar la introducción e ir al inicio"
        className="fixed top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        style={{ fontSize: '0.85rem', fontWeight: 500 }}
      >
        Saltar
      </button>

      <div className="w-full max-w-sm">
        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6"
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`Paso ${current + 1} de ${slides.length}: ${slide.title}`}
          >
            {/* Gradient top */}
            <div className={`bg-gradient-to-br ${slide.color} p-8 flex flex-col items-center text-center`}>
              <span className="text-5xl mb-4" aria-hidden="true">{slide.icon}</span>
              <h1 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '1.3rem', lineHeight: 1.3 }}>{slide.title}</h1>
              <p className="text-white/80" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{slide.description}</p>
            </div>

            {/* Features */}
            <div className="p-6 space-y-3">
              {slide.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <div className="text-indigo-500 flex-shrink-0" aria-hidden="true">{f.icon}</div>
                  <span className="text-slate-700" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6" role="tablist" aria-label="Progreso de bienvenida">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-current={i === current ? 'step' : undefined}
              aria-label={`Ir al paso ${i + 1} de ${slides.length}: ${s.title}`}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 h-2.5 bg-indigo-500' : 'w-2.5 h-2.5 bg-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={prev}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <ChevronLeft className="w-5 h-5" />
              Atrás
            </button>
          )}
          <button
            onClick={next}
            className={`flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors shadow-sm ${isLast ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : ''}`}
            style={{ fontWeight: 600 }}
          >
            {isLast ? '¡Comenzar!' : 'Siguiente'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
