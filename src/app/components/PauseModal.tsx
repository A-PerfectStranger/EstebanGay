import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, LogOut, RotateCcw, BookOpen } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  lessonTitle: string;
  onResume: () => void;
  onExit: () => void;
  onRestart: () => void;
}

export function PauseModal({ isOpen, lessonTitle, onResume, onExit, onRestart }: PauseModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const resumeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<Element | null>(null);

  // Mueve el foco al abrir y lo devuelve al elemento anterior al cerrar.
  useEffect(() => {
    if (isOpen) {
      lastFocused.current = document.activeElement;
      resumeBtnRef.current?.focus();
    } else if (lastFocused.current instanceof HTMLElement) {
      lastFocused.current.focus();
    }
  }, [isOpen]);

  // Escape retoma la lección y Tab queda atrapado dentro del diálogo.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onResume();
        return;
      }
      if (e.key === 'Tab' && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>('button');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onResume]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              ref={cardRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-modal-title"
              aria-describedby="pause-modal-lesson"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h2 id="pause-modal-title" className="text-white" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Lección en Pausa</h2>
                <p id="pause-modal-lesson" className="text-indigo-200 mt-1" style={{ fontSize: '0.8rem' }}>{lessonTitle}</p>
              </div>

              {/* Actions */}
              <div className="p-5 space-y-3">
                <button
                  ref={resumeBtnRef}
                  onClick={onResume}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2.5 transition-colors shadow-sm"
                  style={{ fontWeight: 600 }}
                >
                  <Play className="w-4 h-4 fill-white" aria-hidden="true" />
                  Continuar lección
                </button>

                <button
                  onClick={onExit}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3.5 flex items-center justify-center gap-2.5 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Guardar y salir
                </button>

                <button
                  onClick={onRestart}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl py-3.5 flex items-center justify-center gap-2.5 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Reiniciar lección
                </button>
              </div>

              {/* Tip */}
              <p className="text-center text-slate-400 pb-5" style={{ fontSize: '0.73rem' }}>
                Tu progreso se guarda automáticamente
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
