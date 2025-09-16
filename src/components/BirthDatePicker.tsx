import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    }
  }, [value])

  // Update parent when any part changes
  React.useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dateString = `${selectedYear}-${selectedMonth}-${selectedDay}`
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        onChange(dateString)
      }
    }
  }, [selectedDay, selectedMonth, selectedYear, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)
    
    // Parse the input value
    if (inputValue) {
      const date = new Date(inputValue)
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
  }

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
    return { value: String(year), label: String(year) }
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
    return { value: String(day).padStart(2, '0'), label: String(day) }
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
              !value && "text-muted-foreground"
            )}
            size="icon"
          >
            <CalendarIcon className="h-4 w-4" />
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
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Mes</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {days.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
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
    </div>
  )
}