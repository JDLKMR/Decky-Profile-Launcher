import { resolveScript } from "./backend";
import { getLaunchInfo, listLibraryApps } from "./steam";
import { refresh, snapshot, updateGame } from "./store";

export interface ScanProgress {
  done: number;
  total: number;
  found: number;
}

/**
 * Walk the library and record which apps launch a .sh. Never required — the
 * interceptor checks any game it hasn't detected a script for on each launch,
 * so a newly added .sh is picked up on its own — but scanning ahead of time
 * makes that first launch instant instead of kill-and-relaunch, and fills the
 * games list before you've launched anything.
 */
export async function scanLibrary(
  onProgress?: (progress: ScanProgress) => void,
): Promise<number> {
  const apps = listLibraryApps();
  const batchSize = 6;
  let done = 0;
  let found = 0;

  for (let i = 0; i < apps.length; i += batchSize) {
    const batch = apps.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async ({ appId, name }) => {
        const key = String(appId);
        try {
          const info = await getLaunchInfo(appId);
          const script = await resolveScript(info.exe, info.launchOptions);

          if (script.path) {
            found += 1;
            const existing = snapshot()?.games?.[key];
            await updateGame(key, {
              name,
              script: script.path,
              detected: true,
              enabled: existing?.detected
                ? existing.enabled
                : (snapshot()?.askByDefault ?? true),
            });
          }
        } catch (e) {
          console.warn("[ProfileLauncher] scan failed for", appId, e);
        }
      }),
    );

    done += batch.length;
    onProgress?.({ done: Math.min(done, apps.length), total: apps.length, found });
  }

  await refresh();
  return found;
}
