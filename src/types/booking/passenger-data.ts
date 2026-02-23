export interface PassengerData {
    id: number;
    firstname: string;
    middlename?: string;
    lastname: string;
    suffixName?: string;
    sex: string;
    dob: string;
    nationality: string;
    accommodation: string;
    address: string;
    discountType?: string | null;
}
