import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { authReducer, sessionEnded } from '@/features/auth/authSlice';
import { settingsDraftReducer } from '@/features/settings/settingsDraftSlice';
import { baseApi } from '@/store/baseApi';

const sessionListener = createListenerMiddleware();

sessionListener.startListening({
  actionCreator: sessionEnded,
  effect: (_action, api) => {
    api.dispatch(baseApi.util.resetApiState());
  },
});

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      settingsDraft: settingsDraftReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(sessionListener.middleware)
        .concat(baseApi.middleware),
  });
}
