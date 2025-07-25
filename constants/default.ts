export const DEFAULT_BOOKING_TYPE = 'Single Trip';
export const DEFAULT_NUM_PASSENGERS = 1;
export const DEFAULT_NUM_VEHICLES = 0;
export const DEFAULT_SHIPPING_LINE_LOGO = 'AYAHAY SHIPPING LINES'

export const DATE_FORMAT_LIST = [
  'MM/DD/YYYY',
  'MM/D/YYYY',
  'M/DD/YYYY',
  'M/D/YYYY',
  'MM-DD-YYYY',
  'MM-D-YYYY',
  'M-DD-YYYY',
  'M-D-YYYY',
  'YYYY',
  'MMM. DD, YYYY',
  'ddd, MMM. DD, YYYY',
  'dddd',
];
export const DATE_PLACEHOLDER = DATE_FORMAT_LIST[0];
export const DATE_PRIMARY_DEFAULT_FORMAT = DATE_FORMAT_LIST[9];
export const DATE_SECONDARY_DEFAULT_FORMAT = DATE_FORMAT_LIST[10];
export const DAY_DEFAULT_FORMAT = DATE_FORMAT_LIST[11];

export const TIME_FORMAT_LIST = [
  'hh:mm A', // 12-hour format with AM/PM
  'HH:mm',   // 24-hour format
];
export const TIME_DEFAULT_FORMAT = TIME_FORMAT_LIST[0];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

 // Navigation items array with id and name
 export const NAV_ITEMS = [
  { id: "Book", name: "Book", redirect_url: "", trigger: "Scroll"},
  { id: "Promos", name: "Promos", redirect_url: "", trigger: "Scroll" },
  { id: "Routes", name: "Routes", redirect_url: "", trigger: "Scroll" },
  { id: "WhyChooseUs", name: "Why Choose Us", redirect_url: "", trigger: "Scroll" },
  { id: "Partner", name: "Partner", redirect_url: "", trigger: "Scroll" },
  { id: "Resources", name: "Resources", redirect_url: "", trigger: "Scroll" },
  { id: "AboutUs", name: "About Us", redirect_url: "/about-us", trigger: "Redirect" },
  { id: "ContactUs", name: "Contact Us", redirect_url: "/contact-us", trigger: "Redirect"  },
  { id: "ScheduleAndFares", name: "Schedule And Fares", redirect_url: "/schedule-and-fares", trigger: "Redirect" },
];

export const SORT_BY_OPTIONS = [
  { value: "earliest", label: "Earliest Time" },
  { value: "fastest", label: "Fastest" },
  { value: "cheapest", label: "Cheapest" },
];

export const NATIONALITIES = [
  "Afghan",
  "Algerian",
  "American",
  "Angolan",
  "Argentine",
  "Australian",
  "Bahraini",
  "Bangladeshi",
  "Belgian",
  "Brazilian",
  "British",
  "Canadian",
  "Chilean",
  "Chinese",
  "Colombian",
  "Danish",
  "Dutch",
  "Egyptian",
  "Emirati",
  "Filipino",
  "Finnish",
  "French",
  "Ghanaian",
  "German",
  "Greek",
  "Iraqi",
  "Israeli",
  "Italian",
  "Japanese",
  "Jordanian",
  "Kenyan",
  "Kuwaiti",
  "Lebanese",
  "Libyan",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Nigerian",
  "Norwegian",
  "Omani",
  "Pakistani",
  "Palestinian",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Qatari",
  "Russian",
  "Saudi Arabian",
  "Scottish",
  "Singaporean",
  "South African",
  "South Korean",
  "Sri Lankan",
  "Swedish",
  "Swiss",
  "Syrian",
  "Tunisian",
  "Turkish",
  "Ugandan",
  "Uzbek",
  "Vietnamese",
  "Yemeni",
  "Zambian",
  "Zimbabwean"
].map((name) => ({ value: name, label: name }));

export const MINUTE_OPTIONS = [0, 15, 30, 45];

export const AYAHAY_MARKUP_FLAT = 50;
export const AYAHAY_MARKUP_PERCENT = 0.05;

export const DEFAULT_CREATE_BOOKING_PAYMENT_GATEWAY = "PayMongo";
export const DEFAULT_CREATE_BOOKING_TYPE = "Single";