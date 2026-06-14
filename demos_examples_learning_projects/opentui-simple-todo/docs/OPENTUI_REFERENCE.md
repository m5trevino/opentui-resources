# OpenTUI React 参考文档

OpenTUI 是一个现代的 TUI (Terminal User Interface) 框架，提供了 React 绑定，让你可以用 React 的方式编写终端应用。

## 核心概念

### React 支持
OpenTUI React 完全支持标准 React 特性：
- ✅ 所有 React Hooks (useState, useEffect, useContext, useReducer 等)
- ✅ React Context API
- ✅ 自定义 Hooks
- ✅ 函数式组件
- ✅ 组件组合模式

### 初始化模式

```typescript
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
```

## 组件 API

### `<box>` - 容器组件

最常用的布局容器，支持边框、padding、flexbox 布局。

**Props**:
```typescript
interface BoxProps {
  // 布局
  width?: number | string;
  height?: number | string;
  padding?: number;
  margin?: number;
  
  // Flexbox
  flexDirection?: "row" | "column";
  alignItems?: "flex-start" | "center" | "flex-end";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  
  // 边框
  border?: boolean;
  borderStyle?: "single" | "double" | "rounded" | "bold";
  borderColor?: string;
  title?: string;  // 边框标题
  
  // 样式
  backgroundColor?: string;
  
  // 其他
  children?: React.ReactNode;
  style?: Partial<BoxProps>;  // 可以用 style 属性替代直接 props
}
```

**示例**:
```typescript
// 直接使用 props
<box
  backgroundColor="blue"
  padding={2}
  border
  borderColor="white"
  borderStyle="rounded"
>
  <text>内容</text>
</box>

// 使用 style 属性
<box style={{
  backgroundColor: "blue",
  padding: 2,
  border: true,
  borderColor: "white",
  borderStyle: "rounded",
  flexDirection: "column"
}}>
  <text>内容</text>
</box>
```

### `<text>` - 文本组件

显示文本内容，支持颜色和样式。

**Props**:
```typescript
interface TextProps {
  fg?: string;  // 前景色 (foreground)
  children?: string | number | boolean | null | undefined | React.ReactNode;
}
```

**支持的文本修饰符**:
- `<span>` - 内联文本
- `<strong>` / `<b>` - 粗体
- `<em>` / `<i>` - 斜体
- `<u>` - 下划线
- `<br>` - 换行

**示例**:
```typescript
<text fg="white">Hello, World!</text>
<text fg="green">
  <strong>粗体文本</strong>
  <br />
  <em>斜体文本</em>
</text>
```

### `<input>` - 输入框组件

单行文本输入框。

**Props**:
```typescript
interface InputProps {
  value?: string;
  placeholder?: string;
  maxLength?: number;
  
  // 焦点控制
  focused?: boolean;
  
  // 事件处理
  onInput?: (value: string) => void;     // 每次输入触发
  onChange?: (value: string) => void;    // 值改变时触发
  onSubmit?: (value: string) => void;    // 按 Enter 时触发
  
  // 样式
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: number;
  };
}
```

**示例**:
```typescript
const [value, setValue] = useState("");

<input
  value={value}
  placeholder="输入内容..."
  focused={true}
  onInput={setValue}
  onSubmit={(val) => console.log("提交:", val)}
  style={{
    backgroundColor: "black",
    textColor: "white",
    padding: 1
  }}
/>
```

### `<tab-select>` - Tab 选择器

水平 Tab 选择组件。

**Props**:
```typescript
interface TabSelectProps {
  options: Array<{
    name: string;
    description?: string;
    value: any;
  }>;
  
  focused?: boolean;
  
  onChange?: (index: number, option: TabSelectOption | null) => void;
  onSelect?: (index: number, option: TabSelectOption | null) => void;
}
```

**示例**:
```typescript
const filterOptions = [
  { name: "All", value: "all" },
  { name: "Active", value: "active" },
  { name: "Completed", value: "completed" }
];

<tab-select
  options={filterOptions}
  focused={tabFocused}
  onSelect={(index, option) => setFilter(option.value)}
/>
```

### `<select>` - 列表选择器

垂直列表选择组件。

**Props**:
```typescript
interface SelectProps {
  options: Array<{
    name: string;
    value: any;
  }>;
  
  focused?: boolean;
  
  onChange?: (index: number, option: SelectOption | null) => void;
  onSelect?: (index: number, option: SelectOption | null) => void;
}
```

**导航**:
- ↑/k - 向上
- ↓/j - 向下
- Enter - 选择

