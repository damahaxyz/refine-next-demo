import * as React from "react"
import { Check, ChevronDown, PlusCircle, X } from "lucide-react"

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
  data?: any;
}
interface SelectDropdownCommandProps {
  placeholder?: string;
  options?: OptionType[];
  filterAble?: boolean;
  clearable?: boolean;
  classNameTrigger?: string;
  classNameContent?: string;
  /** refine useSelect 参数 */
  useSelectOptions?: Parameters<typeof useSelect>[0];
  onValueChange?: (value: string | undefined, option: OptionType | undefined) => void;
  value?: string;
  disabled?: boolean;
}

export function SelectDropdownCommand({
  placeholder = "placeholder",
  options,
  useSelectOptions,
  value,
  clearable = true,
  filterAble = false,
  classNameTrigger = "w-40",
  classNameContent = "w-40 p-0",
  onValueChange,
  disabled = false,
}: SelectDropdownCommandProps) {
  const [open, setOpen] = React.useState(false);

  const stableUseSelectOptions = React.useMemo(() => {
    return useSelectOptions ? { ...useSelectOptions, defaultValue: value, } : undefined;
  }, [useSelectOptions?.resource]);

  // ✅ 动态加载选项（useSelect）
  const { options: fetchedOptions = [], query: { data: useSelectData } } = useSelect({
    ...stableUseSelectOptions,
    resource: stableUseSelectOptions?.resource ?? "",
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: !!stableUseSelectOptions,
    }
  });



  // ✅ 优先使用 props.options，否则使用 useSelectOptions 返回值
  const selectOptions: OptionType[] = React.useMemo(() => {
    if (options && options.length > 0) return options;
    if (fetchedOptions && fetchedOptions.length > 0) {
      const data = useSelectData?.data;
      let valueFn: Function = (item: any) => {
        const key = useSelectOptions?.optionValue;
        return typeof key === "function" ? key(item) : item[key || "id"];
      };
      return fetchedOptions.map((opt: any) => ({
        label: opt.label,
        value: String(opt.value),
        data: data?.find((item: any) => valueFn(item) === opt.value)
      }));
    }
    return [];
  }, [options, fetchedOptions]);

  const current = selectOptions.find((option) => option.value === value);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn(classNameTrigger)} disabled={disabled}>
          {
            current ? (
              <span className=" w-full flex font-normal">{current.label}</span>
            ) : (
              <span className=" text-muted-foreground w-full flex font-normal">{placeholder}</span>
            )
          }
          {
            current && clearable ? (
              <span className='bg-secondary rounded-full h-4 w-4 hover:bg-ring flex items-center justify-center' onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onValueChange && onValueChange(undefined, undefined);
              }}>
                <X className='h-3 w-3 text-muted-foreground size-2.5' />
              </span>
            ) : (
              <ChevronDown size={4} className="text-muted-foreground opacity-50" />
            )
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(classNameContent)} align="start">
        <Command>
          {
            filterAble && <CommandInput placeholder={placeholder} />
          }

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {selectOptions.map((option) => {
                const isSelected = option.value == current?.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onValueChange && onValueChange(option.value, option.data);
                      setOpen(false);
                    }}
                    className={cn(isSelected ? "bg-accent text-primary font-bold" : "")}
                  >

                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <div dangerouslySetInnerHTML={{ __html: option.label }}></div>
                    {option.count && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}

                  </CommandItem>
                )
              })}
            </CommandGroup>
            {current && clearable && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onValueChange && onValueChange(undefined, undefined)}
                    className="justify-center text-center">
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