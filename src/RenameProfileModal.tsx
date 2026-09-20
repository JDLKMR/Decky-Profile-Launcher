import { DialogButton, Focusable, ModalRoot, TextField, showModal } from "@decky/ui";
import { FC, useRef, useState } from "react";

interface Props {
  currentLabel: string;
  onResult: (newLabel: string | null) => void;
  closeModal?: () => void;
}

const RenameProfileModal: FC<Props> = ({ currentLabel, onResult, closeModal }) => {
  const [value, setValue] = useState(currentLabel);
  const settled = useRef(false);

  const settle = (result: string | null) => {
    if (settled.current) return;
    settled.current = true;
    onResult(result);
    closeModal?.();
  };

  const trimmed = value.trim();

  return (
    <ModalRoot onCancel={() => settle(null)} onEscKeypress={() => settle(null)}>
      <div style={{ fontSize: "1.4em", fontWeight: "bold", marginBottom: "12px" }}>
        Rename profile
      </div>

      <TextField
        label="Display name for this game"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Focusable style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <DialogButton disabled={!trimmed} onClick={() => settle(trimmed)}>
          Save
        </DialogButton>
        <DialogButton onClick={() => settle(null)}>Cancel</DialogButton>
      </Focusable>
    </ModalRoot>
  );
};

export function promptRenameProfile(currentLabel: string): Promise<string | null> {
  return new Promise((resolve) => {
    showModal(<RenameProfileModal currentLabel={currentLabel} onResult={resolve} />, window);
  });
}

export default RenameProfileModal;
