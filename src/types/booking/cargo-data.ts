export interface CargoData {
    id: number;
    commodityId: number;
    commodityName: string;
    commodityDescription: string;
    quantity: number;
    cbmRate: string;
    cargo_class?: string;
}
