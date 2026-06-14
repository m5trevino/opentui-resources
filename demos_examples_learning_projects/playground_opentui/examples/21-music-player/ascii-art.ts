/**
 * Cozy ASCII Art Module for Music Player
 * Warm, comforting objects for the lo-fi coffee shop aesthetic
 */

// Chillhop - Steaming coffee cup
const coffeeArt = [
  "                                   ",
  "            ) ) )                  ",
  "           ( ( (                   ",
  "          ) ) )                    ",
  "       ╭───────────╮               ",
  "       │           │╮              ",
  "       │  COFFEE   ││              ",
  "       │   ~~~     ││              ",
  "       │           │╯              ",
  "       ╰───────────╯               ",
  "                                   ",
  "      ░░░░░░░░░░░░░░░              ",
];

// Lo-Fi - Vinyl record
const vinylArt = [
  "                                   ",
  "         ╭───────────────╮         ",
  "       ╭─┴───────────────┴─╮       ",
  "      │  ╭───────────────╮  │      ",
  "      │  │  ╭─────────╮  │  │      ",
  "      │  │  │  ╭───╮  │  │  │      ",
  "      │  │  │  │ ● │  │  │  │      ",
  "      │  │  │  ╰───╯  │  │  │      ",
  "      │  │  ╰─────────╯  │  │      ",
  "      │  ╰───────────────╯  │      ",
  "       ╰────────────────────╯      ",
  "            L O - F I             ",
];

// Ambient - Potted plant / succulent
const plantArt = [
  "                                   ",
  "           \\  |  /                 ",
  "            \\ | /                  ",
  "         _   \\|/   _               ",
  "        / \\   |   / \\              ",
  "       /   \\  |  /   \\             ",
  "      ( ___ ) | ( ___ )            ",
  "          \\   |   /                ",
  "       ╭───────────╮               ",
  "       │  ░░░░░░░  │               ",
  "       │  ░░░░░░░  │               ",
  "       ╰───────────╯               ",
];

// Jazz - Rain on window
const rainArt = [
  "    ╭─────────────────────╮        ",
  "    │  .  '  .  '  .  '   │        ",
  "    │ '  .  '  .  '  .  ' │        ",
  "    │  .  '  .  '  .  '   │        ",
  "    │ '  .  '  .  '  .  ' │        ",
  "    │  .  '  .  '  .  '   │        ",
  "    │ '  .  '  .  '  .  ' │        ",
  "    │  .  '  .  '  .  '   │        ",
  "    │ '  .  '  .  '  .  ' │        ",
  "    ├─────────────────────┤        ",
  "    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│        ",
  "    ╰─────────────────────╯        ",
];

// Electronic - Over-ear headphones
const headphonesArt = [
  "                                   ",
  "        ╭─────────────╮            ",
  "       ╱               ╲           ",
  "      │                 │          ",
  "    ╭─┴─╮             ╭─┴─╮        ",
  "   │ ╭─╮ │           │ ╭─╮ │       ",
  "   │ │●│ │           │ │●│ │       ",
  "   │ ╰─╯ │           │ ╰─╯ │       ",
  "    ╰───╯             ╰───╯        ",
  "                                   ",
  "                                   ",
  "                                   ",
];

// Focus - Book with desk lamp
const bookArt = [
  "                 ╭───╮             ",
  "                 │ ☀ │             ",
  "                 ╰─┬─╯             ",
  "                   │╲              ",
  "                   │ ╲             ",
  "      ╭───────────────────╮        ",
  "      │  ════════════════ │        ",
  "      │  ════════════════ │        ",
  "      │  ════════════════ │        ",
  "      │  ════════════════ │        ",
  "      ╰───────────────────╯        ",
  "     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀        ",
];

// Default art for unknown genres
const defaultArt = [
  "                                   ",
  "          ♪ ♫ ♪ ♫ ♪               ",
  "        ╭───────────────╮          ",
  "        │    ╭─────╮    │          ",
  "        │    │  ◉  │    │          ",
  "        │    │     │    │          ",
  "        │    ╰─────╯    │          ",
  "        │       │       │          ",
  "        │       │       │          ",
  "        ╰───────────────╯          ",
  "         ♫ ♪ ♫ ♪ ♫ ♪              ",
  "                                   ",
];

/**
 * Map of genres to their cozy ASCII art
 */
export const genreArtMap: Record<string, string[]> = {
  "Chillhop": coffeeArt,
  "Lo-Fi": vinylArt,
  "Ambient": plantArt,
  "Jazz": rainArt,
  "Electronic": headphonesArt,
  "Focus": bookArt,
};

/**
 * Get ASCII art for a genre
 */
export function getArtForGenre(genre: string): string[] {
  return genreArtMap[genre] || defaultArt;
}

/**
 * Get the default ASCII art
 */
export function getDefaultArt(): string[] {
  return defaultArt;
}

/**
 * Get all available art pieces for cycling through
 */
export function getAllArt(): string[][] {
  return [coffeeArt, vinylArt, plantArt, rainArt, headphonesArt, bookArt];
}
