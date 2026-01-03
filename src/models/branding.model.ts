export interface IBrandingColors {
    accent: string;
    primary: string;
    secondary: string;
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
