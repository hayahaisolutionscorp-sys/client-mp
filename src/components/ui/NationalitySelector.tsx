"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import nationality from "i18n-nationality";
import enLocale from "i18n-nationality/langs/en.json";

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

nationality.registerLocale(enLocale);

const nationalities = Object.values(nationality.getNames("en"))
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ value: name, label: name }));

interface NationalitySelectorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const NationalitySelector = ({
  value: externalValue,
  defaultValue = "",
  onChange,
  placeholder = "Select nationality",
  className,
  disabled = false,
}: NationalitySelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue ?? defaultValue);
  const themeSettings = useThemeSettings();
  const primaryColor = hexToRgb(themeSettings?.primary || "#8C1F21");

  React.useEffect(() => {
    if (externalValue !== undefined) setValue(externalValue);
    else if (defaultValue !== undefined) setValue(defaultValue);
  }, [externalValue, defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={null}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-md border border-input bg-background px-3 py-2 font-normal text-customText text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          style={{ "--primary-color": primaryColor } as React.CSSProperties}
        >
          <span className="truncate">
            {value
              ? nationalities.find((n) => n.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-100" style={{ color: `rgba(${primaryColor}, 1)` }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search nationality..." />
          <CommandList className="max-h-60 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CommandEmpty>No nationality found.</CommandEmpty>
            <CommandGroup>
              {nationalities.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="data-[selected='true']:bg-[rgba(var(--primary-color),0.12)] data-[selected='true']:text-inherit aria-selected:bg-[rgba(var(--primary-color),0.12)]"
                  style={{ "--primary-color": primaryColor } as React.CSSProperties}
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

export default NationalitySelector;
