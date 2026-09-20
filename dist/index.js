const manifest = {"name":"Launch Profiles"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const call = api.call;
const toaster = api.toaster;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaUndo (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z"},"child":[]}]})(props);
}function FaSlidersH (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"},"child":[]}]})(props);
}function FaPen (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z"},"child":[]}]})(props);
}

const getSettings = () => call("get_settings");
const setSettings = (patch) => call("set_settings", patch);
const setGameConfig = (appId, patch) => call("set_game_config", appId, patch);
const forgetGame = (appId) => call("forget_game", appId);
const resolveScript = (exe, launchOptions) => call("resolve_script", exe, launchOptions);
const writeProfile = (path, value) => call("write_profile", path, value);

const RenameProfileModal = ({ currentLabel, onResult, closeModal }) => {
    const [value, setValue] = SP_REACT.useState(currentLabel);
    const settled = SP_REACT.useRef(false);
    const settle = (result) => {
        if (settled.current)
            return;
        settled.current = true;
        onResult(result);
        closeModal?.();
    };
    const trimmed = value.trim();
    return (SP_JSX.jsxs(DFL.ModalRoot, { onCancel: () => settle(null), onEscKeypress: () => settle(null), children: [SP_JSX.jsx("div", { style: { fontSize: "1.4em", fontWeight: "bold", marginBottom: "12px" }, children: "Rename profile" }), SP_JSX.jsx(DFL.TextField, { label: "Display name for this game", value: value, onChange: (e) => setValue(e.target.value) }), SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", gap: "8px", marginTop: "16px" }, children: [SP_JSX.jsx(DFL.DialogButton, { disabled: !trimmed, onClick: () => settle(trimmed), children: "Save" }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => settle(null), children: "Cancel" })] })] }));
};
function promptRenameProfile(currentLabel) {
    return new Promise((resolve) => {
        DFL.showModal(SP_JSX.jsx(RenameProfileModal, { currentLabel: currentLabel, onResult: resolve }), window);
    });
}

/** Translate a shell-style glob ("start-*.sh", "launch?.sh") into a regex. */
function globToRegExp(pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const source = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(`^${source}$`, "i");
}
/**
 * Mirrors `_is_excluded` in main.py: patterns containing a slash match the
 * whole path, everything else matches the file name only.
 */
function isExcluded(path, patterns) {
    if (!path || !patterns?.length)
        return false;
    const base = (path.split("/").pop() ?? path).toLowerCase();
    const full = path.toLowerCase();
    return patterns.some((raw) => {
        const pattern = (raw ?? "").trim().toLowerCase();
        if (!pattern)
            return false;
        const target = pattern.includes("/") ? full : base;
        return target === pattern || globToRegExp(pattern).test(target);
    });
}
const basename = (path) => path.split("/").pop() ?? path;

let cache = null;
const listeners = new Set();
function emit() {
    if (cache)
        listeners.forEach((fn) => fn(cache));
}
/**
 * Apps a scan proved have no .sh, kept in memory only: persisting one entry
 * per library game would balloon settings.json for no benefit.
 */
const noScript = new Set();
const markNoScript = (appId) => noScript.add(appId);
const hasNoScript = (appId) => noScript.has(appId);
const clearNoScript = () => noScript.clear();
function effectiveAllowedProfiles(config, total) {
    const explicit = (config?.allowedProfiles ?? []).filter((v) => v >= 1 && v <= total);
    if (explicit.length)
        return [...new Set(explicit)].sort((a, b) => a - b);
    // No explicit restriction (or it no longer matches the current profile
    // count) — every profile applies, including ones added later.
    return Array.from({ length: total }, (_, i) => i + 1);
}
/** This game's display name for a profile, falling back to the global name. */
function effectiveProfileLabel(config, profiles, value) {
    const override = config?.profileNames?.[String(value)]?.trim();
    return override || profiles[value - 1] || `Profile ${value}`;
}
function snapshot() {
    return cache;
}
/** Synchronous lookup — the launch hook cannot afford a round trip. */
function gameConfig(appId) {
    return cache?.games?.[appId];
}
async function refresh() {
    cache = await getSettings();
    emit();
    return cache;
}
function subscribe(fn) {
    listeners.add(fn);
    if (cache)
        fn(cache);
    return () => listeners.delete(fn);
}
async function updateGame(appId, patch) {
    const entry = await setGameConfig(appId, patch);
    if (cache)
        cache.games[appId] = entry;
    emit();
    return entry;
}
async function updateSettings(patch) {
    cache = await setSettings(patch);
    // A newly-added exclusion should retire any game already detected under
    // that name, otherwise a stale entry keeps prompting on launch.
    if (patch.excludedScripts && cache) {
        const stale = Object.entries(cache.games).filter(([, config]) => config.detected && isExcluded(config.script, patch.excludedScripts));
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
async function dropGame(appId) {
    cache = await forgetGame(appId);
    emit();
    return cache;
}

/** appDetails arrives via a subscription, so wrap the first callback. */
function getAppDetails(appId, timeoutMs = 3000) {
    return new Promise((resolve) => {
        let done = false;
        let reg;
        const finish = (value) => {
            if (done)
                return;
            done = true;
            try {
                reg?.unregister?.();
            }
            catch {
                /* ignore */
            }
            resolve(value);
        };
        try {
            reg = SteamClient.Apps.RegisterForAppDetails(appId, (details) => setTimeout(() => finish(details ?? null), 0));
        }
        catch (e) {
            console.error("[LaunchProfiles] RegisterForAppDetails failed", e);
            finish(null);
            return;
        }
        setTimeout(() => finish(null), timeoutMs);
    });
}
function getOverview(appId) {
    try {
        return appStore?.GetAppOverviewByAppID?.(appId) ?? null;
    }
    catch {
        return null;
    }
}
function getAppName(appId) {
    return getOverview(appId)?.display_name ?? `App ${appId}`;
}
/** TerminateApp/RunGame want the gameid string, which differs from appid for shortcuts. */
function getGameId(appId) {
    const overview = getOverview(appId);
    return String(overview?.gameid ?? appId);
}
/** Read the target + launch options for a Steam game or non-Steam shortcut. */
async function getLaunchInfo(appId) {
    const details = await getAppDetails(appId);
    return {
        appId: String(appId),
        gameId: getGameId(appId),
        name: getAppName(appId),
        exe: details?.strShortcutExe ?? "",
        launchOptions: details?.strLaunchOptions ?? "",
    };
}
/**
 * Stop a launch that Steam has already begun. There is no clean "cancel",
 * so terminate a few times over the first second to cover the window
 * between the game action starting and the process actually existing.
 */
function cancelLaunch(gameId) {
    const kill = () => {
        try {
            SteamClient.Apps.TerminateApp(gameId, false);
        }
        catch (e) {
            console.warn("[LaunchProfiles] TerminateApp failed", e);
        }
    };
    kill();
    setTimeout(kill, 200);
    setTimeout(kill, 600);
    setTimeout(kill, 1200);
}
function runGame(gameId) {
    try {
        SteamClient.Apps.RunGame(gameId, "", -1, 100);
    }
    catch (e) {
        console.error("[LaunchProfiles] RunGame failed", e);
    }
}
/** Every app the library knows about, installed games and shortcuts included. */
function listLibraryApps() {
    const seen = new Map();
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

/**
 * Per-game profile editor, opened from the QAM. Resolves the script fresh
 * rather than assuming the cached entry is current, in case launch options
 * changed since it was last detected.
 */
const GameProfilesModal = ({ appId, fallbackName, closeModal }) => {
    const settings = snapshot();
    const profiles = settings?.profiles ?? [];
    const [config, setConfig] = SP_REACT.useState(gameConfig(appId));
    const [status, setStatus] = SP_REACT.useState(gameConfig(appId)?.detected ? "ready" : "loading");
    const [scriptPath, setScriptPath] = SP_REACT.useState(gameConfig(appId)?.script ?? "");
    const [name, setName] = SP_REACT.useState(gameConfig(appId)?.name || fallbackName || `App ${appId}`);
    const [expanded, setExpanded] = SP_REACT.useState(false);
    SP_REACT.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const info = await getLaunchInfo(Number(appId));
                const script = await resolveScript(info.exe, info.launchOptions);
                if (cancelled)
                    return;
                if (!script.path) {
                    setName(info.name || name);
                    setStatus("none");
                    return;
                }
                const entry = await updateGame(appId, {
                    name: info.name,
                    script: script.path,
                    detected: true,
                    enabled: gameConfig(appId)?.enabled ?? settings?.askByDefault ?? true,
                });
                if (cancelled)
                    return;
                setName(info.name || name);
                setScriptPath(script.path);
                setConfig(entry);
                setStatus("ready");
            }
            catch (e) {
                console.error("[LaunchProfiles] game lookup failed", e);
                if (!cancelled)
                    setStatus("none");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [appId]);
    const allowed = effectiveAllowedProfiles(config, profiles.length);
    const toggleProfile = async (value) => {
        const isAllowed = allowed.includes(value);
        if (isAllowed && allowed.length <= 1)
            return; // keep at least one
        const next = isAllowed
            ? allowed.filter((v) => v !== value)
            : [...allowed, value].sort((a, b) => a - b);
        setConfig(await updateGame(appId, {
            allowedProfiles: next.length === profiles.length ? [] : next,
        }));
    };
    const renameProfile = async (value) => {
        const current = effectiveProfileLabel(config, profiles, value);
        const newLabel = await promptRenameProfile(current);
        if (newLabel === null)
            return;
        setConfig(await updateGame(appId, {
            profileNames: { ...(config?.profileNames ?? {}), [String(value)]: newLabel },
        }));
    };
    const clearProfileName = async (value) => {
        const next = { ...(config?.profileNames ?? {}) };
        delete next[String(value)];
        setConfig(await updateGame(appId, { profileNames: next }));
    };
    return (SP_JSX.jsxs(DFL.ModalRoot, { onCancel: closeModal, onEscKeypress: closeModal, children: [SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "1.4em", fontWeight: "bold" }, children: "Change Profiles" }), SP_JSX.jsxs("div", { style: { opacity: 0.7, fontSize: "0.9em" }, children: [name, scriptPath ? ` · ${basename(scriptPath)}` : ""] })] }), status === "loading" && (SP_JSX.jsx("div", { style: { marginTop: "16px", opacity: 0.7 }, children: "Looking up launch options\u2026" })), status === "none" && (SP_JSX.jsx("div", { style: { marginTop: "16px", opacity: 0.8 }, children: "No profile script for this game. Its launch options and target don't point at a .sh file, or the script's name is on the excluded list." })), status === "ready" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx("div", { style: { marginTop: "16px" }, children: SP_JSX.jsx(DFL.ToggleField, { label: "Prompt for a profile on launch", checked: config?.enabled ?? true, onChange: async (enabled) => setConfig(await updateGame(appId, { enabled })) }) }), SP_JSX.jsxs(DFL.DialogButton, { onClick: () => setExpanded((e) => !e), style: {
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "8px",
                            marginBottom: expanded ? "4px" : "0",
                        }, children: [SP_JSX.jsx("span", { children: "Profiles offered for this game" }), SP_JSX.jsxs("span", { style: { opacity: 0.7, fontSize: "0.85em" }, children: [allowed.length, " of ", profiles.length, " ", expanded ? "▾" : "▸"] })] }), expanded && (SP_JSX.jsx(DFL.Focusable, { style: { display: "flex", flexDirection: "column", gap: "2px" }, children: profiles.map((_, index) => {
                            const value = index + 1;
                            const label = effectiveProfileLabel(config, profiles, value);
                            const hasOverride = !!config?.profileNames?.[String(value)]?.trim();
                            const isAllowed = allowed.includes(value);
                            const isLast = isAllowed && allowed.length <= 1;
                            return (SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", alignItems: "center", gap: "2px" }, children: [SP_JSX.jsx("div", { style: { flexGrow: 1, minWidth: 0 }, children: SP_JSX.jsx(DFL.ToggleField, { label: `${value}. ${label}`, description: isLast ? "At least one profile has to stay on." : undefined, checked: isAllowed, disabled: isLast, onChange: () => void toggleProfile(value) }) }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => void renameProfile(value), style: {
                                            padding: "0",
                                            minWidth: "0",
                                            width: "32px",
                                            height: "32px",
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }, children: SP_JSX.jsx(FaPen, { size: 11 }) }), hasOverride && (SP_JSX.jsx(DFL.DialogButton, { onClick: () => void clearProfileName(value), style: {
                                            padding: "0",
                                            minWidth: "0",
                                            width: "32px",
                                            height: "32px",
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }, children: SP_JSX.jsx(FaUndo, { size: 11 }) }))] }, value));
                        }) }))] })), SP_JSX.jsx(DFL.Focusable, { style: { display: "flex", gap: "8px", marginTop: "16px" }, children: SP_JSX.jsx(DFL.DialogButton, { onClick: closeModal, children: "Close" }) })] }));
};

