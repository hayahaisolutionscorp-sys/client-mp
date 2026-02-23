"use client"

import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Requirement {
  label: string
  met: boolean
}

interface PasswordStrengthTrackerProps {
  password: string
}

export const PasswordStrengthTracker = ({ password }: PasswordStrengthTrackerProps) => {
  if (!password) return null;

  const requirements: Requirement[] = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "At least 1 uppercase and 1 lowercase letter",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      label: "At least 1 number",
      met: /\d/.test(password),
    },
    {
      label: "At least 1 special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ]

  return (
    <div className="space-y-2 py-2">
      <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              req.met ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : (
              <Circle className="h-3 w-3 shrink-0 opacity-50" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
