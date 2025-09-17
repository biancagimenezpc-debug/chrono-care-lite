import * as React from "react"
import { Input } from "@/components/ui/input"

interface BirthDatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BirthDatePicker({ value, onChange, placeholder = "DD/MM/AAAA" }: BirthDatePickerProps) {
  const [inputValue, setInputValue] = React.useState("")

  // Only sync with external value when it changes and format it for display
  React.useEffect(() => {
    if (value) {
      // If value is already in DD/MM/YYYY format, use it directly
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        setInputValue(value)
      } else {
        // If it's in ISO format (YYYY-MM-DD), convert to DD/MM/YYYY
        try {
          const date = new Date(value + 'T12:00:00.000Z')
          if (!isNaN(date.getTime())) {
            const day = String(date.getUTCDate()).padStart(2, '0')
            const month = String(date.getUTCMonth() + 1).padStart(2, '0')
            const year = date.getUTCFullYear()
            setInputValue(`${day}/${month}/${year}`)
          }
        } catch {
          setInputValue(value) // If parsing fails, use the value as is
        }
      }
    } else {
      setInputValue("")
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input)
    
    // Pass the raw input value to parent - no automatic conversion
    onChange(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow numbers, backspace, delete, arrow keys, separators, and common keys
    const allowed = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Enter', 'Home', 'End'
    ]
    const isNumber = /^\d$/.test(e.key)
    const isSeparator = ['/', '-', '.'].includes(e.key)
    
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
    />
  )
}

// Utility function to convert DD/MM/YYYY to YYYY-MM-DD for database storage
export const convertToISODate = (dateString: string): string | null => {
  if (!dateString || !dateString.trim()) return null
  
  // Clean the input
  const cleanInput = dateString.replace(/[^\d\/\-\.]/g, '')
  
  let day: number, month: number, year: number
  
  // Try different formats
  if (cleanInput.includes('/')) {
    const parts = cleanInput.split('/')
    if (parts.length === 3) {
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10)
      year = parseInt(parts[2], 10)
    } else {
      return null
    }
  } else if (cleanInput.includes('-')) {
    const parts = cleanInput.split('-')
    if (parts.length === 3) {
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10)
      year = parseInt(parts[2], 10)
    } else {
      return null
    }
  } else if (cleanInput.includes('.')) {
    const parts = cleanInput.split('.')
    if (parts.length === 3) {
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10)
      year = parseInt(parts[2], 10)
    } else {
      return null
    }
  } else if (cleanInput.length === 8 && /^\d{8}$/.test(cleanInput)) {
    // Handle DDMMYYYY format
    day = parseInt(cleanInput.substring(0, 2), 10)
    month = parseInt(cleanInput.substring(2, 4), 10)
    year = parseInt(cleanInput.substring(4, 8), 10)
  } else {
    return null
  }
  
  // Convert 2-digit years to 4-digit
  if (year < 100) {
    year = year <= 30 ? 2000 + year : 1900 + year
  }
  
  // Validate the date
  if (!day || !month || !year) return null
  if (day < 1 || day > 31 || month < 1 || month > 12) return null
  if (year < 1900 || year > new Date().getFullYear()) return null
  
  // Check if date actually exists using UTC to avoid timezone issues
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCDate() !== day || date.getUTCMonth() !== month - 1 || date.getUTCFullYear() !== year) {
    return null
  }
  
  // Return in ISO format
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
