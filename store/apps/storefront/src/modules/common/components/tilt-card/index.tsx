type TiltCardProps = {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}

const TiltCard = ({ children, className }: TiltCardProps) => {
  if (!className) {
    return <>{children}</>
  }

  return <div className={className}>{children}</div>
}

export default TiltCard
