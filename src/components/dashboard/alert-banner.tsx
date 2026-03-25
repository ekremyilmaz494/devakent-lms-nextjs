'use client'

import { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react'

const alertBannerVariants = cva(
  'flex items-center gap-4 rounded-lg border p-4 animate-fade-in-up',
  {
    variants: {
      type: {
        info: 'border-info/50 bg-info/10 text-info-foreground',
        warning: 'border-warning/50 bg-warning/10 text-warning-foreground',
        error: 'border-error/50 bg-error/10 text-error-foreground',
        success: 'border-success/50 bg-success/10 text-success-foreground',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
)

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
  success: CheckCircle,
}

export interface AlertBannerProps extends VariantProps<typeof alertBannerVariants> {
  message: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function AlertBanner({
  message,
  type = 'info',
  dismissible = false,
  onDismiss,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  const Icon = iconMap[type!]

  return (
    <div className={alertBannerVariants({ type })}>
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="rounded-md p-1 transition-colors hover:bg-background/20"
          aria-label="Bildirimi kapat"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
