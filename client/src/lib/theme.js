export const THEME_STORAGE_KEY = 'mds-theme';

export const DEFAULT_THEME = 'dark';

export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;try{var theme=localStorage.getItem('${THEME_STORAGE_KEY}')||'${DEFAULT_THEME}';var resolved=theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;root.dataset.theme=resolved==='light'?'light':'dark';}catch(e){root.dataset.theme='${DEFAULT_THEME}';}})();`;
