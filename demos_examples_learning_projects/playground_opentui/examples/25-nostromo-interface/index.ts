/**
 * Example 26: USCSS Nostromo Interface
 *
 * A dense, autonomous monitoring interface inspired by the 1979 film Alien.
 * Features 13 animated panels displaying ship systems in a mesmerizing
 * screensaver-like experience.
 *
 * Aesthetic: Phosphor green on black, CRT glow effects, wireframe graphics,
 * monospace uppercase text, scanline artifacts, crosshair markers.
 *
 * Panels:
 * 1. Navigation / Star Map - 3D wireframe planet, orbital trajectory
 * 2. Life Support - Animated bar charts for O2, CO2, pressure, etc.
 * 3. Cryosleep Pods - 7 crew pods with heartbeat waveforms
 * 4. Motion Tracker - Sweeping radar with subtle anomaly easter egg
 * 5. Engine Telemetry - Scrolling hex data, thrust vectors
 * 6. Ship Schematic - ASCII wireframe with blinking indicators
 * 7. Cargo Manifest - Auto-scrolling container list
 * 8. Communications Log - Terminal message feed
 * 9. Reactor Core - Raymarched 3D morphing geometry
 * 10. Seismic Analyzer - Waveform frequency bars
 * 11. Coolant Flow - Physics particle simulation
 * 12. MOTHER Database - Auto-navigating tree browser
 * 13. Proximity Alert - Sprite-based warning system
 */

