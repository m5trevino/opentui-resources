import { createCliRenderer } from "@opentui/core";
import {
  createRoot,
  useKeyboard,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/react";
import { createOpencode } from "@opencode-ai/sdk";
import { appendFileSync } from "node:fs";
import "opentui-spinner/react";
import { useCallback, useEffect, useRef, useState } from "react";

async function createOpencodeWithFallback() {
  try {
    return await createOpencode({ port: 4099 });
  } catch {
    log(
      "error",
      "failed to start opencode on fixed port 4099; retrying with auto port",
    );
    return createOpencode();
  }
}

const { client, server } = await createOpencodeWithFallback();

const renderer = await createCliRenderer({ exitOnCtrlC: true });

type WidthSnapshot = number | `${number}%` | "auto" | undefined;
type Role = "user" | "assistant" | "system";

type ChatMessage = {
  role: Role;
  content: string;
};

type TileWindowState = {
  id: string;
  number: number;
  width: WidthSnapshot;
  superfocused: boolean;
  sessionID: string | null;
  messages: ChatMessage[];
  inputValue: string;
  isStreaming: boolean;
  pendingAssistantText: string;
  activeAssistantMessageID: string | null;
  lastSubmittedPrompt: string;
  sessionError: string | null;
};

const UNFOCUSED_BORDER_COLOR = "#5f5f5f";
const FOCUSED_BORDER_COLOR = "#44c2ff";

function log(
  level: "debug" | "info" | "error",
  message: string,
  details?: unknown,
) {
  const timestamp = new Date().toISOString();
  const suffix = details === undefined ? "" : ` ${JSON.stringify(details)}`;
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${suffix}\n`;
  try {
    appendFileSync("/home/jhsu/code/niri-tui/niri-tui.log", line, "utf8");
  } catch {
    // ignore logging failures
  }
}

function randomWindowWidth() {
  const minWidth = 18;
  const maxWidth = 44;
  return Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
}

function statusText(windowState: TileWindowState) {
  if (windowState.sessionError) {
    return windowState.sessionError;
  }
  const sessionLabel = windowState.sessionID
    ? `session:${windowState.sessionID.slice(0, 8)}`
    : "session:pending";
  const streamLabel = windowState.isStreaming ? "streaming" : "idle";
  return `${sessionLabel}  ${streamLabel}  msgs:${windowState.messages.length}`;
}

function formatMessage(role: Role, content: string) {
  const label = role === "user" ? "you" : role;
  return `${label}> ${content}`;
}

function getWindowBounds(windowBox: any) {
  const layout = windowBox.getLayoutNode().getComputedLayout();
  const left = Number.isFinite(layout.left) ? layout.left : windowBox.x;
  const width = Number.isFinite(layout.width) ? layout.width : windowBox.width;
  return { left, right: left + width };
}

function setAssistantText(windowState: TileWindowState, content: string) {
  const messages = [...windowState.messages];
  const lastIndex = messages.length - 1;
  if (lastIndex >= 0 && messages[lastIndex]?.role === "assistant") {
    messages[lastIndex] = { role: "assistant", content };
  } else {
    messages.push({ role: "assistant", content });
  }
  return messages;
}

function App() {
  const rootRenderer = useRenderer();
  const { width: terminalWidth } = useTerminalDimensions();
  const [windows, setWindows] = useState<TileWindowState[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [confirmingQuit, setConfirmingQuit] = useState(false);

  const nextWindowNumberRef = useRef(1);
  const shuttingDownRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const windowsRef = useRef(windows);
  const focusedIndexRef = useRef(focusedIndex);

  const viewportRef = useRef<any>(null);
  const windowRefs = useRef(new Map<string, any>());
  const inputRefs = useRef(new Map<string, any>());
  const messagesRefs = useRef(new Map<string, any>());

  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const getViewportWidth = useCallback(() => {
    const viewportNode = viewportRef.current;
    if (viewportNode?.viewport?.width) {
      return Math.max(1, viewportNode.viewport.width);
    }
    return Math.max(1, terminalWidth);
  }, [terminalWidth]);

  const keepFocusedInView = useCallback(() => {
    const focused = windowsRef.current[focusedIndexRef.current];
    const viewportNode = viewportRef.current;
    if (!focused || !viewportNode) {
      return;
    }

    const focusedNode = windowRefs.current.get(focused.id);
    if (!focusedNode) {
      return;
    }

    const { left, right } = getWindowBounds(focusedNode);
    const windowWidth = Math.max(1, right - left);
    const viewportWidth = Math.max(1, viewportNode.viewport.width);
    const currentLeft = viewportNode.scrollLeft;
    const maxScrollLeft = Math.max(0, viewportNode.scrollWidth - viewportWidth);

    let nextScrollLeft = currentLeft;

    if (focused.superfocused) {
      nextScrollLeft = left + windowWidth / 2 - viewportWidth / 2;
    } else if (windowWidth <= viewportWidth) {
      const minVisibleScroll = right - viewportWidth;
      const maxVisibleScroll = left;
      nextScrollLeft = Math.max(
        minVisibleScroll,
        Math.min(currentLeft, maxVisibleScroll),
      );
    } else {
      nextScrollLeft = left;
    }

    viewportNode.scrollLeft = Math.max(
      0,
      Math.min(maxScrollLeft, nextScrollLeft),
    );
  }, []);

  const scrollMessagesToBottom = useCallback((windowID: string) => {
    const node = messagesRefs.current.get(windowID);
    if (!node?.viewport) {
      return;
    }
    const maxTop = Math.max(0, node.scrollHeight - node.viewport.height);
    node.scrollTop = maxTop;
  }, []);

  const focusWindow = useCallback((nextIndex: number) => {
    setFocusedIndex((current) => {
      const source = windowsRef.current;
      if (source.length === 0) {
        return -1;
      }
      const maxIndex = source.length - 1;
      const clamped = Math.max(0, Math.min(nextIndex, maxIndex));
      if (clamped === current) {
        return current;
      }
      return clamped;
    });
  }, []);

  const createSessionForWindow = useCallback(
    async (windowID: string, windowNumber: number) => {
      try {
        log("info", "creating session", { window: windowNumber });
        const result = await client.session.create({ throwOnError: true });
        const sessionID = result.data.id;
        setWindows((current) =>
          current.map((windowState) =>
            windowState.id === windowID
              ? { ...windowState, sessionID, sessionError: null }
              : windowState,
          ),
        );
        log("info", "session created", { window: windowNumber, sessionID });
      } catch {
        log("error", "session creation failed", { window: windowNumber });
        setWindows((current) =>
          current.map((windowState) =>
            windowState.id === windowID
              ? { ...windowState, sessionError: "session creation failed" }
              : windowState,
          ),
        );
      }
    },
    [],
  );

  const addWindow = useCallback(() => {
    const insertionIndex =
      focusedIndexRef.current >= 0
        ? focusedIndexRef.current + 1
        : windowsRef.current.length;

    const windowNumber = nextWindowNumberRef.current++;
    const windowID = `window-${windowNumber}-${Date.now()}`;

    const nextWindow: TileWindowState = {
      id: windowID,
      number: windowNumber,
      width: randomWindowWidth(),
      superfocused: false,
      sessionID: null,
      messages: [],
      inputValue: "",
      isStreaming: false,
      pendingAssistantText: "",
      activeAssistantMessageID: null,
      lastSubmittedPrompt: "",
      sessionError: null,
    };

    setWindows((current) => {
      const next = [...current];
      next.splice(insertionIndex, 0, nextWindow);
      return next;
    });
    setFocusedIndex(insertionIndex);

    void createSessionForWindow(windowID, windowNumber);
  }, [createSessionForWindow]);

  const closeFocusedWindow = useCallback(() => {
    const index = focusedIndexRef.current;
    if (index < 0 || index >= windowsRef.current.length) {
      return;
    }

    const closing = windowsRef.current[index];
    if (!closing) {
      return;
    }

    setWindows((current) =>
      current.filter((windowState) => windowState.id !== closing.id),
    );
    windowRefs.current.delete(closing.id);
    inputRefs.current.delete(closing.id);
    messagesRefs.current.delete(closing.id);

    const nextLength = windowsRef.current.length - 1;
    if (nextLength <= 0) {
      setFocusedIndex(-1);
      return;
    }
    setFocusedIndex(Math.min(index, nextLength - 1));
  }, []);

  const quitApp = useCallback(() => {
    if (shuttingDownRef.current) {
      return;
    }
    shuttingDownRef.current = true;
    log("info", "quit requested");
    abortControllerRef.current?.abort();
    server.close();
    rootRenderer.destroy();
  }, [rootRenderer]);

  const submitWindowInput = useCallback(
    async (windowID: string, submittedValue?: string) => {
      const windowState = windowsRef.current.find(
        (entry) => entry.id === windowID,
      );
      if (!windowState) {
        return;
      }

      const prompt = (submittedValue ?? windowState.inputValue).trim();
      if (!prompt || windowState.isStreaming) {
        return;
      }

      if (!windowState.sessionID) {
        setWindows((current) =>
          current.map((entry) =>
            entry.id === windowID
              ? { ...entry, sessionError: "session not ready yet" }
              : entry,
          ),
        );
        log("debug", "submit blocked: session not ready", {
          window: windowState.number,
        });
        return;
      }

      setWindows((current) =>
        current.map((entry) => {
          if (entry.id !== windowID) {
            return entry;
          }
          return {
            ...entry,
            inputValue: "",
            isStreaming: true,
            pendingAssistantText: "",
            activeAssistantMessageID: null,
            lastSubmittedPrompt: prompt,
            sessionError: null,
            messages: [
              ...entry.messages,
              { role: "user", content: prompt },
              { role: "assistant", content: "" },
            ],
          };
        }),
      );

      const inputNode = inputRefs.current.get(windowID);
      if (inputNode && typeof inputNode === "object" && "value" in inputNode) {
        (inputNode as { value: string }).value = "";
      }

      scrollMessagesToBottom(windowID);
      process.nextTick(() => scrollMessagesToBottom(windowID));

      log("info", "prompt async submit", {
        window: windowState.number,
        sessionID: windowState.sessionID,
        prompt,
      });

      try {
        await client.session.promptAsync({
          throwOnError: true,
          path: { id: windowState.sessionID },
          body: { parts: [{ type: "text", text: prompt }] },
        });
        log("debug", "prompt async accepted", {
          window: windowState.number,
          sessionID: windowState.sessionID,
        });
      } catch {
        log("error", "prompt async failed", {
          window: windowState.number,
          sessionID: windowState.sessionID,
        });
        setWindows((current) =>
          current.map((entry) => {
            if (entry.id !== windowID) {
              return entry;
            }
            return {
              ...entry,
              messages: setAssistantText(entry, "(error sending prompt)"),
              isStreaming: false,
              pendingAssistantText: "",
              activeAssistantMessageID: null,
            };
          }),
        );
      }
    },
    [scrollMessagesToBottom],
  );

  const updateBySessionID = useCallback(
    (
      sessionID: string,
      updater: (windowState: TileWindowState) => TileWindowState,
    ) => {
      setWindows((current) => {
        let changed = false;
        const next = current.map((windowState) => {
          if (windowState.sessionID !== sessionID) {
            return windowState;
          }
          const updated = updater(windowState);
          if (updated !== windowState) {
            changed = true;
          }
          return updated;
        });
        return changed ? next : current;
      });
    },
    [],
  );

  const handleMessagePartUpdated = useCallback(
    (event: unknown) => {
      const properties =
        typeof event === "object" && event !== null
          ? (event as { properties?: unknown }).properties
          : undefined;
      const part =
        typeof properties === "object" && properties !== null
          ? (properties as { part?: unknown }).part
          : undefined;

      if (typeof part !== "object" || part === null) {
        return;
      }

      const type = (part as { type?: unknown }).type;
      const sessionID = (part as { sessionID?: unknown }).sessionID;
      const messageID = (part as { messageID?: unknown }).messageID;
      const fullText = (part as { text?: unknown }).text;
      const delta =
        typeof properties === "object" && properties !== null
          ? (properties as { delta?: unknown }).delta
          : undefined;

      if (
        type !== "text" ||
        typeof sessionID !== "string" ||
        typeof messageID !== "string"
      ) {
        return;
      }

      updateBySessionID(sessionID, (windowState) => {
        if (!windowState.isStreaming) {
          return windowState;
        }

        let nextMessageID = windowState.activeAssistantMessageID;
        if (!nextMessageID) {
          if (typeof delta === "string" && delta.length > 0) {
            nextMessageID = messageID;
          } else if (
            typeof fullText === "string" &&
            fullText === windowState.lastSubmittedPrompt
          ) {
            return windowState;
          } else {
            nextMessageID = messageID;
          }
        }

        if (nextMessageID !== messageID) {
          return windowState;
        }

        const nextPending =
          typeof delta === "string" && delta.length > 0
            ? windowState.pendingAssistantText + delta
            : typeof fullText === "string"
              ? fullText
              : windowState.pendingAssistantText;

        return {
          ...windowState,
          activeAssistantMessageID: nextMessageID,
          pendingAssistantText: nextPending,
          messages: setAssistantText(windowState, nextPending),
        };
      });
    },
    [updateBySessionID],
  );

  const handleMessagePartDelta = useCallback(
    (event: unknown) => {
      const properties =
        typeof event === "object" && event !== null
          ? (event as { properties?: unknown }).properties
          : undefined;

      if (typeof properties !== "object" || properties === null) {
        return;
      }

      const sessionID = (properties as { sessionID?: unknown }).sessionID;
      const messageID = (properties as { messageID?: unknown }).messageID;
      const delta = (properties as { delta?: unknown }).delta;

      if (
        typeof sessionID !== "string" ||
        typeof messageID !== "string" ||
        typeof delta !== "string" ||
        delta.length === 0
      ) {
        return;
      }

      updateBySessionID(sessionID, (windowState) => {
        if (!windowState.isStreaming) {
          return windowState;
        }

        const nextMessageID = windowState.activeAssistantMessageID ?? messageID;
        if (nextMessageID !== messageID) {
          return windowState;
        }

        const nextPending = windowState.pendingAssistantText + delta;
        return {
          ...windowState,
          activeAssistantMessageID: nextMessageID,
          pendingAssistantText: nextPending,
          messages: setAssistantText(windowState, nextPending),
        };
      });
    },
    [updateBySessionID],
  );

  const handleMessageUpdated = useCallback(
    (event: unknown) => {
      const properties =
        typeof event === "object" && event !== null
          ? (event as { properties?: unknown }).properties
          : undefined;
      const info =
        typeof properties === "object" && properties !== null
          ? (properties as { info?: unknown }).info
          : undefined;

      if (typeof info !== "object" || info === null) {
        return;
      }

      const sessionID = (info as { sessionID?: unknown }).sessionID;
      const messageID = (info as { id?: unknown }).id;
      const role = (info as { role?: unknown }).role;

      if (
        typeof sessionID !== "string" ||
        typeof messageID !== "string" ||
        role !== "assistant"
      ) {
        return;
      }

      updateBySessionID(sessionID, (windowState) => {
        if (!windowState.isStreaming || windowState.activeAssistantMessageID) {
          return windowState;
        }
        return {
          ...windowState,
          activeAssistantMessageID: messageID,
          pendingAssistantText: "",
          messages: setAssistantText(windowState, ""),
        };
      });
    },
    [updateBySessionID],
  );

  const handleSessionIdle = useCallback(
    (event: unknown) => {
      const properties =
        typeof event === "object" && event !== null
          ? (event as { properties?: unknown }).properties
          : undefined;
      const sessionID =
        typeof properties === "object" && properties !== null
          ? (properties as { sessionID?: unknown }).sessionID
          : undefined;

      if (typeof sessionID !== "string") {
        return;
      }

      updateBySessionID(sessionID, (windowState) => {
        if (!windowState.isStreaming) {
          return windowState;
        }
        log("info", "session idle", { window: windowState.number, sessionID });
        return {
          ...windowState,
          isStreaming: false,
          pendingAssistantText: "",
          activeAssistantMessageID: null,
        };
      });
    },
    [updateBySessionID],
  );

  const handleSessionError = useCallback(
    (event: unknown) => {
      const properties =
        typeof event === "object" && event !== null
          ? (event as { properties?: unknown }).properties
          : undefined;
      const sessionID =
        typeof properties === "object" && properties !== null
          ? (properties as { sessionID?: unknown }).sessionID
          : undefined;

      if (typeof sessionID !== "string") {
        return;
      }

      updateBySessionID(sessionID, (windowState) => {
        log("error", "session error event", {
          window: windowState.number,
          sessionID,
        });
        return {
          ...windowState,
          messages: setAssistantText(windowState, "(stream error)"),
          isStreaming: false,
          pendingAssistantText: "",
          activeAssistantMessageID: null,
        };
      });
    },
    [updateBySessionID],
  );

  useEffect(() => {
    addWindow();
  }, [addWindow]);

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    void (async () => {
      try {
        log("info", "starting event stream");
        const events = await client.event.subscribe({
          signal: abortController.signal,
        });

        for await (const event of events.stream) {
          if (abortController.signal.aborted) {
            break;
          }

          if (!event || typeof event !== "object") {
            continue;
          }

          const type = (event as { type?: unknown }).type;
          if (type === "message.updated") {
            handleMessageUpdated(event);
          } else if (type === "message.part.updated") {
            handleMessagePartUpdated(event);
          } else if (type === "message.part.delta") {
            handleMessagePartDelta(event);
          } else if (type === "session.idle") {
            handleSessionIdle(event);
          } else if (type === "session.error") {
            handleSessionError(event);
          }
        }
      } catch {
        if (!abortController.signal.aborted) {
          log("error", "event stream disconnected unexpectedly");
          setWindows((current) =>
            current.map((windowState) =>
              windowState.isStreaming
                ? { ...windowState, sessionError: "event stream disconnected" }
                : windowState,
            ),
          );
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [
    handleMessagePartDelta,
    handleMessagePartUpdated,
    handleMessageUpdated,
    handleSessionError,
    handleSessionIdle,
  ]);

  useEffect(() => {
    const focused = windows[focusedIndex];
    if (!focused) {
      return;
    }
    inputRefs.current.get(focused.id)?.focus?.();
    keepFocusedInView();
    process.nextTick(() => keepFocusedInView());
  }, [focusedIndex, windows, keepFocusedInView]);

  useEffect(() => {
    const focused = windows[focusedIndex];
    if (!focused) {
      return;
    }
    scrollMessagesToBottom(focused.id);
  }, [windows, focusedIndex, scrollMessagesToBottom]);

  useKeyboard((key) => {
    const keyName = (key.name ?? "").toLowerCase();
    const isAltCombo = (key.option || key.meta) && !key.ctrl;

    if (confirmingQuit) {
      if (keyName === "y" || keyName === "return") {
        key.preventDefault();
        quitApp();
        return;
      }

      if (keyName === "n" || keyName === "escape") {
        setConfirmingQuit(false);
        key.preventDefault();
        return;
      }

      key.preventDefault();
      return;
    }

    if (keyName === "q") {
      setConfirmingQuit(true);
      key.preventDefault();
      return;
    }

    if (isAltCombo && keyName === "h") {
      focusWindow(focusedIndexRef.current - 1);
      key.preventDefault();
      return;
    }

    if (isAltCombo && keyName === "l") {
      focusWindow(focusedIndexRef.current + 1);
      key.preventDefault();
      return;
    }

    if (isAltCombo && keyName === "x") {
      closeFocusedWindow();
      key.preventDefault();
      return;
    }

    if (isAltCombo && keyName === "f") {
      const focused = windowsRef.current[focusedIndexRef.current];
      if (focused) {
        setWindows((current) =>
          current.map((windowState) =>
            windowState.id === focused.id
              ? { ...windowState, superfocused: !windowState.superfocused }
              : windowState,
          ),
        );
        keepFocusedInView();
      }
      key.preventDefault();
      return;
    }

    if (isAltCombo && keyName === "a") {
      addWindow();
      key.preventDefault();
      return;
    }
  });

  return (
    <box flexGrow={1}>
      <scrollbox
        ref={viewportRef}
        flexGrow={1}
        border
        padding={0}
        scrollX
        scrollY={false}
        horizontalScrollbarOptions={{ visible: false }}
        contentOptions={{
          flexDirection: "row",
          alignItems: "stretch",
          padding: 0,
          gap: 1,
        }}
      >
        {windows.map((windowState, index) => (
          <box
            key={windowState.id}
            ref={(node) => {
              if (node) {
                windowRefs.current.set(windowState.id, node);
              } else {
                windowRefs.current.delete(windowState.id);
              }
            }}
            width={
              windowState.superfocused ? getViewportWidth() : windowState.width
            }
            height="100%"
            border
            borderColor={
              index === focusedIndex
                ? FOCUSED_BORDER_COLOR
                : UNFOCUSED_BORDER_COLOR
            }
            focusedBorderColor={FOCUSED_BORDER_COLOR}
            title={
              windowState.sessionID
                ? `Window ${windowState.number} • ${windowState.sessionID.slice(0, 8)}`
                : `Window ${windowState.number}`
            }
            focusable
            flexDirection="column"
            rowGap={1}
            padding={1}
            justifyContent="center"
            alignItems="stretch"
            onMouseDown={() => focusWindow(index)}
          >
            <scrollbox
              ref={(node) => {
                if (node) {
                  messagesRefs.current.set(windowState.id, node);
                } else {
                  messagesRefs.current.delete(windowState.id);
                }
              }}
              flexGrow={1}
              border
              scrollX={false}
              scrollY
              horizontalScrollbarOptions={{ visible: false }}
              contentOptions={{
                flexDirection: "column",
                alignItems: "stretch",
                paddingLeft: 1,
                paddingRight: 1,
                paddingTop: 0,
                paddingBottom: 0,
                gap: 0,
              }}
            >
              {windowState.messages.map((message, messageIndex) => (
                <text key={`${windowState.id}-msg-${messageIndex}`}>
                  {formatMessage(message.role, message.content)}
                </text>
              ))}
            </scrollbox>

            <text>{statusText(windowState)}</text>

            <box
              border
              height={3}
              paddingX={1}
              justifyContent="space-between"
              alignItems="center"
              flexDirection="row"
            >
              <input
                ref={(node) => {
                  if (node) {
                    inputRefs.current.set(windowState.id, node);
                  } else {
                    inputRefs.current.delete(windowState.id);
                  }
                }}
                flexGrow={1}
                placeholder="Type a prompt and press Enter"
                value={windowState.inputValue}
                onChange={(value: string) => {
                  setWindows((current) =>
                    current.map((entry) =>
                      entry.id === windowState.id
                        ? { ...entry, inputValue: value }
                        : entry,
                    ),
                  );
                }}
                onSubmit={() => {
                  const liveValue = inputRefs.current.get(
                    windowState.id,
                  )?.value;
                  void submitWindowInput(
                    windowState.id,
                    typeof liveValue === "string" ? liveValue : undefined,
                  );
                }}
                focused={index === focusedIndex && !confirmingQuit}
              />
              {windowState.isStreaming ? (
                <box alignItems="center" flexDirection="row">
                  <spinner />
                  <text marginLeft={1}>streaming</text>
                </box>
              ) : null}
            </box>
          </box>
        ))}
      </scrollbox>

      {confirmingQuit && (
        <box
          position="absolute"
          left={2}
          right={2}
          bottom={1}
          height={3}
          border
          justifyContent="center"
          alignItems="center"
          zIndex={100}
        >
          <text>Quit niri-tui? [y/N]</text>
        </box>
      )}
    </box>
  );
}

createRoot(renderer).render(<App />);
