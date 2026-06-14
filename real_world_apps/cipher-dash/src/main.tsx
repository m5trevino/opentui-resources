import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { Dashboard } from "./components/Dashboard"

async function main() {
  try {
    console.log("🚀 Starting TUI System Monitor Dashboard...")
    
    // Create the OpenTUI renderer with optimized settings
    const renderer = await createCliRenderer({
      targetFps: 30,
      maxFps: 60,
      backgroundColor: "#1a1b26",
      exitOnCtrlC: true,
      gatherStats: true,
      useAlternateScreen: true,
      consoleOptions: {
        sizePercent: 25,
        startInDebugMode: false
      }
    })

    // Set terminal title
    renderer.setTerminalTitle("System Monitor Dashboard")

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log("\n👋 Shutting down dashboard...")
      renderer.destroy()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      renderer.destroy()
      process.exit(0)
    })

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error)
      renderer.destroy()
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
      renderer.destroy()
      process.exit(1)
    })

    // Start the React application
    const root = createRoot(renderer)
    root.render(<Dashboard />)

    console.log("✅ Dashboard started successfully!")
    console.log("Press 'q' to quit, 'h' for help")

  } catch (error) {
    console.error("❌ Failed to start dashboard:", error)
    process.exit(1)
  }
}

// Start the application
main().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})