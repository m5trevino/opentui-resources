/**
 * Example 06: Code Viewer
 *
 * Demonstrates CodeRenderable with Tree-sitter syntax highlighting:
 * - Multiple language support
 * - Theme-aware syntax colors
 * - Line numbers
 * - Language switching
 */

import {
  TextRenderable,
  BoxRenderable,
  CodeRenderable,
  SyntaxStyle,
  RGBA,
  type KeyEvent,
  t,
  bold,
  fg,
  bg,
  type StyledText,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

createExampleApp(({ renderer }) => {
  // Syntax highlighting style
  const syntaxStyle = SyntaxStyle.fromStyles({
    keyword: { fg: RGBA.fromHex("#ff6b6b"), bold: true },
    string: { fg: RGBA.fromHex("#51cf66") },
    comment: { fg: RGBA.fromHex("#868e96"), italic: true },
    number: { fg: RGBA.fromHex("#ffd43b") },
    default: { fg: RGBA.fromHex("#ffffff") },
  });

  // Sample code in different languages
  const codeExamples: Record<string, { content: string; filetype: string }> = {
    typescript: {
      filetype: "typescript",
      content: `// TypeScript Example
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error(\`Failed to fetch user: \${response.status}\`);
  }
  return response.json();
}

const user = await fetchUser(42);
console.log(\`Hello, \${user.name}!\`);`,
    },
    python: {
      filetype: "python",
      content: `# Python Example
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class User:
    id: int
    name: str
    email: str
    created_at: datetime

async def fetch_user(user_id: int) -> Optional[User]:
    """Fetch a user by their ID."""
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/users/{user_id}") as resp:
            if resp.status == 200:
                data = await resp.json()
                return User(**data)
            return None

user = await fetch_user(42)
print(f"Hello, {user.name}!")`,
    },
    rust: {
      filetype: "rust",
      content: `// Rust Example
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
    email: String,
    created_at: DateTime<Utc>,
}

async fn fetch_user(id: u64) -> Result<User, Error> {
    let url = format!("/api/users/{}", id);
    let response = reqwest::get(&url).await?;
    let user: User = response.json().await?;
    Ok(user)
}

#[tokio::main]
async fn main() {
    let user = fetch_user(42).await.unwrap();
    println!("Hello, {}!", user.name);
}`,
    },
    go: {
      filetype: "go",
      content: `// Go Example
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type User struct {
    ID        int64     \`json:"id"\`
    Name      string    \`json:"name"\`
    Email     string    \`json:"email"\`
    CreatedAt time.Time \`json:"created_at"\`
}

func fetchUser(id int64) (*User, error) {
    url := fmt.Sprintf("/api/users/%d", id)
    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, err
    }
    return &user, nil
}

func main() {
    user, _ := fetchUser(42)
    fmt.Printf("Hello, %s!\\n", user.Name)
}`,
    },
  };

  const languages = Object.keys(codeExamples);
  let currentLangIndex = 0;

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
    gap: 1,
  });

  // Header
  const header = createHeader(renderer, {
    theme,
    title: "Code Viewer - Tree-sitter Syntax Highlighting",
    rightContent: `Language: ${languages[currentLangIndex]}`,
    rightColor: theme.colors.accent3,
  });

  // Language tabs
  const tabs = new BoxRenderable(renderer, {
    id: "tabs",
    flexDirection: "row",
    gap: 1,
    marginBottom: 1,
  });

  const tabRenderables: TextRenderable[] = [];

  function getTabContent(lang: string, isActive: boolean): StyledText {
    const text = ` ${lang.toUpperCase()} `;
    if (isActive) {
      return t`${bold(fg(theme.colors.bg)(bg(theme.colors.accent2)(text)))}`;
    }
    return t`${fg(theme.colors.fg)(bg(theme.colors.bgHighlight)(text))}`;
  }

  languages.forEach((lang, i) => {
    const isActive = i === currentLangIndex;
    const tab = new TextRenderable(renderer, {
      id: `tab-${lang}`,
      content: getTabContent(lang, isActive),
    });
    tabRenderables.push(tab);
    tabs.add(tab);
  });

  // Code container
  const codeContainer = new BoxRenderable(renderer, {
    id: "code-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    padding: 1,
    overflow: "hidden",
  });

  const codeView = new CodeRenderable(renderer, {
    id: "code-view",
    content: codeExamples[languages[currentLangIndex]].content,
    filetype: codeExamples[languages[currentLangIndex]].filetype,
    syntaxStyle,
    width: "100%",
  });

  codeContainer.add(codeView);

  function updateLanguage(index: number) {
    currentLangIndex = index;
    const lang = languages[currentLangIndex];
    const example = codeExamples[lang];

    // Update code view
    codeView.content = example.content;
    codeView.filetype = example.filetype;

    // Update language indicator
    header.setRightContent(`Language: ${lang}`);

    // Update tabs
    tabRenderables.forEach((tab, i) => {
      const isActive = i === currentLangIndex;
      tab.content = getTabContent(languages[i], isActive);
    });
  }

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "←/→", action: "Switch language" },
      { key: "1-4", action: "Direct select" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(tabs);
  main.add(codeContainer);
  main.add(keyBar);
  renderer.root.add(main);

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "left":
        updateLanguage(
          (currentLangIndex - 1 + languages.length) % languages.length
        );
        break;
      case "right":
        updateLanguage((currentLangIndex + 1) % languages.length);
        break;
      case "1":
      case "2":
      case "3":
      case "4":
        const idx = parseInt(key.name) - 1;
        if (idx < languages.length) {
          updateLanguage(idx);
        }
        break;
    }
  });
});
