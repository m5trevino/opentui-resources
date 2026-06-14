/**
 * Filename: ProcessListInteractive.tsx
 * Folder: /components/
 */

import { useMemo, useState } from "react";
import { ProcessService } from "../application/services/ProcessService";
import { ProcessRepositoryImpl } from "../infrastructure/ProcessRepositoryImpl";
import { useProcessList } from "../hooks/useProcessList";
import {
  Process,
  ProcessFilter,
  ProcessSortField,
  SortDirection,
} from "../domain/entities/Process";
import { BoxPanel } from "./ui/BoxPanel";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { useSettings } from "../hooks/useSettings";
import { useKeyboard } from "@opentui/react";

interface ProcessListInteractiveProps {
  width: number;
  height: number;
}

export function ProcessListInteractive({
  width,
  height,
}: ProcessListInteractiveProps) {
  const { settings } = useSettings();
  const [sortField, setSortField] = useState<ProcessSortField>("cpu");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmKill, setConfirmKill] = useState<Process | null>(null);

  const filter: ProcessFilter = searchTerm ? { searchTerm } : {};

  const processService = useMemo(
    () => new ProcessService(new ProcessRepositoryImpl()),
    [],
  );

  const { processes, loading, error } = useProcessList(
    processService,
    filter,
    sortField,
    sortDirection,
    settings.processUpdateInterval,
  );

  // Keyboard navigation
  useKeyboard((key) => {
    if (confirmKill) {
      if (key.name === "y") {
        handleKillConfirm();
      } else if (key.name === "n" || key.name === "escape") {
        setConfirmKill(null);
      }
      return;
    }

    if (showSearch) {
      if (key.name === "escape") {
        setShowSearch(false);
        setSearchTerm("");
      }
      return;
    }

    switch (key.name) {
      case "f":
        setShowSearch(!showSearch);
        break;
      case "k":
        if (processes[selectedIndex]) {
          setConfirmKill(processes[selectedIndex]);
        }
        break;
      case "up":
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        break;
      case "down":
        setSelectedIndex((prev) => Math.min(processes.length - 1, prev + 1));
        break;
      case "s":
        toggleSort();
        break;
    }
  });

  const toggleSort = () => {
    if (sortField === "cpu") {
      setSortField("memory");
    } else if (sortField === "memory") {
      setSortField("name");
    } else if (sortField === "name") {
      setSortField("pid");
    } else {
      setSortField("cpu");
    }
  };

  const handleKillConfirm = async () => {
    if (confirmKill) {
      try {
        await processService.killProcess(confirmKill.pid);
        setConfirmKill(null);
      } catch (err) {
        console.error("Failed to kill process:", err);
      }
    }
  };

  if (error) {
    return (
      <BoxPanel
        title="Process List"
        style={{
          width: width - 2,
          height: height - 2,
        }}
      >
        <text fg="red">
          <strong>Error:</strong> {error.message}
        </text>
      </BoxPanel>
    );
  }

  const contentHeight = Math.max(5, height - 10);
  const visibleProcesses = processes.slice(0, Math.max(1, contentHeight - 2));
  const isNarrow = width < 80;
  const isVeryNarrow = width < 60;

  return (
    <>
      <BoxPanel
        title={`Process List (${processes.length} processes)`}
        style={{
          width: width - 2,
          height: height - 2,
          flexDirection: "column",
          gap: 0,
          padding: 1,
        }}
      >
        {loading && processes.length === 0 ? (
          <LoadingSpinner message="Loading processes..." />
        ) : (
          <>
            {/* Search Bar */}
            {showSearch && (
              <box
                style={{
                  border: true,
                  borderStyle: "single",
                  padding: 1,
                  marginBottom: 1,
                  height: 3,
                }}
              >
                <input
                  placeholder="Search by name or PID..."
                  focused
                  onInput={setSearchTerm}
                />
              </box>
            )}

            {/* Header */}
            <box
              style={{
                flexDirection: "row",
                gap: 2,
                paddingBottom: 0,
                marginBottom: 1,
              }}
            >
              <text style={{ width: 8 }}>
                <strong>PID</strong>
              </text>
              <text style={{ width: isVeryNarrow ? 15 : 20 }}>
                <strong>Name</strong>
              </text>
              <text style={{ width: 10 }}>
                <strong>
                  CPU%
                  {sortField === "cpu"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </strong>
              </text>
              <text style={{ width: 10 }}>
                <strong>
                  Mem%
                  {sortField === "memory"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </strong>
              </text>
              {!isVeryNarrow && (
                <text style={{ width: 12 }}>
                  <strong>Status</strong>
                </text>
              )}
              {!isNarrow && (
                <text style={{ width: 15 }}>
                  <strong>User</strong>
                </text>
              )}
            </box>

            {/* Process List */}
            <box style={{ flexDirection: "column", gap: 0 }}>
              {visibleProcesses.map((proc, index) => {
                const cpuColor =
                  proc.cpu > 50 ? "red" : proc.cpu > 20 ? "yellow" : "green";
                const memColor =
                  proc.memory > 50
                    ? "red"
                    : proc.memory > 20
                      ? "yellow"
                      : "green";
                const isSelected = index === selectedIndex;

                return (
                  <box
                    key={proc.pid}
                    style={{
                      flexDirection: "row",
                      gap: 2,
                      backgroundColor: isSelected ? "#2a2a3a" : undefined,
                    }}
                  >
                    <text style={{ width: 8 }}>{proc.pid}</text>
                    <text style={{ width: isVeryNarrow ? 15 : 20 }}>
                      {proc.name.length > (isVeryNarrow ? 13 : 18)
                        ? proc.name.substring(0, isVeryNarrow ? 12 : 17) + "…"
                        : proc.name}
                    </text>
                    <text fg={cpuColor} style={{ width: 10 }}>
                      {proc.cpu.toFixed(1)}
                    </text>
                    <text fg={memColor} style={{ width: 10 }}>
                      {proc.memory.toFixed(1)}
                    </text>
                    {!isVeryNarrow && (
                      <text
                        fg={proc.status === "running" ? "green" : "gray"}
                        style={{ width: 12 }}
                      >
                        {proc.status}
                      </text>
                    )}
                    {!isNarrow && (
                      <text style={{ width: 15 }}>
                        {proc.user.length > 13
                          ? proc.user.substring(0, 12) + "…"
                          : proc.user}
                      </text>
                    )}
                  </box>
                );
              })}
            </box>

            {/* Footer */}
            <box
              style={{
                marginTop: 1,
                paddingTop: 1,
                flexDirection: "column",
                gap: 0,
              }}
            >
              <text fg="gray">
                Showing <span fg="cyan">{visibleProcesses.length}</span> of{" "}
                <span fg="cyan">{processes.length}</span> processes
              </text>
              <text fg="gray">
                [F] Search | [K] Kill | [S] Sort | [↑↓] Navigate
              </text>
            </box>
          </>
        )}
      </BoxPanel>

      {/* Kill Confirmation Dialog */}
      {confirmKill && (
        <ConfirmDialog
          title="Kill Process"
          message={`Are you sure you want to kill process "${confirmKill.name}" (PID: ${confirmKill.pid})?`}
          onConfirm={handleKillConfirm}
          onCancel={() => setConfirmKill(null)}
          confirmText="Yes, kill it"
          cancelText="Cancel"
          danger
        />
      )}
    </>
  );
}
