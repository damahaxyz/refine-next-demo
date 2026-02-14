import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FormControl } from '@/components/ui/form'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string,
  isControlled?: boolean,
  disabled?: (date: Date) => boolean,
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  isControlled = false,
  disabled = (date: Date) => date > new Date() || date < new Date('1900-01-01')
}: DatePickerProps) {

  const popoverTrigger = (<PopoverTrigger asChild>
    <Button
      variant='outline'
      data-empty={!selected}
      className='data-[empty=true]:text-muted-foreground w-[240px] justify-start text-start font-normal'
    >
      {selected ? (
        format(selected, 'yyyy-MM-dd')
      ) : (
        <span>{placeholder}</span>
      )}
      <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
    </Button>
  </PopoverTrigger>);
  return (
    <Popover>
      {isControlled ? <FormControl>{popoverTrigger}</FormControl> : popoverTrigger}
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
