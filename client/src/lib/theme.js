export const THEME_STORAGE_KEY = 'mds-theme';

export const REDUCE_MOTION_STORAGE_KEY = 'mds-reduce-motion';

export const DEFAULT_THEME = 'dark';

export function resolveTheme(theme) {
  if (theme !== 'system') return theme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyAppearance({ theme, reduceMotion }) {
  const root = document.documentElement;

  root.dataset.theme = resolveTheme(theme);
  root.dataset.reduceMotion = String(reduceMotion);
}

export function rememberAppearance({ theme, reduceMotion }) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, String(reduceMotion));
  } catch {
    return;
  }
}

export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;try{var theme=localStorage.getItem('${THEME_STORAGE_KEY}')||'${DEFAULT_THEME}';var reduce=localStorage.getItem('${REDUCE_MOTION_STORAGE_KEY}')==='true';var resolved=theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;root.dataset.theme=resolved==='light'?'light':'dark';root.dataset.reduceMotion=String(reduce);}catch(e){root.dataset.theme='${DEFAULT_THEME}';root.dataset.reduceMotion='false';}})();`;
