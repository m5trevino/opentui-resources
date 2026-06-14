/**
 * Filename: ConfirmDialog.tsx
 * Folder: /components/ui/
 */

import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);

  // Fade-in animation effect
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <box
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onMouseDown={onCancel}
      />

      {/* Dialog box - centered */}
      <box
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: -32,
          marginTop: -7,
          width: 64,
          height: 14,
          backgroundColor: "#1a1b26",
          border: true,
          borderStyle: "double",
          borderColor: danger ? "red" : "cyan",
          padding: 2,
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* Title with icon */}
        <box style={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
          <text fg={danger ? "red" : "cyan"}>{danger ? "⚠" : "ℹ"}</text>
          <text fg={danger ? "red" : "cyan"}>
            <strong>{title}</strong>
          </text>
        </box>

        {/* Message */}
        <box
          style={{
            marginTop: 1,
            marginBottom: 1,
            padding: 1,
            flexGrow: 1,
          }}
        >
          <text>{message}</text>
        </box>

        {/* Action buttons with mouse support */}
        <box
          style={{
            flexDirection: "row",
            gap: 3,
            marginTop: 1,
            justifyContent: "center",
          }}
        >
          <box
            onMouseDown={onConfirm}
            style={{
              border: true,
              borderStyle: "single",
              borderColor: danger ? "red" : "green",
              padding: 0,
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            <text fg={danger ? "red" : "green"}>
              <strong>[Y]</strong> {confirmText}
            </text>
          </box>

          <box
            onMouseDown={onCancel}
            style={{
              border: true,
              borderStyle: "single",
              borderColor: "gray",
              padding: 0,
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            <text fg="gray">
              <strong>[N]</strong> {cancelText}
            </text>
          </box>
        </box>

        {/* Keyboard hint */}
        <box style={{ justifyContent: "center", marginTop: 1 }}>
          <text fg="gray">Press Y or N, or click a button</text>
        </box>
      </box>
    </>
  );
}
