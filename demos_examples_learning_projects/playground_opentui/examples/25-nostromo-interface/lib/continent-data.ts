/**
 * Continent Data - Simplified Earth Outline Polygons
 *
 * Provides simplified continent outlines for wireframe globe rendering.
 * Each continent is defined as an array of lat/lon coordinates that form
 * a recognizable outline when rendered on a sphere.
 *
 * Coordinates are simplified to ~20-30 vertices per continent for
 * efficient terminal rendering while maintaining recognizable shapes.
 */

export interface ContinentPoint {
  lat: number;
  lon: number;
}

export interface Continent {
  name: string;
  points: ContinentPoint[];
}

/**
 * Simplified North America outline
 * Traces major coastline features: Alaska, Canada, US East Coast, Gulf, Mexico
 */
export const NORTH_AMERICA: Continent = {
  name: "North America",
  points: [
    // Alaska
    { lat: 65, lon: -168 },
    { lat: 71, lon: -156 },
    { lat: 70, lon: -141 },
    // Northern Canada
    { lat: 69, lon: -135 },
    { lat: 66, lon: -115 },
    { lat: 63, lon: -90 },
    { lat: 60, lon: -78 },
    // Hudson Bay
    { lat: 52, lon: -80 },
    { lat: 48, lon: -88 },
    // Great Lakes region
    { lat: 48, lon: -82 },
    // US East Coast
    { lat: 45, lon: -67 },
    { lat: 40, lon: -74 },
    { lat: 35, lon: -75 },
    { lat: 28, lon: -80 },
    // Florida
    { lat: 25, lon: -80 },
    { lat: 25, lon: -82 },
    // Gulf of Mexico
    { lat: 29, lon: -90 },
    { lat: 26, lon: -97 },
    // Mexico
    { lat: 20, lon: -105 },
    { lat: 16, lon: -96 },
    // Central America
    { lat: 15, lon: -90 },
    { lat: 10, lon: -83 },
    // Back up West Coast
    { lat: 20, lon: -105 },
    { lat: 32, lon: -117 },
    { lat: 37, lon: -122 },
    { lat: 46, lon: -124 },
    { lat: 55, lon: -133 },
    { lat: 60, lon: -140 },
    { lat: 65, lon: -168 }, // Close the loop
  ],
};

/**
 * Simplified South America outline
 */
export const SOUTH_AMERICA: Continent = {
  name: "South America",
  points: [
    // Colombia/Venezuela coast
    { lat: 12, lon: -72 },
    { lat: 10, lon: -62 },
    // Brazil east coast
    { lat: 5, lon: -35 },
    { lat: -5, lon: -35 },
    { lat: -15, lon: -39 },
    { lat: -23, lon: -43 },
    // Uruguay/Argentina
    { lat: -35, lon: -57 },
    { lat: -40, lon: -62 },
    // Patagonia
    { lat: -50, lon: -68 },
    { lat: -55, lon: -67 },
    // Tierra del Fuego
    { lat: -55, lon: -68 },
    // Chile west coast
    { lat: -45, lon: -75 },
    { lat: -33, lon: -72 },
    { lat: -20, lon: -70 },
    // Peru
    { lat: -5, lon: -81 },
    // Ecuador/Colombia
    { lat: 2, lon: -79 },
    { lat: 12, lon: -72 }, // Close
  ],
};

/**
 * Simplified Europe outline
 */
export const EUROPE: Continent = {
  name: "Europe",
  points: [
    // Portugal
    { lat: 37, lon: -9 },
    { lat: 42, lon: -9 },
    // Spain/France
    { lat: 43, lon: -2 },
    { lat: 48, lon: -5 },
    // UK approximation (simplified)
    { lat: 50, lon: -5 },
    { lat: 55, lon: -3 },
    { lat: 58, lon: -5 },
    // Scandinavia
    { lat: 62, lon: 5 },
    { lat: 70, lon: 20 },
    { lat: 70, lon: 28 },
    // Finland/Russia border
    { lat: 65, lon: 30 },
    { lat: 60, lon: 30 },
    // Baltic
    { lat: 55, lon: 20 },
    // Poland/Germany
    { lat: 54, lon: 14 },
    { lat: 50, lon: 15 },
    // Italy
    { lat: 45, lon: 14 },
    { lat: 42, lon: 12 },
    { lat: 38, lon: 16 },
    // Greece
    { lat: 35, lon: 25 },
    { lat: 40, lon: 25 },
    // Turkey border
    { lat: 42, lon: 28 },
    // Back through Mediterranean
    { lat: 44, lon: 8 },
    { lat: 43, lon: 3 },
    { lat: 37, lon: -9 }, // Close
  ],
};

/**
 * Simplified Africa outline
 */
