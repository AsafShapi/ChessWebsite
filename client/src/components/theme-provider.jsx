import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext()

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme" }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(storageKey) || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      root.classList.add(mediaQuery.matches ? "dark" : "light")

      const listener = (e) => {
        root.classList.remove("light", "dark")
        root.classList.add(e.matches ? "dark" : "light")
      }

      mediaQuery.addEventListener("change", listener)
      return () => mediaQuery.removeEventListener("change", listener)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

