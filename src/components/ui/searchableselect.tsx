"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableSelectOption {
  label: string;
  value: string;
  description?: string;
  avatar?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isMultiple?: boolean;
  maxItems?: number;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  isMultiple = false,
  maxItems,
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedValues = isMultiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string" && value
    ? [value]
    : [];

  const handleSelect = (optionValue: string) => {
    if (isMultiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(optionValue)) {
        onChange(current.filter((v) => v !== optionValue));
      } else {
        if (maxItems && current.length >= maxItems) {
          return;
        }
        onChange([...current, optionValue]);
      }
    } else {
      onChange(optionValue === value ? "" : optionValue);
      setOpen(false);
    }
  };

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (isMultiple) {
      const current = Array.isArray(value) ? value : [];
      onChange(current.filter((v) => v !== optionValue));
    } else {
      onChange("");
    }
  };

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full flex items-center justify-between bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white focus:outline-none focus:border-emerald-400 h-auto py-2.5 px-3 rounded-xl cursor-pointer font-normal text-sm min-h-[44px] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2 overflow-hidden">
              {selectedOptions.length === 0 && (
                <span className="text-white/40">{placeholder}</span>
              )}

              {!isMultiple && selectedOptions.length > 0 && (
                <span className="truncate text-white font-medium">
                  {selectedOptions[0].label}
                </span>
              )}

              {isMultiple &&
                selectedOptions.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-medium"
                  >
                    <span>{opt.label}</span>
                    <span
                      onClick={(e) => handleRemove(e, opt.value)}
                      className="hover:text-rose-400 cursor-pointer transition-colors p-0.5"
                    >
                      <X size={12} />
                    </span>
                  </span>
                ))}
            </div>
            <ChevronsUpDown size={16} className="shrink-0 text-white/50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[280px] p-0 bg-[#181818] border-white/10 text-white rounded-xl shadow-2xl overflow-hidden"
          align="start"
        >
          <Command className="bg-[#181818] text-white">
            <CommandInput
              placeholder={searchPlaceholder}
              className="border-b border-white/10 text-white placeholder:text-white/40 h-11"
            />
            <CommandList className="max-h-60 overflow-y-auto p-1 bg-[#181818]">
              <CommandEmpty className="py-3 text-center text-xs text-white/40">
                No results found.
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isMaxReached =
                    isMultiple && maxItems ? selectedValues.length >= maxItems && !isSelected : false;

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      disabled={isMaxReached}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm cursor-pointer transition-colors my-0.5",
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400 font-medium"
                          : "text-white/80 hover:bg-white/10 hover:text-white aria-selected:bg-white/10 aria-selected:text-white",
                        isMaxReached && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-[10px] text-white/40">{option.description}</span>
                        )}
                      </div>
                      {isSelected && <Check size={15} className="text-emerald-400 shrink-0 ml-2" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