export const AFRICA: Continent = {
  name: "Africa",
  points: [
    // Morocco
    { lat: 35, lon: -6 },
    { lat: 32, lon: -8 },
    // Western Sahara/Mauritania
    { lat: 26, lon: -15 },
    { lat: 20, lon: -17 },
    // Senegal/Guinea
    { lat: 14, lon: -17 },
    { lat: 8, lon: -14 },
    // Ivory Coast/Ghana
    { lat: 5, lon: -7 },
    { lat: 5, lon: 2 },
    // Nigeria/Cameroon
    { lat: 4, lon: 8 },
    // Congo/Angola
    { lat: -5, lon: 12 },
    { lat: -15, lon: 12 },
    // Namibia
    { lat: -22, lon: 14 },
    // South Africa
    { lat: -34, lon: 18 },
    { lat: -34, lon: 26 },
    // Mozambique
    { lat: -25, lon: 35 },
    { lat: -15, lon: 40 },
    // Tanzania/Kenya
    { lat: -5, lon: 40 },
    { lat: 2, lon: 42 },
    // Somalia horn
    { lat: 10, lon: 51 },
    // Red Sea coast
    { lat: 15, lon: 42 },
    { lat: 22, lon: 37 },
    // Egypt
    { lat: 30, lon: 32 },
    // Mediterranean coast
    { lat: 32, lon: 25 },
    { lat: 35, lon: 10 },
    { lat: 37, lon: 10 },
    { lat: 35, lon: -6 }, // Close
  ],
};

/**
 * Simplified Asia outline (mainland only, no islands)
 */
export const ASIA: Continent = {
  name: "Asia",
  points: [
    // Turkey
    { lat: 42, lon: 28 },
    { lat: 40, lon: 43 },
    // Caspian region
    { lat: 45, lon: 50 },
    // Russia arctic coast
    { lat: 70, lon: 60 },
    { lat: 72, lon: 100 },
    { lat: 70, lon: 140 },
    { lat: 66, lon: 170 },
    // Kamchatka
    { lat: 60, lon: 165 },
    { lat: 52, lon: 158 },
    // Japan Sea coast
    { lat: 45, lon: 140 },
    { lat: 40, lon: 130 },
    // Korea
    { lat: 35, lon: 127 },
    // China coast
    { lat: 30, lon: 122 },
    { lat: 22, lon: 114 },
    // Vietnam
    { lat: 18, lon: 108 },
    { lat: 10, lon: 106 },
    // Malaysia
    { lat: 5, lon: 103 },
    { lat: 1, lon: 104 },
    // Back up through India
    { lat: 8, lon: 77 },
    { lat: 15, lon: 74 },
    { lat: 23, lon: 68 },
    // Pakistan/Iran
    { lat: 25, lon: 62 },
    { lat: 28, lon: 57 },
    // Arabian Peninsula
    { lat: 22, lon: 60 },
    { lat: 15, lon: 52 },
    { lat: 12, lon: 45 },
    // Red Sea
    { lat: 15, lon: 42 },
    { lat: 28, lon: 34 },
    // Mediterranean
    { lat: 35, lon: 36 },
    { lat: 42, lon: 28 }, // Close
  ],
};

/**
 * Simplified Australia outline
 */
export const AUSTRALIA: Continent = {
  name: "Australia",
  points: [
    // Western Australia
    { lat: -20, lon: 114 },
    { lat: -25, lon: 113 },
    { lat: -32, lon: 115 },
    // Southern coast
    { lat: -35, lon: 117 },
    { lat: -35, lon: 137 },
    // Victoria
    { lat: -38, lon: 145 },
    // NSW/Queensland coast
    { lat: -35, lon: 151 },
    { lat: -28, lon: 153 },
    { lat: -20, lon: 149 },
    { lat: -15, lon: 145 },
    // Cape York
    { lat: -10, lon: 142 },
    // Northern Territory
    { lat: -12, lon: 136 },
    { lat: -14, lon: 130 },
    { lat: -12, lon: 125 },
    // Western Australia top
    { lat: -15, lon: 122 },
    { lat: -20, lon: 114 }, // Close
  ],
};

/**
 * All continents for easy iteration
 */
export const ALL_CONTINENTS: Continent[] = [
  NORTH_AMERICA,
  SOUTH_AMERICA,
  EUROPE,
  AFRICA,
  ASIA,
  AUSTRALIA,
];

/**
 * Get continent points as 3D coordinates on sphere
 */
export function getContinentPoints(
  continent: Continent,
  radius: number
): Array<{ x: number; y: number; z: number }> {
  return continent.points.map((p) => {
    const latRad = (p.lat * Math.PI) / 180;
    const lonRad = (p.lon * Math.PI) / 180;

    return {
      x: radius * Math.cos(latRad) * Math.sin(lonRad),
      y: radius * Math.sin(latRad),
      z: radius * Math.cos(latRad) * Math.cos(lonRad),
    };
  });
}
