import { useKeyboard, useTerminalDimensions } from '@opentui/react'
import { useState } from 'react'
import { DashboardState } from '../types/metrics'
import { defaultTheme } from '../utils/colors'

export function Dashboard() {
  const { width, height } = useTerminalDimensions()
  const [state, setState] = useState<DashboardState>({
    isPaused: false,
    updateInterval: 1000,
    selectedMetric: null,
    showHelp: false
  })

  // Keyboard controls
  useKeyboard((key) => {
    switch(key.name) {
      case 'q':
      case 'escape':
        process.exit(0)
        break
      case 'r':
        // Force refresh - will implement later
        console.log('Refreshing metrics...')
        break
      case 'p':
        setState(prev => ({ ...prev, isPaused: !prev.isPaused }))
        break
      case 'h':
      case 'f1':
        setState(prev => ({ ...prev, showHelp: !prev.showHelp }))
        break
      case '1':
        setState(prev => ({ ...prev, selectedMetric: 'cpu' }))
        break
      case '2':
        setState(prev => ({ ...prev, selectedMetric: 'memory' }))
        break
      case '3':
        setState(prev => ({ ...prev, selectedMetric: 'gpu' }))
        break
      case '4':
        setState(prev => ({ ...prev, selectedMetric: 'network' }))
        break
      case '5':
        setState(prev => ({ ...prev, selectedMetric: 'disk' }))
        break
      case '6':
        setState(prev => ({ ...prev, selectedMetric: 'temperature' }))
        break
    }
  })

  // Show help modal
  if (state.showHelp) {
    return (
      <box style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        backgroundColor: defaultTheme.background
      }}>
        <box 
          title="Help - Keyboard Shortcuts"
          border
          style={{
            padding: 2,
            backgroundColor: defaultTheme.surface,
            borderColor: defaultTheme.border,
            width: 50,
            height: 20
          }}
        >
          <box style={{ flexDirection: 'column' }}>
            <text content="Navigation:" fg={defaultTheme.text} />
            <text content="  [Q] or [ESC] - Quit" fg={defaultTheme.textSecondary} />
            <text content="  [H] or [F1]  - Toggle Help" fg={defaultTheme.textSecondary} />
            <text content="  [R]          - Refresh Data" fg={defaultTheme.textSecondary} />
            <text content="  [P]          - Pause/Resume" fg={defaultTheme.textSecondary} />
            <text content=" " />
            <text content="Select Metrics:" fg={defaultTheme.text} />
            <text content="  [1] - CPU Monitor" fg={defaultTheme.textSecondary} />
            <text content="  [2] - Memory Monitor" fg={defaultTheme.textSecondary} />
            <text content="  [3] - GPU Monitor" fg={defaultTheme.textSecondary} />
            <text content="  [4] - Network Monitor" fg={defaultTheme.textSecondary} />
            <text content="  [5] - Disk Monitor" fg={defaultTheme.textSecondary} />
            <text content="  [6] - Temperature Monitor" fg={defaultTheme.textSecondary} />
            <text content=" " />
            <text content="Press [H] again to close this help" fg={defaultTheme.info} />
          </box>
        </box>
      </box>
    )
  }

  // Main dashboard layout
  return (
    <box style={{ 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: defaultTheme.background
    }}>
      {/* Header */}
      <box style={{
        height: 3,
        border: true,
        borderColor: defaultTheme.border,
        padding: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: defaultTheme.surface
      }}>
        <text
          content="🖥️  System Monitor Dashboard"
          fg={defaultTheme.primary}
        />
        <text
          content={`${new Date().toLocaleTimeString()} | ${width}x${height}`}
          fg={defaultTheme.textSecondary}
        />
      </box>

      {/* Status Bar */}
      <box style={{
        height: 2,
        padding: 1,
        backgroundColor: state.isPaused ? defaultTheme.warning : defaultTheme.surface,
        border: true,
        borderColor: defaultTheme.border
      }}>
        <text
          content={`${state.isPaused ? '⏸️  PAUSED' : '▶️  LIVE'} | Update: ${state.updateInterval}ms | Selected: ${state.selectedMetric || 'All'}`}
          fg={state.isPaused ? defaultTheme.background : defaultTheme.text}
        />
      </box>

      {/* Main Content Area */}
      <box style={{ 
        flexGrow: 1,
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <box 
          title="System Metrics Loading..."
          border
          style={{
            padding: 2,
            backgroundColor: defaultTheme.surface,
            borderColor: defaultTheme.border,
            width: 60,
            height: 15
          }}
        >
          <box style={{ 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <text
              content="🔄 Initializing System Metrics..."
              fg={defaultTheme.info}
              style={{ marginBottom: 2 }}
            />
            <text
              content="• CPU Usage Monitor"
              fg={defaultTheme.textSecondary}
            />
            <text
              content="• Memory Usage Monitor"
              fg={defaultTheme.textSecondary}
            />
            <text
              content="• GPU Usage Monitor (M3 Max)"
              fg={defaultTheme.textSecondary}
            />
            <text
              content="• Network I/O Monitor"
              fg={defaultTheme.textSecondary}
            />
            <text
              content="• Disk I/O Monitor"
              fg={defaultTheme.textSecondary}
            />
            <text
              content="• Temperature Sensors"
              fg={defaultTheme.textSecondary}
            />
            <text
              content="Press [H] for help"
              fg={defaultTheme.success}
              style={{ marginTop: 2 }}
            />
          </box>
        </box>
      </box>

      {/* Footer */}
      <box style={{
        height: 3,
        border: true,
        borderColor: defaultTheme.border,
        padding: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: defaultTheme.surface
      }}>
        <text
          content="[Q]uit [R]efresh [P]ause [H]elp [1-6]Select"
          fg={defaultTheme.textSecondary}
        />
        <text
          content="FPS: 30 | OpenTUI Dashboard v1.0"
          fg={defaultTheme.textSecondary}
        />
      </box>
    </box>
  )
}