/**
 * Walk the library and cache which apps launch a .sh. Not required — the
 * interceptor detects on first launch too — but it makes that first launch
 * instant instead of kill-and-relaunch.
 */
async function scanLibrary(onProgress) {
    clearNoScript();
    const apps = listLibraryApps();
    const batchSize = 6;
    let done = 0;
    let found = 0;
    for (let i = 0; i < apps.length; i += batchSize) {
        const batch = apps.slice(i, i + batchSize);
        await Promise.all(batch.map(async ({ appId, name }) => {
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
                else {
                    markNoScript(key);
                }
            }
            catch (e) {
                console.warn("[LaunchProfiles] scan failed for", appId, e);
            }
        }));
        done += batch.length;
        onProgress?.({ done: Math.min(done, apps.length), total: apps.length, found });
    }
    await refresh();
    return found;
}

const QamPanel = () => {
    const [settings, setSettings] = SP_REACT.useState(snapshot());
    const [names, setNames] = SP_REACT.useState(snapshot()?.profiles ?? []);
    const [dirty, setDirty] = SP_REACT.useState(false);
    const [scanning, setScanning] = SP_REACT.useState(null);
    const [newExclusion, setNewExclusion] = SP_REACT.useState("");
    SP_REACT.useEffect(() => {
        const unsubscribe = subscribe((next) => {
            setSettings({ ...next });
            setNames((current) => (dirty ? current : [...next.profiles]));
        });
        void refresh();
        return unsubscribe;
    }, [dirty]);
    if (!settings) {
        return (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: "Loading\u2026" }) }));
    }
    const games = Object.entries(settings.games)
        .filter(([, config]) => config.detected && !isExcluded(config.script, settings.excludedScripts))
        .sort((a, b) => (a[1].name ?? "").localeCompare(b[1].name ?? ""));
    const runScan = async () => {
        setScanning("Scanning…");
        try {
            const found = await scanLibrary(({ done, total, found }) => setScanning(`${done}/${total} checked, ${found} found`));
            setScanning(`Done — ${found} script-launched game${found === 1 ? "" : "s"}`);
        }
        catch (e) {
            setScanning(`Scan failed: ${e}`);
        }
        setTimeout(() => setScanning(null), 4000);
    };
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Games", children: [games.length === 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "Nothing detected yet", description: "Scan your library, or just launch a game whose launch options point at a .sh file.", bottomSeparator: "none", focusable: true }) })), games.map(([appId, config]) => (SP_JSX.jsxs(DFL.PanelSectionRow, { children: [SP_JSX.jsx(DFL.ToggleField, { label: config.name || `App ${appId}`, description: `${basename(config.script)} · ${effectiveAllowedProfiles(config, settings.profiles.length).length} of ${settings.profiles.length} profiles`, checked: config.enabled, onChange: (enabled) => void updateGame(appId, { enabled }) }), SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => DFL.showModal(SP_JSX.jsx(GameProfilesModal, { appId: appId, fallbackName: config.name }), window), children: "Change Profiles..." })] }, appId))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: !!scanning, onClick: runScan, children: scanning ?? "Scan library for .sh launchers" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Profiles", children: [names.map((name, index) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: `Profile ${index + 1}`, value: name, onChange: (e) => {
                                const next = [...names];
                                next[index] = e.target.value;
                                setNames(next);
                                setDirty(true);
                            } }) }, index))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => {
                                setNames([...names, `Profile ${names.length + 1}`]);
                                setDirty(true);
                            }, children: "Add a profile" }) }), names.length > 1 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => {
                                setNames(names.slice(0, -1));
                                setDirty(true);
                            }, children: "Remove the last profile" }) })), dirty && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: async () => {
                                await updateSettings({
                                    profiles: names.map((n, i) => n.trim() || `Profile ${i + 1}`),
                                });
                                setDirty(false);
                            }, children: "Save profile names" }) }))] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Excluded scripts", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "Scripts with these names are never treated as profile scripts. Wildcards work: launch.sh, start-*.sh", bottomSeparator: "none" }) }), (settings.excludedScripts ?? []).map((pattern, index) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => void updateSettings({
                                excludedScripts: settings.excludedScripts.filter((_, i) => i !== index),
                            }), children: `Remove "${pattern}"` }) }, `${pattern}-${index}`))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Add a name to exclude", value: newExclusion, onChange: (e) => setNewExclusion(e.target.value) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: !newExclusion.trim(), onClick: async () => {
                                const pattern = newExclusion.trim();
                                if (!pattern)
                                    return;
                                const current = settings.excludedScripts ?? [];
                                if (!current.includes(pattern)) {
                                    await updateSettings({ excludedScripts: [...current, pattern] });
                                }
                                setNewExclusion("");
                            }, children: "Add exclusion" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Advanced", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Script variable", description: "The assignment rewritten inside the .sh file.", value: settings.variable, onChange: (e) => void updateSettings({ variable: e.target.value }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Prompt for newly detected games", checked: settings.askByDefault, onChange: (askByDefault) => void updateSettings({ askByDefault }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Back up scripts once", description: "Writes a .launchprofiles.bak next to each script the first time it is edited.", checked: settings.backup, onChange: (backup) => void updateSettings({ backup }) }) }), games.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: async () => {
                                for (const [appId] of games)
                                    await dropGame(appId);
                            }, children: "Forget all detected games" }) }))] })] }));
};

