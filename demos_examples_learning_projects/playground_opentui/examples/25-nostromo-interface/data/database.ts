/**
 * MOTHER Database Content
 *
 * Hierarchical file system for the Nostromo's central computer.
 * Contains crew records, cargo data, navigation, and the infamous
 * SPECIAL ORDER 937 easter egg.
 */

export interface DatabaseNode {
  name: string;
  type: "folder" | "file";
  children?: DatabaseNode[];
  content?: string;
  classification?: "PUBLIC" | "RESTRICTED" | "CLASSIFIED";
}

export const motherDatabase: DatabaseNode = {
  name: "MOTHER",
  type: "folder",
  children: [
    {
      name: "CREW RECORDS",
      type: "folder",
      children: [
        {
          name: "DALLAS, A.J.",
          type: "file",
          classification: "PUBLIC",
          content: `CAPTAIN
EMPLOYEE ID: WY-4472981
SERVICE: 14 YEARS
STATUS: CRYO-STABLE
NEXT OF KIN: NONE LISTED`,
        },
        {
          name: "RIPLEY, E.L.",
          type: "file",
          classification: "PUBLIC",
          content: `WARRANT OFFICER
EMPLOYEE ID: WY-5618203
SERVICE: 5 YEARS
STATUS: CRYO-STABLE
CERTIFICATION: FLIGHT`,
        },
        {
          name: "KANE, G.W.",
          type: "file",
          classification: "PUBLIC",
          content: `EXECUTIVE OFFICER
EMPLOYEE ID: WY-3391056
SERVICE: 8 YEARS
STATUS: CRYO-STABLE
NEXT OF KIN: CLASSIFIED`,
        },
        {
          name: "LAMBERT, J.M.",
          type: "file",
          classification: "PUBLIC",
          content: `NAVIGATOR
EMPLOYEE ID: WY-6628411
SERVICE: 3 YEARS
STATUS: CRYO-STABLE
CERTIFICATION: NAV-III`,
        },
        {
          name: "BRETT, S.E.",
          type: "file",
          classification: "PUBLIC",
          content: `ENGINEERING TECH
EMPLOYEE ID: WY-7784562
SERVICE: 6 YEARS
STATUS: CRYO-STABLE
SPECIALTY: PROPULSION`,
        },
        {
          name: "PARKER, D.T.",
          type: "file",
          classification: "PUBLIC",
          content: `CHIEF ENGINEER
EMPLOYEE ID: WY-2259873
SERVICE: 9 YEARS
STATUS: CRYO-STABLE
BONUS SHARE: PENDING`,
        },
        {
          name: "ASH",
          type: "file",
          classification: "RESTRICTED",
          content: `SCIENCE OFFICER
EMPLOYEE ID: WY-0000001
SERVICE: [CLASSIFIED]
STATUS: CRYO-STABLE
CLEARANCE: LEVEL 6`,
        },
        {
          name: "MEDICAL LOGS",
          type: "folder",
          children: [
            {
              name: "CRYO VITALS 2122.06",
              type: "file",
              classification: "PUBLIC",
              content: `ALL CREW NOMINAL
HEART RATES: 4-8 BPM
CORE TEMPS: 3.1-3.4°C
NEXT CHECK: 2122.07.01`,
            },
          ],
        },
      ],
    },
    {
      name: "NAVIGATION",
      type: "folder",
      children: [
        {
          name: "CURRENT ROUTE",
          type: "file",
          classification: "PUBLIC",
          content: `ORIGIN: THEDUS
DESTINATION: EARTH
WAYPOINT: LV-426 [DIVERTED]
ETA: 10 MONTHS 14 DAYS
FUEL: 78% CAPACITY`,
        },
        {
          name: "BEACON LOG",
          type: "file",
          classification: "RESTRICTED",
          content: `SIGNAL DETECTED: 2122.06.03
ORIGIN: ACHERON (LV-426)
TYPE: UNKNOWN
FREQUENCY: 12KHZ REPEATING
STATUS: INVESTIGATING`,
        },
        {
          name: "STAR CHARTS",
          type: "folder",
          children: [
            {
              name: "ZETA RETICULI",
              type: "file",
              classification: "PUBLIC",
              content: `SECTOR: OUTER RIM
KNOWN BODIES: 4 PLANETS
HAZARDS: NONE LOGGED
COLONIES: LV-426 [PENDING]`,
            },
          ],
        },
      ],
    },
    {
      name: "SHIP SYSTEMS",
      type: "folder",
      children: [
        {
          name: "REACTOR STATUS",
          type: "file",
          classification: "PUBLIC",
          content: `TYPE: FUSION CORE MK-IV
OUTPUT: 2847°K NOMINAL
FUEL ROD: 94% LIFE
COOLANT: CIRCULATING`,
        },
        {
          name: "LIFE SUPPORT",
          type: "file",
          classification: "PUBLIC",
          content: `O2 LEVEL: 82%
CO2 SCRUB: 71%
PRESSURE: 1.02 ATM
TEMP: 18°C
HUMIDITY: 68%`,
        },
        {
          name: "HULL INTEGRITY",
          type: "file",
          classification: "PUBLIC",
          content: `OUTER HULL: 100%
INNER HULL: 100%
AIRLOCKS: ALL SEALED
LAST INSPECTION: 2122.01`,
        },
      ],
    },
    {
      name: "CARGO",
      type: "folder",
      children: [
        {
          name: "MANIFEST SUMMARY",
          type: "file",
          classification: "PUBLIC",
          content: `TOTAL CONTAINERS: 42
TOTAL TONNAGE: 20,000,000 T
HAZMAT ITEMS: 3
VALUE: [CLASSIFIED]`,
        },
        {
          name: "REFINERY STATUS",
          type: "file",
          classification: "PUBLIC",
          content: `ORE PROCESSING: STANDBY
STORAGE CAPACITY: 98%
AUTO-REFINE: DISABLED
NEXT CYCLE: ON ARRIVAL`,
        },
      ],
    },
    {
      name: "COMPANY DIRECTIVES",
      type: "folder",
      classification: "RESTRICTED",
      children: [
        {
          name: "STANDARD PROTOCOL",
          type: "file",
          classification: "PUBLIC",
          content: `ALL CREW MUST COMPLY
WITH WY REGULATIONS
SECTION 7 SUBSEC 2
RE: CARGO TRANSPORT`,
        },
        {
          name: "EMERGENCY PROCEDURES",
          type: "file",
          classification: "PUBLIC",
          content: `HULL BREACH: SEAL DECK
FIRE: VENT ATMOSPHERE
CONTAMINATION: QUARANTINE
ABANDON SHIP: POD ALPHA`,
        },
        {
          name: "SPECIAL ORDER 937",
          type: "file",
          classification: "CLASSIFIED",
          content: `PRIORITY ONE
INSURE RETURN OF ORGANISM
FOR ANALYSIS.

ALL OTHER CONSIDERATIONS
SECONDARY.

CREW EXPENDABLE.

[SCIENCE OFFICER EYES ONLY]
[AUTH: WY SPECIAL PROJECTS]`,
        },
      ],
    },
    {
      name: "COMMUNICATIONS",
      type: "folder",
      children: [
        {
          name: "OUTBOUND LOG",
          type: "file",
          classification: "PUBLIC",
          content: `2122.06.12 - THEDUS RELAY
  "COURSE CONFIRMED"
2122.06.10 - WY GATEWAY
  "ETA 10 MONTHS"
2122.06.03 - WY GATEWAY
  "SIGNAL ACKNOWLEDGED"`,
        },
        {
          name: "INBOUND LOG",
          type: "file",
          classification: "RESTRICTED",
          content: `2122.06.03 - WY GATEWAY
  "INVESTIGATE SIGNAL"
  "PRIORITY OVERRIDE"
2122.05.28 - WY GATEWAY
  "BONUS SHARES APPROVED"`,
        },
      ],
    },
  ],
};

