import { BigNumber, MathBN, MedusaError } from "@medusajs/framework/utils"
import type { BigNumberInput } from "@medusajs/framework/types"

const PAYPHONE_ORIGIN = "https://pay.payphonetodoesposible.com"

export type PayphonePrepareResult = {
  paymentId: string
  payWithCard: string
  payWithPayPhone: string
}

export type PayphoneConfirmResult = {
  statusCode?: number
  transactionStatus?: string
  transactionId?: number
  authorizationCode?: string
  clientTransactionId?: string
  amount?: number
  currency?: string
  lastDigits?: string
  cardBrand?: string
  message?: string
  errorCode?: number
}

const currencyMultiplier = (currency: string) => {
  const code = currency.toUpperCase()
  const zero = ["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]
  const three = ["BHD", "IQD", "JOD", "KWD", "OMR", "TND"]

  if (zero.includes(code)) {
    return 1
  }

  if (three.includes(code)) {
    return 1000
  }

  return 100
}

export const amountToCents = (amount: BigNumberInput, currency: string) => {
  const multiplier = currencyMultiplier(currency)
  const scaled = new BigNumber(MathBN.mult(amount, multiplier))
  const numeric = parseInt(scaled.numeric.toString().split(".")[0] || "", 10)

  if (!Number.isFinite(numeric)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "El monto del carrito no se pudo convertir para Payphone."
    )
  }

  return numeric
}

const formatPayphoneError = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") {
    return fallback
  }

  const body = payload as {
    message?: string
    errors?: { errorDescriptions?: string[] }[]
  }
  const details = (body.errors || [])
    .flatMap((item) => item.errorDescriptions || [])
    .filter(Boolean)

  const message = [body.message, ...details].filter(Boolean).join(" ")

  return message || fallback
}

const payphonePost = async <T>(
  path: string,
  token: string,
  body: Record<string, unknown>
): Promise<T> => {
  let response: Response

  try {
    response = await fetch(`${PAYPHONE_ORIGIN}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "No se pudo contactar la API de Payphone."
    )
  }

  const text = await response.text()
  let parsed: unknown = null

  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { message: text.slice(0, 300) }
    }
  }

  if (!response.ok) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      formatPayphoneError(parsed, "Payphone rechazó la solicitud.")
    )
  }

  return parsed as T
}

export const preparePayphoneSale = async (input: {
  token: string
  storeId: string
  amountCents: number
  clientTransactionId: string
  currency: string
  responseUrl: string
  cancellationUrl: string
  email?: string
  phone?: string
}) => {
  const body: Record<string, unknown> = {
    amount: input.amountCents,
    amountWithoutTax: input.amountCents,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    clientTransactionId: input.clientTransactionId,
    storeId: input.storeId,
    currency: input.currency.toUpperCase(),
    reference: "Merch USFQ",
    responseUrl: input.responseUrl,
    cancellationUrl: input.cancellationUrl,
    timeZone: -5,
  }

  if (input.email) {
    body.email = input.email
  }

  if (input.phone) {
    body.phoneNumber = input.phone
  }

  const result = await payphonePost<{
    paymentId?: string
    payWithCard?: string
    payWithPayPhone?: string
    message?: string
  }>("/api/button/Prepare", input.token, body)

  if (!result?.payWithCard && !result?.payWithPayPhone) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      formatPayphoneError(result, "Payphone no devolvió la página de pago.")
    )
  }

  return {
    paymentId: String(result.paymentId || ""),
    payWithCard: result.payWithCard || "",
    payWithPayPhone: result.payWithPayPhone || "",
  } satisfies PayphonePrepareResult
}

export const confirmPayphoneSale = async (input: {
  token: string
  id: number
  clientTxId: string
}) => {
  return payphonePost<PayphoneConfirmResult>(
    "/api/button/V2/Confirm",
    input.token,
    {
      id: input.id,
      clientTxId: input.clientTxId,
    }
  )
}
