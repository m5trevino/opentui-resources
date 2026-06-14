# figtui

Terminal UI component for rendering FIGlet ASCII art fonts with React and OpenTUI.

## Features

- **Multiple FIGlet Fonts**: Support for dozens of built-in FIGlet fonts
- **Custom Fonts**: Load fonts from custom paths or provide font data directly
- **Terminal Rendering**: Seamless integration with OpenTUI's React components
- **Colors**: Full color support for styled ASCII art output
- **Alignment**: Configure text alignment (left, center, right)

## Installation

```bash
npm i figtui
```

## Peer Dependencies

This package expects these libraries to be installed in your app:

- **@opentui/react**
- **react**

## Usage

```tsx
import { Fig } from "figtui";

export function App() {
  return (
    <Fig font="Standard" color="#7dd3fc" align="center" width="100%">
      Hello World
    </Fig>
  );
}
```

### Font Options

Use built-in font names:

```tsx
<Fig font="Cyberlarge">Text</Fig>
```

Load from file path:

```tsx
<Fig font="./fonts/custom.flf">Text</Fig>
```

Provide custom font data:

```tsx
<Fig font={{ name: "Custom", data: fontString }}>Text</Fig>
```

## Scripts

- `bun run demo` - Run the demo app
- `npm run build` - Build the library
- `bun run typecheck` - Check TypeScript types

## Available Fonts

All standard FIGlet fonts are supported. Common options include:

|              |              |              |                 |
| ------------ | ------------ | ------------ | --------------- |
| Standard     | Slant        | Banner       | Big             |
| Block        | Bubble       | Digital      | 3-D             |
| 3D Diagonal  | 3D-ASCII     | Banner 3D    | ASCII New Roman |
| ANSI Shadow  | ANSI Regular | ANSI Compact | Alligator       |
| Avatar       | B1FF         | Barbwire     | Benjamin        |
| Bloody       | Broadway     | Bulbhead     | Chunky          |
| Circle       | Colossal     | Computer     | Cursive         |
| Cyberlarge   | Cybermedium  | Cybersmall   | Dancing Font    |
| Diamond      | Diet Cola    | Doh          | Doom            |
| Dot Matrix   | Double       | Dr Pepper    | Efti Chess      |
| Efti Font    | Efti Italic  | Efti Robot   | Efti Wall       |
| Electronic   | Elite        | Emboss       | Epic            |
| Fender       | Filter       | Fire Font K  | Fire Font S     |
| Flipped      | Flower Power | Font Font    | Fraktur         |
| Fun Face     | Future       | Fuzzy        | Ghost           |
| Ghoulish     | Glenyn       | Goofy        | Gothic          |
| Gradient     | Graffiti     | Greek        | 3x5             |
| 4Max         | 1Row         | Big Money NE | Big Money NW    |
| Big Money SE | Big Money SW |              |                 |

## Dependencies

- **@opentui/react** - Terminal UI framework
- **figlet** - FIGlet ASCII art renderer
- **react** - UI library

## License

MIT
