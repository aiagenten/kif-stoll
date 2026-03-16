interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number
}

// Controller / Gamepad
export function ControllerIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Body */}
      <path d="M6 8H18L20 16H4L6 8Z" />
      {/* D-pad left/right */}
      <line x1="8" y1="12" x2="11" y2="12" />
      <line x1="9.5" y1="10.5" x2="9.5" y2="13.5" />
      {/* Buttons */}
      <rect x="14" y="10" width="1.5" height="1.5" />
      <rect x="16" y="11.5" width="1.5" height="1.5" />
      <rect x="14" y="13" width="1.5" height="1.5" />
      <rect x="12.5" y="11.5" width="1.5" height="1.5" />
      {/* Triggers */}
      <path d="M6 8L5 5H8" />
      <path d="M18 8L19 5H16" />
    </svg>
  )
}

// Trophy / Pokal
export function TrophyIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Cup body */}
      <path d="M7 3H17V13C17 16.3137 14.7614 19 12 19C9.23858 19 7 16.3137 7 13V3Z" />
      {/* Base stem */}
      <line x1="12" y1="19" x2="12" y2="21" />
      {/* Base */}
      <line x1="8" y1="21" x2="16" y2="21" />
      {/* Handles */}
      <path d="M7 6H4V9C4 10.6569 5.34315 12 7 12" />
      <path d="M17 6H20V9C20 10.6569 18.6569 12 17 12" />
      {/* Star detail inside */}
      <polyline points="12,6 12.7,8.3 15,8.3 13.2,9.7 13.9,12 12,10.7 10.1,12 10.8,9.7 9,8.3 11.3,8.3" />
    </svg>
  )
}

// Headset
export function HeadsetIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Headband arc */}
      <path d="M4 13V12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12V13" />
      {/* Left ear cup */}
      <rect x="2" y="13" width="4" height="6" />
      {/* Right ear cup */}
      <rect x="18" y="13" width="4" height="6" />
      {/* Mic arm */}
      <path d="M18 17H21L21 21" />
      {/* Mic dot */}
      <rect x="20" y="20" width="2" height="2" />
    </svg>
  )
}

// Lightning / Energi
export function LightningIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <polyline points="13,2 4,14 12,14 11,22 20,10 12,10" />
    </svg>
  )
}

// Sword / Sverd
export function SwordIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Blade */}
      <line x1="5" y1="19" x2="18" y2="6" />
      {/* Blade tip detail */}
      <polyline points="18,6 18,9 15,6" />
      {/* Guard crossguard */}
      <line x1="8" y1="16" x2="11" y2="13" />
      <line x1="6" y1="14" x2="13" y2="15" />
      {/* Handle */}
      <line x1="5" y1="19" x2="3" y2="21" />
    </svg>
  )
}

// Shield / Skjold
export function ShieldIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Shield outline - angular/geometric */}
      <path d="M12 2L4 5V12C4 16.4183 7.58172 21 12 21C16.4183 21 20 16.4183 20 12V5L12 2Z" />
      {/* Inner cross detail */}
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

// Star / Stjerne (ranking)
export function StarIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Angular 5-pointed star */}
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

// Clock / Tid
export function ClockIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Clock face - hexagonal for gaming feel */}
      <polygon points="12,2 19,5.5 22,12 19,18.5 12,22 5,18.5 2,12 5,5.5" />
      {/* Hour hand */}
      <line x1="12" y1="12" x2="12" y2="7" />
      {/* Minute hand */}
      <line x1="12" y1="12" x2="16" y2="12" />
      {/* Center dot */}
      <rect x="11" y="11" width="2" height="2" />
    </svg>
  )
}

// Chat / Boble
export function ChatIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Angular chat bubble */}
      <path d="M2 4H22V16H14L10 20V16H2V4Z" />
      {/* Message dots */}
      <line x1="7" y1="10" x2="7" y2="10" strokeWidth={2.5} strokeLinecap="round" />
      <line x1="12" y1="10" x2="12" y2="10" strokeWidth={2.5} strokeLinecap="round" />
      <line x1="17" y1="10" x2="17" y2="10" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}

// Fire / Flamme
export function FireIcon({ size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Outer flame - angular for gaming vibe */}
      <path d="M12 2C12 2 18 8 18 13C18 16.3137 15.3137 19 12 19C8.68629 19 6 16.3137 6 13C6 10 8 8 8 8C8 8 8 11 10 12C10 12 9 9 12 2Z" />
      {/* Inner flame detail */}
      <path d="M12 22V19" />
      <line x1="9" y1="21" x2="15" y2="21" />
      {/* Inner core */}
      <path d="M12 10C12 10 14 12 14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14C10 12.5 11 11 12 10Z" />
    </svg>
  )
}
