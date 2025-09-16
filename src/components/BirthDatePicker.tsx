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
  const [selectedYear, setSelectedYear] = React.useState<number>(() => {
    if (value) {
      return new Date(value).getFullYear()
    }
    return new Date().getFullYear() - 25 // Default to 25 years ago
  })
  const [selectedMonth, setSelectedMonth] = React.useState<number>(() => {
    if (value) {
      return new Date(value).getMonth()
    }
    return 0 // January
  })

  const handleDateChange = (selectedDate: Date | undefined, closePopover: boolean = true) => {
    setDate(selectedDate)
    if (selectedDate) {
      setSelectedYear(selectedDate.getFullYear())
      setSelectedMonth(selectedDate.getMonth())
      // Format date as YYYY-MM-DD for the backend
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      onChange(formattedDate)
      if (closePopover) {
        setIsOpen(false) // Close popover after selection
      }
    } else {
      onChange("")
    }
  }

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear)
    const newDate = new Date(date || new Date(newYear, selectedMonth, 1))
    newDate.setFullYear(newYear)
    handleDateChange(newDate, false) // Don't close popover when changing year
  }

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth)
    const newDate = new Date(date || new Date(selectedYear, newMonth, 1))
    newDate.setMonth(newMonth)
    handleDateChange(newDate, false) // Don't close popover when changing month
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)
    
    // Try to parse the input as a date
    if (inputValue) {
      const parsedDate = new Date(inputValue)
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate)
        setSelectedYear(parsedDate.getFullYear())
        setSelectedMonth(parsedDate.getMonth())
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
          <div className="p-3" onMouseDown={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-2 py-1 border rounded text-sm flex-1"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
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
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="px-2 py-1 border rounded text-sm flex-1"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const monthName = new Date(2000, i, 1).toLocaleDateString('es-ES', { month: 'long' })
                  return (
                    <option key={i} value={i}>
                      {monthName}
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
            month={new Date(selectedYear, selectedMonth)}
            onMonthChange={(month) => {
              setSelectedYear(month.getFullYear())
              setSelectedMonth(month.getMonth())
            }}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}