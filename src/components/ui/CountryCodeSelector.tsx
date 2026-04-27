"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { defaultCountries, parseCountry } from "react-international-phone";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

export interface CountryData {
  name: string;
  iso2: string;
  dialCode: string;
  format?: string;
  maxLength: number;
  placeholder: string;
}

interface CountryCodeSelectorProps {
  value: string; // ISO2 code
  onChange: (country: CountryData) => void;
  className?: string;
  disabled?: boolean;
}

const CountryCodeSelector = ({
  value,
  onChange,
  className,
  disabled = false,
}: CountryCodeSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const themeSettings = useThemeSettings();
  
  const primaryColorRgb = React.useMemo(() => {
    return hexToRgb(themeSettings?.primary || "#8C1F21");
  }, [themeSettings?.primary]);

  const countries = React.useMemo(() => {
    return defaultCountries.map((c) => {
      const parsed = parseCountry(c);
      return {
        name: parsed.name,
        iso2: parsed.iso2,
        dialCode: parsed.dialCode,
        format: parsed.format,
      };
    });
  }, []);

  const selectedCountry = React.useMemo(() => {
    return countries.find((c) => c.iso2.toLowerCase() === value.toLowerCase()) || countries[0];
  }, [countries, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-template-ignore="true"
          variant={null}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-[110px] justify-between !rounded-md border border-input bg-white px-3 py-2 font-normal text-base text-black shadow-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          style={
            {
              "--primary-color": primaryColorRgb,
            } as React.CSSProperties
          }
        >
          <span className="truncate">
            {selectedCountry ? `+${selectedCountry.dialCode}` : "+63"}
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-100 text-black" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] border border-gray-200 bg-white p-0 text-black shadow-none" align="start">
        <Command className="bg-white text-black shadow-none">
          <CommandInput className="text-black placeholder:text-gray-500" placeholder="Search country or code..." />
          <CommandList className="max-h-60 bg-white text-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.iso2}
                  value={`${country.name} ${country.dialCode} ${country.iso2}`}
                  className="bg-white text-black transition-colors hover:bg-[rgba(var(--primary-color),0.08)] hover:text-black data-[selected='true']:bg-[rgba(var(--primary-color),0.08)] data-[selected='true']:text-black data-[selected='true']:font-medium aria-selected:bg-[rgba(var(--primary-color),0.08)] aria-selected:text-black aria-selected:font-medium"
                  style={{ "--primary-color": primaryColorRgb } as React.CSSProperties}
                  onSelect={() => {
                    // Extract numeric length from format (e.g., "(...) ...-...." -> 10)
                    const format = country.format;
                    const formatStr = typeof format === "string" ? format : "";
                    const dotMatches = formatStr.match(/\./g);
                    const maxLength = dotMatches ? dotMatches.length : 10;
                    const placeholder = formatStr.replace(/\./g, "0").replace(/\\/g, "");
                    
                    onChange({
                      ...country,
                      format: formatStr, // Ensure it's a string
                      maxLength,
                      placeholder: placeholder || "Phone Number",
                    });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === country.iso2.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="ml-2 text-muted-foreground">+{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCodeSelector;
