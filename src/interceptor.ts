import { toaster } from "@decky/api";
import { resolveScript, writeProfile } from "./backend";
import { LinkEntry, buildPromptEntries, hasLinks, pickDefaultKey } from "./links";
import { withProfileEnv, withoutProfileEnv } from "./launchOptions";
import { promptForProfile } from "./ProfileModal";
import { gameConfig, snapshot, updateGame } from "./store";
import {
  cancelLaunch,
  getGameId,
  getLaunchInfo,
  getOverview,
  msUntilKillsDone,
  resolveAppId,
  runGame,
  setLaunchOptions,
} from "./steam";
import { basename } from "./util";

/** appIds we relaunched ourselves — their next GameActionStart passes through. */
const bypass = new Set<string>();
/** appIds currently being prompted, so a double-fire cannot stack modals. */
const busy = new Set<string>();

function toast(title: string, body: string) {
  try {
    toaster.toast({ title, body });
  } catch {
    console.log(`[ProfileLauncher] ${title}: ${body}`);
  }
}

export function registerLaunchInterceptor(): () => void {
  let registration: any;
  try {
    registration = SteamClient.Apps.RegisterForGameActionStart(
      (_actionType: number, rawGameActionId: string, action: string) => {
        void onGameActionStart(rawGameActionId, action);
      },
    );
  } catch (e) {
    console.error("[ProfileLauncher] could not hook game launches", e);
    return () => {};
  }

  return () => {
    try {
      registration?.unregister?.();
    } catch {
      /* ignore */
    }
  };
}

async function onGameActionStart(rawGameActionId: string, action: string) {
  if (action !== "LaunchApp") return;

  // The value Steam hands this callback is a GameID, not an AppID — see
  // resolveAppId's comment. Everything from here on keys off the real AppID,
  // matching what the QAM, config storage, and script resolution all expect.
  const resolvedAppId = resolveAppId(rawGameActionId);
  if (typeof resolvedAppId !== "number") {
    console.warn(
      "[ProfileLauncher] couldn't resolve an AppID for game action",
      rawGameActionId,
    );
    return;
  }
  const appId = String(resolvedAppId);

  // Our own relaunch — let it through.
  if (bypass.has(appId)) {
    bypass.delete(appId);
    return;
  }
  if (busy.has(appId)) return;

  const config = gameConfig(appId);

  if (config && (config.detected || hasLinks(config))) {
    // Prompting switched off: do nothing.
    if (!config.enabled) return;

    // A .sh game, a game with shortcut links, or both: stop the launch
    // immediately, then take our time.
    busy.add(appId);
    const gameId = getGameId(Number(appId));
    cancelLaunch(gameId);
    try {
      await promptOrLaunch(appId, gameId);
    } finally {
      busy.delete(appId);
    }
    return;
  }

  // Everything else — never seen before, or last seen without a script — is
  // checked on every launch, so giving a game a .sh launch path takes effect
  // the next time it starts, with no re-scan. The lookup runs alongside the
  // launch and only interrupts it if a script actually turns up; a game that
  // has none just carries on, so this costs nothing visible. The first launch
  // after a script appears is therefore killed a beat late; later ones are
  // intercepted immediately.
  busy.add(appId);
  try {
    const info = await getLaunchInfo(Number(appId));
    const script = await resolveScript(info.exe, info.launchOptions);

    if (!script.path) return;

    // A fresh detection starts from the default prompting setting, same as a
    // scan does — including a game that used to have a script and lost it.
    const promptNew = snapshot()?.askByDefault ?? true;

    // New games default to no prompt: just record the game and let this
    // launch carry on untouched. Cancelling it would force a prompt the
    // person has said they don't want, and answering that prompt would
    // overwrite the setting anyway.
    if (!promptNew) {
      await updateGame(appId, {
        name: info.name,
        script: script.path,
        detected: true,
        enabled: false,
      });
      return;
    }

    // Stop the launch before anything else — the config write below is a
    // backend round trip the script shouldn't get to run through.
    cancelLaunch(info.gameId);

    // The launch is already stopped, so a failed save mustn't abandon it:
    // carry on and prompt anyway.
    try {
      await updateGame(appId, {
        name: info.name,
        script: script.path,
        detected: true,
        enabled: true,
      });
    } catch (e) {
      console.warn("[ProfileLauncher] could not save newly detected game", e);
    }

    await promptOrLaunch(appId, info.gameId);
  } catch (e) {
    // Only the lookup above can land here (promptOrLaunch handles its own
    // failures), and the launch hasn't been cancelled yet, so it just carries on.
    console.warn("[ProfileLauncher] script lookup failed for", appId, e);
  } finally {
    busy.delete(appId);
  }
}

/**
 * Run the prompt flow for a launch that has already been cancelled. If
 * anything throws partway, the game is down and nothing would bring it back,
 * so fall back to launching it unchanged rather than leaving a dead launch.
 */
async function promptOrLaunch(appId: string, gameId: string) {
  try {
    await handleLaunch(appId, gameId);
  } catch (e) {
    console.error("[ProfileLauncher] launch handling failed; launching unchanged", e);
    toast("Profile Launcher", "Something went wrong — launching unchanged.");
    relaunch(appId, gameId);
  }
}

