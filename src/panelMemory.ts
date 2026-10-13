/**
 * Steam rebuilds the plugin's Quick Access panel after a modal opened from it
 * closes, which resets the panel's own state — the games list would collapse
 * and focus would land somewhere else. These few things are remembered here,
 * outside the component, so the panel can put you back where you were.
 */

/** How long after a game's settings close the panel will still restore. */
const RETURN_WINDOW_MS = 8000;

let returnTo: { appId: string; modalOpen: boolean; closedAt: number } | null = null;
const closedListeners = new Set<() => void>();

/** A game's settings modal is about to open from the games list. */
export function rememberGameSettingsOpened(appId: string): void {
  returnTo = { appId, modalOpen: true, closedAt: 0 };
}

/** That modal has closed. Wakes a panel that stayed mounted through it. */
export function noteGameSettingsClosed(appId: string): void {
  if (returnTo?.appId !== appId) return;
  returnTo = { appId, modalOpen: false, closedAt: Date.now() };
  closedListeners.forEach((listener) => listener());
}

/** Subscribe to settings-closed events; returns the unsubscribe function. */
export function onGameSettingsClosed(listener: () => void): () => void {
  closedListeners.add(listener);
  return () => {
    closedListeners.delete(listener);
  };
}

/**
 * The game whose settings were just closed, if that was moments ago — what
 * the panel should reopen the list for and refocus. Null while the modal is
 * still open, and once the window has passed (a later, ordinary open of the
 * panel starts collapsed as usual).
 */
export function pendingReturnTarget(): string | null {
  if (!returnTo || returnTo.modalOpen) return null;
  if (Date.now() - returnTo.closedAt > RETURN_WINDOW_MS) {
    returnTo = null;
    return null;
  }
  return returnTo.appId;
}
