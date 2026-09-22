import {
  GameConfig,
  Settings,
  getSettings,
  setGameConfig,
  setSettings,
  forgetGame,
} from "./backend";
import { isExcluded } from "./util";

let cache: Settings | null = null;
const listeners = new Set<(s: Settings) => void>();

function emit() {
  if (cache) listeners.forEach((fn) => fn(cache!));
}

/**
 * Apps a scan proved have no .sh, kept in memory only: persisting one entry
 * per library game would balloon settings.json for no benefit.
 */
const noScript = new Set<string>();

export const markNoScript = (appId: string) => noScript.add(appId);
export const hasNoScript = (appId: string) => noScript.has(appId);
export const clearNoScript = () => noScript.clear();

export function effectiveAllowedProfiles(
  config: GameConfig | undefined,
  total: number,
): number[] {
  const explicit = (config?.allowedProfiles ?? []).filter((v) => v >= 1 && v <= total);
  if (explicit.length) return [...new Set(explicit)].sort((a, b) => a - b);
  // No explicit restriction (or it no longer matches the current profile
  // count) — every profile applies, including ones added later.
  return Array.from({ length: total }, (_, i) => i + 1);
}

/** This game's display name for a profile, falling back to the global name. */
export function effectiveProfileLabel(
  config: GameConfig | undefined,
  profiles: string[],
  value: number,
): string {
  const override = config?.profileNames?.[String(value)]?.trim();
  return override || profiles[value - 1] || `Profile ${value}`;
}

/**
 * This game's display order, as a full permutation of 1..total — purely
 * cosmetic sequencing, independent of which profiles are allowed. Anything
 * stored that's out of range is dropped, and any profile not covered by the
 * stored order (including ones added later) is appended at the end,
 * ascending, so "no custom order" and "explicitly ascending" behave
 * identically going forward.
 */
export function effectiveProfileOrder(
  config: GameConfig | undefined,
  total: number,
): number[] {
  const seen = new Set<number>();
  const ordered: number[] = [];
  for (const v of config?.profileOrder ?? []) {
    if (v >= 1 && v <= total && !seen.has(v)) {
      seen.add(v);
      ordered.push(v);
    }
  }
  for (let v = 1; v <= total; v++) {
    if (!seen.has(v)) ordered.push(v);
  }
  return ordered;
}

/** True once the stored order actually differs from plain ascending. */
export function hasCustomProfileOrder(
  config: GameConfig | undefined,
  total: number,
): boolean {
  return effectiveProfileOrder(config, total).some((v, i) => v !== i + 1);
}

export function snapshot(): Settings | null {
  return cache;
}

/** Synchronous lookup — the launch hook cannot afford a round trip. */
export function gameConfig(appId: string): GameConfig | undefined {
  return cache?.games?.[appId];
}

export async function refresh(): Promise<Settings> {
  cache = await getSettings();
  emit();
  return cache;
}

export function subscribe(fn: (s: Settings) => void): () => void {
  listeners.add(fn);
  if (cache) fn(cache);
  return () => listeners.delete(fn);
}

export async function updateGame(appId: string, patch: Partial<GameConfig>) {
  const entry = await setGameConfig(appId, patch);
  if (cache) cache.games[appId] = entry;
  emit();
  return entry;
}

export async function updateSettings(patch: Partial<Settings>) {
  cache = await setSettings(patch);

  // A newly-added exclusion should retire any game already detected under
  // that name, otherwise a stale entry keeps prompting on launch.
  if (patch.excludedScripts && cache) {
    const stale = Object.entries(cache.games).filter(
      ([, config]) => config.detected && isExcluded(config.script, patch.excludedScripts),
    );
    for (const [appId] of stale) {
      cache.games[appId] = await setGameConfig(appId, {
        detected: false,
        enabled: false,
      });
    }
  }

  emit();
  return cache;
}

export async function dropGame(appId: string) {
  cache = await forgetGame(appId);
  emit();
  return cache;
}
