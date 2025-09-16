import * as React from "react"
import { Input } from "@/components/ui/input"

interface BirthDatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BirthDatePicker({ value, onChange, placeholder = "DD/MM/AAAA" }: BirthDatePickerProps) {
  const [inputValue, setInputValue] = React.useState("")

  // Sync with external value
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        // Format to DD/MM/YYYY for display
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        setInputValue(`${day}/${month}/${year}`)
      }
    } else {
      setInputValue("")
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    setInputValue(input)

    // Try to parse and convert to ISO format
    if (input.length >= 8) {
      // Handle different input formats
      let day, month, year
      
      if (input.includes('/')) {
        const parts = input.split('/')
        if (parts.length === 3) {
          day = parseInt(parts[0])
          month = parseInt(parts[1])
          year = parseInt(parts[2])
        }
      } else if (input.includes('-')) {
        // Handle DD-MM-YYYY format
        const parts = input.split('-')
        if (parts.length === 3) {
          day = parseInt(parts[0])
          month = parseInt(parts[1])
          year = parseInt(parts[2])
        }
      } else if (input.length === 8 && /^\d{8}$/.test(input)) {
        // Handle DDMMYYYY format
        day = parseInt(input.substring(0, 2))
        month = parseInt(input.substring(2, 4))
        year = parseInt(input.substring(4, 8))
      }

      // Validate and convert to ISO format
      if (day && month && year && day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
        const date = new Date(year, month - 1, day)
        if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
          const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          onChange(isoString)
        }
      }
    } else if (input === "") {
      onChange("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow numbers, backspace, delete, arrow keys, and separators
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
    const isNumber = /^\d$/.test(e.key)
    const isSeparator = ['/', '-'].includes(e.key)
    
    if (!isNumber && !isSeparator && !allowed.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full"
      maxLength={10}
    />
  )
}
