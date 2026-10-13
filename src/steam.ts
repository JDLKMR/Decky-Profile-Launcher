export interface AppLaunchInfo {
  appId: string;
  gameId: string;
  name: string;
  exe: string;
  launchOptions: string;
  /**
   * False when Steam never delivered the app's details (lookup timed out), in
   * which case exe/launchOptions are empty because they're unknown — not
   * because the game has no script. Callers that act on "no script found"
   * (the scan's pruning) must check this first.
   */
  loaded: boolean;
}

/**
 * RegisterForGameActionStart hands back a GameID, not an AppID. For an
 * ordinary Steam game those two happen to be numerically identical, which is
 * why treating the raw value as an AppID appears to work — but a non-Steam
 * shortcut's AppID is reported as 0 at this layer, while its GameID is a
 * distinct, always-valid composite value. Resolve the real AppID through the
 * overview lookup before using the identifier for anything else.
 */
export function resolveAppId(rawGameActionId: string | number): number | undefined {
  try {
    const overview = appStore?.GetAppOverviewByGameID?.(rawGameActionId);
    const appid = overview?.appid;
    return typeof appid === "number" ? appid : undefined;
  } catch (e) {
    console.error("[ProfileLauncher] GetAppOverviewByGameID failed", e);
    return undefined;
  }
}

/** appDetails arrives via a subscription, so wrap the first callback. */
export function getAppDetails(appId: number, timeoutMs = 3000): Promise<any | null> {
  return new Promise((resolve) => {
    let done = false;
    let reg: any;

    const finish = (value: any) => {
      if (done) return;
      done = true;
      try {
        reg?.unregister?.();
      } catch {
        /* ignore */
      }
      resolve(value);
    };

    try {
      reg = SteamClient.Apps.RegisterForAppDetails(appId, (details: any) =>
        setTimeout(() => finish(details ?? null), 0),
      );
    } catch (e) {
      console.error("[ProfileLauncher] RegisterForAppDetails failed", e);
      finish(null);
      return;
    }

    setTimeout(() => finish(null), timeoutMs);
  });
}

export function getOverview(appId: number): any | null {
  try {
    return appStore?.GetAppOverviewByAppID?.(appId) ?? null;
  } catch {
    return null;
  }
}

export function getAppName(appId: number): string {
  return getOverview(appId)?.display_name ?? `App ${appId}`;
}

/** TerminateApp/RunGame want the gameid string, which differs from appid for shortcuts. */
export function getGameId(appId: number): string {
  const overview = getOverview(appId);
  return String(overview?.gameid ?? appId);
}

/** Read the target + launch options for a Steam game or non-Steam shortcut. */
export async function getLaunchInfo(appId: number): Promise<AppLaunchInfo> {
  const details = await getAppDetails(appId);
  return {
    appId: String(appId),
    gameId: getGameId(appId),
    name: getAppName(appId),
    exe: details?.strShortcutExe ?? "",
    launchOptions: details?.strLaunchOptions ?? "",
    loaded: details != null,
  };
}

/** gameId -> timestamp (ms) at which cancelLaunch's last kill attempt fires. */
const killWindowEnds = new Map<string, number>();

/**
 * Stop a launch that Steam has already begun. There is no clean "cancel",
 * so terminate a few times over the first second to cover the window
 * between the game action starting and the process actually existing.
 */
export function cancelLaunch(gameId: string) {
  const kill = () => {
    try {
      SteamClient.Apps.TerminateApp(gameId, false);
    } catch (e) {
      console.warn("[ProfileLauncher] TerminateApp failed", e);
    }
  };
  const delays = [200, 600, 1200];
  killWindowEnds.set(gameId, Date.now() + delays[delays.length - 1]);
  kill();
  for (const ms of delays) setTimeout(kill, ms);
}

/**
 * How long until cancelLaunch's last scheduled kill for this game has fired
 * (0 if none is pending). Relaunching before then would let a late kill
 * terminate the new launch.
 */
export function msUntilKillsDone(gameId: string): number {
  return Math.max(0, (killWindowEnds.get(gameId) ?? 0) - Date.now());
}

export function runGame(gameId: string) {
  try {
    SteamClient.Apps.RunGame(gameId, "", -1, 100);
  } catch (e) {
    console.error("[ProfileLauncher] RunGame failed", e);
  }
}

/** Every app the library knows about, installed games and shortcuts included. */
export function listLibraryApps(): { appId: number; name: string }[] {
  const seen = new Map<number, string>();
  const collections = [
    collectionStore?.localGamesCollection,
    collectionStore?.deckDesktopApps,
    collectionStore?.allAppsCollection,
  ];
  for (const collection of collections) {
    for (const app of collection?.allApps ?? []) {
      if (app?.appid && !seen.has(app.appid)) {
        seen.set(app.appid, app.display_name ?? `App ${app.appid}`);
      }
    }
  }
  return [...seen].map(([appId, name]) => ({ appId, name }));
}

/** Steam's app_type for a non-Steam shortcut (0x40000000). */
const SHORTCUT_APP_TYPE = 1073741824;

/**
 * Replace an app's Steam launch options. Non-Steam shortcuts and Steam games
 * have separate setters. Throws if Steam doesn't offer one, so a caller never
 * carries on as if the options had changed when they hadn't.
 */
export function setLaunchOptions(appId: number, options: string): void {
  const isShortcut = getOverview(appId)?.app_type === SHORTCUT_APP_TYPE;
  const apps = SteamClient?.Apps;
  const setter = isShortcut ? apps?.SetShortcutLaunchOptions : apps?.SetAppLaunchOptions;
  if (typeof setter !== "function") {
    throw new Error("Steam doesn't expose a way to set launch options here");
  }
  setter.call(apps, appId, options);
}

/**
 * The installed Steam and non-Steam games, alphabetized, for the game
 * dropdowns. Installed games and Deck desktop apps come from their own
 * collections; non-Steam shortcuts are also pulled from the full library by
 * app type, in case this Steam build doesn't list them as "local". If none of
 * that turns anything up, fall back to the whole library rather than showing
 * an empty dropdown.
 */
export function listInstalledApps(): { appId: number; name: string }[] {
  const seen = new Map<number, string>();
  const add = (app: any) => {
    if (app?.appid && !seen.has(app.appid)) {
      seen.set(app.appid, app.display_name ?? `App ${app.appid}`);
    }
  };

  for (const collection of [
    collectionStore?.localGamesCollection,
    collectionStore?.deckDesktopApps,
  ]) {
    for (const app of collection?.allApps ?? []) add(app);
  }
  for (const app of collectionStore?.allAppsCollection?.allApps ?? []) {
    if (app?.app_type === SHORTCUT_APP_TYPE) add(app);
  }
  if (!seen.size) {
    for (const app of collectionStore?.allAppsCollection?.allApps ?? []) add(app);
  }

  return [...seen]
    .map(([appId, name]) => ({ appId, name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
