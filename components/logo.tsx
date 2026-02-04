interface VixleLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  showIcon?: boolean
  variant?: "default" | "dark"
  className?: string
}

export default function Logo({ size = "md", showText = true, showIcon = true, variant = "default" }: VixleLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  }

  const iconColor = variant === "default" ? "#ffffff" : "#000000"
  const textColor = variant === "default" ? "text-white" : "text-black"

  return (
    <div className="flex items-center gap-0 select-none">
      {showIcon && (
        <svg className={sizeClasses[size]} viewBox="0 0 85 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10 L50 80 L80 10 L65 10 L50 50 L35 10 Z" fill={iconColor} />
          <path d="M50 80 L65 90 L80 10 L65 10 Z" fill={iconColor} fillOpacity="0.2" />
        </svg>
      )}

      {showText && (
        <div className={`flex items-baseline ${textSizeClasses[size]}`} style={{ marginLeft: "-2px" }}>
          <span className={`${textColor} tracking-tight font-medium`}>ixle</span>
        </div>
      )}
    </div>
  )
}

