const FEMALE_NAMES = [
  "linet", "sharon", "mary", "jane", "sarah", "elizabeth", "grace", "faith", "mercy",
  "joy", "ann", "anne", "catherine", "rose", "ruth", "florence", "esther", "lucy",
  "caroline", "brenda", "stacy", "tracy", "njeri", "mwariri", "wanjiku", "akinyi",
  "atieno", "chebet", "wambui", "muthoni", "nyambura", "waithera", "adhiambo", "fiona"
];

export function detectGender(name: string): 'male' | 'female' {
  const lower = name.toLowerCase();
  if (FEMALE_NAMES.some(fn => lower.includes(fn))) {
    return 'female';
  }
  return 'male';
}

export function makeAvatarSvg(name: string, genderPreference?: 'male' | 'female' | 'auto'): string {
  const gender = (!genderPreference || genderPreference === 'auto') ? detectGender(name) : genderPreference;
  const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || "LV";
  
  const isFemale = gender === 'female';

  const silhouette = isFemale ? `
    <!-- Female Advocate Silhouette -->
    <!-- Hair & Head Contour -->
    <path d="M 140,170 C 135,110 170,80 200,80 C 230,80 265,110 260,170 C 260,200 250,225 240,245 C 225,220 215,200 200,200 C 185,200 175,220 160,245 C 150,225 140,200 140,170 Z" fill="#EAB308" opacity="0.95"/>
    <circle cx="200" cy="155" r="42" fill="#121212"/>
    <circle cx="200" cy="155" r="38" fill="#EAB308" opacity="0.85"/>
    <!-- Blazer & Shoulders -->
    <path d="M 105,370 C 105,275 145,240 200,240 C 255,240 295,275 295,370 Z" fill="#EAB308" opacity="0.9"/>
    <!-- Neckline & V-Cut -->
    <polygon points="175,240 225,240 200,310" fill="#121212"/>
    <polygon points="185,240 215,240 200,285" fill="#EAB308" opacity="0.3"/>
  ` : `
    <!-- Male Advocate Silhouette -->
    <!-- Head -->
    <circle cx="200" cy="145" r="42" fill="#EAB308" opacity="0.9"/>
    <!-- Tailored Suit Shoulders -->
    <path d="M 95,370 C 95,270 140,230 200,230 C 260,230 305,270 305,370 Z" fill="#EAB308" opacity="0.9"/>
    <!-- Shirt Collar & Tie -->
    <polygon points="175,230 225,230 200,330" fill="#121212"/>
    <polygon points="190,230 210,230 205,315 200,325 195,315" fill="#EAB308"/>
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1c1a17"/>
        <stop offset="100%" stop-color="#0a0a0a"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FACC15"/>
        <stop offset="50%" stop-color="#EAB308"/>
        <stop offset="100%" stop-color="#CA8A04"/>
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="400" height="500" fill="url(#bgGrad)"/>
    
    <!-- Outer & Inner Gold Frame -->
    <rect x="12" y="12" width="376" height="476" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <rect x="18" y="18" width="364" height="464" fill="none" stroke="#EAB308" stroke-width="0.5" stroke-dasharray="6,4" opacity="0.6"/>

    <!-- Gender Silhouette -->
    <g transform="translate(0, -10)">
      ${silhouette}
    </g>

    <!-- Initials Crest Badge -->
    <circle cx="200" cy="365" r="32" fill="#0a0a0a" stroke="url(#goldGrad)" stroke-width="2"/>
    <text x="200" y="372" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="22" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle">${initials}</text>

    <!-- Scale of Justice Emblem Top Left -->
    <path d="M 35 30 L 55 30 M 45 30 L 45 50 M 35 42 Q 40 50 45 42 M 45 42 Q 50 50 55 42" stroke="#EAB308" stroke-width="1.5" fill="none" opacity="0.4"/>

    <!-- Gold Bottom Banner -->
    <rect x="12" y="435" width="376" height="53" fill="url(#goldGrad)"/>
    <text x="200" y="460" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="15" font-weight="800" fill="#000000" text-anchor="middle" letter-spacing="2.5">${name.toUpperCase()}</text>
    <text x="200" y="476" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#332200" text-anchor="middle" letter-spacing="2">LEXVANGUARD ADVOCATE</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

