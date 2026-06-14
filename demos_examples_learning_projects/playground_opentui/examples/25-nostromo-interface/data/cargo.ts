/**
 * Cargo manifest data
 * Industrial mining ore containers
 */

export interface CargoContainer {
  id: string;
  contents: string;
  tonnage: number;
  status: "OK" | "HAZ" | "SECURE" | "QUARANTINE";
  temp?: number; // Optional temperature for volatile materials
}

// Generate a realistic cargo manifest
export const cargoManifest: CargoContainer[] = [
  { id: "ORE-0847", contents: "PLATINUM ORE", tonnage: 2400, status: "OK" },
  { id: "ORE-0848", contents: "TITANIUM ORE", tonnage: 1800, status: "OK" },
  { id: "ORE-0849", contents: "URANIUM-235", tonnage: 200, status: "HAZ", temp: -40 },
  { id: "ORE-0850", contents: "IRIDIUM ORE", tonnage: 450, status: "OK" },
  { id: "ORE-0851", contents: "COBALT ORE", tonnage: 3200, status: "OK" },
  { id: "ORE-0852", contents: "RARE EARTH MIX", tonnage: 890, status: "SECURE" },
  { id: "ORE-0853", contents: "PALLADIUM ORE", tonnage: 1100, status: "OK" },
  { id: "ORE-0854", contents: "PLUTONIUM-238", tonnage: 50, status: "HAZ", temp: -60 },
  { id: "ORE-0855", contents: "OSMIUM ORE", tonnage: 780, status: "OK" },
  { id: "ORE-0856", contents: "RHODIUM ORE", tonnage: 340, status: "SECURE" },
  { id: "ORE-0857", contents: "TUNGSTEN ORE", tonnage: 4500, status: "OK" },
  { id: "ORE-0858", contents: "MOLYBDENUM", tonnage: 2100, status: "OK" },
  { id: "ORE-0859", contents: "VANADIUM ORE", tonnage: 1600, status: "OK" },
  { id: "ORE-0860", contents: "CHROMIUM ORE", tonnage: 2800, status: "OK" },
  { id: "ORE-0861", contents: "MANGANESE ORE", tonnage: 3400, status: "OK" },
  { id: "ORE-0862", contents: "THORIUM-232", tonnage: 120, status: "HAZ", temp: -50 },
  { id: "ORE-0863", contents: "NICKEL ORE", tonnage: 5200, status: "OK" },
  { id: "ORE-0864", contents: "COPPER ORE", tonnage: 4100, status: "OK" },
  { id: "ORE-0865", contents: "ZINC ORE", tonnage: 2900, status: "OK" },
  { id: "ORE-0866", contents: "SILVER ORE", tonnage: 680, status: "SECURE" },
  { id: "ORE-0867", contents: "GOLD ORE", tonnage: 290, status: "SECURE" },
  { id: "ORE-0868", contents: "BISMUTH ORE", tonnage: 1400, status: "OK" },
  { id: "ORE-0869", contents: "ANTIMONY ORE", tonnage: 920, status: "OK" },
  { id: "ORE-0870", contents: "TIN ORE", tonnage: 2300, status: "OK" },
  { id: "ORE-0871", contents: "LEAD ORE", tonnage: 3100, status: "OK" },
  { id: "ORE-0872", contents: "LITHIUM ORE", tonnage: 1850, status: "OK" },
  { id: "ORE-0873", contents: "BERYLLIUM ORE", tonnage: 440, status: "HAZ", temp: -30 },
  { id: "ORE-0874", contents: "SCANDIUM ORE", tonnage: 180, status: "SECURE" },
  { id: "ORE-0875", contents: "YTTRIUM ORE", tonnage: 560, status: "OK" },
  { id: "ORE-0876", contents: "ZIRCONIUM ORE", tonnage: 2700, status: "OK" },
  { id: "ORE-0877", contents: "NIOBIUM ORE", tonnage: 1300, status: "OK" },
  { id: "ORE-0878", contents: "HAFNIUM ORE", tonnage: 210, status: "SECURE" },
  { id: "ORE-0879", contents: "TANTALUM ORE", tonnage: 890, status: "OK" },
  { id: "ORE-0880", contents: "RHENIUM ORE", tonnage: 95, status: "SECURE" },
  { id: "ORE-0881", contents: "GALLIUM ORE", tonnage: 320, status: "OK" },
  { id: "ORE-0882", contents: "GERMANIUM ORE", tonnage: 480, status: "OK" },
  { id: "ORE-0883", contents: "INDIUM ORE", tonnage: 140, status: "SECURE" },
  { id: "ORE-0884", contents: "TELLURIUM ORE", tonnage: 260, status: "OK" },
  { id: "ORE-0885", contents: "CESIUM-133", tonnage: 35, status: "HAZ", temp: -80 },
  { id: "ORE-0886", contents: "BARIUM ORE", tonnage: 1900, status: "OK" },
];

// Calculate total tonnage
export const totalTonnage = cargoManifest.reduce((sum, c) => sum + c.tonnage, 0);
export const hazmatCount = cargoManifest.filter((c) => c.status === "HAZ").length;
export const secureCount = cargoManifest.filter((c) => c.status === "SECURE").length;
