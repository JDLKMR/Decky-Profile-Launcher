# Launch Profiles (Decky Loader plugin)

Prompts for a numbered profile when you launch a game whose **launch options** or
**target** point at a `.sh` file, writes that number into the script's `PROFILE`
variable, then launches the game.

Works for Steam games and non-Steam shortcuts.

## What it does

1. Hooks `SteamClient.Apps.RegisterForGameActionStart`.
2. Reads the app's `strShortcutExe` and `strLaunchOptions`, and pulls out any
   `.sh` token (quotes, `%command%`, `bash /path/x.sh` and `~` all handled).
3. If one is found and prompting is on for that game, it stops the launch and
   shows the profile picker.
4. Your choice is written into the script: the first uncommented
   `PROFILE=…`, `export PROFILE=…` or `PROFILE="…"` line is rewritten in place.
   Indentation, `export`, quoting style, trailing comments, line endings and
   file permissions are preserved, and the write is atomic (temp file +
   `os.replace`), so a crash mid-write can't truncate your script.
5. The game is launched.

The picker also has **Launch unchanged** and **Cancel launch**.

## Per-game on/off and profile selection

The first time the plugin catches a game launching a `.sh` it hasn't seen
before, it shows **Profile Setup** instead of the usual prompt: pick which of
your global profiles this game should offer going forward (every profile is
checked by default), then continue straight into the normal profile picker to
actually launch. After that first time, Profile Setup isn't locked away —
there's a **Profile Setup...** button in the launch prompt itself, just above
"Ask every time for this game," so you can adjust which profiles a game
offers whenever you like without leaving the prompt. Changes there apply
immediately to the list you're currently looking at.

For more detailed editing — the enable/disable toggle, and renaming — use
**Change Profiles...** next to that game in the Launch Profiles Quick Access
panel. The per-profile list there is collapsed behind a "Profiles offered for
this game" row by default (it shows a quick `2 of 5` count either way); tap
it to expand. At least one profile has to stay on.

The prompt always numbers its options sequentially (1, 2, 3…) in the order
they're shown, regardless of which global profile number each one actually
is — so if a game only has profiles 1, 3 and 5 enabled, the prompt lists them
as "1.", "2.", "3." for a natural read, but picking the second one still
writes `PROFILE=3` into the script. Nothing changes about what gets written;
only what's offered.

A game left with every profile enabled is stored as unrestricted, so a
profile you add later is automatically offered for that game too. Only games
where you've actually excluded something keep a fixed list.

### Renaming a profile for one game

Every profile in "Profiles offered for this game" has a pencil icon next to
it. Tap it to give that profile a different display name just for this game —
say, launching Donkey Kong 64 with your "Mod" profile actually boots a rom
patched for Tag Anywhere, so you rename it to "Tag Anywhere" for DK64 only.
It's still the same profile — same number, same script value — it just reads
differently in that game's prompt and setup screen. Once a profile has a
custom name here, an undo icon appears next to the pencil to clear it and
revert to the global name. Nothing about the global profile list, or any
other game's naming, is affected.

## Profiles

Named and counted in the QAM panel — add, remove and rename freely. The value
written to the script is always the 1-based index (`1`, `2`, `3`…), so renaming
never changes what your script sees. The variable name itself (`PROFILE`) is
editable under Advanced if you ever want a second one.

## Excluding scripts by name

Some `.sh` files aren't profile scripts at all. Under **Excluded scripts** in
the QAM, add names that should never be picked up — `launch.sh`, or a wildcard
like `start-*.sh`. Matching is case-insensitive and applies to the file name;
a pattern containing a `/` matches the whole path instead
(`/home/deck/tools/*.sh`).

Excluded games disappear from the configuration list and never prompt. If a
game's launch options reference both an excluded helper and a real profile
script, the non-excluded one still wins.

## Build

Needs Node 18+ and pnpm (or npm).

```bash
cd decky-launch-profiles
pnpm install          # or: npm install
pnpm run build        # or: npm run build
```

That produces `dist/index.js`. To install on the Deck, copy the folder —
`plugin.json`, `main.py`, `dist/`, `package.json` — to
`~/homebrew/plugins/launch-profiles/` and restart Decky:

```bash
sudo systemctl restart plugin_loader
```

Or zip the same files and use Decky's *Install from ZIP* in developer mode.

## Settings

`~/homebrew/settings/launch-profiles/settings.json`. Detected games, their
enabled flag and last-used profile all live there.

## Caveats worth knowing

- **Steam has no "cancel launch" API.** The plugin terminates the game action
  and relaunches after you choose. Terminate is retried a few times over the
  first ~1.2s to cover the gap before the process exists. In practice you see
  the launch spinner flick and come back; occasionally a game will flash a
  window before dying.
- **First launch of a newly seen game is slower.** Reading launch options is
  async, so an unknown app gets killed a beat late. Hit *Scan library for .sh
  launchers* once and every game is cached from then on.
- If the `PROFILE=` write fails (permissions, no such line), the game is **not**
  launched and a toast explains why — better than silently running the wrong
  profile.
- Plugin backends run unprivileged. If your scripts live somewhere the `deck`
  user can't write, add `"root"` to `flags` in `plugin.json`.
- **Upgrading from a version before Profile Setup existed:** games you'd
  already launched won't have the new "configured" flag set, so each will
  show Profile Setup once, the next time you launch it. After that it's back
  to normal. Nothing is lost — it just asks once more.
- **Fixed: non-Steam shortcuts never prompted at all.** The identifier
  `RegisterForGameActionStart` hands back is a GameID, not an AppID. For an
  ordinary Steam game those two are numerically identical, so treating the
  raw value as an AppID happened to work — but a non-Steam shortcut's AppID
  is reported as `0` at this layer (confirmed in Steam's own client logs:
  `GameAction [AppID 0, ActionID 3] : LaunchApp`), while its GameID is a
  distinct, valid value. That meant `GetAppOverviewByAppID`/
  `RegisterForAppDetails` silently found nothing for shortcuts, so launch
  options came back empty, no script was ever found, and the game launched
  untouched with whatever `PROFILE` was already in the file — no prompt, no
  "script not found" toast either, since that toast only fires when a script
  is found but missing from disk, not when none is found at all. The fix
  resolves the real AppID via `appStore.GetAppOverviewByGameID(rawId).appid`
  before anything else runs, so both paths now go through the exact same
  logic. Scanning and Change Profiles were never affected by this, since
  they source AppIDs from `collectionStore` directly rather than from a
  launch event.

## A simpler alternative, if you ever want it

Since the script reads `PROFILE`, you could skip editing the file entirely and
have the plugin set the launch options to `PROFILE=2 /path/script.sh` before
launching (`SteamClient.Apps.SetAppLaunchOptions` /
`SteamClient.Apps.SetShortcutLaunchOptions`). Same result, nothing rewritten on
disk, and it survives you editing the script by hand. It only works if the
script doesn't hard-assign `PROFILE` over the inherited value — i.e. change the
line to `PROFILE="${PROFILE:-1}"`. Worth considering if the terminate-and-
relaunch dance ever annoys you.
