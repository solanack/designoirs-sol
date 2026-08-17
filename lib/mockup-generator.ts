const palettes = [
  ["#baff32", "#7b3cff", "#10110f"], ["#ff4fa3", "#35d9ff", "#151515"],
  ["#ff7139", "#ffe735", "#17121f"], ["#8c5cff", "#f4f0e8", "#111111"],
];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, char => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[char] || char));
}

export function mockDesignSvg(brief: string, type: string, seed: string) {
  const hash = [...seed].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const p = palettes[hash % palettes.length];
  const word = (brief.match(/[a-z0-9]{4,}/gi) || ["DESIGNOIRS"])[hash % Math.max(1, (brief.match(/[a-z0-9]{4,}/gi) || []).length)] || "DESIGNOIRS";
  const label = escapeXml(type.toUpperCase());
  const tag = escapeXml(word.slice(0, 12).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><filter id="n"><feTurbulence baseFrequency=".8" numOctaves="3" seed="${hash % 99}"/><feBlend mode="overlay" in="SourceGraphic"/></filter><linearGradient id="g" x2="1" y2="1"><stop stop-color="${p[2]}"/><stop offset="1" stop-color="#333"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/><g opacity=".16" filter="url(#n)"><rect width="1024" height="1024" fill="${p[0]}"/></g><path d="M110 790 Q260 620 170 260 Q500 80 850 250 Q760 610 920 790 Q530 890 110 790Z" fill="#181916" stroke="${p[1]}" stroke-width="18"/><path d="M215 320 L790 230 M160 655 L845 520 M290 820 L755 700" stroke="${p[0]}" stroke-width="38" stroke-linecap="round" opacity=".9"/><text x="512" y="505" text-anchor="middle" fill="${p[1]}" stroke="#000" stroke-width="8" paint-order="stroke" font-family="Impact, sans-serif" font-size="126" transform="rotate(-7 512 505)">${tag}</text><text x="512" y="595" text-anchor="middle" fill="#fff" font-family="monospace" font-size="36" letter-spacing="12">${label}</text><text x="68" y="92" fill="${p[0]}" font-family="monospace" font-size="24">DESIGNOIRS // ${hash.toString(16).toUpperCase()}</text></svg>`;
}

export function designName(brief: string, type: string, index: number) {
  const words = (brief.match(/[a-z0-9]{4,}/gi) || ["Untitled", "Signal"]).slice(0, 5);
  const lead = words[(Date.now() + index) % words.length];
  return `${lead[0].toUpperCase()}${lead.slice(1)} ${type[0].toUpperCase()}${type.slice(1)}`;
}
