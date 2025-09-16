import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface BirthDatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BirthDatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: BirthDatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      // Format date as YYYY-MM-DD for the backend
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      onChange(formattedDate)
    } else {
      onChange("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)
    
    // Try to parse the input as a date
    if (inputValue) {
      const parsedDate = new Date(inputValue)
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate)
      }
    } else {
      setDate(undefined)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        value={value || ""}
        onChange={handleInputChange}
        max={new Date().toISOString().split('T')[0]} // Don't allow future dates
        className="flex-1"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-center text-left font-normal min-w-[40px]",
              !date && "text-muted-foreground"
            )}
            size="icon"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <select
                value={date?.getFullYear() || new Date().getFullYear()}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value)
                  const newDate = new Date(date || new Date())
                  newDate.setFullYear(newYear)
                  handleDateChange(newDate)
                }}
                className="px-2 py-1 border rounded text-sm"
              >
                {Array.from({ length: 120 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            defaultMonth={date || new Date(2000, 0, 1)} // Default to a reasonable birth year
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}