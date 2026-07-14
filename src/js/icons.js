// Conjunto de iconos propios (trazo, 24x24, currentColor) que sustituye a los emoji.
// Cada entrada es el contenido interior de un <svg>; icon() arma el elemento completo.
const PATHS = {
    home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>',
    book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
    'bar-chart': '<path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-7"/><path d="M3 20h18"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M3 12h2.4M18.6 12H21M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/>',
    flame: '<path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.7 2 4a5 5 0 0 1-10 0c0-4 2-5 3-9 .3 1 .8 1.6 1.4 2.2.3-2 .1-3.6.6-5.2Z"/>',
    zap: '<path d="M13 3 5 13.5h5.2L11 21l8-10.5h-5.2Z"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5C3 8.4 4.4 10 6.5 10"/><path d="M17 5h2.5A1.5 1.5 0 0 1 21 6.5C21 8.4 19.6 10 17.5 10"/><path d="M10 15v2h4v-2M9 20.5h6M12 17v3.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'check-circle': '<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
    'x-circle': '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><path d="M12 17v4M9 21h6"/>',
    'mic-off': '<path d="M9 5.5a3 3 0 0 1 6 0V11m0 3a3 3 0 0 1-5.7-1.3"/><path d="M6 11a6 6 0 0 0 8.7 5.4M18 11a6 6 0 0 1-1 3.3"/><path d="M12 17v4M9 21h6M3 3l18 18"/>',
    'chevron-left': '<path d="m15 5-7 7 7 7"/>',
    'chevron-right': '<path d="m9 5 7 7-7 7"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 2v-8.5Z"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4.5-6 7-6s6 2 7 6"/>',
    play: '<path d="M8 5.5v13l11-6.5Z"/>',
    pause: '<rect x="7" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    'rotate-ccw': '<path d="M4 4v6h6"/><path d="M4.6 15A8 8 0 1 0 6 7.3L4 10"/>',
    'volume-2': '<path d="M5 9.5v5h3.5L14 19V5L8.5 9.5Z"/><path d="M17.5 9a4 4 0 0 1 0 6M20 6.5a8 8 0 0 1 0 11"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    star: '<path d="M12 3.5l2.5 5.4 5.8.6-4.4 4 1.3 5.8L12 16.3 6.8 19.3l1.3-5.8-4.4-4 5.8-.6Z"/>',
    lightbulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
    logo: '<path d="M12 3 4.5 7v6.5C4.5 17.6 7.8 20.7 12 21.5c4.2-.8 7.5-3.9 7.5-8V7Z"/><path d="m8.7 12 2.3 2.3 4.3-4.6"/>',
    'shuffle': '<path d="M4 6h3.5L16 17h4"/><path d="m17 4 3 2-3 2M4 17h3.5L11 12.5"/><path d="m17 20 3-2-3-2"/>',
    dumbbell: '<path d="M4 10v4M2.5 9v6M8 7v10"/><path d="M20 10v4M21.5 9v6M16 7v10"/><path d="M8 12h8"/>',
};

/**
 * Devuelve el marcado SVG de un icono.
 * @param {string} name clave del icono (ver PATHS)
 * @param {{label?:string, className?:string, size?:number}} [opts]
 */
export function icon(name, opts = {}) {
    const inner = PATHS[name];
    if (!inner) return '';
    const { label, className = '', size = 22 } = opts;
    const a11y = label
        ? `role="img" aria-label="${label}"`
        : 'aria-hidden="true" focusable="false"';
    const cls = className ? ` class="icon ${className}"` : ' class="icon"';
    return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${inner}</svg>`;
}

export const ICON_NAMES = Object.keys(PATHS);
