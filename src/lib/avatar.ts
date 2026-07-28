export function makeAvatarSvg(name: string): string {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="#111111"/>
    <rect x="0" y="460" width="400" height="40" fill="#EAB308"/>
    <text x="200" y="280" font-family="Georgia,serif" font-size="120" font-weight="bold" fill="#EAB308" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    <text x="200" y="480" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#000000" text-anchor="middle" dominant-baseline="middle" letter-spacing="3">${name.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
