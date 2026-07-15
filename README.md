
  # LinguaFlow AF

  This is a code bundle for LinguaFlow AF. The original project is available at https://www.figma.com/design/1W6IQHI3eEeHVb8Pjc9GWY/LinguaFlow-AF.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Contenido: niveles de inglés (MCER)

  La app cubre **los seis niveles del Marco Común Europeo de Referencia**, cada uno con su propia unidad, lecciones y ejercicios:

  | Unidad | Nivel | Contenido |
  |--------|-------|-----------|
  | 1 | A1 — Principiante | Saludos, verbo *to be*, presente simple, familia |
  | 2 | A2 — Elemental | Pasado simple, presente continuo, comida, preguntas *wh-* |
  | 3 | B1 — Intermedio | Pasado continuo, presente perfecto, trabajo, condicionales 1 y 2 |
  | 4 | B2 — Intermedio alto | Presente perfecto continuo, voz pasiva, viajes, estilo indirecto |
  | 5 | C1 — Avanzado | Tercer condicional, phrasal verbs, conectores, modales de deducción |
  | 6 | C2 — Maestría | Expresiones idiomáticas, estructuras enfáticas, registro formal, colocaciones |

  Cada lección incluye 5 tipos de ejercicio (selección múltiple, completar oración, ordenar palabras, traducción y pronunciación) con retroalimentación explicativa inmediata.

  ## Accesibilidad — WCAG 2.2 (nivel AA)

  La interfaz aplica los cuatro principios POUR de las Pautas de Accesibilidad para el Contenido Web 2.2:

  ### Perceptible
  - Contraste de texto ≥ 4.5:1 y de componentes ≥ 3:1 (criterios 1.4.3 y 1.4.11).
  - El color nunca es la única señal: aciertos y errores se comunican también con iconos, texto y anuncios `aria-live` (1.4.1).
  - Nombres accesibles en todos los elementos no textuales: estrellas, barras de progreso (`role="progressbar"` con `aria-valuenow`), gráficos radiales e iconos; los elementos decorativos llevan `aria-hidden` (1.1.1).
  - Modo de alto contraste activable desde el perfil, y tipografía Atkinson Hyperlegible de alta legibilidad.

  ### Operable
  - Toda la interfaz es manejable por teclado: las tarjetas interactivas son botones reales y los modales atrapan el foco y se cierran con `Escape` (2.1.1, 2.1.2).
  - Enlaces «saltar al contenido» en el layout y en la pantalla de ejercicios (2.4.1).
  - Foco visible con contorno de 3 px (2.4.7, 2.4.11) y objetivos táctiles de al menos 24×24 px (2.5.8, nuevo en WCAG 2.2).
  - El temporizador de la lección puede pausarse en cualquier momento (2.2.1) y se respeta `prefers-reduced-motion` (2.3.3).

  ### Comprensible
  - `lang="es"` en el documento y `lang="en"` en el contenido en inglés para una pronunciación correcta de los lectores de pantalla (3.1.1, 3.1.2).
  - Título de página propio en cada vista (2.4.2) y navegación consistente en todas las pantallas (3.2.3).
  - Errores identificados con texto y explicación gramatical, no solo con color (3.3.1); las instrucciones acompañan cada ejercicio (3.3.2).

  ### Robusto
  - HTML semántico (`header`, `nav`, `main`, listas) y ARIA correcto: `role="dialog"` con `aria-modal`, `role="switch"` con `aria-checked`, `aria-pressed` en filtros y `aria-expanded` en desplegables (4.1.2).
  - Mensajes de estado anunciados con `role="status"` y `aria-live` sin mover el foco (4.1.3).
  - El ejercicio de pronunciación siempre ofrece alternativa de texto cuando el reconocimiento de voz no está disponible.
