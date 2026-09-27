import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const isDefaultLabel = (value?: string | null) => {
  if (!value) {
    return true
  }
  const normalized = value.trim().toLowerCase()
  return (
    normalized === "default variant" ||
    normalized === "default option" ||
    normalized === "default" ||
    normalized === "único" ||
    normalized === "unico"
  )
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const optionParts =
    variant?.options
      ?.map((option) => {
        const title = option.option?.title || option.value
        const value = option.value
        if (!value || isDefaultLabel(value) || isDefaultLabel(title)) {
          return null
        }
        return `${title}: ${value}`
      })
      .filter(Boolean) || []

  if (!optionParts.length) {
    if (isDefaultLabel(variant?.title)) {
      return null
    }
    if (!variant?.title) {
      return null
    }
  }

  const label = optionParts.length
    ? optionParts.join(" · ")
    : variant?.title

  if (!label) {
    return null
  }

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      {label}
    </Text>
  )
}

export default LineItemOptions
