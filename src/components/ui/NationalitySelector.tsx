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
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const NationalitySelector = ({
  value: externalValue,
  onChange,
  placeholder = "Select nationality",
  className,
  disabled = false,
}: NationalitySelectorProps) => {
  const defaultValue = "Filipino";
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue ?? "defaultValue");
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
        <Button
          data-template-ignore="true"
          variant={null}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between !rounded-md border border-input bg-transparent px-3 py-2 font-normal text-base text-black shadow-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          style={{ "--primary-color": primaryColorRgb } as React.CSSProperties}
        >
          <span className="truncate">
            {value
              ? nationalities.find((n) => n.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-100 text-black" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border border-gray-200 bg-white p-0 text-black shadow-none" align="start">
        <Command className="bg-white text-black shadow-none">
          <CommandInput className="text-black placeholder:text-gray-500" placeholder="Search nationality..." />
          <CommandList className="max-h-60 bg-white text-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CommandEmpty>No nationality found.</CommandEmpty>
            <CommandGroup>
              {nationalities.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="bg-white text-black transition-colors hover:bg-[rgba(var(--primary-color),0.08)] data-[selected='true']:bg-[rgba(var(--primary-color),0.08)] data-[selected='true']:text-black data-[selected='true']:font-medium aria-selected:bg-[rgba(var(--primary-color),0.08)] aria-selected:text-black aria-selected:font-medium"
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

export default NationalitySelector;
