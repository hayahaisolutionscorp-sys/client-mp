'use client'

import { terms } from '@/app/terms/terms.data'
import { useState, useEffect } from 'react'

interface TermsSidebarProps {
  className?: string
}

export default function TermsSidebar({ className }: TermsSidebarProps) {
  const [activeTerms, setActiveTerms] = useState('introduction')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = terms.map(term => term.id)
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveTerms(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    setActiveTerms(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={`w-full md:w-64 ${isMobile ? '' : 'h-screen sticky top-0 items-center overflow-y-auto'} ${className || ''}`}>
      <nav className="w-full pb-8">
        <ul className="space-y-2">
          {terms.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={`w-full rounded-md px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 hover:text-customText/80 ${
                  activeTerms === section.id
                    ? 'bg-customBlue text-white'
                    : 'text-customText/80'
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
