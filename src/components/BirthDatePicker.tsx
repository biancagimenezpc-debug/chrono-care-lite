import * as React from "react"
import { Input } from "@/components/ui/input"

interface BirthDatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BirthDatePicker({ value, onChange, placeholder = "DD/MM/AAAA" }: BirthDatePickerProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  // Sync with external value only when not typing
  React.useEffect(() => {
    if (!isTyping && value) {
      const date = new Date(value + 'T12:00:00.000Z') // Add time to avoid timezone issues
      if (!isNaN(date.getTime())) {
        // Format to DD/MM/YYYY for display using UTC
        const day = String(date.getUTCDate()).padStart(2, '0')
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const year = date.getUTCFullYear()
        setInputValue(`${day}/${month}/${year}`)
      }
    } else if (!isTyping && !value) {
      setInputValue("")
    }
  }, [value, isTyping])

  // Parse date from DD/MM/YYYY format
  const parseDate = (input: string) => {
    // Remove any extra characters and normalize separators
    const cleanInput = input.replace(/[^\d\/\-]/g, '')
    
    let day, month, year
    
    if (cleanInput.includes('/')) {
      const parts = cleanInput.split('/')
      if (parts.length === 3) {
        day = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10)
        year = parseInt(parts[2], 10)
      }
    } else if (cleanInput.includes('-')) {
      const parts = cleanInput.split('-')
      if (parts.length === 3) {
        day = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10)
        year = parseInt(parts[2], 10)
      }
    } else if (cleanInput.length === 8 && /^\d{8}$/.test(cleanInput)) {
      // Handle DDMMYYYY format
      day = parseInt(cleanInput.substring(0, 2), 10)
      month = parseInt(cleanInput.substring(2, 4), 10)
      year = parseInt(cleanInput.substring(4, 8), 10)
    }

    // Convert 2-digit years to 4-digit (assume 20xx for years 00-30, 19xx for 31-99)
    if (year && year < 100) {
      year = year <= 30 ? 2000 + year : 1900 + year
    }

    return { day, month, year }
  }

  // Validate if date is valid
  const isValidDate = (day: number, month: number, year: number) => {
    if (!day || !month || !year) return false
    if (day < 1 || day > 31 || month < 1 || month > 12) return false
    if (year < 1900 || year > new Date().getFullYear()) return false
    
    // Check if date actually exists (handles leap years, etc.)
    // Use UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.getUTCDate() === day && date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input)
    setIsTyping(true)
    
    // Clear typing state after a short delay
    setTimeout(() => setIsTyping(false), 1000)

    // Only try to parse when user stops typing or input looks complete
    if (input === "") {
      onChange("")
      return
    }
  }

  const handleBlur = () => {
    setIsTyping(false)
    
    if (!inputValue.trim()) {
      onChange("")
      return
    }

    const { day, month, year } = parseDate(inputValue)
    
    if (isValidDate(day, month, year)) {
      // Convert to ISO format for storage
      const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      onChange(isoString)
      
      // Format display value consistently
      const displayValue = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
      setInputValue(displayValue)
    } else {
      // If invalid, keep the user input for them to correct
      console.warn('Invalid date format:', inputValue)
    }
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
    
    // Handle Enter key to trigger validation
    if (e.key === 'Enter') {
      handleBlur()
    }
  }

  return (
    <Input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full"
      maxLength={10}
    />
  )
}
