import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSelect } from "@refinedev/core"
interface OptionType {
  label: string;
  value: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}
interface SelectDropdownCommandMutipleProps {
  placeholder?: string,
  filterAble?: boolean;
  classNameTrigger?: string;
  classNameContent?: string;
  maxDisplayNumber?: number;
  options?: OptionType[],
  useSelectOptions?: Parameters<typeof useSelect>[0];
  onValueChange?: (filterValues: string[] | undefined) => void;
  value?: string[]
}

export function SelectDropdownCommandMutiple({
  placeholder = "placeholder",
  filterAble = false,
  classNameTrigger = "w-40 px-0",
  classNameContent = "w-40 p-0 align-left",
  maxDisplayNumber = 2,
  options,
  useSelectOptions,
  value = [],
  onValueChange,
}: SelectDropdownCommandMutipleProps) {
  const selectedValues = new Set(value)

  // ✅ 动态加载选项（useSelect）
  //避免useSelect每次render都是新对象，重新请求api
  const stableUseSelectOptions = React.useMemo(() => {
    return useSelectOptions ? {
      ...useSelectOptions,
      defaultValue: value,
    } : undefined;
  }, []);

  const { options: fetchedOptions = [] } = stableUseSelectOptions ? useSelect(stableUseSelectOptions) : { options: [] };

  // ✅ 优先使用 props.options，否则使用 useSelectOptions 返回值
  const selectOptions: OptionType[] = React.useMemo(() => {
    if (options && options.length > 0) return options;

    if (fetchedOptions && fetchedOptions.length > 0) {
      return fetchedOptions.map((opt: any) => ({
        label: opt.label,
        value: String(opt.value),
      }));
    }
    return [];
  }, [options, fetchedOptions]);


  // ✅ Clean up selected values that are no longer in the options list
  React.useEffect(() => {
    if (selectOptions.length === 0) return;

    // Only check if we have values to check
    if (value.length === 0) return;

    const validValues = value.filter(val =>
      selectOptions.some(opt => opt.value === val)
    );

    if (validValues.length !== value.length) {
      onValueChange?.(validValues);
    }
  }, [selectOptions, value, onValueChange]);


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-8 w-full justify-start", classNameTrigger)} type="button">
          {selectedValues?.size == 0 && <span className=" text-muted-foreground w-full flex font-normal">{placeholder}</span>}
          {selectedValues?.size > 0 && (
            <>
              <div className="space-x-1 lg:flex w-full">
                {
                  selectOptions.filter((option) => selectedValues.has(option.value)).map((option, index) => (
                    index < maxDisplayNumber ? <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge> : null
                  ))
                }
                {
                  selectedValues.size > maxDisplayNumber && (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      +{selectedValues.size - maxDisplayNumber}
                    </Badge>
                  )
                }
              </div>
              {/* <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge> */}
            </>
          )}
          {
            selectedValues.size === 0 ?
              <ChevronDown size={4} className="text-muted-foreground opacity-50" /> :
              <span className='bg-secondary rounded-full h-5 w-5 hover:bg-ring flex items-center justify-center' onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onValueChange && onValueChange(undefined);
              }}>
                <X className='h-3 w-3 text-muted-foreground size-2.5' />
              </span>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(classNameContent)} align="start">
        <Command>
          {filterAble && <CommandInput placeholder={placeholder} />}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {selectOptions.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      onValueChange && onValueChange(filterValues)
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground [&_svg]:stroke-gray-200 [&_svg]:dark:stroke-gray-800"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onValueChange && onValueChange(undefined)}
                    className="justify-center text-center"
                  >
                    Clear
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}