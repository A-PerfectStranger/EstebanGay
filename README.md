# LinguaFlow

App de inglés B1 (multipágina) migrada a **Vite**, manteniendo el HTML/CSS/JS original y reforzando los 4 principios de accesibilidad (WCAG POUR):

## Cómo ejecutar

```bash
npm install
npm run dev       # servidor de desarrollo con recarga en caliente
npm run build      # genera dist/ listo para producción
npm run preview    # sirve dist/ para probarlo como en producción
```

## Estructura

```
index.html            → páginas (una por cada entrada en vite.config.js)
onboarding2.html
dashboard.html
lecciones.html
practica.html
progreso.html
config.html
src/css/styles.css     → estilos
src/js/app.js          → lógica de lecciones, práctica y configuración
public/assets/         → archivos estáticos (video, subtítulos, imágenes)
vite.config.js          → build multipágina (rollupOptions.input)
```

## Qué se hizo para cumplir Perceptible, Operable, Comprensible y Robusto

- **Perceptible**: se corrigió el contraste de dos colores de texto secundario que no
  alcanzaban 4.5:1 (`--muted` y el texto de las tarjetas de lección). El video conserva
  pista de subtítulos (`.vtt`) y transcripción textual como alternativa.
- **Operable**: todas las páginas cargan ahora `app.js` (antes faltaba en 4 de las 7),
  así que el modo de alto contraste y la navegación por teclado son consistentes en
  todo el sitio, no solo en algunas pantallas.
- **Comprensible**: el botón "Guardar configuración" ahora persiste los datos
  (`localStorage`) y muestra una confirmación (`role="status"`, `aria-live="polite"`)
  visible y anunciada por lectores de pantalla. La velocidad de lectura configurada se
  aplica de verdad al botón "Escuchar explicación".
- **Robusto**: proyecto empaquetado con Vite (HTML válido, módulos ES, build
  verificado con `npm run build`), en vez de archivos sueltos sin herramienta de
  compilación ni control de errores.

## Nota

`public/assets/video/tutorial.mp4` no estaba incluido en el proyecto original: el
`<video>` referencia esa ruta pero, si el archivo no existe, el navegador mostrará el
texto alternativo y la transcripción igualmente. Agrega el archivo de video ahí cuando
lo tengas disponible.
