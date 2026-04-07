export interface CargoData {
    id: number;
    commodityId: number;
    commodityName: string;
    commodityDescription: string;
    quantity: number;
    cbmRate: string;
    cargo_class?: string;
    // Leg 2 overrides for cross-tenant connecting trips
    leg2CommodityId?: number;
    leg2CommodityName?: string;
    leg2CommodityDescription?: string;
    leg2CbmRate?: string;
    leg2CargoClass?: string;
}
