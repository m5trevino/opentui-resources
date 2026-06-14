/**
 * Communications Log Panel
 *
 * Features:
 * - Scrolling terminal log
 * - Timestamps, direction, source, message
 * - New entries appear periodically
 * - Blinking cursor
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
  t,
  bold,
  fg,
} from "@opentui/core";
import { nostromoTheme as theme } from "../theme";
import { baseMessages, getRandomSystemMessage, type CommMessage } from "../data/messages";

const MAX_VISIBLE_MESSAGES = 4;

export function createCommsPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "comms-panel",
    flexDirection: "column",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 0,
    width: "100%",
    overflow: "hidden",
  });

  // Title bar
  const titleBar = new BoxRenderable(renderer, {
    id: "comms-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "comms-title",
    content: t`${bold(fg(theme.colors.fg)("COMMUNICATIONS LOG"))}`,
  });

  const signalStrength = new TextRenderable(renderer, {
    id: "comms-signal",
    content: "SIGNAL: ▂▄▆█",
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(signalStrength);

  // Message area
  const messageArea = new BoxRenderable(renderer, {
    id: "comms-messages",
    flexDirection: "column",
    padding: 1,
    gap: 0,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Message lines
  const messageLines: TextRenderable[] = [];
  for (let i = 0; i < MAX_VISIBLE_MESSAGES; i++) {
    const line = new TextRenderable(renderer, {
      id: `comms-msg-${i}`,
      content: "",
      fg: theme.colors.fg,
    });
    messageLines.push(line);
    messageArea.add(line);
  }

  // Cursor line
  const cursorLine = new TextRenderable(renderer, {
    id: "comms-cursor",
    content: "> █",
    fg: theme.colors.success,
  });
  messageArea.add(cursorLine);

  container.add(titleBar);
  container.add(messageArea);

  // Message buffer - start with some base messages
  const messageBuffer: CommMessage[] = [...baseMessages.slice(0, MAX_VISIBLE_MESSAGES)];
  let messageIndex = MAX_VISIBLE_MESSAGES;
  let lastMessageTime = 0;
  let cursorBlink = true;

  // Message type colors (expanded palette)
  const MESSAGE_COLORS: Record<string, string> = {
    INCOMING: theme.colors.accent2, // Cyan
    OUTGOING: theme.colors.fg, // Green
    SYSTEM: theme.colors.success, // Green
    ALERT: theme.colors.error, // Red
    DIAGNOSTIC: theme.colors.accent5, // Blue
    ENCRYPTED: theme.colors.warning, // Amber
  };

  function formatMessage(msg: CommMessage): { text: string; color: string } {
    const timestamp = msg.timestamp.substring(11); // Just time portion
    const direction = msg.direction.padEnd(10);

    // Get color based on direction/type
    const dirColor = MESSAGE_COLORS[msg.direction] || theme.colors.fg;

    // Add prefix icon based on type
    let icon = ">";
    if (msg.direction === "ALERT") icon = "!";
    else if (msg.direction === "DIAGNOSTIC") icon = "◆";
    else if (msg.direction === "ENCRYPTED") icon = "◊";
    else if (msg.direction === "INCOMING") icon = "←";
    else if (msg.direction === "OUTGOING") icon = "→";

    const source = msg.source.substring(0, 14).padEnd(14);
    const message = `"${msg.message}"`;

    // Return formatted text (will be truncated if too long)
    const fullText = `${icon} ${timestamp}  ${direction}  ${source}  ${message}`;
    return {
      text: fullText.length > 78 ? fullText.substring(0, 75) + "..." : fullText,
      color: dirColor,
    };
  }

  function addNewMessage() {
    // Cycle through base messages, occasionally add random system message
    let newMsg: CommMessage;

    if (Math.random() < 0.3) {
      newMsg = getRandomSystemMessage();
    } else {
      newMsg = baseMessages[messageIndex % baseMessages.length];
      messageIndex++;
    }

    // Add to buffer, remove oldest if needed
    messageBuffer.push(newMsg);
    if (messageBuffer.length > MAX_VISIBLE_MESSAGES) {
      messageBuffer.shift();
    }
  }

  function update(time: number) {
    // Add new message every 5-10 seconds
    if (time - lastMessageTime > 5 + Math.random() * 5) {
      addNewMessage();
      lastMessageTime = time;
    }

    // Update message display
    messageLines.forEach((line, i) => {
      if (i < messageBuffer.length) {
        const msg = messageBuffer[messageBuffer.length - 1 - i];
        const { text, color } = formatMessage(msg);
        line.content = text;
        line.fg = color;
      } else {
        line.content = "";
      }
    });

    // Cursor blink (every 500ms)
    cursorBlink = Math.floor(time * 2) % 2 === 0;
    cursorLine.content = cursorBlink ? "> █" : ">  ";

    // Signal strength animation
    const signalLevel = Math.floor(time * 2) % 4;
    const signalBars = ["▂   ", "▂▄  ", "▂▄▆ ", "▂▄▆█"];
    signalStrength.content = `SIGNAL: ${signalBars[signalLevel]}`;
  }

  return { container, update };
}
