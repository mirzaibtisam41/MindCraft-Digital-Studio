import { createSlice } from '@reduxjs/toolkit';

export const SESSION_END_REASON = {
  EXPIRED: 'expired',
  SIGNED_OUT: 'signed-out',
};

const initialState = {
  token: null,
  hydrated: false,
  endReason: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionRestored(state, action) {
      state.token = action.payload?.accessToken ?? null;
      state.hydrated = true;
    },
    credentialsReceived(state, action) {
      state.token = action.payload.accessToken;
      state.hydrated = true;
      state.endReason = null;
    },
    sessionEnded(state, action) {
      state.token = null;
      state.endReason = action.payload?.reason ?? SESSION_END_REASON.EXPIRED;
    },
  },
});

export const { sessionRestored, credentialsReceived, sessionEnded } =
  authSlice.actions;

export const authReducer = authSlice.reducer;

export const selectToken = (state) => state.auth.token;
export const selectIsHydrated = (state) => state.auth.hydrated;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectSignedOut = (state) =>
  state.auth.endReason === SESSION_END_REASON.SIGNED_OUT;
