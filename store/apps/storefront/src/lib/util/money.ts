import { localeFromCountry } from "./country-locale"
import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  country_code?: string | null
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  country_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale,
}: ConvertToLocaleParams) => {
  const resolvedLocale = locale || localeFromCountry(country_code)

  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(resolvedLocale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}
