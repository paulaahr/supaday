"use client"

import { Button, Heading, Text } from "@modules/common/components/ui"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const formatAmount = (raw: string | null, currency: string) => {
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    return raw || "—"
  }

  // Medusa store amounts are major units for this storefront display path.
  try {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: currency || "USD",
    }).format(value)
  } catch {
    return `${value} ${currency}`
  }
}

export default function PayphoneDemoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { countryCode } = useParams()
  const [busy, setBusy] = useState<"approve" | "cancel" | null>(null)

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

  const approve = () => {
    setBusy("approve")
    const params = new URLSearchParams({
      status: "approved",
      cart_id: payload.cartId,
      country_code: payload.country,
      id: payload.id,
      clientTransactionId: payload.clientTransactionId,
    })
    window.location.href = `/api/payphone-return?${params.toString()}`
  }

  const cancel = () => {
    setBusy("cancel")
    const params = new URLSearchParams({
      status: "canceled",
      cart_id: payload.cartId,
      country_code: payload.country,
      id: payload.id,
      clientTransactionId: payload.clientTransactionId,
    })
    window.location.href = `/api/payphone-return?${params.toString()}`
  }

  return (
    <div className="content-container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-usfq-red">
          Payphone · demo
        </p>
        <Heading
          level="h1"
          className="font-serif text-4xl leading-tight text-usfq-black"
        >
          Confirmar pago
        </Heading>
        <Text className="mt-3 text-base leading-7 text-grey-60">
          Simulación local del Botón de Pago Payphone. No se cobra dinero ni se
          llama a la API real.
        </Text>

        <div className="mt-10 space-y-4 border-t border-grey-20 pt-8">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-grey-50">Monto</span>
            <span className="font-semibold text-usfq-black">
              {formatAmount(payload.amount, payload.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-grey-50">Transacción</span>
            <span className="truncate text-usfq-black">
              {payload.clientTransactionId || "—"}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-grey-50">Referencia</span>
            <span className="truncate text-usfq-black">{payload.id || "—"}</span>
          </div>
        </div>

        {missingRequired ? (
          <div className="mt-8 space-y-4">
            <Text className="text-sm text-usfq-red">
              Faltan datos de la sesión de pago. Vuelve al checkout e inicia
              Payphone otra vez.
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
        ) : (
          <div className="mt-10 flex flex-col gap-3 small:flex-row">
            <Button
              className="flex-1"
              size="large"
              isLoading={busy === "approve"}
              disabled={!!busy}
              onClick={approve}
              data-testid="payphone-demo-approve"
            >
              Aprobar pago
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              size="large"
              isLoading={busy === "cancel"}
              disabled={!!busy}
              onClick={cancel}
              data-testid="payphone-demo-cancel"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
