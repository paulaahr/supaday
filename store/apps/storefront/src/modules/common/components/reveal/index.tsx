type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

const Reveal = ({ children, className }: RevealProps) => {
  return <div className={className}>{children}</div>
}

export default Reveal
