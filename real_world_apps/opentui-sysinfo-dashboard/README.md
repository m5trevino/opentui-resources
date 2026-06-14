# 🖥️ OpenTUI Dashboard

> A professional, production-ready Terminal User Interface (TUI) dashboard for real-time system monitoring and process management.

Built with **OpenTUI**, **React**, and **TypeScript** following **Domain-Driven Design** principles.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Bun](https://img.shields.io/badge/bun-v1.3.1-orange)

---

## ✨ Features

### 📊 **Real-Time System Monitoring**

- **CPU & Memory Usage** - Live metrics with color-coded alerts
- **Historical Data** - 60-point sparkline graphs showing trends
- **Disk Usage** - Multi-partition monitoring with usage bars
- **Alert System** - Configurable thresholds for CPU, Memory, and Disk
- **Auto-refresh** - Configurable intervals (default: 1s)

### ⚙️ **Interactive Process Management**

- **Real System Processes** - Live data from your actual running processes
- **Live Search** - Filter processes by name or PID (Press `F`)
- **Sortable Columns** - Sort by PID, Name, CPU, Memory
- **Process Killing** - Kill processes with confirmation dialog (Press `K`)
- **Keyboard Navigation** - Arrow keys to select processes
- **Responsive Layout** - Adapts to terminal size

### 🎨 **Themes & Customization**

- **5 Built-in Themes**:
  - Default - Classic terminal colors
  - Dark - Modern dark with purple/blue accents
  - Light - Light background theme
  - Matrix - Green-on-black hacker aesthetic
  - Nord - Popular Nord color palette
- **Theme Cycling** - Press `T` to switch themes
- **Settings Persistence** - Auto-saved to `~/.opentui-dashboard/settings.json`

### 🎮 **User Experience**

- **Mouse Support** - Click tabs, buttons, and dialogs
- **Keyboard Shortcuts** - Full keyboard navigation
- **Help Screen** - Press `?` for command reference
- **Status Bar** - Hostname, platform, uptime, and time
- **Error Handling** - Graceful error boundaries
- **Loading States** - Animated spinners

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.2.19 or higher
- Terminal with mouse support (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/opentui-dashboard.git
cd opentui-dashboard

# Install dependencies
bun install
```

### Running the Dashboard

```bash
# Start the dashboard
bun run index.ts

# Or use the dev script
bun run dev
```

---

## ⌨️ Keyboard Shortcuts

### Navigation

| Key        | Action                 |
| ---------- | ---------------------- |
| `1`        | Switch to Dashboard    |
| `2`        | Switch to Process List |
| `3`        | Switch to Settings     |
| `?` or `H` | Show Help Screen       |
| `Q`        | Quit Application       |

### Dashboard

| Key | Action                    |
| --- | ------------------------- |
| `R` | Refresh Data              |
| `+` | Decrease Refresh Interval |
| `-` | Increase Refresh Interval |

### Process List

| Key       | Action                |
| --------- | --------------------- |
| `F`       | Toggle Search Bar     |
| `K`       | Kill Selected Process |
| `S`       | Change Sort Field     |
| `↑` / `↓` | Navigate Processes    |

### Settings

| Key | Action       |
| --- | ------------ |
| `T` | Cycle Themes |

### Dialogs

| Key          | Action         |
| ------------ | -------------- |
| `Y`          | Confirm Action |
| `N` or `ESC` | Cancel Action  |

---

## 🖱️ Mouse Support

- **Click Tabs** - Switch between Dashboard, Processes, and Settings
- **Click Buttons** - Confirm or cancel in dialogs
- **Click Backdrop** - Close dialogs by clicking outside

---

## 🏗️ Architecture

Built following **Domain-Driven Design (DDD)** and **SOLID** principles:

```
src/
├── domain/              # Business logic & entities
│   ├── entities/        # Process, SystemMetrics, Theme, AppSettings
│   └── repositories/    # Repository interfaces
├── application/         # Use cases & services
│   └── services/        # MetricsService, ProcessService
├── infrastructure/      # External integrations
│   ├── MetricsRepositoryImpl.ts
│   ├── ProcessRepositoryImpl.ts
│   └── SettingsStorage.ts
├── components/          # React UI components
│   ├── Dashboard.tsx
│   ├── ProcessListInteractive.tsx
│   ├── Settings.tsx
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
└── core/               # Core utilities
```

### Key Patterns

- **Dependency Injection** - Services receive repositories via constructor
- **Repository Pattern** - Abstract data access layer
- **Custom Hooks** - Encapsulate state and side effects
- **Separation of Concerns** - Business logic separate from UI

---

## ⚙️ Configuration

Settings are automatically saved to `~/.opentui-dashboard/settings.json`:

```json
{
  "theme": "default",
  "refreshInterval": 1000,
  "showSparklines": true,
  "maxHistoryPoints": 60,
  "processUpdateInterval": 2000,
  "showSystemInfo": true,
  "alertThresholds": {
    "cpu": 80,
    "memory": 85,
    "disk": 90
  },
  "enableAlerts": true
}
```

### Settings Options

| Setting                  | Type    | Default     | Description                    |
| ------------------------ | ------- | ----------- | ------------------------------ |
| `theme`                  | string  | `"default"` | Active theme name              |
| `refreshInterval`        | number  | `1000`      | Dashboard refresh rate (ms)    |
| `showSparklines`         | boolean | `true`      | Show historical graphs         |
| `maxHistoryPoints`       | number  | `60`        | Max data points to store       |
| `processUpdateInterval`  | number  | `2000`      | Process list refresh rate (ms) |
| `showSystemInfo`         | boolean | `true`      | Show status bar                |
| `alertThresholds.cpu`    | number  | `80`        | CPU alert threshold (%)        |
| `alertThresholds.memory` | number  | `85`        | Memory alert threshold (%)     |
| `alertThresholds.disk`   | number  | `90`        | Disk alert threshold (%)       |
| `enableAlerts`           | boolean | `true`      | Enable alert notifications     |

---

## 🎨 Themes

### Available Themes

1. **Default** - Classic terminal colors (cyan/green/yellow/red)
2. **Dark** - Modern dark theme with purple and blue accents
3. **Light** - Light background for bright environments
4. **Matrix** - Green-on-black hacker aesthetic
5. **Nord** - Popular Nord color palette (blue/teal/green)

Press `T` to cycle through themes, or change in Settings.

---

## 📦 Dependencies

- **@opentui/react** - Terminal UI framework
- **react** - UI library
- **systeminformation** - Real system metrics and process data
- **typescript** - Type safety

### Dev Dependencies

- **@types/node** - Node.js type definitions
- **@types/react** - React type definitions
- **prettier** - Code formatting

---

## 🧪 Development

```bash
# Format code
bun run format

# Type check
bunx tsc --noEmit

# Run in development mode
bun run dev
```

---

## 📝 Scripts

```json
{
  "dev": "bun run index.ts",
  "format": "prettier --write .",
  "type-check": "tsc --noEmit"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Follow **SOLID** principles
- Use **Domain-Driven Design** patterns
- Write **clean, maintainable** code
- Add **TypeScript types** for everything
- Format with **Prettier**

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [OpenTUI](https://github.com/opentui/opentui)
- Powered by [Bun](https://bun.sh)
- Inspired by htop, btop, and other TUI monitoring tools

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ and TypeScript**