/**
 * Flatten database tree for rendering
 */
export interface FlatNode {
  node: DatabaseNode;
  depth: number;
  expanded: boolean;
  visible: boolean;
  parent: FlatNode | null;
}

export function flattenTree(
  node: DatabaseNode,
  depth: number = 0,
  parent: FlatNode | null = null,
  expandedPaths: Set<string> = new Set()
): FlatNode[] {
  const path = getNodePath(node, parent);
  const isExpanded = expandedPaths.has(path);

  const flatNode: FlatNode = {
    node,
    depth,
    expanded: isExpanded,
    visible: true,
    parent,
  };

  const result: FlatNode[] = [flatNode];

  if (node.type === "folder" && node.children && isExpanded) {
    for (const child of node.children) {
      result.push(...flattenTree(child, depth + 1, flatNode, expandedPaths));
    }
  }

  return result;
}

function getNodePath(node: DatabaseNode, parent: FlatNode | null): string {
  if (!parent) return node.name;
  return getNodePath(parent.node, parent.parent) + "/" + node.name;
}

export function getClassificationColor(
  classification: string | undefined,
  theme: { colors: Record<string, string> }
): string {
  switch (classification) {
    case "CLASSIFIED":
      return theme.colors.error;
    case "RESTRICTED":
      return theme.colors.warning;
    default:
      return theme.colors.fgMuted;
  }
}
