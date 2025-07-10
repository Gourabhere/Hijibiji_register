
"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

const themes = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor }
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // To prevent hydration mismatch, render a placeholder or nothing until mounted.
    return (
        <div className="w-[132px] h-10 rounded-full bg-muted/50" />
    )
  }

  const currentTheme = theme || 'system';
  const currentResolvedTheme = resolvedTheme || 'light';

  const getAnimateX = () => {
    switch (currentTheme) {
      case 'light': return 4;
      case 'dark': return 44;
      case 'system': return 84;
      default: return 84;
    }
  }

  return (
    <div
      className={`relative p-1 flex items-center rounded-full border transition-all duration-300 ${
        currentResolvedTheme === 'dark'
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-100 border-slate-200'
      }`}
      style={{ width: '132px', height: '40px' }}
    >
      <motion.div
        className={`absolute top-1 h-8 w-8 rounded-full shadow-md ${
            currentTheme === 'light' 
              ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
              : currentTheme === 'dark'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
        animate={{ x: getAnimateX() }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      />
      
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = currentTheme === themeOption.id;
        
        return (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`relative z-10 flex items-center justify-center w-10 h-8 rounded-full transition-colors duration-200 focus:outline-none ${
              isActive 
                ? 'text-white' 
                : currentResolvedTheme === 'dark' 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-slate-500 hover:text-black'
            }`}
            aria-label={`Set theme to ${themeOption.id}`}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
