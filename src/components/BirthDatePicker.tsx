import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BirthDatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BirthDatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDay, setSelectedDay] = React.useState<string>("")
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [selectedYear, setSelectedYear] = React.useState<string>("")

  // Parse initial value if provided
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setSelectedDay(String(date.getDate()).padStart(2, '0'))
        setSelectedMonth(String(date.getMonth() + 1).padStart(2, '0'))
        setSelectedYear(String(date.getFullYear()))
      }
    } else {
      setSelectedDay("")
      setSelectedMonth("")
      setSelectedYear("")
    }
  }, [value])

  // Update parent when any part changes but prevent loops
  React.useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dateString = `${selectedYear}-${selectedMonth}-${selectedDay}`
      const date = new Date(dateString)
      if (!isNaN(date.getTime()) && dateString !== value) {
        onChange(dateString)
      }
    } else if (!selectedDay && !selectedMonth && !selectedYear && value) {
      onChange("")
    }
  }, [selectedDay, selectedMonth, selectedYear, onChange])

  const clearSelection = () => {
    setSelectedDay("")
    setSelectedMonth("")
    setSelectedYear("")
    onChange("")
  }

  const handleApply = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dateString = `${selectedYear}-${selectedMonth}-${selectedDay}`
      onChange(dateString)
    }
    setIsOpen(false)
  }

  // Generate years (last 120 years)
  const years = Array.from({ length: 120 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year
  })

  // Generate months
  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
  ]

  // Generate days based on selected month and year
  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedYear) return 31
    return new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()
  }

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => {
    const day = i + 1
    return day
  })

  const getDisplayValue = () => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES')
      }
    }
    return placeholder
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="text-center font-medium text-sm">
            {getDisplayValue()}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Año</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Mes</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Día</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={String(day).padStart(2, '0')}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSelection}
              className="flex-1"
            >
              Limpiar
            </Button>
            <Button 
              size="sm" 
              onClick={handleApply}
              disabled={!selectedDay || !selectedMonth || !selectedYear}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}