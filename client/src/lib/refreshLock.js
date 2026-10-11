const REFRESH_LOCK_NAME = 'mindcraft-refresh';

export function withRefreshLock(run) {
  if (globalThis.navigator?.locks) {
    return globalThis.navigator.locks.request(REFRESH_LOCK_NAME, run);
  }

  return run();
}
