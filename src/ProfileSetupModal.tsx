import { DialogButton, Focusable, ModalRoot, ToggleField, showModal } from "@decky/ui";
import { FC, useRef, useState } from "react";
import { FaPen, FaUndo } from "react-icons/fa";
import { GameConfig } from "./backend";
import { promptRenameProfile } from "./RenameProfileModal";
import { effectiveProfileLabel, gameConfig, updateGame } from "./store";

interface Props {
  appId: string;
  gameName: string;
  scriptName: string;
  profiles: string[];
  /** "Cancel launch" the first time round; just "Cancel" when reopened mid-prompt. */
  cancelLabel?: string;
  onResult: (chosen: number[] | null) => void;
  closeModal?: () => void;
}

/**
 * Lets the person pick which global profiles apply to a game. Shown
 * automatically the first time a game's launch is intercepted, and
 * reachable on demand from the launch prompt afterward. Returns the chosen
 * profile numbers (ascending), or null if they backed out — the caller
 * decides what "no change" means in each context.
 */
const ProfileSetupModal: FC<Props> = ({
  appId,
  gameName,
  scriptName,
  profiles,
  cancelLabel = "Cancel launch",
  onResult,
  closeModal,
}) => {
  const [selected, setSelected] = useState<number[]>(
    Array.from({ length: profiles.length }, (_, i) => i + 1),
  );
  const [config, setConfig] = useState<GameConfig | undefined>(gameConfig(appId));
  const settled = useRef(false);

  const settle = (value: number[] | null) => {
    if (settled.current) return;
    settled.current = true;
    onResult(value);
    closeModal?.();
  };

  const toggle = (value: number) => {
    setSelected((current) => {
      const isOn = current.includes(value);
      if (isOn && current.length <= 1) return current; // keep at least one
      return isOn
        ? current.filter((v) => v !== value)
        : [...current, value].sort((a, b) => a - b);
    });
  };

  // Renames save immediately, independent of the checklist above — they're
  // kept even if the person backs out of the selection with Cancel.
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

  return (
    <ModalRoot onCancel={() => settle(null)} onEscKeypress={() => settle(null)}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "1.4em", fontWeight: "bold" }}>Profile Setup</div>
        <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
          {gameName} &middot; {scriptName}
        </div>
      </div>

      <div style={{ marginTop: "12px", opacity: 0.85 }}>
        Choose which profiles this game should offer. You can change this any
        time from the launch prompt or the plugin settings.
      </div>

      <Focusable
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          marginTop: "12px",
        }}
      >
        {profiles.map((_, index) => {
          const value = index + 1;
          const label = effectiveProfileLabel(config, profiles, value);
          const hasOverride = !!config?.profileNames?.[String(value)]?.trim();
          const isOn = selected.includes(value);
          const isLast = isOn && selected.length <= 1;
          return (
            <Focusable
              key={value}
              style={{ display: "flex", alignItems: "center", gap: "2px" }}
            >
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <ToggleField
                  label={`${value}. ${label}`}
                  description={
                    isLast ? "At least one profile has to stay on." : undefined
                  }
                  checked={isOn}
                  disabled={isLast}
                  onChange={() => toggle(value)}
                />
              </div>
              <DialogButton
                onClick={() => void renameProfile(value)}
                style={{
                  padding: "0",
                  minWidth: "0",
                  width: "32px",
                  height: "32px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPen size={11} />
              </DialogButton>
              {hasOverride && (
                <DialogButton
                  onClick={() => void clearProfileName(value)}
                  style={{
                    padding: "0",
                    minWidth: "0",
                    width: "32px",
                    height: "32px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaUndo size={11} />
                </DialogButton>
              )}
            </Focusable>
          );
        })}
      </Focusable>

      <Focusable style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <DialogButton onClick={() => settle(selected)}>Continue</DialogButton>
        <DialogButton onClick={() => settle(null)}>{cancelLabel}</DialogButton>
      </Focusable>
    </ModalRoot>
  );
};

export function promptProfileSetup(
  props: Omit<Props, "onResult" | "closeModal">,
): Promise<number[] | null> {
  return new Promise((resolve) => {
    showModal(<ProfileSetupModal {...props} onResult={resolve} />, window);
  });
}

export default ProfileSetupModal;
