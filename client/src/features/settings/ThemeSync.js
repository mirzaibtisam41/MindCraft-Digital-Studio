'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { selectDraftChanges } from '@/features/settings/settingsDraftSlice';
import { applyAppearance, rememberAppearance } from '@/lib/theme';

export function ThemeSync() {
  const { data: saved } = useGetSettingsQuery();
  const changes = useSelector(selectDraftChanges);

  const savedTheme = saved?.theme;
  const savedReduceMotion = saved?.reduceMotion;
  const theme = changes.theme ?? savedTheme;
  const reduceMotion = changes.reduceMotion ?? savedReduceMotion;

  useEffect(() => {
    if (theme === undefined || reduceMotion === undefined) return;

    applyAppearance({ theme, reduceMotion });

    if (theme !== 'system') return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyAppearance({ theme, reduceMotion });

    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, [theme, reduceMotion]);

  useEffect(() => {
    if (savedTheme === undefined || savedReduceMotion === undefined) return;

    rememberAppearance({
      theme: savedTheme,
      reduceMotion: savedReduceMotion,
    });
  }, [savedTheme, savedReduceMotion]);

  return null;
}
