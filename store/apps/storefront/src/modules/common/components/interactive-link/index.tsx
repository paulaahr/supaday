import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "../localized-client-link"
type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group"
      href={href}
      onClick={onClick}
      {...props}
    >
      <Text className="text-usfq-red transition-colors duration-300 group-hover:text-usfq-red-dark">{children}</Text>
      <ArrowUpRightMini
        className="group-hover:rotate-45 ease-out duration-300"
        color="#ED1C24"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
