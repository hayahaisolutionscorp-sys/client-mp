export interface IThemeSettings {
  id: number;
  shippingLineId: number;
  fontStyle: string;
  backgroundColor: string;
  buttonDefaultColor: string;
  buttonDestructiveColor: string;
  buttonOutlineColor: string;
  buttonSecondaryColor: string;
  buttonGhostColor: string;
  buttonLinkColor: string;

  iconColor: string;

  // New Fields
  primaryColor: string;
  secondaryColor: string;
  accent: string;
}

export interface IThemeSettingsNew {
  primaryColor: string;
  secondaryColor: string;
  accent: string;
  fontStyle: string;
}