const iconButtonStyle = {
    padding: "0",
    minWidth: "0",
    width: "32px",
    height: "32px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};
/**
 * Lets the person pick which global profiles apply to a game. Shown
 * automatically the first time a game's launch is intercepted, and
 * reachable on demand from the launch prompt afterward. Returns the chosen
 * profile numbers (ascending), or null if they backed out — the caller
 * decides what "no change" means in each context.
 */
const ProfileSetupModal = ({ appId, gameName, scriptName, profiles, cancelLabel = "Cancel launch", onResult, closeModal, }) => {
    const [selected, setSelected] = SP_REACT.useState(Array.from({ length: profiles.length }, (_, i) => i + 1));
    const [config, setConfig] = SP_REACT.useState(gameConfig(appId));
    const settled = SP_REACT.useRef(false);
    const settle = (value) => {
        if (settled.current)
            return;
        settled.current = true;
        onResult(value);
        closeModal?.();
    };
    const toggle = (value) => {
        setSelected((current) => {
            const isOn = current.includes(value);
            if (isOn && current.length <= 1)
                return current; // keep at least one
            return isOn
                ? current.filter((v) => v !== value)
                : [...current, value].sort((a, b) => a - b);
        });
    };
    // Renames save immediately, independent of the checklist above — they're
    // kept even if the person backs out of the selection with Cancel.
    const renameProfile = async (value) => {
        const current = effectiveProfileLabel(config, profiles, value);
        const newLabel = await promptRenameProfile(current);
        if (newLabel === null)
            return;
        setConfig(await updateGame(appId, {
            profileNames: { ...(config?.profileNames ?? {}), [String(value)]: newLabel },
        }));
    };
    const clearProfileName = async (value) => {
        const next = { ...(config?.profileNames ?? {}) };
        delete next[String(value)];
        setConfig(await updateGame(appId, { profileNames: next }));
    };
    return (SP_JSX.jsxs(DFL.ModalRoot, { onCancel: () => settle(null), onEscKeypress: () => settle(null), children: [SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "1.4em", fontWeight: "bold" }, children: "Profile Setup" }), SP_JSX.jsxs("div", { style: { opacity: 0.7, fontSize: "0.9em" }, children: [gameName, " \u00B7 ", scriptName] })] }), SP_JSX.jsx("div", { style: { marginTop: "12px", opacity: 0.85 }, children: "Choose which profiles this game should offer. You can come back here anytime from the launch prompt, or edit toggles in more detail from Change Profiles... in the Quick Access menu." }), SP_JSX.jsx(DFL.Focusable, { style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    marginTop: "12px",
                }, children: profiles.map((_, index) => {
                    const value = index + 1;
                    const label = effectiveProfileLabel(config, profiles, value);
                    const hasOverride = !!config?.profileNames?.[String(value)]?.trim();
                    const isOn = selected.includes(value);
                    const isLast = isOn && selected.length <= 1;
                    return (SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", alignItems: "center", gap: "2px" }, children: [SP_JSX.jsx("div", { style: { flexGrow: 1, minWidth: 0 }, children: SP_JSX.jsx(DFL.ToggleField, { label: `${value}. ${label}`, description: isLast ? "At least one profile has to stay on." : undefined, checked: isOn, disabled: isLast, onChange: () => toggle(value) }) }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => void renameProfile(value), style: iconButtonStyle, children: SP_JSX.jsx(FaPen, { size: 11 }) }), hasOverride && (SP_JSX.jsx(DFL.DialogButton, { onClick: () => void clearProfileName(value), style: iconButtonStyle, children: SP_JSX.jsx(FaUndo, { size: 11 }) }))] }, value));
                }) }), SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", gap: "8px", marginTop: "16px" }, children: [SP_JSX.jsx(DFL.DialogButton, { onClick: () => settle(selected), children: "Continue" }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => settle(null), children: cancelLabel })] })] }));
};
function promptProfileSetup(props) {
    return new Promise((resolve) => {
        DFL.showModal(SP_JSX.jsx(ProfileSetupModal, { ...props, onResult: resolve }), window);
    });
}

