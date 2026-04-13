"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

const Combobox = ({
  values,
  placeholder = "Select value...",
  defaultValue = "",
  value: externalValue,
  onChange,
  className,
  disabled = false,
}: {
  values: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (selectedValue: string) => void;
  className?: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue || defaultValue);
  const themeSettings = useThemeSettings();
  const primaryColor = hexToRgb(themeSettings?.primary || "#8C1F21");

  React.useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    } else if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [externalValue, defaultValue]);

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(nextOpen) => {
        if (!disabled) {
          setOpen(nextOpen);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          data-template-ignore="true"
          variant={null}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between !rounded-md border border-input bg-transparent px-3 py-2 text-base text-black shadow-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          style={
            {
              "--primary-color": hexToRgb(themeSettings?.primary || "#8C1F21"),
            } as React.CSSProperties
          }
        >
          {value
            ? values.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-100 text-black" style={{ color: `rgba(${primaryColor}, 1)` }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border border-gray-200 bg-white p-0 text-black shadow-none" align="start">
        <Command className="bg-white text-black shadow-none">
          <CommandInput className="text-black placeholder:text-gray-500" placeholder={placeholder} />
          <CommandList className="max-h-60 bg-white text-black">
            <CommandEmpty>No value found.</CommandEmpty>
            <CommandGroup>
              {values.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  data-template-ignore="true"
                  className="bg-white text-black transition-colors hover:bg-[rgba(var(--primary-color),0.08)] hover:text-black data-[selected='true']:bg-[rgba(var(--primary-color),0.08)] data-[selected='true']:text-black data-[selected='true']:font-medium aria-selected:bg-[rgba(var(--primary-color),0.08)] aria-selected:text-black aria-selected:font-medium"
                  onSelect={() => {
                    const newValue = item.value === value ? "" : item.value;
                    setValue(newValue);
                    setOpen(false);
                    if (onChange) onChange(newValue);
                  }}
                  style={
                    {
                      "--primary-color": hexToRgb(themeSettings?.primary || "#8C1F21"),
                    } as React.CSSProperties
                  }
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
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

export default Combobox;