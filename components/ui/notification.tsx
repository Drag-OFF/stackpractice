"use client"

import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react"
import { useEffect } from "react"

type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationProps {
  show: boolean
  onClose: () => void
  type?: NotificationType
  title?: string
  message?: string
  duration?: number
}

const notificationConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-500 dark:bg-green-600",
    textColor: "text-white",
    subTextColor: "text-green-50",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-500 dark:bg-red-600",
    textColor: "text-white",
    subTextColor: "text-red-50",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-orange-500 dark:bg-orange-600",
    textColor: "text-white",
    subTextColor: "text-orange-50",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500 dark:bg-blue-600",
    textColor: "text-white",
    subTextColor: "text-blue-50",
  },
}

export function Notification({
  show,
  onClose,
  type = "success",
  title = "Success!",
  message = "Operation completed successfully.",
  duration = 4000,
}: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const config = notificationConfig[type]
  const Icon = config.icon

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in">
      <div className={`${config.bgColor} ${config.textColor} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className={`text-sm ${config.subTextColor}`}>{message}</p>
        </div>
      </div>
    </div>
  )
}

// Export backward compatibility alias
export const SuccessNotification = Notification
