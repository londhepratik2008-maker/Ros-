import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-hud-accent/20 border-hud-accent text-hud-accent hover:bg-hud-accent/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]',
  secondary: 'bg-hud-surface border-hud-border text-hud-text hover:border-hud-accent/50 hover:text-hud-accent',
  danger: 'bg-hud-danger/20 border-hud-danger text-hud-danger hover:bg-hud-danger/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={`
        font-orbitron uppercase tracking-wider
        border rounded-md
        transition-all duration-300
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
