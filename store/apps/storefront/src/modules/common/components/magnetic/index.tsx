type MagneticProps = {
  children: React.ReactNode
  className?: string
  strength?: number
  style?: React.CSSProperties
}

const Magnetic = ({ children, className, style }: MagneticProps) => {
  if (!className && !style) {
    return <>{children}</>
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

export default Magnetic