const ProfileModal = ({ appId, allProfiles, gameName, scriptName, variable, currentValue, options: initialOptions, defaultValue: initialDefaultValue, onResult, closeModal, }) => {
    const [keepAsking, setKeepAsking] = SP_REACT.useState(true);
    const [options, setOptions] = SP_REACT.useState(initialOptions);
    const [defaultValue, setDefaultValue] = SP_REACT.useState(initialDefaultValue);
    const settled = SP_REACT.useRef(false);
    const settle = (choice) => {
        if (settled.current)
            return;
        settled.current = true;
        onResult(choice);
        closeModal?.();
    };
    const openProfileSetup = async () => {
        const chosen = await promptProfileSetup({
            appId,
            gameName,
            scriptName,
            profiles: allProfiles,
            cancelLabel: "Cancel",
        });
        if (chosen === null)
            return; // no change — still on this same prompt
        const config = await updateGame(appId, {
            allowedProfiles: chosen.length === allProfiles.length ? [] : chosen,
        });
        const allowed = effectiveAllowedProfiles(config, allProfiles.length);
        const nextOptions = allowed.map((value) => ({
            value,
            label: effectiveProfileLabel(config, allProfiles, value),
        }));
        setOptions(nextOptions);
        setDefaultValue((prev) => prev && allowed.includes(prev) ? prev : (nextOptions[0]?.value ?? null));
    };
    return (SP_JSX.jsxs(DFL.ModalRoot, { onCancel: () => settle({ profile: null, keepAsking }), onEscKeypress: () => settle({ profile: null, keepAsking }), children: [SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [SP_JSX.jsx("div", { style: { fontSize: "1.4em", fontWeight: "bold" }, children: "Choose a profile" }), SP_JSX.jsxs("div", { style: { opacity: 0.7, fontSize: "0.9em" }, children: [gameName, " \u00B7 ", scriptName, currentValue !== null ? ` (currently ${variable}=${currentValue})` : ""] })] }), SP_JSX.jsx(DFL.Focusable, { style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "16px",
                }, children: options.map((option, index) => {
                    const displayNumber = index + 1;
                    const isDefault = option.value === defaultValue;
                    return (SP_JSX.jsxs(DFL.DialogButton, { 
                        // @ts-expect-error autoFocus isn't in @decky/ui's DialogButtonProps
                        // typing, but the component forwards unknown props to the
                        // underlying <button>, and Steam's controller navigation on
                        // Deck follows native DOM focus — so this genuinely gives the
                        // last-used profile initial gamepad focus.
                        autoFocus: isDefault, onClick: () => settle({ profile: option.value, keepAsking }), style: { display: "flex", justifyContent: "space-between" }, children: [SP_JSX.jsxs("span", { children: [displayNumber, ". ", option.label] }), isDefault && (SP_JSX.jsx("span", { style: { opacity: 0.6, fontSize: "0.85em" }, children: "last used" }))] }, option.value));
                }) }), SP_JSX.jsx("div", { style: { marginTop: "16px" }, children: SP_JSX.jsx(DFL.DialogButton, { onClick: () => void openProfileSetup(), children: "Profile Setup..." }) }), SP_JSX.jsx("div", { style: { marginTop: "8px" }, children: SP_JSX.jsx(DFL.ToggleField, { label: "Ask every time for this game", description: "Turn this off to keep launching with the profile you pick now. You can turn it back on from the Launch Profiles menu.", checked: keepAsking, onChange: setKeepAsking }) }), SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", gap: "8px", marginTop: "8px" }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { onClick: () => settle({ profile: null, keepAsking, skipWrite: true }), children: "Launch unchanged" }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => settle({ profile: null, keepAsking }), children: "Cancel launch" })] })] }));
};
function promptForProfile(props) {
    return new Promise((resolve) => {
        DFL.showModal(SP_JSX.jsx(ProfileModal, { ...props, onResult: resolve }), window);
    });
}

/** appIds we relaunched ourselves — their next GameActionStart passes through. */
const bypass = new Set();
/** appIds currently being prompted, so a double-fire cannot stack modals. */
const busy = new Set();
function toast(title, body) {
    try {
        toaster.toast({ title, body });
    }
    catch {
        console.log(`[LaunchProfiles] ${title}: ${body}`);
    }
}
function registerLaunchInterceptor() {
    let registration;
    try {
        registration = SteamClient.Apps.RegisterForGameActionStart((_actionType, appIdStr, action) => {
            void onGameActionStart(String(appIdStr), action);
        });
    }
    catch (e) {
        console.error("[LaunchProfiles] could not hook game launches", e);
        return () => { };
    }
    return () => {
        try {
            registration?.unregister?.();
        }
        catch {
            /* ignore */
        }
    };
}
async function onGameActionStart(appId, action) {
    if (action !== "LaunchApp")
        return;
    // Our own relaunch — let it through.
    if (bypass.has(appId)) {
        bypass.delete(appId);
        return;
    }
    if (busy.has(appId))
        return;
    if (hasNoScript(appId))
        return;
    const config = gameConfig(appId);
    // Known game, prompting switched off, or known to have no script: do nothing.
    if (config && (!config.enabled || !config.detected))
        return;
    if (config?.detected) {
        // Known .sh game: stop the launch immediately, then take our time.
        busy.add(appId);
        cancelLaunch(getGameId(Number(appId)));
        try {
            await handleLaunch(appId);
        }
        finally {
            busy.delete(appId);
        }
        return;
    }
    // First time we've seen this app. Look it up before deciding, and only
    // interrupt if a script actually turns up. The first launch of a new
    // .sh game therefore gets killed a beat late; after that it is cached.
    busy.add(appId);
    try {
        const info = await getLaunchInfo(Number(appId));
        const script = await resolveScript(info.exe, info.launchOptions);
        if (!script.path) {
            markNoScript(appId);
            return;
        }
        await updateGame(appId, {
            name: info.name,
            script: script.path,
            detected: true,
            enabled: snapshot()?.askByDefault ?? true,
        });
        cancelLaunch(info.gameId);
        await handleLaunch(appId, info.gameId);
    }
    finally {
        busy.delete(appId);
    }
}
async function handleLaunch(appId, knownGameId) {
    const settings = snapshot();
    const profiles = settings?.profiles?.length
        ? settings.profiles
        : ["Profile 1", "Profile 2", "Profile 3"];
    const variable = settings?.variable ?? "PROFILE";
    const info = await getLaunchInfo(Number(appId));
    const gameId = knownGameId ?? info.gameId;
    // Re-resolve every time: launch options may have changed since we cached.
    const script = await resolveScript(info.exe, info.launchOptions);
    if (!script.path) {
        await updateGame(appId, { detected: false, enabled: false, script: "" });
        relaunch(appId, gameId);
        return;
    }
    if (!script.exists) {
        toast("Launch Profiles", `Script not found: ${script.path}`);
        relaunch(appId, gameId);
        return;
    }
    let config = gameConfig(appId);
    if (!config?.configured) {
        const chosen = await promptProfileSetup({
            appId,
            gameName: info.name,
            scriptName: basename(script.path),
            profiles,
        });
        if (chosen === null) {
            // Backed out of setup entirely — cancel this launch, stay unconfigured
            // so setup runs again next time.
            return;
        }
        config = await updateGame(appId, {
            name: info.name,
            script: script.path,
            detected: true,
            allowedProfiles: chosen.length === profiles.length ? [] : chosen,
            configured: true,
        });
    }
    const allowed = effectiveAllowedProfiles(config, profiles.length);
    const options = allowed.map((value) => ({
        value,
        label: effectiveProfileLabel(config, profiles, value),
    }));
    const defaultValue = config?.lastProfile && allowed.includes(config.lastProfile)
        ? config.lastProfile
        : (options[0]?.value ?? null);
    const choice = await promptForProfile({
        appId,
        allProfiles: profiles,
        gameName: info.name,
        scriptName: basename(script.path),
        variable,
        currentValue: script.value,
        options,
        defaultValue,
    });
    await updateGame(appId, {
        name: info.name,
        script: script.path,
        detected: true,
        enabled: choice.keepAsking,
        ...(choice.profile ? { lastProfile: choice.profile } : {}),
    });
    if (choice.profile === null) {
        if (choice.skipWrite)
            relaunch(appId, gameId);
        return; // cancelled: leave the game closed
    }
    if (!script.hasVariable) {
        toast("Launch Profiles", `No ${variable}= line in ${basename(script.path)} — nothing to change.`);
        relaunch(appId, gameId);
        return;
    }
    const result = await writeProfile(script.path, choice.profile);
    if (!result.ok) {
        toast("Launch Profiles — not launched", result.error ?? "Could not update the script.");
        return;
    }
    relaunch(appId, gameId);
}
function relaunch(appId, gameId) {
    bypass.add(appId);
    // Give Steam a moment to finish tearing down the cancelled game action.
    setTimeout(() => {
        runGame(gameId);
        // Safety net: if the launch never reaches us, clear the bypass.
        setTimeout(() => bypass.delete(appId), 10000);
    }, 400);
}

var index = definePlugin(() => {
    // Prime the cache before hooking, so the first launch after boot can be
    // decided synchronously.
    void refresh();
    const unregister = registerLaunchInterceptor();
    return {
        name: "Launch Profiles",
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Launch Profiles" }),
        content: SP_JSX.jsx(QamPanel, {}),
        icon: SP_JSX.jsx(FaSlidersH, {}),
        onDismount() {
            unregister();
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
