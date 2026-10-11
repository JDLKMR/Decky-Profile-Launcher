import { DialogButton, Focusable, ModalRoot, ToggleField, showModal } from "@decky/ui";
import { FC, useRef, useState } from "react";
import type { PromptEntry } from "./links";

export interface ProfileChoice {
  /** What was picked, or null if the launch was cancelled. */
  entry: PromptEntry | null;
  /** false = stop prompting for this game from now on. */
  keepAsking: boolean;
}

interface Props {
  /** Script profiles and shortcut links, already merged and ordered. */
  entries: PromptEntry[];
  /** Key of the entry to pre-select, or null if none applies. */
  defaultKey: string | null;
  onResult: (choice: ProfileChoice) => void;
  closeModal?: () => void;
}

const ProfileModal: FC<Props> = ({
  entries,
  defaultKey,
  onResult,
  closeModal,
}) => {
  const [keepAsking, setKeepAsking] = useState(true);
  const settled = useRef(false);

  const settle = (choice: ProfileChoice) => {
    if (settled.current) return;
    settled.current = true;
    onResult(choice);
    closeModal?.();
  };

  return (
    <ModalRoot
      onCancel={() => settle({ entry: null, keepAsking })}
      onEscKeypress={() => settle({ entry: null, keepAsking })}
    >
      <div style={{ fontSize: "1.4em", fontWeight: "bold" }}>Select Profile</div>

      <Focusable
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        {entries.map((entry, index) => {
          const displayNumber = index + 1;
          const isDefault = entry.key === defaultKey;
          return (
            <DialogButton
              key={entry.key}
              // @ts-expect-error autoFocus isn't in @decky/ui's DialogButtonProps
              // typing, but the component forwards unknown props to the
              // underlying <button>, and Steam's controller navigation on
              // Deck follows native DOM focus — so this genuinely gives the
              // last-used profile initial gamepad focus.
              autoFocus={isDefault}
              onClick={() => settle({ entry, keepAsking })}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>
                {displayNumber}. {entry.label}
              </span>
              {isDefault && (
                <span style={{ opacity: 0.6, fontSize: "0.85em" }}>last used</span>
              )}
            </DialogButton>
          );
        })}
      </Focusable>

      <div style={{ marginTop: "16px" }}>
        <ToggleField
          label="Always ask for this game"
          checked={keepAsking}
          onChange={setKeepAsking}
        />
      </div>

      <Focusable
        style={{ display: "flex", gap: "8px", marginTop: "8px" }}
        flow-children="horizontal"
      >
        <DialogButton onClick={() => settle({ entry: null, keepAsking })}>
          Cancel
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
