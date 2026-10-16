const DEFAULT_THEME = 'dark';
const THEME_KEY = 'mds-theme';
const REDUCE_MOTION_KEY = 'mds-reduce-motion';

export const THEME_CHOICES = ['dark', 'light', 'system'];

export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;try{var theme=localStorage.getItem('${THEME_KEY}')||'${DEFAULT_THEME}';var resolved=theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;root.dataset.theme=resolved==='light'?'light':'dark';if(localStorage.getItem('${REDUCE_MOTION_KEY}')==='true'){root.dataset.reduceMotion='true';}}catch(e){root.dataset.theme='${DEFAULT_THEME}';}})();`;

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

export function readAppearance() {
  const theme = readStorage(THEME_KEY);

  return {
    theme: THEME_CHOICES.includes(theme) ? theme : DEFAULT_THEME,
    reduceMotion: readStorage(REDUCE_MOTION_KEY) === 'true',
  };
}

export function applyAppearance({ theme, reduceMotion }) {
  const root = document.documentElement;
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  root.dataset.theme = resolved === 'light' ? 'light' : 'dark';

  if (reduceMotion) {
    root.dataset.reduceMotion = 'true';
  } else {
    delete root.dataset.reduceMotion;
  }

  writeStorage(THEME_KEY, theme);
  writeStorage(REDUCE_MOTION_KEY, String(reduceMotion));
}
