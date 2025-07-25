import { IVoucher } from "@/models";
import { AYAHAY_MARKUP_FLAT, AYAHAY_MARKUP_PERCENT } from "constants/default"

export class PaymentCalculationHelper {
    // private readonly AYAHAY_MARKUP_FLAT = 50;
    // private readonly AYAHAY_MARKUP_PERCENT = 0.05;

    // Calculates Ayahay markup for passenger
    public calculateAyahayMarkupForPassenger(
        chargeablePrice: number
    ): number {
        return Math.max(AYAHAY_MARKUP_FLAT, chargeablePrice * AYAHAY_MARKUP_PERCENT);
    }

    // Calculates Ayahay markup for vehicle
    public calculateAyahayMarkupForVehicle(
        chargeablePrice: number
    ): number {
        return Math.max(AYAHAY_MARKUP_FLAT, chargeablePrice * AYAHAY_MARKUP_PERCENT);
    }

    // Calculates Passenger Total Fare
    public calculatePassengerTotalFare(
        passengerFare: number,
        passengerCount: number
    ): number {
        return passengerFare * passengerCount;
    }

    // Calculates Vehicle Total Fare
    public calculateVehicleTotalFare(
        vehicleFare: number,
        vehicleCount: number
    ): number {
        return vehicleFare * vehicleCount;
    }

    // Calculates voucher discount
    public calculateVoucherDiscount(
        discountablePrice: number,
        voucher?: IVoucher
    ): number {
        if (!voucher) return 0;
        const totalDiscount = discountablePrice * voucher.discountPercent + voucher.discountFlat;
        return totalDiscount > discountablePrice ? discountablePrice : totalDiscount;
    }
}