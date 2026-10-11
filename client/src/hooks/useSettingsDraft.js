'use client';

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/settingsApi';
import {
  selectDraftChanges,
  settingChanged,
  settingsDiscarded,
} from '@/features/settings/settingsDraftSlice';

export function useSettingsDraft() {
  const dispatch = useDispatch();
  const changes = useSelector(selectDraftChanges);
  const { data: saved, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const dirtyChanges = useMemo(() => {
    if (!saved) return {};

    return Object.fromEntries(
      Object.entries(changes).filter(([key, value]) => value !== saved[key]),
    );
  }, [changes, saved]);

  const isDirty = Object.keys(dirtyChanges).length > 0;
  const settings = saved ? { ...saved, ...changes } : null;

  function change(key, value) {
    dispatch(settingChanged({ key, value }));
  }

  function discard() {
    dispatch(settingsDiscarded());
  }

  async function save() {
    try {
      await updateSettings(dirtyChanges).unwrap();
      dispatch(settingsDiscarded());
      toast.success('Settings saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return {
    settings,
    isLoading,
    isError,
    isDirty,
    isSaving,
    change,
    discard,
    save,
    refetch,
  };
}
