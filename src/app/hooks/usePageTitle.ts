import { useEffect } from 'react';

/**
 * WCAG 2.2 — 2.4.2 "Página titulada" (nivel A): cada vista anuncia un
 * título propio para que lectores de pantalla y pestañas del navegador
 * identifiquen dónde está el usuario.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · LinguaFlow` : 'LinguaFlow';
  }, [title]);
}
