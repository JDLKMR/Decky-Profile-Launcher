import { call } from "@decky/api";

export interface GameConfig {
  name: string;
  script: string;
  enabled: boolean;
  lastProfile: number;
  detected: boolean;
  /**
   * Global profile numbers (1-based) selectable for this game, in ascending
   * order. Empty or missing = unrestricted (every global profile applies,
   * including ones added later).
   */
  allowedProfiles?: number[];
  /** Has this game already been through the first-time setup prompt? */
  configured?: boolean;
  /** Per-game display name overrides, keyed by profile number as a string. */
  profileNames?: Record<string, string>;
  /**
   * Per-game display order, as global profile numbers — purely cosmetic,
   * the script still gets the same PROFILE value regardless of position.
   * Empty or missing = default ascending order. Any profile number not
   * listed here (including ones added later) is appended at the end,
   * ascending.
   */
  profileOrder?: number[];
}

export interface Settings {
  version: number;
  variable: string;
  profiles: string[];
  askByDefault: boolean;
  backup: boolean;
  /** Script names never treated as profile scripts (glob allowed). */
  excludedScripts: string[];
  games: Record<string, GameConfig>;
}

export interface ScriptInfo {
  path: string;
  exists: boolean;
  hasVariable: boolean;
  value: string | null;
  /** True when a .sh was found but every candidate was excluded by name. */
  excluded?: boolean;
}

export interface WriteResult {
  ok: boolean;
  value?: string;
  unchanged?: boolean;
  error?: string;
}

export const getSettings = () => call<[], Settings>("get_settings");

export const setSettings = (patch: Partial<Settings>) =>
  call<[Partial<Settings>], Settings>("set_settings", patch);

export const setGameConfig = (appId: string, patch: Partial<GameConfig>) =>
  call<[string, Partial<GameConfig>], GameConfig>("set_game_config", appId, patch);

export const forgetGame = (appId: string) =>
  call<[string], Settings>("forget_game", appId);

export const resolveScript = (exe: string, launchOptions: string) =>
  call<[string, string], ScriptInfo>("resolve_script", exe, launchOptions);

export const writeProfile = (path: string, value: number) =>
  call<[string, number], WriteResult>("write_profile", path, value);
