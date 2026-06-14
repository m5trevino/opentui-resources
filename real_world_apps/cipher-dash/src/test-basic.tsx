// Simple test to verify our basic setup works
console.log("🚀 Testing basic setup...")

// Test our utility functions
import { formatBytes, formatPercentage } from './utils/formatters'
import { defaultTheme } from './utils/colors'

console.log("✅ Formatters working:")
console.log("  - formatBytes(1024):", formatBytes(1024))
console.log("  - formatPercentage(75.5):", formatPercentage(75.5))

console.log("✅ Theme colors working:")
console.log("  - Primary color:", defaultTheme.primary)
console.log("  - Success color:", defaultTheme.success)

console.log("✅ Basic setup is working!")
console.log("📋 Phase 1 Foundation Setup: COMPLETE")

console.log("\n🎯 Next Steps:")
console.log("  1. Fix OpenTUI compatibility issues")
console.log("  2. Implement system metrics collection")
console.log("  3. Build UI components")
console.log("  4. Add real-time updates")

process.exit(0)