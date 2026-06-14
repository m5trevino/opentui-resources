// Showcases multiple FIGlet fonts using the Fig component in terminal.
// Demonstrates custom font loading via path data and object inputs.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Fig } from "./components/Fig";

const cyberFont = readFileSync(
  join(process.cwd(), "src", "fonts", "cyber.flf"),
  "utf8",
);

const fonts = [
  { name: "Standard", label: "Standard" },
  { name: "Slant", label: "Slant" },
  { name: "Banner", label: "Banner" },
  { name: "Big", label: "Big" },
  { name: "Block", label: "Block" },
  { name: "Bubble", label: "Bubble" },
  { name: "Digital", label: "Digital" },
  { name: "3-D", label: "3D" },
  { name: "3D Diagonal", label: "3D Diagonal" },
  { name: "3D-ASCII", label: "3D ASCII" },
  { name: "Banner3-D", label: "Banner 3D" },
  { name: "ASCII New Roman", label: "ASCII New Roman" },
  { name: "ANSI Shadow", label: "ANSI Shadow" },
  { name: "ANSI Regular", label: "ANSI Regular" },
  { name: "ANSI Compact", label: "ANSI Compact" },
  { name: "Alligator", label: "Alligator" },
  { name: "Avatar", label: "Avatar" },
  { name: "B1FF", label: "B1FF" },
  { name: "Barbwire", label: "Barbwire" },
  { name: "Benjamin", label: "Benjamin" },
  { name: "Bloody", label: "Bloody" },
  { name: "Broadway", label: "Broadway" },
  { name: "Bulbhead", label: "Bulbhead" },
  { name: "Chunky", label: "Chunky" },
  { name: "Circle", label: "Circle" },
  { name: "Colossal", label: "Colossal" },
  { name: "Computer", label: "Computer" },
  { name: "Cursive", label: "Cursive" },
  { name: "Cyberlarge", label: "Cyberlarge" },
  { name: "Cybermedium", label: "Cybermedium" },
  { name: "Cybersmall", label: "Cybersmall" },
  { name: "Dancing Font", label: "Dancing Font" },
  { name: "Diamond", label: "Diamond" },
  { name: "Diet Cola", label: "Diet Cola" },
  { name: "Doh", label: "Doh" },
  { name: "Doom", label: "Doom" },
  { name: "Dot Matrix", label: "Dot Matrix" },
  { name: "Double", label: "Double" },
  { name: "Dr Pepper", label: "Dr Pepper" },
  { name: "Efti Chess", label: "Efti Chess" },
  { name: "Efti Font", label: "Efti Font" },
  { name: "Efti Italic", label: "Efti Italic" },
  { name: "Efti Robot", label: "Efti Robot" },
  { name: "Efti Wall", label: "Efti Wall" },
  { name: "Electronic", label: "Electronic" },
  { name: "Elite", label: "Elite" },
  { name: "Emboss", label: "Emboss" },
  { name: "Epic", label: "Epic" },
  { name: "Fender", label: "Fender" },
  { name: "Filter", label: "Filter" },
  { name: "Fire Font-k", label: "Fire Font K" },
  { name: "Fire Font-s", label: "Fire Font S" },
  { name: "Flipped", label: "Flipped" },
  { name: "Flower Power", label: "Flower Power" },
  { name: "Font Font", label: "Font Font" },
  { name: "Fraktur", label: "Fraktur" },
  { name: "Fun Face", label: "Fun Face" },
  { name: "Future", label: "Future" },
  { name: "Fuzzy", label: "Fuzzy" },
  { name: "Ghost", label: "Ghost" },
  { name: "Ghoulish", label: "Ghoulish" },
  { name: "Glenyn", label: "Glenyn" },
  { name: "Goofy", label: "Goofy" },
  { name: "Gothic", label: "Gothic" },
  { name: "Gradient", label: "Gradient" },
  { name: "Graffiti", label: "Graffiti" },
  { name: "Greek", label: "Greek" },
  { name: "3x5", label: "3x5" },
  { name: "4Max", label: "4Max" },
  { name: "1Row", label: "1Row" },
  { name: "Big Money-ne", label: "Big Money NE" },
  { name: "Big Money-nw", label: "Big Money NW" },
  { name: "Big Money-se", label: "Big Money SE" },
  { name: "Big Money-sw", label: "Big Money SW" },
];

const colors = [
  "#7dd3fc",
  "#34d399",
  "#f472b6",
  "#c4b5fd",
  "#fb7185",
  "#60a5fa",
  "#fbbf24",
];

export function App() {
  return (
    <scrollbox width="100%" height="100%" scrollY viewportCulling={false}>
      <box flexDirection="column" width="100%" paddingLeft={1} paddingRight={1}>
        {fonts.map((font, i) => (
          <box key={font.name} flexDirection="column" gap={0} paddingBottom={1}>
            <Fig
              font={font.name}
              color={colors[i % colors.length]}
              align="center"
              width="100%"
            >
              {font.label}
            </Fig>
          </box>
        ))}

        <box flexDirection="column" gap={0} paddingBottom={1}>
          <Fig
            font="./src/fonts/cyber.flf"
            color={colors[0]}
            align="center"
            width="100%"
          >
            Custom Path
          </Fig>
        </box>

        <box flexDirection="column" gap={0} paddingBottom={1}>
          <Fig
            font={{ name: "CyberData", data: cyberFont }}
            color={colors[1]}
            align="center"
            width="100%"
          >
            Custom Data
          </Fig>
        </box>

        <box flexDirection="column" gap={0} paddingBottom={1}>
          <Fig
            font={{ name: "CyberObj", path: "./fonts/cyber.flf" }}
            color={colors[2]}
            align="center"
            width="100%"
          >
            Custom Object
          </Fig>
        </box>
      </box>
    </scrollbox>
  );
}
