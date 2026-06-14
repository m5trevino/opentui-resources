/**
 * Example 19: Chat Interface
 *
 * Demonstrates a chat/messaging UI:
 * - Message bubbles with timestamps
 * - Input field for new messages
 * - Scroll-to-bottom behavior
 * - Different user avatars/colors
 */

import {
  TextRenderable,
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  ScrollBoxRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

createExampleApp(({ renderer, addTimeout }) => {
  // Chat state
  const messages: Message[] = [
    {
      id: 1,
      user: "Alice",
      text: "Hey! Have you seen the new OpenTUI release?",
      timestamp: new Date(Date.now() - 300000),
      isMe: false,
    },
    {
      id: 2,
      user: "You",
      text: "Not yet! What's new?",
      timestamp: new Date(Date.now() - 240000),
      isMe: true,
    },
    {
      id: 3,
      user: "Alice",
      text: "They added some amazing new features. The flexbox layout is really smooth now.",
      timestamp: new Date(Date.now() - 180000),
      isMe: false,
    },
    {
      id: 4,
      user: "You",
      text: "That sounds great! I've been wanting better layout support.",
      timestamp: new Date(Date.now() - 120000),
      isMe: true,
    },
    {
      id: 5,
      user: "Alice",
      text: "Yeah, and the new scrolling performance is incredible. You should check it out!",
      timestamp: new Date(Date.now() - 60000),
      isMe: false,
    },
  ];

  let nextMessageId = 6;
  const users = ["Alice", "Bob", "Charlie"];
  const userColors: Record<string, string> = {
    Alice: theme.colors.accent1,
    Bob: theme.colors.accent3,
    Charlie: theme.colors.accent4,
    You: theme.colors.accent2,
  };

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
  });

  // Header
  const header = createHeader(renderer, {
    theme,
    title: "Chat Room",
    rightContent: "* 3 online",
    rightColor: theme.colors.success,
    paddingBottom: 1,
  });

  // Messages area
  const messagesContainer = new BoxRenderable(renderer, {
    id: "messages-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    overflow: "hidden",
    marginTop: 1,
  });

  const messagesScroll = new ScrollBoxRenderable(renderer, {
    id: "messages-scroll",
    width: "100%",
    height: "100%",
    scrollbarOptions: { visible: true },
  });

  const messagesContent = new BoxRenderable(renderer, {
    id: "messages-content",
    flexDirection: "column",
    padding: 1,
    gap: 1,
  });

  // Message bubble renderables
  const messageBubbles: BoxRenderable[] = [];

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function createMessageBubble(message: Message): BoxRenderable {
    const bubble = new BoxRenderable(renderer, {
      id: `msg-${message.id}`,
      flexDirection: "column",
      padding: 1,
      marginLeft: message.isMe ? 10 : 0,
      marginRight: message.isMe ? 0 : 10,
      backgroundColor: message.isMe ? theme.colors.bgHighlight : theme.colors.bg,
      border: true,
      borderStyle: "rounded",
      borderColor: message.isMe ? theme.colors.accent2 : theme.colors.border,
      alignSelf: message.isMe ? "flex-end" : "flex-start",
    });

    const headerRow = new BoxRenderable(renderer, {
      id: `msg-header-${message.id}`,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 2,
    });

    const userName = new TextRenderable(renderer, {
      id: `msg-user-${message.id}`,
      content: t`${bold(fg(userColors[message.user] || theme.colors.fg)(message.user))}`,
    });

    const timestamp = new TextRenderable(renderer, {
      id: `msg-time-${message.id}`,
      content: formatTime(message.timestamp),
      fg: theme.colors.fgMuted,
    });

    headerRow.add(userName);
    headerRow.add(timestamp);

    const textContent = new TextRenderable(renderer, {
      id: `msg-text-${message.id}`,
      content: message.text,
      fg: theme.colors.fg,
    });

    bubble.add(headerRow);
    bubble.add(textContent);

    return bubble;
  }

  // Timeout tracking for cleanup
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  let showTypingTimeout: ReturnType<typeof setTimeout> | null = null;
  let incomingMessageTimeout: ReturnType<typeof setTimeout> | null = null;
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  function renderMessages() {
    // Clear existing bubbles
    messageBubbles.forEach((bubble) => {
      messagesContent.remove(bubble.id);
    });
    messageBubbles.length = 0;

    // Create new bubbles
    messages.forEach((message) => {
      const bubble = createMessageBubble(message);
      messageBubbles.push(bubble);
      messagesContent.add(bubble);
    });

    // Scroll to bottom
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      messagesScroll.scrollTo({ x: 0, y: messagesScroll.scrollHeight });
    }, 10);
    if (scrollTimeout) addTimeout(scrollTimeout);
  }

  function addMessage(text: string, isMe: boolean = true) {
    const message: Message = {
      id: nextMessageId++,
      user: isMe ? "You" : users[Math.floor(Math.random() * users.length)],
      text,
      timestamp: new Date(),
      isMe,
    };
    messages.push(message);
    renderMessages();
  }

  // Simulate incoming messages
  function simulateIncomingMessage() {
    const responses = [
      "That's interesting!",
      "I agree with you.",
      "Have you tried the new features?",
      "Let me know what you think!",
      "Sounds good to me!",
      "I'll check it out later.",
      "Thanks for sharing!",
      "That makes sense.",
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage(randomResponse, false);
  }

  messagesScroll.add(messagesContent);
  messagesContainer.add(messagesScroll);

  // Input area
  const inputArea = new BoxRenderable(renderer, {
    id: "input-area",
    flexDirection: "row",
    gap: 1,
    marginTop: 1,
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  const inputPrompt = new TextRenderable(renderer, {
    id: "input-prompt",
    content: t`${bold(fg(theme.colors.accent2)("You:"))}`,
  });

  const messageInput = new InputRenderable(renderer, {
    id: "message-input",
    flexGrow: 1,
    placeholder: "Type a message...",
    backgroundColor: theme.colors.bg,
    focusedBackgroundColor: theme.colors.bgHighlight,
    textColor: theme.colors.fg,
    placeholderColor: theme.colors.fgMuted,
  });

  let currentInput = "";

  messageInput.on(InputRenderableEvents.CHANGE, (value: string) => {
    currentInput = value;
  });

  inputArea.add(inputPrompt);
  inputArea.add(messageInput);

  // Typing indicator
  const typingIndicator = new TextRenderable(renderer, {
    id: "typing",
    content: "",
    fg: theme.colors.fgMuted,
    marginTop: 1,
  });

  // Instructions
  const instructions = createKeyBindingBar(
    renderer,
    [
      { key: "Enter", action: "Send" },
      { key: "Tab", action: "Focus input" },
      { key: "Ctrl+C/q", action: "Exit" },
    ],
    { theme, id: "instructions" }
  );
  instructions.marginTop = 1;

  // Build tree
  main.add(header.getContainer());
  main.add(messagesContainer);
  main.add(inputArea);
  main.add(typingIndicator);
  main.add(instructions);
  renderer.root.add(main);

  // Initial render
  renderMessages();
  messageInput.focus();

  function showTyping(user: string) {
    typingIndicator.content = `${user} is typing...`;
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      typingIndicator.content = "";
    }, 3000);
    if (typingTimeout) addTimeout(typingTimeout);
  }

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "q":
        // Only exit if not focused on input and not Ctrl+Q
        if (!key.ctrl && !messageInput.focused) {
          renderer.destroy();
        }
        break;
      case "return":
      case "enter":
        if (currentInput.trim()) {
          addMessage(currentInput.trim());
          messageInput.clear();
          currentInput = "";

          // Simulate response after a delay
          const randomUser = users[Math.floor(Math.random() * users.length)];
          if (showTypingTimeout) clearTimeout(showTypingTimeout);
          if (incomingMessageTimeout) clearTimeout(incomingMessageTimeout);
          showTypingTimeout = setTimeout(() => showTyping(randomUser), 500);
          incomingMessageTimeout = setTimeout(simulateIncomingMessage, 2000 + Math.random() * 2000);
          if (showTypingTimeout) addTimeout(showTypingTimeout);
          if (incomingMessageTimeout) addTimeout(incomingMessageTimeout);
        }
        break;
      case "tab":
        messageInput.focus();
        break;
      case "escape":
        messageInput.blur();
        break;
      case "pageup":
        messagesScroll.scrollBy({ x: 0, y: -10 });
        break;
      case "pagedown":
        messagesScroll.scrollBy({ x: 0, y: 10 });
        break;
    }
  });
}, {
  // Disable default q key handling - we handle it in our keypress handler
  disableQuitKey: true,
});
