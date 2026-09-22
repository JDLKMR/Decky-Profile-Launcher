import { DialogButton, Focusable, ModalRoot, ToggleField } from "@decky/ui";
import { FC, useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPen, FaUndo } from "react-icons/fa";
import { GameConfig, resolveScript } from "./backend";
import { promptRenameProfile } from "./RenameProfileModal";
import {
  effectiveAllowedProfiles,
  effectiveProfileLabel,
  effectiveProfileOrder,
  gameConfig,
  hasCustomProfileOrder,
  snapshot,
  updateGame,
} from "./store";
import { getLaunchInfo } from "./steam";
import { basename } from "./util";

const iconButtonStyle = {
  padding: "0",
  minWidth: "0",
  width: "32px",
  height: "32px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

interface Props {
  appId: string;
  fallbackName?: string;
  closeModal?: () => void;
}

/**
 * Per-game profile editor, opened from the QAM. Resolves the script fresh
 * rather than assuming the cached entry is current, in case launch options
 * changed since it was last detected.
 */
const GameProfilesModal: FC<Props> = ({ appId, fallbackName, closeModal }) => {
  const settings = snapshot();
  const profiles = settings?.profiles ?? [];

  const [config, setConfig] = useState<GameConfig | undefined>(gameConfig(appId));
  const [status, setStatus] = useState<"loading" | "ready" | "none">(
    gameConfig(appId)?.detected ? "ready" : "loading",
  );
  const [scriptPath, setScriptPath] = useState(gameConfig(appId)?.script ?? "");
  const [name, setName] = useState(
    gameConfig(appId)?.name || fallbackName || `App ${appId}`,
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const info = await getLaunchInfo(Number(appId));
        const script = await resolveScript(info.exe, info.launchOptions);
        if (cancelled) return;

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

        if (cancelled) return;
        setName(info.name || name);
        setScriptPath(script.path);
        setConfig(entry);
        setStatus("ready");
      } catch (e) {
        console.error("[ProfileLauncher] game lookup failed", e);
        if (!cancelled) setStatus("none");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appId]);

  const allowed = effectiveAllowedProfiles(config, profiles.length);

  const toggleProfile = async (value: number) => {
    const isAllowed = allowed.includes(value);
    if (isAllowed && allowed.length <= 1) return; // keep at least one

    const next = isAllowed
      ? allowed.filter((v) => v !== value)
      : [...allowed, value].sort((a, b) => a - b);

    setConfig(
      await updateGame(appId, {
        allowedProfiles: next.length === profiles.length ? [] : next,
      }),
    );
  };

  const renameProfile = async (value: number) => {
    const current = effectiveProfileLabel(config, profiles, value);
    const newLabel = await promptRenameProfile(current);
    if (newLabel === null) return;

    setConfig(
      await updateGame(appId, {
        profileNames: { ...(config?.profileNames ?? {}), [String(value)]: newLabel },
      }),
    );
  };

  const clearProfileName = async (value: number) => {
    const next = { ...(config?.profileNames ?? {}) };
    delete next[String(value)];
    setConfig(await updateGame(appId, { profileNames: next }));
  };

  const moveProfile = async (value: number, direction: -1 | 1) => {
    const order = effectiveProfileOrder(config, profiles.length);
    const index = order.indexOf(value);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= order.length) return; // already at an edge

    const next = [...order];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setConfig(await updateGame(appId, { profileOrder: next }));
  };

  const resetOrder = async () => {
    setConfig(await updateGame(appId, { profileOrder: [] }));
  };

  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "1.4em", fontWeight: "bold" }}>Change Profiles</div>
        <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
          {name}
          {scriptPath ? ` · ${basename(scriptPath)}` : ""}
        </div>
      </div>

      {status === "loading" && (
        <div style={{ marginTop: "16px", opacity: 0.7 }}>Looking up launch options…</div>
      )}

      {status === "none" && (
        <div style={{ marginTop: "16px", opacity: 0.8 }}>
          No profile script for this game. Its launch options and target don't point
          at a .sh file, or the script's name is on the excluded list.
        </div>
      )}

      {status === "ready" && (
        <>
          <div style={{ marginTop: "16px" }}>
            <ToggleField
              label="Prompt for a profile on launch"
              checked={config?.enabled ?? true}
              onChange={async (enabled) =>
                setConfig(await updateGame(appId, { enabled }))
              }
            />
          </div>

          <DialogButton
            onClick={() => setExpanded((e) => !e)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              marginBottom: expanded ? "4px" : "0",
            }}
          >
            <span>Profiles offered for this game</span>
            <span style={{ opacity: 0.7, fontSize: "0.85em" }}>
              {allowed.length} of {profiles.length} {expanded ? "▾" : "▸"}
            </span>
          </DialogButton>

          {expanded && (
            <>
              {hasCustomProfileOrder(config, profiles.length) && (
                <div style={{ marginBottom: "6px" }}>
                  <DialogButton onClick={() => void resetOrder()}>
                    Reset order to default
                  </DialogButton>
                </div>
              )}

              <Focusable style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {effectiveProfileOrder(config, profiles.length).map((value, index, order) => {
                  const label = effectiveProfileLabel(config, profiles, value);
                  const hasOverride = !!config?.profileNames?.[String(value)]?.trim();
                  const isAllowed = allowed.includes(value);
                  const isLast = isAllowed && allowed.length <= 1;
                  return (
                    <Focusable
                      key={value}
                      style={{ display: "flex", alignItems: "center", gap: "2px" }}
                    >
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <ToggleField
                          label={`${index + 1}. ${label}`}
                          description={
                            isLast ? "At least one profile has to stay on." : undefined
                          }
                          checked={isAllowed}
                          disabled={isLast}
                          onChange={() => void toggleProfile(value)}
                        />
                      </div>
                      <DialogButton
                        onClick={() => void moveProfile(value, -1)}
                        disabled={index === 0}
                        style={iconButtonStyle}
                      >
                        <FaChevronUp size={11} />
                      </DialogButton>
                      <DialogButton
                        onClick={() => void moveProfile(value, 1)}
                        disabled={index === order.length - 1}
                        style={iconButtonStyle}
                      >
                        <FaChevronDown size={11} />
                      </DialogButton>
                      <DialogButton
                        onClick={() => void renameProfile(value)}
                        style={iconButtonStyle}
                      >
                        <FaPen size={11} />
                      </DialogButton>
                      {hasOverride && (
                        <DialogButton
                          onClick={() => void clearProfileName(value)}
                          style={iconButtonStyle}
                        >
                          <FaUndo size={11} />
                        </DialogButton>
                      )}
                    </Focusable>
                  );
                })}
              </Focusable>
            </>
          )}
        </>
      )}

      <Focusable style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <DialogButton onClick={closeModal}>Close</DialogButton>
      </Focusable>
    </ModalRoot>
  );
};

export default GameProfilesModal;
