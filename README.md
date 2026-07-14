# LinguaFlow

App de inglés B1 (multipágina) construida con **Vite**, con una interfaz minimalista,
tipografía accesible, modo de alto contraste, ejercicios estilo Duolingo (incluida
pronunciación) y los 4 principios de accesibilidad (WCAG POUR / WCAG 2.2):

## Cómo ejecutar

```bash
npm install
npm run dev       # servidor de desarrollo con recarga en caliente
npm run build      # genera dist/ listo para producción
npm run preview    # sirve dist/ para probarlo como en producción
```

## Estructura

```
index.html             → onboarding interactivo de 5 pasos
dashboard.html
lecciones.html          → lista de lecciones con filtros funcionales
practica.html           → motor de ejercicios (opción múltiple, completar,
                           ordenar palabras y pronunciación)
progreso.html
config.html
src/css/styles.css      → estilos, tema, alto contraste, animaciones
src/js/app.js           → estado compartido, motor de ejercicios, filtros
src/js/icons.js         → iconos propios en SVG (sin emoji)
public/assets/fonts/    → Atkinson Hyperlegible (tipografía accesible, autoalojada)
public/assets/video/    → archivos estáticos (video, subtítulos)
vite.config.js          → build multipágina (rollupOptions.input)
```

## Accesibilidad (WCAG 2.2)

- **Perceptible**: tipografía Atkinson Hyperlegible (diseñada para baja visión),
  contraste verificado, feedback de ejercicios combinado con icono + texto (nunca solo
  color, criterio 1.4.1), subtítulos y transcripción del video.
- **Operable**: navegación e iconos con objetivo mínimo de 44px (2.5.8), cabecera
  fija sin obstruir el foco (2.4.11), ejercicio de ordenar palabras es táctil —no
  requiere arrastrar— (2.5.7), modal de pausa con `role="dialog"`, foco atrapado y
  cierre con Escape, animaciones respetan `prefers-reduced-motion` (2.3.3).
- **Comprensible**: estado compartido (XP, racha, lecciones) consistente en todas
  las páginas, filtros de lecciones con resultado anunciado por `aria-live`,
  ejercicio de pronunciación siempre incluye una alternativa de texto para quien no
  tenga micrófono o use un navegador sin reconocimiento de voz.
- **Robusto**: HTML válido, módulos ES, build verificado con `npm run build`.

## Nota

`public/assets/video/tutorial.mp4` no estaba incluido en el proyecto original: el
`<video>` referencia esa ruta pero, si el archivo no existe, el navegador mostrará el
texto alternativo y la transcripción igualmente. Agrega el archivo de video ahí cuando
lo tengas disponible.
