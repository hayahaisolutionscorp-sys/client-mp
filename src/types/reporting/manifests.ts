export interface TripManifest {
  shipName: string;
  srcPortName: string;
  destPortName: string;
  departureDate: string;
  passengers: {
    fullName: string;
    birthDate: string;
    age: number;
    sex: string;
    nationality: string;
    address: string;
  }[];
}

export interface BillOfLading {
  referenceNo: string;
  consigneeName: string;
  freightRateReceipt: string;
  shipName: string;
  voyageNumber: number;
  shippingLineName: string;
  shippingLineSubsidiary?: string;
  shippingLineAddress: string;
  shippingLineTelephoneNo: string;
  shippingLineFaxNo?: string;

  vehicles: {
    // destPortName and departureDateIso are for round trip purposes
    destPortName: string;
    departureDateIso: string;

    classification?: string;
    modelName: string;
    plateNo: string;
    weight?: string;
    vehicleTypeDesc: string;
    fare: number;
  }[];

  isCollectBooking: boolean;
}
