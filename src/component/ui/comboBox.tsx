import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface Item {
  label: string,
  value: string
}

const Combobox = ({...props }) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const {items, prompt} = props
  const label = items.find((item: Item) => item.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {value ? label : prompt}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0 max-h-64 overflow-auto' >
        <Command>
          <CommandInput placeholder='Search item...'/>
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup>
            {items.map((item: Item) => (
              <CommandItem
                key={item.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue)
                  props.onChange(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === item.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Combobox 