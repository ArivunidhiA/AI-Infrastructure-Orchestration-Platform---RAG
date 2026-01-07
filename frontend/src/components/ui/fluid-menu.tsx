"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface MenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  showChevron?: boolean
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-9 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
  label?: string
}

export function MenuItem({ children, onClick, disabled = false, icon, isActive = false, label }: MenuItemProps) {
  return (
    <button
      className={`relative block w-full text-center group
        ${disabled ? "text-white/40 cursor-not-allowed" : "text-white"}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex flex-col items-center justify-center h-full py-2">
        {icon && (
          <span className={`relative flex items-center justify-center w-12 h-12 mb-2 rounded-full transition-all duration-200 ${
            isActive 
              ? "bg-white text-black" 
              : "bg-white/10 text-white group-hover:bg-white/20"
          }`}>
            <span className="transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">
              {icon}
            </span>
          </span>
        )}
        {label && (
          <span className="text-[10px] font-light whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            {label}
          </span>
        )}
        {children}
      </div>
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length

  const handleToggle = () => {
    if (isExpanded) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <div className="relative w-[120px]" data-expanded={isExpanded}>
      {/* Container for all items */}
      <div className="relative">
        {/* First item - always visible */}
        <div 
          className="relative w-16 h-16 bg-transparent cursor-pointer rounded-full group will-change-transform z-50 flex items-center justify-center"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {/* Other items */}
        {childrenArray.slice(1).map((child, index) => (
          <div 
            key={index} 
            className="absolute top-0 left-0 w-24 h-24 bg-transparent will-change-transform"
            style={{
              transform: `translateY(${isExpanded ? (index + 1) * 90 : 0}px)`,
              opacity: isExpanded ? 1 : 0,
              zIndex: 40 - index,
              clipPath: 'none',
              transition: `transform ${isExpanded ? '300ms' : '300ms'} cubic-bezier(0.4, 0, 0.2, 1),
                         opacity ${isExpanded ? '300ms' : '350ms'}`,
              backfaceVisibility: 'hidden',
              perspective: 1000,
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
