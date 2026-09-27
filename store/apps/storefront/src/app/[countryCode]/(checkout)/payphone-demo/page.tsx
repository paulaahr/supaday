"use client"

import { Button, Heading, Text } from "@modules/common/components/ui"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"

const formatAmount = (raw: string | null, currency: string) => {
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    return raw || "—"
  }

  try {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: currency || "USD",
    }).format(value)
  } catch {
    return `${value} ${currency}`
  }
}

const digitsOnly = (value: string) => value.replace(/\D/g, "")

const luhnOk = (pan: string) => {
  let sum = 0
  let alt = false

  for (let i = pan.length - 1; i >= 0; i -= 1) {
    let n = Number(pan[i])
    if (alt) {
      n *= 2
      if (n > 9) {
        n -= 9
      }
    }
    sum += n
    alt = !alt
  }

  return sum % 10 === 0
}

const brandOf = (pan: string) => {
  if (/^3[47]/.test(pan)) {
    return "American Express"
  }
  if (/^4/.test(pan)) {
    return "Visa"
  }
  if (/^5[1-5]/.test(pan)) {
    return "Mastercard"
  }
  return "Tarjeta"
}

const formatPan = (value: string) => {
  const pan = digitsOnly(value).slice(0, 16)
  return pan.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
}

const formatExpiry = (value: string) => {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) {
    return digits
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

type FieldErrors = {
  name?: string
  number?: string
  expiry?: string
  cvc?: string
}

const validateCard = (input: {
  name: string
  number: string
  expiry: string
  cvc: string
}) => {
  const errors: FieldErrors = {}
  const pan = digitsOnly(input.number)
  const amex = /^3[47]/.test(pan)
  const expectedLength = amex ? 15 : 16

  if (input.name.trim().length < 3) {
    errors.name = "Escribe el nombre del titular."
  }

  if (pan.length !== expectedLength || !luhnOk(pan)) {
    errors.number = "El número de tarjeta no es válido."
  }

  const [monthRaw, yearRaw] = input.expiry.split("/")
  const month = Number(monthRaw)
  const year = Number(yearRaw)
  const now = new Date()
  const current = now.getFullYear() % 100
  const expired =
    !monthRaw ||
    !yearRaw ||
    monthRaw.length !== 2 ||
    yearRaw.length !== 2 ||
    month < 1 ||
    month > 12 ||
    year < current ||
    (year === current && month < now.getMonth() + 1)

  if (expired) {
    errors.expiry = "La tarjeta está vencida o la fecha no es válida."
  }

  const cvc = digitsOnly(input.cvc)
  if (cvc.length !== (amex ? 4 : 3)) {
    errors.cvc = amex ? "El código tiene 4 dígitos." : "El código tiene 3 dígitos."
  }

  return { errors, pan }
}

export default function PayphoneDemoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { countryCode } = useParams()
  const [name, setName] = useState("")
  const [number, setNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [phase, setPhase] = useState<"form" | "processing" | "declined">("form")
  const [processStep, setProcessStep] = useState(0)
  const [declineMessage, setDeclineMessage] = useState("")

  const payload = useMemo(() => {
    return {
      id: searchParams.get("id") || "",
      clientTransactionId: searchParams.get("clientTransactionId") || "",
      cartId: searchParams.get("cart_id") || "",
      country:
        searchParams.get("country_code") || String(countryCode || "ec"),
      amount: searchParams.get("amount"),
      currency: (searchParams.get("currency") || "USD").toUpperCase(),
    }
  }, [searchParams, countryCode])

  const missingRequired = !payload.cartId || !payload.id
  const pan = digitsOnly(number)
  const brand = pan ? brandOf(pan) : "Tarjeta"

  const finish = (status: "approved" | "canceled", last4?: string) => {
    const params = new URLSearchParams({
      status,
      cart_id: payload.cartId,
      country_code: payload.country,
      id: payload.id,
      clientTransactionId: payload.clientTransactionId,
    })
    if (last4) {
      params.set("last4", last4)
    }
    window.location.href = `/api/payphone-return?${params.toString()}`
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = validateCard({ name, number, expiry, cvc })
    setErrors(result.errors)
    if (Object.keys(result.errors).length > 0) {
      return
    }

    setPhase("processing")
    setProcessStep(1)

    window.setTimeout(() => setProcessStep(2), 700)

    window.setTimeout(() => {
      const declined = result.pan.endsWith("0002")
      if (declined) {
        setDeclineMessage(
          "El banco rechazó la tarjeta. En esta demo, 4242 4242 4242 4242 se aprueba."
        )
        setPhase("declined")
        return
      }

      setProcessStep(3)
      window.setTimeout(() => finish("approved", result.pan.slice(-4)), 500)
    }, 1600)
  }

  return (
    <div className="content-container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-usfq-red">
          Caja de pagos · demo
        </p>
        <Heading
          level="h1"
          className="font-serif text-4xl leading-tight text-usfq-black"
        >
          Pagar con tarjeta
        </Heading>
        <Text className="mt-3 text-base leading-7 text-grey-60">
          Simulación local. La tarjeta no se envía a ningún banco y no se cobra
          dinero.
        </Text>

        <div className="mt-8 flex items-center justify-between border-y border-grey-20 py-4 text-sm">
          <span className="text-grey-50">Total</span>
          <span className="font-semibold text-usfq-black">
            {formatAmount(payload.amount, payload.currency)}
          </span>
        </div>

        {missingRequired ? (
          <div className="mt-8 space-y-4">
            <Text className="text-sm text-usfq-red">
              Faltan datos de la sesión de pago. Vuelve al checkout e inicia el
              pago otra vez.
            </Text>
            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/${payload.country}/checkout?step=payment`)
              }
            >
              Volver al checkout
            </Button>
          </div>
        ) : phase === "processing" ? (
          <div className="mt-8 space-y-4" data-testid="payment-box-processing">
            {[
              "Datos de la tarjeta recibidos",
              "Verificando el número",
              "Autorizando el cobro",
            ].map((label, index) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    processStep > index ? "bg-usfq-red" : "bg-grey-20"
                  }`}
                />
                <span
                  className={
                    processStep > index ? "text-usfq-black" : "text-grey-40"
                  }
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            {phase === "declined" ? (
              <p className="text-sm text-usfq-red" data-testid="payment-box-declined">
                {declineMessage}
              </p>
            ) : null}

            <label className="block text-sm text-grey-50">
              Titular
              <input
                className="mt-1 w-full border border-grey-20 px-3 py-3 text-usfq-black outline-none focus:border-usfq-black"
                autoComplete="cc-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                data-testid="payment-box-name"
              />
              {errors.name ? (
                <span className="mt-1 block text-xs text-usfq-red">
                  {errors.name}
                </span>
              ) : null}
            </label>

            <label className="block text-sm text-grey-50">
              Número de tarjeta
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                className="mt-1 w-full border border-grey-20 px-3 py-3 tracking-wider text-usfq-black outline-none focus:border-usfq-black"
                placeholder="4242 4242 4242 4242"
                value={number}
                onChange={(event) => setNumber(formatPan(event.target.value))}
                data-testid="payment-box-number"
              />
              <span className="mt-1 block text-xs text-grey-40">{brand}</span>
              {errors.number ? (
                <span className="mt-1 block text-xs text-usfq-red">
                  {errors.number}
                </span>
              ) : null}
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-grey-50">
                Vence
                <input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  className="mt-1 w-full border border-grey-20 px-3 py-3 text-usfq-black outline-none focus:border-usfq-black"
                  value={expiry}
                  onChange={(event) =>
                    setExpiry(formatExpiry(event.target.value))
                  }
                  data-testid="payment-box-expiry"
                />
                {errors.expiry ? (
                  <span className="mt-1 block text-xs text-usfq-red">
                    {errors.expiry}
                  </span>
                ) : null}
              </label>
              <label className="block text-sm text-grey-50">
                CVC
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  className="mt-1 w-full border border-grey-20 px-3 py-3 text-usfq-black outline-none focus:border-usfq-black"
                  value={cvc}
                  onChange={(event) =>
                    setCvc(digitsOnly(event.target.value).slice(0, 4))
                  }
                  data-testid="payment-box-cvc"
                />
                {errors.cvc ? (
                  <span className="mt-1 block text-xs text-usfq-red">
                    {errors.cvc}
                  </span>
                ) : null}
              </label>
            </div>

            <p className="text-xs leading-5 text-grey-40">
              Aprueba con 4242 4242 4242 4242. Un número que termina en 0002 se
              rechaza.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                size="large"
                data-testid="payment-box-submit"
              >
                Pagar {formatAmount(payload.amount, payload.currency)}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={() => finish("canceled")}
                data-testid="payment-box-cancel"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
