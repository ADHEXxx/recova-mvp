/**
 * Generates an inline SVG "brand mark" data URI for companies that don't have
 * a real uploaded logo yet. Used as demo/placeholder branding — any company
 * can replace it with a real photo from their profile page.
 */
export function generateLogoDataUri(initials: string, bg: string, fg: string = "#ffffff"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<rect width="128" height="128" rx="30" fill="${bg}"/>
<rect x="7" y="7" width="114" height="114" rx="25" fill="none" stroke="${fg}" stroke-opacity="0.22" stroke-width="2"/>
<circle cx="100" cy="30" r="7" fill="${fg}" fill-opacity="0.16"/>
<text x="64" y="79" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700" letter-spacing="1" fill="${fg}" text-anchor="middle">${initials}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const BRAND_PALETTE = [
  "#0f3d46",
  "#1c4f63",
  "#2f6f5e",
  "#2c6e6b",
  "#3f7a4f",
  "#46505c",
  "#52565c",
  "#6b4226",
  "#7a5230",
  "#8a5a2b",
];

/** Deterministically picks a palette color for a given seed (e.g. company name). */
export function pickBrandColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return BRAND_PALETTE[Math.abs(hash) % BRAND_PALETTE.length];
}
