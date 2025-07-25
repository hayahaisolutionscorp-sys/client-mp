export const formatCurrency = (value: number, currency: string = "PHP") =>
    `${currency} ${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;