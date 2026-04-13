export interface IBrandingColors {
    accent: string;
    primaryColor?: string;
    secondaryColor?: string;
    primary?: string;
    secondary?: string;
    surface?: string;
    surfaceAlt?: string;
    cornerRadiusClass?: string;
    sectionAnimation?: string;
    [key: string]: any;
}

export interface IBrandingLogo {
    dark: string;
    light: string;
}

export interface IBrandingConfig {
    id: string;
    brand_name: string;
    domain_name: string;
    subdomain_name: string;
    favicon_url: string;
    fontFamily?: string;
    fontFamilyTitle?: string;
    font_family?: string; // from API
    font_family_title?: string; // from API
    corner_radius_class?: string | null;
    card_surface_class?: string | null;
    load_classes?: Record<string, any> | null;
    colors: IBrandingColors;
    logo: IBrandingLogo;
    slogan: string | null;
    motto: string | null;
    tagline: string | null;
    created_at: string;
    updated_at: string;
}

export interface IBrandingResponse {
    message: string;
    data: IBrandingConfig;
}
