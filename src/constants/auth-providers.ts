export interface AuthProviderConfig {
  id: string;
  name: string;
  icon: string;
  variant?: 'social' | 'native';
}

export const AUTH_PROVIDERS: AuthProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '/assets/icons/google_logo.svg',
    variant: 'social',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '/assets/icons/facebook_logo.svg',
    variant: 'social',
  },
  {
    id: 'hayahai',
    name: 'Hayahai',
    icon: '/assets/icons/Ayahay_logo.svg',
    variant: 'native',
  },
];
