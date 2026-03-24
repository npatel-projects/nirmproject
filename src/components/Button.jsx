/**
 * Button component based on DIT Style Guide (Figma)
 *
 * variant: 'primary' | 'secondary' | 'ghost'
 * size:    'sm' | 'md' | 'lg'
 * shape:   'pill' | 'rounded' | 'square'
 * disabled, iconStart, iconEnd
 */

const styles = {
  base: [
    'inline-flex items-center justify-center gap-1',
    'font-semibold uppercase tracking-wide',
    'transition-all duration-150 cursor-pointer select-none',
    'focus:outline-none',
  ].join(' '),

  variant: {
    primary: [
      'bg-[#006296] text-white',
      'hover:bg-[#003a5a]',
      'active:bg-[#012639]',
      'focus:shadow-[0px_0px_0px_2px_#006296,0px_0px_0px_4px_#84c6ea]',
      'disabled:bg-[#84c6ea] disabled:cursor-not-allowed',
      'shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]',
    ].join(' '),

    secondary: [
      'bg-white text-[#006296] border border-[#006296]',
      'hover:bg-[#e6f3fa] hover:border-[#003a5a] hover:text-[#003a5a]',
      'active:bg-[#cce6f5] active:text-[#012639]',
      'focus:shadow-[0px_0px_0px_2px_#006296,0px_0px_0px_4px_#84c6ea]',
      'disabled:border-[#b7bbc2] disabled:text-[#b7bbc2] disabled:cursor-not-allowed',
    ].join(' '),

    ghost: [
      'bg-transparent text-[#006296]',
      'hover:bg-[#e6f3fa] hover:text-[#003a5a]',
      'active:bg-[#cce6f5] active:text-[#012639]',
      'focus:shadow-[0px_0px_0px_2px_#006296,0px_0px_0px_4px_#84c6ea]',
      'disabled:text-[#b7bbc2] disabled:cursor-not-allowed',
    ].join(' '),
  },

  size: {
    sm: 'px-[12px] py-[4px] text-[11px] leading-[15px]',
    md: 'px-[16px] py-[8px] text-[12px] leading-[16px]',
    lg: 'px-[18px] py-[10px] text-[14px] leading-[22px]',
  },

  shape: {
    pill:    'rounded-[500px]',
    rounded: 'rounded-[8px]',
    square:  'rounded-[4px]',
  },

  iconSize: {
    sm: 'size-[14px]',
    md: 'size-[16px]',
    lg: 'size-[20px]',
  },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  disabled = false,
  iconStart,
  iconEnd,
  onClick,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        styles.base,
        styles.variant[variant],
        styles.size[size],
        styles.shape[shape],
        className,
      ].join(' ')}
    >
      {iconStart && (
        <span className={`${styles.iconSize[size]} flex items-center justify-center`}>
          {iconStart}
        </span>
      )}
      {children}
      {iconEnd && (
        <span className={`${styles.iconSize[size]} flex items-center justify-center`}>
          {iconEnd}
        </span>
      )}
    </button>
  )
}
