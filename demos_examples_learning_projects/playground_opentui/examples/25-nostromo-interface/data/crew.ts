/**
 * Crew data for cryosleep pods
 * Based on the USCSS Nostromo crew from Alien (1979)
 */

export interface CrewMember {
  name: string;
  rank: string;
  status: "CRYO-STABLE" | "ACTIVE" | "DECEASED";
  heartRate: number; // Base BPM during cryo (typically 4-8)
  bodyTemp: number; // Celsius (typically 2-4 during cryo)
}

export const crew: CrewMember[] = [
  { name: "DALLAS", rank: "CAPTAIN", status: "CRYO-STABLE", heartRate: 6, bodyTemp: 3.2 },
  { name: "RIPLEY", rank: "WARRANT OFFICER", status: "CRYO-STABLE", heartRate: 5, bodyTemp: 3.1 },
  { name: "KANE", rank: "EXEC OFFICER", status: "CRYO-STABLE", heartRate: 7, bodyTemp: 3.4 },
  { name: "LAMBERT", rank: "NAVIGATOR", status: "CRYO-STABLE", heartRate: 6, bodyTemp: 3.0 },
  { name: "BRETT", rank: "ENGINEER TECH", status: "CRYO-STABLE", heartRate: 5, bodyTemp: 3.3 },
  { name: "PARKER", rank: "CHIEF ENGINEER", status: "CRYO-STABLE", heartRate: 8, bodyTemp: 3.5 },
  { name: "ASH", rank: "SCIENCE OFFICER", status: "CRYO-STABLE", heartRate: 4, bodyTemp: 2.8 },
];

// Ship info
export const shipInfo = {
  name: "USCSS NOSTROMO",
  registration: "180286",
  class: "LOCKMART CM-88B BISON",
  type: "COMMERCIAL TOWING VEHICLE",
  owner: "WEYLAND-YUTANI CORP",
  cargo: "REFINERY PROCESSING PLATFORM",
  cargoName: "THEDUS ORE REFINERY",
};
