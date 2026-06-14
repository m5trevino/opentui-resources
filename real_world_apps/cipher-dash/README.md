# 🖥️ TUI System Monitor Dashboard

A real-time system monitoring dashboard built with OpenTUI and React, designed specifically for macOS with M3 Max support.

## ✨ Features

- **Real-time System Metrics**: CPU, Memory, GPU, Network, Disk I/O
- **M3 Max GPU Support**: Specialized monitoring for Apple Silicon
- **Interactive TUI**: Keyboard navigation and controls
- **Responsive Layout**: Adapts to different terminal sizes
- **Smooth Animations**: Progress bars and transitions
- **Temperature Monitoring**: CPU, GPU, and SSD sensors
- **Network Visualization**: Real-time graphs and sparklines

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **macOS** (optimized for M3 Max, but works on other Macs)
- **Terminal** with true color support

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd tui-system-monitor
   ```

2. **Install dependencies**:
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Run the dashboard**:
   ```bash
   # Development mode
   bun run dev
   
   # Or build and run
   bun run build
   bun run start
   ```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Q` or `ESC` | Quit application |
| `H` or `F1` | Toggle help |
| `R` | Refresh data |
| `P` | Pause/Resume updates |
| `1-6` | Select specific metric |

## 📊 Metrics Monitored

### CPU
- Overall usage percentage
- Per-core utilization
- Temperature sensors
- Frequency information

### Memory
- Used/Available RAM
- Memory pressure
- Swap usage

### GPU (M3 Max)
- GPU utilization
- VRAM usage
- Temperature
- Frequency

### Network
- Upload/Download speeds
- Real-time graphs
- Interface statistics

### Disk I/O
- Read/Write speeds
- Disk usage
- Performance graphs

### Temperature
- CPU temperature
- GPU temperature
- SSD temperature
- Ambient sensors

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── MetricCard.tsx   # Metric display cards
│   ├── ProgressBar.tsx  # Animated progress bars
│   └── monitors/        # Individual metric monitors
├── services/            # System data collection
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
├── utils/              # Utilities and formatters
└── main.tsx            # Application entry point
```

## 🛠️ Development

### Project Structure

- **OpenTUI Core**: Terminal rendering and layout
- **React Integration**: Component-based UI
- **System Information**: macOS metrics collection
- **Real-time Updates**: Efficient data polling

### Building

```bash
# TypeScript compilation
bun run build

# Clean build artifacts
bun run clean
```

### Dependencies

- `@opentui/core` - Terminal UI framework
- `@opentui/react` - React integration
- `systeminformation` - System metrics collection
- `react` - UI framework

## 🎨 Customization

### Themes

Edit `src/utils/colors.ts` to customize the color scheme:

```typescript
export const defaultTheme: ThemeColors = {
  primary: '#7aa2f7',
  secondary: '#bb9af7',
  success: '#9ece6a',
  warning: '#e0af68',
  danger: '#f7768e',
  // ...
}
```

### Update Intervals

Modify update frequency in `src/main.tsx`:

```typescript
const { metrics } = useSystemMetrics(1000) // 1 second updates
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Errors**: Some system metrics require elevated permissions
2. **Terminal Compatibility**: Ensure your terminal supports true color
3. **Performance**: Reduce update frequency for better performance

### macOS Specific

- GPU metrics require Metal Performance Shaders
- Temperature sensors use IOKit framework
- Some features require macOS 12+

## 📈 Performance

- **Target FPS**: 30 FPS
- **Memory Usage**: <100MB
- **CPU Impact**: <5% on modern systems
- **Update Frequency**: 1-2 seconds (configurable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [OpenTUI](https://github.com/sst/opentui) - Terminal UI framework
- [systeminformation](https://github.com/sebhildebrandt/systeminformation) - System metrics
- Apple Silicon community for M3 Max insights

---

**Built with ❤️ for macOS developers**