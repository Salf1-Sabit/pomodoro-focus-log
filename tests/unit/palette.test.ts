// Guards the colour palette in src/style.css: contrast of the main pairs, and that
// no colour is written anywhere except the palette blocks.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/style.css", "utf8");

type Palette = Record<string, string>;

/** Reads `--name: #rrggbb;` declarations out of one block of CSS. */
function readTokens(block: string): Palette {
  const tokens: Palette = {};
  for (const match of block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\b/g)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

// The palette blocks: the light :root, and the :root inside the dark-scheme media query.
const darkMatch = css.match(/@media \(prefers-color-scheme: dark\) \{\s*:root \{[^}]*\}\s*\}/);
const lightMatch = css.match(/:root \{[^}]*\}/);
if (!darkMatch || !lightMatch) throw new Error("Palette blocks not found in src/style.css");
const darkBlock = darkMatch[0];
const lightBlock = lightMatch[0];

const light = readTokens(lightBlock);
const dark = { ...light, ...readTokens(darkBlock) };

/** WCAG 2.x relative luminance of #rrggbb. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** [foreground token, background token, minimum ratio, what it is] */
const PAIRS: Array<[string, string, number, string]> = [
  // Text, 4.5:1
  ["text", "bg", 4.5, "body text on page"],
  ["text", "surface", 4.5, "body text on cards"],
  ["muted", "bg", 4.5, "secondary text on page"],
  ["muted", "surface", 4.5, "secondary text on cards"],
  ["accent-text", "accent", 4.5, "primary button text"],
  ["focus-state", "surface", 4.5, "focus state text"],
  ["break-state", "surface", 4.5, "break state text"],
  ["completed", "surface", 4.5, "completed text"],
  ["cancelled", "surface", 4.5, "cancelled text"],
  ["danger", "surface", 4.5, "error and delete text"],
  ["text", "bg", 4.5, "text typed in the label field"],
  // Controls and graphics, 3:1
  ["border", "bg", 3, "control border on page"],
  ["border", "surface", 3, "control border on cards"],
  ["accent", "surface", 3, "primary button edge on cards"],
  ["focus", "bg", 3, "focus ring on page"],
  // The ring is drawn 2px outside the control (outline-offset), so it sits on the page or card.
  ["focus", "surface", 3, "focus ring on cards"],
  ["focus-state", "surface", 3, "focus state border"],
  ["break-state", "surface", 3, "break state border"],
  ["completed", "surface", 3, "weekly bar fill and log marker"],
  ["cancelled", "surface", 3, "cancel button border"],
  ["danger", "surface", 3, "delete button border"],
];

describe.each([
  ["light", light],
  ["dark", dark],
])("%s palette contrast", (_name, palette) => {
  it.each(PAIRS)("%s on %s is at least %s:1 (%s)", (fg, bg, minimum, what) => {
    expect(palette[fg], `--${fg} is missing`).toBeDefined();
    expect(palette[bg], `--${bg} is missing`).toBeDefined();
    const ratio = contrast(palette[fg], palette[bg]);
    expect(ratio, `${what}: ${palette[fg]} on ${palette[bg]} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum);
  });
});

describe("palette is the only place colours are written", () => {
  const withoutComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");
  const literal = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(/;

  it("has no colour literal in the stylesheet outside the palette blocks", () => {
    const rest = withoutComments(css.replace(darkBlock, "").replace(lightBlock, ""));
    expect(rest.match(literal)?.[0]).toBeUndefined();
  });

  it("has no colour literal in index.html or src/main.ts", () => {
    for (const file of ["index.html", "src/main.ts"]) {
      expect(readFileSync(file, "utf8").match(literal)?.[0], file).toBeUndefined();
    }
  });
});
