export interface PassengerData {
    id: number;
    firstname: string;
    lastname: string;
    sex: string;
    dob: string;
    nationality: string;
    accommodation: string;
    address: string;
    discountType?: string | null;
}
