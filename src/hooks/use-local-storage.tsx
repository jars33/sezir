
import { useState, useEffect, useCallback } from "react"

// Create a custom event for storage changes
const createStorageEvent = (key: string, newValue: any) => 
  new CustomEvent('local-storage', {
    detail: { key, newValue }
  })

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Listen to storage events including our custom one
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('detail' in e) {
        // Custom event
        if (e.detail.key === key) {
          setStoredValue(e.detail.newValue)
        }
      } else {
        // Regular storage event
        if (e.key === key) {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue)
        }
      }
    }

    // Listen to both storage and our custom event
    window.addEventListener('storage', handleStorageChange as EventListener)
    window.addEventListener('local-storage', handleStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener)
      window.removeEventListener('local-storage', handleStorageChange as EventListener)
    }
  }, [key, initialValue])

  const setValue = useCallback((value: T) => {
    try {
      // Save state
      setStoredValue(value)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value))
      // Dispatch custom event to notify other components
      window.dispatchEvent(createStorageEvent(key, value))
    } catch (error) {
      console.log(error)
    }
  }, [key])

  return [storedValue, setValue]
}