### `<textarea>` - 多行文本输入

**Props**:
```typescript
interface TextareaProps {
  initialValue?: string;
  placeholder?: string;
  focused?: boolean;
}
```

### `<scrollbox>` - 可滚动容器

**Props**:
```typescript
interface ScrollBoxProps {
  children?: React.ReactNode;
  focused?: boolean;
}
```

### `<code>` - 代码显示

带语法高亮的代码显示组件。

**Props**:
```typescript
interface CodeProps {
  content: string;
  filetype?: string;  // 如 "typescript", "javascript", "python"
}
```

### `<ascii-font>` - ASCII 艺术字体

**Props**:
```typescript
interface AsciiFontProps {
  text: string;
  // 更多配置选项...
}
```

## Hooks API

### `useKeyboard(handler)`

处理键盘事件的核心 Hook。

**参数**:
```typescript
type KeyEvent = {
  name: string;        // 键名，如 "a", "enter", "escape", "tab"
  sequence: string;    // 原始按键序列
  ctrl: boolean;       // Ctrl 键是否按下
  shift: boolean;      // Shift 键是否按下
  meta: boolean;       // Alt 键是否按下 (在某些系统上)
  option: boolean;     // Option 键 (macOS)
};

useKeyboard((key: KeyEvent) => void);
```

**示例**:
```typescript
useKeyboard((key) => {
  // 退出应用
  if (key.name === "q" || key.name === "escape") {
    process.exit(0);
  }
  
  // Ctrl+C
  if (key.ctrl && key.name === "c") {
    // 处理复制
  }
  
  // Tab 键
  if (key.name === "tab") {
    // 切换焦点
  }
});
```

### `useTerminalDimensions()`

获取终端尺寸，响应式更新。

**返回值**:
```typescript
const { width, height } = useTerminalDimensions();
```

**示例**:
```typescript
const { width, height } = useTerminalDimensions();

return (
  <box width={width} height={height}>
    <text>终端尺寸: {width}x{height}</text>
  </box>
);
```

### `useRenderer()`

访问底层 OpenTUI 渲染器实例。

**返回值**:
```typescript
const renderer = useRenderer();
```

### `useOnResize(callback)`

监听终端尺寸变化。

**示例**:
```typescript
useOnResize((width, height) => {
  console.log(`终端调整为: ${width}x${height}`);
});
```

### `useTimeline(options?)`

创建和管理动画时间线。

**参数**:
```typescript
interface TimelineOptions {
  duration?: number;    // 持续时间（毫秒）
  loop?: boolean;       // 是否循环
  onComplete?: () => void;
}
```

**返回值**:
```typescript
const timeline = useTimeline({ duration: 1000, loop: true });
timeline.play();
timeline.pause();
timeline.restart();
```

### `useEffectEvent(handler)`

创建稳定的事件回调，避免不必要的重渲染。

**示例**:
```typescript
const handleClick = useEffectEvent((value) => {
  // 总是使用最新的 props 和 state
  console.log(value, latestState);
});
```

## 样式系统

### 颜色
OpenTUI 支持标准终端颜色：

**基础颜色**:
- `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`

**亮色版本**:
- `brightBlack`, `brightRed`, `brightGreen`, 等

**十六进制**:
- `#ff0000` (某些终端支持)

### 布局系统

OpenTUI 使用 **Yoga** 布局引擎，支持类似 CSS Flexbox 的布局：

```typescript
<box style={{
  flexDirection: "column",      // 或 "row"
  alignItems: "center",         // "flex-start" | "center" | "flex-end"
  justifyContent: "space-between",  // "flex-start" | "center" | "flex-end" | "space-between"
  width: 100,
  height: 50,
  padding: 2,
  margin: 1
}}>
```

## 常用模式

### 1. 全局状态管理 (Context)

```typescript
// AppContext.tsx
import { createContext, useContext, useState } from "react";

interface AppState {
  screen: string;
  // ... 其他状态
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState("welcome");
  
  return (
    <AppContext.Provider value={{ screen, setScreen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
```

### 2. 焦点管理

```typescript
const [focusedComponent, setFocusedComponent] = useState<"input" | "list">("input");

useKeyboard((key) => {
  if (key.name === "tab") {
    setFocusedComponent(prev => prev === "input" ? "list" : "input");
  }
});

return (
  <>
    <input focused={focusedComponent === "input"} />
    <select focused={focusedComponent === "list"} />
  </>
);
```

### 3. 多屏幕导航