import {
  TextRenderable,
  BoxRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { createExampleApp } from "@shared/utils/example-app";
import { nostromoTheme as theme } from "./theme";
import { shipInfo } from "./data/crew";

// Import original panel creators
import { createDeorbitalDescentPanel } from "./panels/deorbital-descent";
import { createLifeSupportPanel } from "./panels/life-support";
import { createCryosleepPanel } from "./panels/cryosleep";
import { createMotionTrackerPanel } from "./panels/motion-tracker";
import { createTelemetryPanel } from "./panels/telemetry";
import { createSchematicPanel } from "./panels/schematic";
import { createCargoPanel } from "./panels/cargo";
import { createCommsPanel } from "./panels/comms";

// Import new advanced panel creators
import { createReactorCorePanel } from "./panels/reactor-core";
import { createSeismicPanel } from "./panels/seismic";
import { createCoolantPanel } from "./panels/coolant";
import { createMotherDatabasePanel } from "./panels/mother-database";
import { createProximityAlertPanel } from "./panels/proximity-alert";

createExampleApp(({ renderer, addCleanup }) => {
  // Track animation state
  let animationRunning = true;
  let startTime = Date.now();

  // ============================================
  // MAIN LAYOUT STRUCTURE
  // ============================================

  // Main container - full screen
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: theme.colors.bg,
  });

  // ============================================
  // HEADER BAR
  // ============================================

  const header = new BoxRenderable(renderer, {
    id: "header",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 2,
    paddingRight: 2,
    backgroundColor: theme.colors.bgAlt,
    borderColor: theme.colors.border,
    border: ["bottom"],
  });

  const shipName = new TextRenderable(renderer, {
    id: "ship-name",
    content: t`${bold(fg(theme.colors.fg)(shipInfo.name))}`,
  });

  const shipType = new TextRenderable(renderer, {
    id: "ship-type",
    content: shipInfo.type,
    fg: theme.colors.fgMuted,
  });

  const regNumber = new TextRenderable(renderer, {
    id: "reg-number",
    content: `REG: ${shipInfo.registration}`,
    fg: theme.colors.fgMuted,
  });

  const clock = new TextRenderable(renderer, {
    id: "clock",
    content: "2122.06.12 03:45:22",
    fg: theme.colors.accent2,
  });

  header.add(shipName);
  header.add(shipType);
  header.add(regNumber);
  header.add(clock);

  // ============================================
  // CONTENT AREA
  // ============================================

  const content = new BoxRenderable(renderer, {
    id: "content",
    flexDirection: "column",
    flexGrow: 1,
    padding: 1,
    gap: 1,
    overflow: "hidden", // Prevent child overflow
  });

  // ============================================
  // ROW 1: Navigation + Life Support + Reactor Core
  // ============================================

  const row1 = new BoxRenderable(renderer, {
    id: "row1",
    flexDirection: "row",
    gap: 1,
    width: "100%",
    flexGrow: 3, // Navigation/Reactor row - taller
    flexShrink: 0,
    flexBasis: "25%",
  });

  // Create panels
  const navPanel = createDeorbitalDescentPanel(renderer);
  const lifeSupportPanel = createLifeSupportPanel(renderer);
  const reactorPanel = createReactorCorePanel(renderer);

  // Configure sizes
  navPanel.container.flexGrow = 2;
  lifeSupportPanel.container.flexGrow = 1;
  reactorPanel.container.flexGrow = 1;

  row1.add(navPanel.container);
  row1.add(lifeSupportPanel.container);
  row1.add(reactorPanel.container);

  // ============================================
  // ROW 2: Cryosleep + Motion Tracker + Seismic
  // ============================================

  const row2 = new BoxRenderable(renderer, {
    id: "row2",
    flexDirection: "row",
    gap: 1,
    width: "100%",
    flexGrow: 2,
    flexShrink: 0,
    flexBasis: "18%",
  });

  const cryoPanel = createCryosleepPanel(renderer);
  const motionPanel = createMotionTrackerPanel(renderer);
  const seismicPanel = createSeismicPanel(renderer);

  cryoPanel.container.flexGrow = 2;
  motionPanel.container.flexGrow = 1;
  seismicPanel.container.flexGrow = 1;

  row2.add(cryoPanel.container);
  row2.add(motionPanel.container);
  row2.add(seismicPanel.container);

  // ============================================
  // ROW 3: Telemetry + Schematic + Coolant
  // ============================================

  const row3 = new BoxRenderable(renderer, {
    id: "row3",
    flexDirection: "row",
    gap: 1,
    width: "100%",
    flexGrow: 2,
    flexShrink: 0,
    flexBasis: "18%",
  });

  const telemPanel = createTelemetryPanel(renderer);
  const schematicPanel = createSchematicPanel(renderer);
  const coolantPanel = createCoolantPanel(renderer);

  telemPanel.container.flexGrow = 1;
  schematicPanel.container.flexGrow = 1;
  coolantPanel.container.flexGrow = 1;

  row3.add(telemPanel.container);
  row3.add(schematicPanel.container);
  row3.add(coolantPanel.container);

  // ============================================
  // ROW 4: Cargo + MOTHER Database
  // ============================================

  const row4 = new BoxRenderable(renderer, {
    id: "row4",
    flexDirection: "row",
    gap: 1,
    width: "100%",
    flexGrow: 2,
    flexShrink: 0,
    flexBasis: "18%",
  });

  const cargoPanel = createCargoPanel(renderer);
  const motherPanel = createMotherDatabasePanel(renderer);

  cargoPanel.container.flexGrow = 1;
  motherPanel.container.flexGrow = 2;

  row4.add(cargoPanel.container);
  row4.add(motherPanel.container);

  // ============================================
  // ROW 5: Communications Log + Proximity Alert
  // ============================================

  const row5 = new BoxRenderable(renderer, {
    id: "row5",
    flexDirection: "row",
    gap: 1,
    width: "100%",
    flexGrow: 1, // Shorter row
    flexShrink: 0,
    flexBasis: "10%",
  });

  const commsPanel = createCommsPanel(renderer);
  const proximityPanel = createProximityAlertPanel(renderer);

  commsPanel.container.flexGrow = 3;
  proximityPanel.container.flexGrow = 1; // Add flexGrow instead of fixed width

  row5.add(commsPanel.container);
  row5.add(proximityPanel.container);

  // ============================================
  // FOOTER
  // ============================================

  const footer = new BoxRenderable(renderer, {
    id: "footer",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 2,
    paddingRight: 2,
    backgroundColor: theme.colors.bgAlt,
    borderColor: theme.colors.border,
    border: ["top"],
    flexShrink: 0, // Prevent footer from shrinking
  });

  const instructions = new TextRenderable(renderer, {
    id: "instructions",
    content: "PRESS Q TO EXIT",
    fg: theme.colors.fgMuted,
  });

  const motherStatus = new TextRenderable(renderer, {
    id: "mother-status",
    content: "MOTHER INTERFACE 2037 ACTIVE",
    fg: theme.colors.success,
  });

  footer.add(instructions);
  footer.add(motherStatus);

  // ============================================
  // BUILD COMPONENT TREE
  // ============================================

  content.add(row1);
  content.add(row2);
  content.add(row3);
  content.add(row4);
  content.add(row5);

  main.add(header);
  main.add(content);
  main.add(footer);
  renderer.root.add(main);

  // ============================================
  // ANIMATION LOOP
  // ============================================

  function updateClock() {
    const now = new Date();
    const year = 2122;
    const month = "06";
    const day = "12";
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    const secs = String(now.getSeconds()).padStart(2, "0");
    clock.content = `${year}.${month}.${day} ${hours}:${mins}:${secs}`;
  }

  function animate() {
    if (!animationRunning) return;

    const elapsed = (Date.now() - startTime) / 1000;

    // Update all 13 panels
    navPanel.update(elapsed);
    lifeSupportPanel.update(elapsed);
    reactorPanel.update(elapsed);
    cryoPanel.update(elapsed);
    motionPanel.update(elapsed);
    seismicPanel.update(elapsed);
    telemPanel.update(elapsed);
    schematicPanel.update(elapsed);
    coolantPanel.update(elapsed);
    cargoPanel.update(elapsed);
    motherPanel.update(elapsed);
    commsPanel.update(elapsed);
    proximityPanel.update(elapsed);

    // Update header clock
    updateClock();

    // Continue animation (~30 FPS for terminal friendliness)
    setTimeout(animate, 33);
  }

  // Start animation
  animate();

  // Register cleanup to stop animation
  addCleanup(() => {
    animationRunning = false;
  });
});
