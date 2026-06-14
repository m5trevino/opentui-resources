

## OpenTUI Explained
**ZIG NATIVE CORE + TYPESCRIPT BINDINGS**  
**Document:** OTUI/INT-26A

### Full Section Map (from the long vertical nav)
TERMINAL BASICS → ANSI CODES → CELL BUFFER → GRAPHEMES → DIFF RENDERING → GAME LOOP → ARCHITECTURE → (plus FFI, render loop, input handling, frame pacing, etc.)

---

## SECTION 01 — How terminals work

A terminal acts as a **grid of cells**. Each cell displays a character with specific colors and styles. Unlike graphical apps that draw pixels, terminal apps write **bytes to stdout**. The terminal reads these bytes to decide what to show.

### Interactive Terminal Grid (ASCII approximation)

```
+--------------------------------------------------+
| H   e   l   l   o   ,       O   p   e   n   T   |
| U   I   !                                        |
+--------------------------------------------------+
          ↑
Cell (19, 6) — char: space, index: 139
```

**Text and control bytes**  
Everything in a terminal is **text plus control bytes**. Many controls use escape sequences starting with `ESC (0x1B)`. Simpler ones like CR, LF, and TAB handle cursor movement and layout.

### Data Flow (ASCII diagram)

```
[ YOUR APP ]  -->  [ stdout ]  -->  [ PTY ]  -->  [ Terminal ]  -->  [ Display ]
   OpenTUI           bytes         Pseudo-      Interprets         Pixels
                                 terminal       bytes
```

---

## SECTION 02 — ANSI escape codes

Control sequences tell the terminal what to do. The most common type is the **CSI sequence**. It starts with `\x1b[` (ESC + `[` ) and ends with a command character. Other sequences start with `\x1b]` (OSC) or `\x1bP` (DCS).

### ANSI sequence structure (ASCII)

```
MOVE CURSOR TO ROW 5, COLUMN 10

[1B] [5] [;] [1] [0] [H]
 ESC   5   ;   1   0   H     →   ESC + [ + row + ; + col + H
```

### Common escape sequences (extracted)

```zig
// Cursor control
pub const hideCursor = "\x1b[?25l";
pub const showCursor = "\x1b[?25h";
pub const home = "\x1b[H";

// Screen control
pub const clear = "\x1b[2J";
pub const reset = "\x1b[0m";

// Text attributes
pub const bold = "\x1b[1m";
pub const italic = "\x1b[3m";
pub const underline = "\x1b[4m";

// True color (24-bit RGB)
// Foreground: ESC[38;2;R;G;B m
// Background: ESC[48;2;R;G;B m
```

**Create an ANSI sequence** (interactive builder approximated):  
You pick foreground/background colors + attributes → it spits out the byte sequence like:

`\x1b[38;2;17;39;48;2;244;244;245mHello\x1b[0m`

---

## SECTION 03 — Cell buffer memory layout

OpenTUI uses a **Structure of Arrays (SoA)** layout. This means it stores each field in a separate array rather than grouping fields into a structure for each cell. This improves cache speed and lets the CPU process data faster.

### Cell structure

```
EACH CELL IN THE BUFFER
+-------------------+
| char       u32    |  Unicode codepoint or encoded grapheme ID
+-------------------+
| fg       [4]f32   |  RGBA foreground (0.0 - 1.0)
+-------------------+
| bg       [4]f32   |  RGBA background (0.0 - 1.0)
+-------------------+
| attributes u32    |  Packed text attrs (8 bits) + link ID (24 bits)
+-------------------+
```

### Attribute bit packing (lower 8 bits of u32)

```
Bit:  7  6  5  4  3  2  1  0
      S  H  I  B  U  I  D  B
      t  i  n  l  n  t  i  o
      r  d  v  i  d  a  m  l
      i  d  e  n  e  l    d
      k  e  r  k  r  i
         n     t  l  c

Bit 0: Bold
Bit 1: Dim
Bit 2: Italic
Bit 3: Underline
Bit 4: Blink
Bit 5: Inverse
Bit 6: Hidden
Bit 7: Strikethrough
```

### Memory layout: SoA vs AoS (Zig code — extracted)

============================================================
LOADED TOKE: Cell Buffer SoA Layout (buffer.zig:144-163)
============================================================

```zig
// Structure of Arrays - what OpenTUI uses
pub const OptimizedBuffer = struct {
    buffer: struct {
        char: []u32,      // All characters contiguous
        fg: []RGBA,       // All foregrounds contiguous
        bg: []RGBA,       // All backgrounds contiguous
        attributes: []u32, // All attributes contiguous
    },
    width: u32,
    height: u32,
    // ...
};

// Index calculation: row-major order
fn coordsToIndex(x: u32, y: u32) u32 {
    return y * self.width + x;
}
```
---

## SECTION 04 — Grapheme clusters

One character on screen can use multiple Unicode codepoints. Emojis with skin tones or flags use several codepoints but appear as one symbol. These groups are called **grapheme clusters**. OpenTUI stores these clusters in a separate pool and refers to them by ID.

### Grapheme Examples (ASCII recreation)

**Simple ASCII (1 codepoint, 1 cell)**
```
A
[U+0041]
0x41 DIRECT
```

**CJK character (1 codepoint, 2 cells wide)**
```
中
[U+4E2D]
0x4E2D START   0xXXXX CONTINUATION
```

**Family emoji (7 codepoints, 2 cells wide)**
```
👨‍👩‍👧‍👦
[U+1F468] [U+200D] [U+1F469] [U+200D] [U+1F467] [U+200D] [U+1F466]
GRAPHEME     CONTINUATION   ... (multiple continuation cells)
START
```

### Grapheme ID encoding

When a character is a grapheme cluster, the `char` field stores a **pool ID** instead of a codepoint. The top 2 bits indicate the type.

```zig
// Bit 31-30 encoding:
// 00xxxxxx = direct Unicode codepoint
// 10xxxxxx = grapheme start (pool ID in lower bits)
// 11xxxxxx = continuation cell

pub const CHAR_FLAG_GRAPHEME: u32 = 0x8000_0000;
pub const CHAR_FLAG_CONTINUATION: u32 = 0xC000_0000;

pub fn isGraphemeChar(c: u32) bool {
    return (c & 0xC000_0000) == CHAR_FLAG_GRAPHEME;
}

pub fn graphemeIdFromChar(c: u32) u32 {
    return c & 0x03FF_FFFF; // Lower 26 bits
}
```

### The grapheme pool

Grapheme byte sequences live in a slab allocator with size classes: 8, 16, 32, 64, and 128 bytes. The 26-bit ID encodes the class (3 bits), generation (7 bits), and slot index (16 bits).

### ID BIT LAYOUT (ASCII)

```
+----------+-------------+------------------+
|  class   | generation  |   slot_index     |
|  3 bits  |   7 bits    |     16 bits      |
+----------+-------------+------------------+
   red        brown           blue
```

---
