import { Loader, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from './ui/button'

type SelectDropdownProps = {
  onValueChange?: (value: string) => void
  value: string | undefined
  placeholder?: string
  isPending?: boolean
  items: { label: string; value: string }[] | undefined
  disabled?: boolean
  className?: string
  isControlled?: boolean
  clearable?: boolean
}

export function SelectDropdown({
  value,
  onValueChange,
  isPending,
  items,
  placeholder = "placeholder",
  disabled,
  className = '',
  isControlled = false,
  clearable = true
}: SelectDropdownProps) {

  const defaultState = { value: value === undefined ? "" : value, onValueChange };
  const selectTrigger =  (
    <div className="relative">
      <SelectTrigger disabled={disabled} className={cn(className, "relative")}>
          <SelectValue placeholder={placeholder ?? 'Select'} />
      </SelectTrigger>
       {
         clearable && value && <div className='right-0 top-0 z-10 w-9 absolute h-full flex justify-center items-center'>
            <Button variant="ghost" size="icon-sm" className='bg-secondary rounded-full h-4 w-4 hover:bg-ring' onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onValueChange && onValueChange("");
              }}><X className='h-3 w-3 text-muted-foreground size-2.5' /></Button>
          </div>
        }
    </div>
  );

  return (
    <Select {...defaultState}>
      {
        isControlled ? <FormControl>{selectTrigger}</FormControl> : selectTrigger
      }
      
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <Loader className='h-5 w-5 animate-spin' />
              {'  '}
              Loading...
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
