import { DialogButton, Focusable, ModalRoot, ToggleField, showModal } from "@decky/ui";
import { FC, useRef, useState } from "react";
import { promptProfileSetup } from "./ProfileSetupModal";
import { effectiveAllowedProfiles, effectiveProfileLabel, updateGame } from "./store";

export interface ProfileOption {
  /** The real, global profile number — what gets written into the script. */
  value: number;
  label: string;
}

export interface ProfileChoice {
  /** The global profile number chosen, or null if the launch was cancelled. */
  profile: number | null;
  /** false = stop prompting for this game from now on. */
  keepAsking: boolean;
  /** true = launch without touching the script. */
  skipWrite?: boolean;
}

interface Props {
  appId: string;
  /** All global profile names, for reopening Profile Setup from here. */
  allProfiles: string[];
  gameName: string;
  scriptName: string;
  variable: string;
  currentValue: string | null;
  /** Already filtered to this game's allowed profiles, in display order. */
  options: ProfileOption[];
  /** Global profile number to pre-select, or null if none applies. */
  defaultValue: number | null;
  onResult: (choice: ProfileChoice) => void;
  closeModal?: () => void;
}

const ProfileModal: FC<Props> = ({
  appId,
  allProfiles,
  gameName,
  scriptName,
  variable,
  currentValue,
  options: initialOptions,
  defaultValue: initialDefaultValue,
  onResult,
  closeModal,
}) => {
  const [keepAsking, setKeepAsking] = useState(true);
  const [options, setOptions] = useState(initialOptions);
  const [defaultValue, setDefaultValue] = useState(initialDefaultValue);
  const settled = useRef(false);

  const settle = (choice: ProfileChoice) => {
    if (settled.current) return;
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
    if (chosen === null) return; // no change — still on this same prompt

    const config = await updateGame(appId, {
      allowedProfiles: chosen.length === allProfiles.length ? [] : chosen,
    });

    const allowed = effectiveAllowedProfiles(config, allProfiles.length);
    const nextOptions: ProfileOption[] = allowed.map((value) => ({
      value,
      label: effectiveProfileLabel(config, allProfiles, value),
    }));
    setOptions(nextOptions);
    setDefaultValue((prev) =>
      prev && allowed.includes(prev) ? prev : (nextOptions[0]?.value ?? null),
    );
  };

  return (
    <ModalRoot
      onCancel={() => settle({ profile: null, keepAsking })}
      onEscKeypress={() => settle({ profile: null, keepAsking })}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontSize: "1.4em", fontWeight: "bold" }}>Choose a profile</div>
        <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
          {gameName} &middot; {scriptName}
          {currentValue !== null ? ` (currently ${variable}=${currentValue})` : ""}
        </div>
      </div>

      <Focusable
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        {options.map((option, index) => {
          const displayNumber = index + 1;
          const isDefault = option.value === defaultValue;
          return (
            <DialogButton
              key={option.value}
              // @ts-expect-error autoFocus isn't in @decky/ui's DialogButtonProps
              // typing, but the component forwards unknown props to the
              // underlying <button>, and Steam's controller navigation on
              // Deck follows native DOM focus — so this genuinely gives the
              // last-used profile initial gamepad focus.
              autoFocus={isDefault}
              onClick={() => settle({ profile: option.value, keepAsking })}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>
                {displayNumber}. {option.label}
              </span>
              {isDefault && (
                <span style={{ opacity: 0.6, fontSize: "0.85em" }}>last used</span>
              )}
            </DialogButton>
          );
        })}
      </Focusable>

      <div style={{ marginTop: "16px" }}>
        <DialogButton onClick={() => void openProfileSetup()}>
          Profile Setup...
        </DialogButton>
      </div>

      <div style={{ marginTop: "8px" }}>
        <ToggleField
          label="Ask every time for this game"
          description="Turn this off to keep launching with the profile you pick now. You can turn it back on from the Launch Profiles menu."
          checked={keepAsking}
          onChange={setKeepAsking}
        />
      </div>

      <Focusable
        style={{ display: "flex", gap: "8px", marginTop: "8px" }}
        flow-children="horizontal"
      >
        <DialogButton
          onClick={() => settle({ profile: null, keepAsking, skipWrite: true })}
        >
          Launch unchanged
        </DialogButton>
        <DialogButton onClick={() => settle({ profile: null, keepAsking })}>
          Cancel launch
        </DialogButton>
      </Focusable>
    </ModalRoot>
  );
};

export function promptForProfile(
  props: Omit<Props, "onResult" | "closeModal">,
): Promise<ProfileChoice> {
  return new Promise((resolve) => {
    showModal(<ProfileModal {...props} onResult={resolve} />, window);
  });
}

export default ProfileModal;