```typescript
type Screen = "welcome" | "main" | "settings";

function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  
  useKeyboard((key) => {
    if (key.name === "escape") {
      setScreen("welcome");
    }
  });
  
  return (
    <>
      {screen === "welcome" && <WelcomeScreen onNavigate={setScreen} />}
      {screen === "main" && <MainScreen />}
      {screen === "settings" && <SettingsScreen />}
    </>
  );
}
```

### 4. 列表渲染与过滤

```typescript
const [items, setItems] = useState([...]);
const [filter, setFilter] = useState<"all" | "active">("all");

const filteredItems = items.filter(item => {
  if (filter === "active") return !item.completed;
  return true;
});

return (
  <box>
    {filteredItems.map(item => (
      <box key={item.id}>
        <text>{item.name}</text>
      </box>
    ))}
  </box>
);
```

### 5. 表单输入处理

```typescript
const [inputValue, setInputValue] = useState("");

const handleSubmit = (value: string) => {
  if (value.trim()) {
    // 处理提交
    setInputValue("");  // 清空输入
  }
};

return (
  <input
    value={inputValue}
    placeholder="输入内容..."
    focused
    onInput={setInputValue}
    onSubmit={handleSubmit}
  />
);
```

## 最佳实践

### 1. TypeScript 配置
确保 `tsconfig.json` 包含：
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react"
  }
}
```

### 2. 退出处理
始终提供优雅的退出方式：
```typescript
useKeyboard((key) => {
  if (key.name === "q" || key.name === "escape") {
    process.exit(0);
  }
});
```

### 3. 响应式布局
使用 `useTerminalDimensions()` 适配不同终端尺寸：
```typescript
const { width } = useTerminalDimensions();
<box width={Math.min(width - 4, 80)}>
```

### 4. 组件分离
将复杂 UI 拆分为小组件，提高可维护性：
```typescript
// ❌ 不好
function App() {
  return (
    <box>
      {/* 数百行 JSX */}
    </box>
  );
}

// ✅ 好
function App() {
  return (
    <box>
      <Header />
      <MainContent />
      <Footer />
    </box>
  );
}
```

### 5. 使用自定义 Hooks
封装复杂逻辑：
```typescript
function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useKeyboard((key) => {
    const handler = handlers[key.name];
    if (handler) handler();
  });
}

// 使用
useKeyboardShortcuts({
  "q": () => process.exit(0),
  "r": () => refresh(),
  "h": () => showHelp()
});
```

## 调试技巧

### Console 调试
OpenTUI 有内置 console 覆盖层，可以捕获所有 console 输出：
- 使用 `console.log()`, `console.error()` 等正常调试
- 控制台会显示在 TUI 上方

### 开发模式
使用 `--watch` 模式自动重载：
```bash
bun run --watch src/index.tsx
```

## 性能优化

### 1. 避免不必要的重渲染
使用 `React.memo` 和 `useMemo`:
```typescript
const TodoItem = React.memo(({ todo }) => (
  <box>
    <text>{todo.text}</text>
  </box>
));
```

### 2. 使用 useEffectEvent
避免因回调函数变化导致的重渲染：
```typescript
const handleInput = useEffectEvent((value) => {
  // 使用最新的 state，但回调引用稳定
});
```

## 常见问题

### Q: 如何退出应用？
A: 调用 `process.exit(0)` 或使用 Ctrl+C

### Q: 如何处理中文等宽字符？
A: OpenTUI 自动处理 Unicode 字符宽度

### Q: 支持鼠标事件吗？
A: 支持，参考 `mouse-interaction-demo.ts` 示例

### Q: 如何实现滚动？
A: 使用 `<scrollbox>` 组件

### Q: 颜色不显示？
A: 检查终端是否支持颜色，某些 CI 环境可能需要强制启用颜色

## 资源链接

- [OpenTUI GitHub](https://github.com/sst/opentui)
- [Getting Started](https://github.com/sst/opentui/blob/main/packages/core/docs/getting-started.md)
- [Examples](https://github.com/sst/opentui/tree/main/packages/core/src/examples)
- [React README](https://github.com/sst/opentui/blob/main/packages/react/README.md)

## 总结

OpenTUI 让你可以用熟悉的 React 方式构建强大的 TUI 应用：
- ✅ 完整的 React 生态支持
- ✅ 声明式 UI 组件
- ✅ 强大的 Hooks API
- ✅ Flexbox 布局系统
- ✅ TypeScript 类型支持

Happy Terminal UI coding! 🚀
