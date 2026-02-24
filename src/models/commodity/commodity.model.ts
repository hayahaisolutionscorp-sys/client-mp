export interface ICommodity {
    id: number;
    name: string;
    description: string;
    is_hazardous: boolean;
    requires_permit: boolean;
    cbm_rate: string;
    cargo_class: string | null;
    created_at: string;
    updated_at: string;
}
