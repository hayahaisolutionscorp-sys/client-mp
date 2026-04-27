"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
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

const countryOptions = Array.from(
  new Map(
    defaultCountries.map((c) => {
      const parsed = parseCountry(c);
      return [parsed.name, { value: parsed.iso2.toUpperCase(), label: parsed.name }];
    })
  ).values()
).sort((a, b) => a.label.localeCompare(b.label));

interface CountrySelectorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CountrySelector = ({
  value: externalValue,
  defaultValue = "PH",
  onChange,
  placeholder = "Select country",
  className,
  disabled = false,
}: CountrySelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue ?? defaultValue);
  const themeSettings = useThemeSettings();
  
  const primaryColorRgb = React.useMemo(() => {
    return hexToRgb(themeSettings?.primary || "#8C1F21");
  }, [themeSettings?.primary]);

  React.useEffect(() => {
    if (externalValue !== undefined) setValue(externalValue);
    else if (defaultValue !== undefined) setValue(defaultValue);
  }, [externalValue, defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          data-template-ignore="true"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between !bg-white rounded-full border border-slate-200 bg-white px-4 py-2 text-sm !text-black shadow-none focus:outline-none focus:ring-2 focus:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          style={{ "--primary-color": primaryColorRgb } as React.CSSProperties}
        >
          <span className="truncate !text-black">
            {(() => {
              const selected = countryOptions.find((n) => n.value === value || n.label === value);
              return selected ? selected.label : (value || placeholder);
            })()}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-100 text-slate-900" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-60 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryOptions.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="data-[selected='true']:bg-[rgba(var(--primary-color),0.12)] data-[selected='true']:text-inherit aria-selected:bg-[rgba(var(--primary-color),0.12)]"
                  style={{ "--primary-color": primaryColorRgb } as React.CSSProperties}
                  onSelect={() => {
                    const next = item.value === value ? "" : item.value;
                    setValue(next);
                    setOpen(false);
                    onChange?.(next);
                  }}
                >
                  <span className="flex-1 truncate">{item.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelector;
