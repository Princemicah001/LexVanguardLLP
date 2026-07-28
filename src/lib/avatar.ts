export const DEFAULT_AVATAR_URL = "https://37assets.37signals.com/svn/765-default-avatar.png";

export function detectGender(_name: string): 'male' | 'female' {
  return 'male';
}

export function makeAvatarSvg(_name?: string, _genderPreference?: 'male' | 'female' | 'auto'): string {
  return DEFAULT_AVATAR_URL;
}