async function handleLaunch(appId: string, knownGameId?: string) {
  const settings = snapshot();
  const variable = settings?.variable ?? "PROFILE";

  const info = await getLaunchInfo(Number(appId));
  const gameId = knownGameId ?? info.gameId;

  // Re-resolve every time: launch options may have changed since we cached,
  // and the script's own PROFILE_NAMES table is the live source of truth for
  // which profiles exist, their names, and their order — never cached here,
  // so an edit to the script shows up on the very next launch.
  const script = await resolveScript(info.exe, info.launchOptions);

  const config = gameConfig(appId);
  const links = config?.links ?? [];
  const scriptUsable = !!script.path && script.exists && script.profiles.length > 0;

  if (!scriptUsable && !links.length) {
    // Nothing to offer: launch normally, saying why if there's something to fix.
    if (!script.path) {
      // Leave prompting as the person set it — this game gets re-checked on
      // every launch, so a script added later is picked up on its own.
      await updateGame(appId, { detected: false, script: "" });
    } else if (!script.exists) {
      toast("Profile Launcher", `Script not found: ${script.path}`);
    } else {
      await updateGame(appId, { name: info.name, script: script.path, detected: true });
      toast(
        "Profile Launcher",
        `No PROFILE_NAMES table found in ${basename(script.path)} — launching unchanged.`,
      );
    }
    relaunch(appId, gameId);
    return;
  }

  // The shortcut profiles are still worth offering, but a script that's
  // referenced and missing is worth flagging.
  if (script.path && !script.exists) {
    toast("Profile Launcher", `Script not found: ${script.path}`);
  }

  // One list: the script's profiles in table order, then shortcut profiles
  // (each placed by its number override, or last, alphabetically).
  const entries = buildPromptEntries(
    scriptUsable ? script.profiles : [],
    links,
    config?.defaultName,
  );
  const defaultKey = pickDefaultKey(entries, config);

  const choice = await promptForProfile({ entries, defaultKey });

  const picked = choice.entry;
  await updateGame(appId, {
    name: info.name,
    ...(scriptUsable ? { script: script.path, detected: true } : {}),
    enabled: choice.keepAsking,
    ...(picked?.kind === "profile" ? { lastProfile: picked.value, lastLinkId: null } : {}),
    ...(picked?.kind === "default" ? { lastLinkId: null } : {}),
    ...(picked?.kind === "link" ? { lastLinkId: picked.linkId } : {}),
  });

  if (!picked) return; // cancelled: leave the game closed

  if (picked.kind === "link") {
    launchLink(picked);
    return;
  }

  if (picked.kind === "default") {
    // Just this game, opened normally — no script to touch.
    relaunch(appId, gameId);
    return;
  }

  if (!script.hasVariable) {
    toast(
      "Profile Launcher",
      `No ${variable}= line in ${basename(script.path)} — nothing to change.`,
    );
    relaunch(appId, gameId);
    return;
  }

  if (script.envAware) {
    // The script takes PROFILE from the environment, so leave the file alone
    // and pass the choice through the launch options instead.
    try {
      if (!info.loaded) throw new Error("couldn't read this game's launch options");
      const next = withProfileEnv(info.launchOptions, variable, picked.value);
      if (next !== info.launchOptions) setLaunchOptions(Number(appId), next);
    } catch (e) {
      toast("Profile Launcher — not launched", `Could not update launch options: ${e}`);
      return;
    }
    relaunch(appId, gameId);
    return;
  }

  const result = await writeProfile(script.path, picked.value);
  if (!result.ok) {
    toast("Profile Launcher — not launched", result.error ?? "Could not update the script.");
    return;
  }

  // A game that used to pass its profile through launch options and now has
  // a plain assignment in its script: drop the leftover from the launch
  // options. The script's own line wins either way, so a failure here is
  // only untidy and never stops the launch.
  try {
    const cleaned = withoutProfileEnv(info.launchOptions, variable);
    if (info.loaded && cleaned !== info.launchOptions) {
      setLaunchOptions(Number(appId), cleaned);
    }
  } catch (e) {
    console.warn("[ProfileLauncher] could not clear leftover launch options", e);
  }

  relaunch(appId, gameId);
}

/**
 * Open the linked game instead of running this game's script. Starting it
 * goes through the same launch hook as any other game, so if the linked game
 * has its own profile prompt, that prompt appears as usual.
 */
function launchLink(entry: LinkEntry) {
  if (!getOverview(entry.targetAppId)) {
    toast("Profile Launcher", `Game not found for shortcut profile: ${entry.label}`);
    return;
  }
  runGame(getGameId(entry.targetAppId));
}

function relaunch(appId: string, gameId: string) {
  bypass.add(appId);
  // Give Steam a moment to finish tearing down the cancelled game action —
  // and if cancelLaunch still has kill attempts scheduled (a relaunch with no
  // prompt in between, like a script with no profile table), wait for them
  // too, or one would terminate the game we're about to start.
  const delay = Math.max(400, msUntilKillsDone(gameId) + 150);
  setTimeout(() => {
    runGame(gameId);
    // Safety net: if the launch never reaches us, clear the bypass.
    setTimeout(() => bypass.delete(appId), 10000);
  }, delay);
}
