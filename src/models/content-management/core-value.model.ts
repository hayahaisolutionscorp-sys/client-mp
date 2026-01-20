export interface ICoreValue {
    id: string;
    page_id: string;
    section_id: string;
    title: string;
    description: string;
    icon_url: string;
    icon_alt: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}
