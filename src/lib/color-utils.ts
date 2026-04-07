export function hexToHsl(hex: string): string {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

type RGB = { r: number; g: number; b: number };

function normalizeHex(hex: string): string | null {
    const raw = hex.trim().replace(/^#/, "");

    if (/^[0-9a-fA-F]{3}$/.test(raw)) {
        return raw
            .split("")
            .map((char) => `${char}${char}`)
            .join("");
    }

    if (/^[0-9a-fA-F]{6}$/.test(raw)) {
        return raw;
    }

    if (/^[0-9a-fA-F]{8}$/.test(raw)) {
        return raw.slice(0, 6);
    }

    return null;
}

function parseRgbString(value: string): RGB | null {
    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
        return null;
    }

    const parts = match[1]
        .split(",")
        .slice(0, 3)
        .map((part) => Number.parseFloat(part.trim()));

    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
        return null;
    }

    const [r, g, b] = parts.map((part) => Math.max(0, Math.min(255, Math.round(part))));
    return { r, g, b };
}

export function parseColorToRgb(value: string | null | undefined): RGB | null {
    if (!value) {
        return null;
    }

    let input = value.trim();

    // If it's a gradient, try to extract the first hex color for luminance calculation
    if (input.includes("gradient")) {
        const hexMatch = input.match(/#[a-fA-F0-9]{3,8}/);
        if (hexMatch) {
            input = hexMatch[0];
        }
    }

    const normalizedHex = normalizeHex(input);
    if (normalizedHex) {
        return {
            r: Number.parseInt(normalizedHex.slice(0, 2), 16),
            g: Number.parseInt(normalizedHex.slice(2, 4), 16),
            b: Number.parseInt(normalizedHex.slice(4, 6), 16),
        };
    }

    return parseRgbString(input);
}

function linearizeChannel(channel: number): number {
    const normalized = channel / 255;
    return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function relativeLuminance(color: RGB): number {
    return (
        0.2126 * linearizeChannel(color.r) +
        0.7152 * linearizeChannel(color.g) +
        0.0722 * linearizeChannel(color.b)
    );
}

function contrastRatio(foreground: RGB, background: RGB): number {
    const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
    return (light + 0.05) / (dark + 0.05);
}

export function getReadableTextColor(
    backgroundColor: string | null | undefined,
    darkText: string = "#0f172a",
    lightText: string = "#f8fafc"
): string {
    const background = parseColorToRgb(backgroundColor);
    const dark = parseColorToRgb(darkText);
    const light = parseColorToRgb(lightText);

    if (!background || !dark || !light) {
        return darkText;
    }

    const darkContrast = contrastRatio(dark, background);
    const lightContrast = contrastRatio(light, background);

    return lightContrast >= darkContrast ? lightText : darkText;
}

export function toRgbCssValue(color: string | null | undefined, fallback = "15 23 42"): string {
    const parsed = parseColorToRgb(color);
    if (!parsed) {
        return fallback;
    }

    return `${parsed.r} ${parsed.g} ${parsed.b}`;
}
