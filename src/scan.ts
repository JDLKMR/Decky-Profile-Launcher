import { resolveScript } from "./backend";
import { hasLinks } from "./links";
import { getLaunchInfo, listLibraryApps } from "./steam";
import { refresh, snapshot, updateGame } from "./store";

export interface ScanProgress {
  done: number;
  total: number;
  found: number;
}

export interface ScanResult {
  /** Games in the library that launch a .sh. */
  found: number;
  /** Games dropped from the list: no .sh any more (or gone from the library) and no shortcut links. */
  pruned: number;
  /** Games Steam never returned launch details for; left exactly as they were. */
  unverified: number;
}

/**
 * Walk the library and record which apps launch a .sh. Never required — the
 * interceptor checks any game it hasn't detected a script for on each launch,
 * so a newly added .sh is picked up on its own — but scanning ahead of time
 * means that first launch is intercepted immediately instead of being killed
 * a beat late, and fills the games list before you've launched anything.
 *
 * The scan also tidies up: a game that was detected before but no longer has
 * a script is marked undetected (so it leaves the list unless it has shortcut
 * links). Only games whose launch details were actually read are touched — a
 * lookup that timed out looks identical to "no script" and must never prune.
 */
export async function scanLibrary(
  onProgress?: (progress: ScanProgress) => void,
): Promise<ScanResult> {
  const apps = listLibraryApps();
  const batchSize = 6;
  let done = 0;
  let found = 0;
  let pruned = 0;

  const inLibrary = new Set(apps.map(({ appId }) => String(appId)));
  const confirmedNoScript = new Set<string>();
  const unverified = new Set<string>();

  for (let i = 0; i < apps.length; i += batchSize) {
    const batch = apps.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async ({ appId, name }) => {
        const key = String(appId);
        try {
          const info = await getLaunchInfo(appId);
          if (!info.loaded) {
            unverified.add(key);
            return;
          }

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
          } else {
            confirmedNoScript.add(key);
          }
        } catch (e) {
          unverified.add(key);
          console.warn("[ProfileLauncher] scan failed for", appId, e);
        }
      }),
    );

    done += batch.length;
    onProgress?.({ done: Math.min(done, apps.length), total: apps.length, found });
  }

  // An empty library listing means Steam's stores weren't ready, not that
  // every game vanished — never prune off that.
  if (apps.length > 0) {
    const games = snapshot()?.games ?? {};
    for (const [key, config] of Object.entries(games)) {
      if (!config.detected) continue;
      // Gone from the library entirely, or looked up fine and has no script.
      if (inLibrary.has(key) && !confirmedNoScript.has(key)) continue;

      // Keeps lastProfile, defaultName and links, the same as a launch that
      // finds the script gone does. A game with shortcut links stays listed.
      await updateGame(key, { detected: false, script: "" });
      if (!hasLinks(config)) pruned += 1;
    }
  }

  await refresh();
  return { found, pruned, unverified: unverified.size };
}
