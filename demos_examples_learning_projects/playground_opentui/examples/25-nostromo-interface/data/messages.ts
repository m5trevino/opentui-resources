/**
 * Communications log messages
 * Mix of incoming, outgoing, and MOTHER system messages
 */

export interface CommMessage {
  timestamp: string;
  direction: "INCOMING" | "OUTGOING" | "SYSTEM" | "ALERT" | "DIAGNOSTIC" | "ENCRYPTED";
  source: string;
  message: string;
}

// Base messages that cycle through
export const baseMessages: CommMessage[] = [
  {
    timestamp: "2122.06.12 03:45:22",
    direction: "SYSTEM",
    source: "MOTHER",
    message: "ALL SYSTEMS NOMINAL",
  },
  {
    timestamp: "2122.06.12 03:44:18",
    direction: "OUTGOING",
    source: "WEYLAND-YUTANI",
    message: "ETA EARTH: 10 MONTHS 14 DAYS",
  },
  {
    timestamp: "2122.06.12 03:42:01",
    direction: "INCOMING",
    source: "THEDUS RELAY",
    message: "COURSE VECTOR CONFIRMED",
  },
  {
    timestamp: "2122.06.12 03:38:47",
    direction: "SYSTEM",
    source: "MOTHER",
    message: "HYPERSLEEP CYCLE 847 COMPLETE",
  },
  {
    timestamp: "2122.06.12 03:35:12",
    direction: "SYSTEM",
    source: "NAV-COMP",
    message: "TRAJECTORY CORRECTION +0.0042 DEG",
  },
  {
    timestamp: "2122.06.12 03:30:00",
    direction: "SYSTEM",
    source: "MOTHER",
    message: "CREW VITALS: ALL NOMINAL",
  },
  {
    timestamp: "2122.06.12 03:25:33",
    direction: "INCOMING",
    source: "GATEWAY STATION",
    message: "ACKNOWLEDGE CARGO MANIFEST UPDATE",
  },
  {
    timestamp: "2122.06.12 03:20:15",
    direction: "SYSTEM",
    source: "REACTOR",
    message: "FUEL CELL ROTATION COMPLETE",
  },
  {
    timestamp: "2122.06.12 03:15:08",
    direction: "OUTGOING",
    source: "AUTO-BEACON",
    message: "POSITION BROADCAST TRANSMITTED",
  },
  {
    timestamp: "2122.06.12 03:10:44",
    direction: "SYSTEM",
    source: "MOTHER",
    message: "CARGO TEMP VARIANCE: +0.02C",
  },
  {
    timestamp: "2122.06.12 03:05:21",
    direction: "SYSTEM",
    source: "LIFE-SUPPORT",
    message: "O2 GENERATION NOMINAL",
  },
  {
    timestamp: "2122.06.12 03:00:00",
    direction: "SYSTEM",
    source: "MOTHER",
    message: "HOURLY STATUS: ALL CLEAR",
  },
  {
    timestamp: "2122.06.12 02:55:38",
    direction: "INCOMING",
    source: "DEEP SPACE NET",
    message: "SOLAR WEATHER: CLEAR",
  },
  {
    timestamp: "2122.06.12 02:50:17",
    direction: "SYSTEM",
    source: "NAV-COMP",
    message: "ASTEROID FIELD CLEAR - NEXT: 4.2 AU",
  },
  {
    timestamp: "2122.06.12 02:45:02",
    direction: "SYSTEM",
    source: "MOTHER",
    message: "CRYOGENIC FLUID PRESSURE STABLE",
  },
  {
    timestamp: "2122.06.12 02:40:29",
    direction: "OUTGOING",
    source: "WEYLAND-YUTANI",
    message: "CARGO INTEGRITY REPORT FILED",
  },
];

// Function to generate a timestamp for new messages
export function generateTimestamp(): string {
  const now = new Date();
  const year = 2122;
  const month = String(6).padStart(2, "0");
  const day = String(12).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const secs = String(now.getSeconds()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${mins}:${secs}`;
}

// Random system messages that can be generated
export const randomSystemMessages = [
  "SENSOR SWEEP COMPLETE",
  "HULL INTEGRITY: 100%",
  "MAGNETIC SHIELDING NOMINAL",
  "ANTENNA ALIGNMENT OPTIMAL",
  "BACKUP POWER CELLS: 98%",
  "WATER RECYCLING: NOMINAL",
  "ATMOSPHERIC SCRUBBERS: OPTIMAL",
  "RADIATION LEVELS: NOMINAL",
  "THERMAL REGULATION: STABLE",
  "NAVIGATION BEACON RECEIVED",
  "CARGO BAY PRESSURE: STABLE",
  "AIRLOCK SEALS: VERIFIED",
  "FIRE SUPPRESSION: STANDBY",
  "EMERGENCY BEACON: ARMED",
  "DISTRESS FREQ: MONITORING",
];

// Additional message types for visual variety
interface RandomMessageConfig {
  direction: CommMessage["direction"];
  source: string;
  messages: string[];
  weight: number; // Higher = more common
}

const randomMessageTypes: RandomMessageConfig[] = [
  {
    direction: "SYSTEM",
    source: "MOTHER",
    messages: randomSystemMessages,
    weight: 50,
  },
  {
    direction: "DIAGNOSTIC",
    source: "SELF-TEST",
    messages: [
      "MEMORY CHECKSUM VERIFIED",
      "CPU CYCLES NOMINAL",
      "I/O PORTS RESPONSIVE",
      "SENSOR ARRAY CALIBRATED",
      "COMM ARRAY DIAGNOSTIC OK",
    ],
    weight: 15,
  },
  {
    direction: "ENCRYPTED",
    source: "COMPANY",
    messages: [
      "[CLASSIFIED TRANSMISSION]",
      "[ENCODED MESSAGE RECEIVED]",
      "[SECURE CHANNEL ACTIVE]",
      "[AUTH REQUIRED - LEVEL 4]",
    ],
    weight: 10,
  },
  {
    direction: "ALERT",
    source: "WARNING",
    messages: [
      "MINOR HULL VIBRATION DETECTED",
      "POWER FLUCTUATION - RESOLVED",
      "BACKUP SYSTEM ACTIVATED BRIEFLY",
      "ANOMALOUS READING - CLEARED",
    ],
    weight: 5,
  },
];

export function getRandomSystemMessage(): CommMessage {
  // Weighted random selection
  const totalWeight = randomMessageTypes.reduce((sum, t) => sum + t.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const msgType of randomMessageTypes) {
    rand -= msgType.weight;
    if (rand <= 0) {
      const msg = msgType.messages[Math.floor(Math.random() * msgType.messages.length)];
      return {
        timestamp: generateTimestamp(),
        direction: msgType.direction,
        source: msgType.source,
        message: msg,
      };
    }
  }

  // Fallback
  const msg = randomSystemMessages[Math.floor(Math.random() * randomSystemMessages.length)];
  return {
    timestamp: generateTimestamp(),
    direction: "SYSTEM",
    source: "MOTHER",
    message: msg,
  };
}
