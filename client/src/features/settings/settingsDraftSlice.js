import { createSlice } from '@reduxjs/toolkit';
import { sessionEnded } from '@/features/auth/authSlice';

const initialState = { changes: {} };

const settingsDraftSlice = createSlice({
  name: 'settingsDraft',
  initialState,
  reducers: {
    settingChanged(state, action) {
      state.changes[action.payload.key] = action.payload.value;
    },
    settingsDiscarded(state) {
      state.changes = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => initialState);
  },
});

export const { settingChanged, settingsDiscarded } = settingsDraftSlice.actions;

export const settingsDraftReducer = settingsDraftSlice.reducer;

export const selectDraftChanges = (state) => state.settingsDraft.changes;
