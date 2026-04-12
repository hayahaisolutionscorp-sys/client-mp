"use client";

import { useState, useEffect, FC } from "react";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { PassengerData } from "@/types/booking/passenger-data";
import { ContactData } from "@/types/booking/contact-data";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useAuth } from "@/contexts/AuthContexts";
import CountryCodeSelector, { CountryData } from "@/components/ui/CountryCodeSelector";
import { defaultCountries, parseCountry } from "react-international-phone";


interface ContactDetailsFormProps {
  passengerDetails?: PassengerData;
  initialContact?: ContactData | null;
  onChange?: (contacts: ContactData) => void;
}

const emailDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br", "yahoo.com"];

const ContactDetailsForm: FC<ContactDetailsFormProps> = ({
  passengerDetails,
  initialContact,
  onChange,
}) => {
  const themeSettings = useThemeSettings();
  const { currentUser } = useAuth();
  const [usePassengerDetails, setUsePassengerDetails] = useState(false);
  const ph = defaultCountries.find(c => parseCountry(c).iso2 === 'ph') || defaultCountries[0];
  const defaultCountry = parseCountry(ph);

  const [contactDetails, setContactDetails] = useState<ContactData>(initialContact || {
    firstname: "",
    lastname: "",
    mobileNumber: "",
    email: "",
    countryCode: defaultCountry.iso2,
  });
  const [phoneDigits, setPhoneDigits] = useState("");

  const [phoneConfig, setPhoneConfig] = useState(() => {
    const formatStr = typeof defaultCountry.format === 'string' ? defaultCountry.format : '';
    const dotMatches = formatStr.match(/\./g);
    return {
      maxLength: dotMatches ? dotMatches.length : 10,
      placeholder: formatStr.replace(/\./g, "0").replace(/\\/g, "") || "917 123 4567"
    };
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update parent component when contactDetails change
  useEffect(() => {
    if (onChange) {
      onChange(contactDetails);
    }
  }, [contactDetails, onChange]);

  // Auto-fill contact details if user is logged in
  useEffect(() => {
    if (currentUser && !contactDetails.firstname && !contactDetails.lastname && !contactDetails.email) {
      const profile = currentUser.passenger;
      const phone = profile?.phone || "";
      let countryIso = defaultCountry.iso2;
      let digits = phone.replace(/\D/g, "");

      if (phone) {
        const match = defaultCountries.find(c => {
          const parsed = parseCountry(c);
          const dialCode = parsed.dialCode;
          return phone.startsWith(dialCode) || phone.startsWith('+' + dialCode);
        });
        if (match) {
          const parsed = parseCountry(match);
          const dialCode = parsed.dialCode;
          countryIso = parsed.iso2;
          digits = phone.startsWith('+') 
            ? phone.slice(dialCode.length + 1).replace(/\D/g, '')
            : phone.slice(dialCode.length).replace(/\D/g, '');
          
          setPhoneConfig({
            maxLength: digits.length > 10 ? digits.length : 10, // heuristic
            placeholder: "" // will be updated by CountryCodeSelector if changed
          });
        }
      }

      setPhoneDigits(digits);
      setContactDetails({
        firstname: profile?.firstName || "",
        lastname: profile?.lastName || "",
        mobileNumber: phone.startsWith('+') ? phone : (phone ? `+${phone}` : ""),
        email: currentUser.email || "",
        countryCode: countryIso,
      });
    }
  }, [currentUser, contactDetails.firstname, contactDetails.lastname, contactDetails.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update contact details for the changed field
    setContactDetails((prev) => ({ ...prev, [name.replace("contact-", "")]: value }));

    if (name === "contact-email") {
      const [localPart, domainPart] = value.split("@");

      if (domainPart !== undefined) {
        const filtered = emailDomains
          .filter((domain) => domain.startsWith(domainPart))
          .map((domain) => `${localPart}@${domain}`);

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSelectSuggestion = (email: string) => {
    setContactDetails((prev) => ({ ...prev, email }));
    setShowSuggestions(false);
  };

  const handleCheckboxChange = () => {
    setUsePassengerDetails((prev) => {
      const newValue = !prev;
      if (newValue && passengerDetails) {
        setContactDetails({
          firstname: passengerDetails.firstname,
          lastname: passengerDetails.lastname,
          mobileNumber: "",
          email: "",
          countryCode: "PH",
        });
      } else {
        setContactDetails({
          firstname: "",
          lastname: "",
          mobileNumber: "",
          email: "",
          countryCode: defaultCountry.iso2,
        });
      }
      return newValue;
    });
  };

  useEffect(() => {
    const validateAllFields = () => {
      const errors: { [key: string]: string } = {};

      // Validate all fields in contactDetails
      if (!contactDetails.firstname) {
        errors.firstname = "First Name is required";
      }
      if (!contactDetails.lastname) {
        errors.lastname = "Last Name is required";
      }
      if (!contactDetails.mobileNumber) {
        errors.mobileNumber = "Mobile Number is required";
      }
      if (!contactDetails.email) {
        errors.email = "Email is required";
      } else if (
        contactDetails.email &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contactDetails.email)
      ) {
        errors.email = "Please enter a valid email address";
      }

      if (phoneDigits && phoneDigits.length < phoneConfig.maxLength) {
        errors.mobileNumber = `Mobile number must be ${phoneConfig.maxLength} digits`;
      }

      // Update the errors state with all fields' errors
      setFormErrors(errors);
    };

    validateAllFields();
  }, [contactDetails]);

  return (
    <div className="border rounded-lg shadow-md bg-white p-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center text-customText">
          <h2 className="text-lg font-semibold sm:mr-2">Contact Details</h2>
          <p className="text-sm text-gray-500">(Booking details will be sent to)</p>
        </div>
        <label className="flex items-center space-x-2">
          <input
            title="Use passenger's details"
            type="checkbox"
            checked={usePassengerDetails}
            onChange={handleCheckboxChange}
            className="h-4 w-4 border-gray-300 rounded"
            style={{ accentColor: themeSettings?.accent || '#23abff', colorScheme: 'light' }}
          />
          <span className="text-sm">Use passenger&apos;s details</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="contact-firstname" className="block text-sm font-medium text-customText">
            First Name
          </label>
          <Input
            id="contact-firstname"
            name="contact-firstname"
            type="text"
            placeholder="e.g. John"
            value={contactDetails.firstname}
            onChange={handleInputChange}
          />
          {formErrors.firstname && (
            <div className="text-sm text-red-500 mt-1">{formErrors.firstname}</div>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="contact-lastname" className="block text-sm font-medium text-customText">
            Last Name
          </label>
          <Input
            id="contact-lastname"
            name="contact-lastname"
            type="text"
            placeholder="e.g. Doe"
            value={contactDetails.lastname}
            onChange={handleInputChange}
          />
          {formErrors.lastname && (
            <div className="text-sm text-red-500 mt-1">{formErrors.lastname}</div>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="contact-mobileNumber" className="block text-sm font-medium text-customText">
            Mobile Number
          </label>
          <div className="flex flex-row items-center">
            <CountryCodeSelector 
              value={contactDetails.countryCode}
              onChange={(country: CountryData) => {
                const truncated = phoneDigits.slice(0, country.maxLength);
                setPhoneDigits(truncated);
                const dial = country.dialCode;
                setContactDetails(prev => ({ 
                  ...prev, 
                  countryCode: country.iso2, 
                  mobileNumber: '+' + dial + truncated 
                }));
                setPhoneConfig({
                  maxLength: country.maxLength,
                  placeholder: country.placeholder
                });
              }}
              className="w-[100px] mr-2"
            />
            <Input
              id="contact-mobileNumber"
              name="mobileNumber"
              type="text"
              placeholder={phoneConfig.placeholder}
              value={phoneDigits}
              inputMode="numeric"
              maxLength={phoneConfig.maxLength}
              className="w-full"
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, "").slice(0, phoneConfig.maxLength);
                setPhoneDigits(numericValue);
                // We need to find the current dial code
                const match = defaultCountries.find(c => parseCountry(c).iso2 === contactDetails.countryCode) || defaultCountries[0];
                const dial = parseCountry(match).dialCode;
                setContactDetails((prev) => ({ ...prev, mobileNumber: '+' + dial + numericValue }));
              }}
            />
          </div>
          {formErrors.mobileNumber && (
            <div className="text-sm text-red-500 mt-1">{formErrors.mobileNumber}</div>
          )}
        </div>

        {/* Email with Autocomplete */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-customText">
            Email
          </label>
          <div className="relative">
            <Input
              id="contact-email"
              name="contact-email"
              type="email"
              placeholder="Email"
              value={contactDetails.email}
              onChange={handleInputChange}
            />
            {showSuggestions && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-md z-10">
                {suggestions.map((email, index) => (
                  <li
                    key={index}
                    className="text-sm p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectSuggestion(email)}
                  >
                    {email}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {formErrors.email && <div className="text-sm text-red-500 mt-1">{formErrors.email}</div>}
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsForm;