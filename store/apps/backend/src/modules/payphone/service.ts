import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  BigNumberInput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { randomUUID } from "crypto"
import {
  amountToCents,
  confirmPayphoneSale,
  preparePayphoneSale,
} from "./payphone-api"

type PayphoneOptions = {
  demo?: boolean
  token?: string
  storeId?: string
  storefrontUrl?: string
}

type InjectedDependencies = {
  logger: {
    info: (message: string) => void
    warn: (message: string) => void
  }
}

class PayphonePaymentProviderService extends AbstractPaymentProvider<PayphoneOptions> {
  static identifier = "payphone"

  protected logger_: InjectedDependencies["logger"]
  protected options_: PayphoneOptions

  constructor(container: InjectedDependencies, options: PayphoneOptions = {}) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = {
      demo: false,
      storefrontUrl: "http://localhost:8000",
      ...options,
    }
  }

  protected isLive() {
    return (
      this.options_.demo !== true &&
      Boolean(this.options_.token) &&
      Boolean(this.options_.storeId)
    )
  }

  protected storefrontBase() {
    return (this.options_.storefrontUrl || "http://localhost:8000").replace(
      /\/$/,
      ""
    )
  }

  protected requireLiveCredentials() {
    if (this.options_.demo === true) {
      return
    }

    if (!this.options_.token || !this.options_.storeId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Faltan PAYPHONE_TOKEN y PAYPHONE_STORE_ID. Créalos en Payphone Developer (aplicación WEB, dominio localhost) y reinicia el backend."
      )
    }
  }

  protected demoPayUrl(input: {
    id: string
    clientTransactionId: string
    amount: BigNumberInput
    currencyCode: string
    cartId?: string
    countryCode?: string
  }) {
    const cents = amountToCents(input.amount, input.currencyCode)
    const country = (input.countryCode || "ec").toLowerCase()
    const params = new URLSearchParams({
      id: input.id,
      clientTransactionId: input.clientTransactionId,
      amount: String(cents / 100),
      currency: input.currencyCode.toUpperCase(),
      country_code: country,
    })

    if (input.cartId) {
      params.set("cart_id", input.cartId)
    }

    return `${this.storefrontBase()}/${country}/payphone-demo?${params.toString()}`
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const id = randomUUID()
    const clientTransactionId = `usfq${Date.now()}`
    const currencyCode = (input.currency_code || "usd").toUpperCase()
    const data = input.data || {}
    const cartId = typeof data.cart_id === "string" ? data.cart_id : undefined
    const countryCode =
      typeof data.country_code === "string" ? data.country_code : "ec"
    const live = this.isLive()

    this.logger_?.info?.(
      `[payphone] initiatePayment ${live ? "live" : "pending"} ${clientTransactionId}`
    )

    return {
      id,
      status: PaymentSessionStatus.PENDING,
      data: {
        id,
        clientTransactionId,
        currency_code: currencyCode,
        cart_id: cartId,
        country_code: countryCode,
        demo: !live,
        provider: "payphone",
      },
    }
  }

  protected async prepareCheckout(input: UpdatePaymentInput) {
    const previous = { ...(input.data || {}) }
    const currencyCode = (input.currency_code || "usd").toUpperCase()
    const cartId = String(previous.cart_id || "")
    const countryCode = String(previous.country_code || "ec").toLowerCase()
    const clientTransactionId = `usfq${Date.now()}`
    const sessionId = String(previous.id || randomUUID())

    if (!this.isLive()) {
      this.requireLiveCredentials()

      const payUrl = this.demoPayUrl({
        id: sessionId,
        clientTransactionId,
        amount: input.amount,
        currencyCode,
        cartId,
        countryCode,
      })

      return {
        status: PaymentSessionStatus.PENDING,
        data: {
          ...previous,
          id: sessionId,
          clientTransactionId,
          currency_code: currencyCode,
          demo: true,
          payUrl,
          provider: "payphone",
        },
      }
    }

    if (!cartId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Falta el carrito para abrir Payphone."
      )
    }

    const amountCents = amountToCents(input.amount, currencyCode)

    if (amountCents <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "El monto a cobrar debe ser mayor que cero."
      )
    }

    const base = this.storefrontBase()
    const responseUrl = `${base}/api/payphone-return/${encodeURIComponent(cartId)}?country_code=${encodeURIComponent(countryCode)}`
    const cancellationUrl = `${base}/${countryCode}/checkout?step=payment&error=payphone_canceled`
    const email =
      typeof previous.email === "string" && previous.email.includes("@")
        ? previous.email
        : undefined
    const phone =
      typeof previous.phone === "string" && previous.phone.startsWith("+")
        ? previous.phone
        : undefined

    const prepared = await preparePayphoneSale({
      token: this.options_.token as string,
      storeId: this.options_.storeId as string,
      amountCents,
      clientTransactionId,
      currency: currencyCode,
      responseUrl,
      cancellationUrl,
      email,
      phone,
    })

    const payUrl = prepared.payWithCard || prepared.payWithPayPhone

    this.logger_?.info?.(
      `[payphone] prepare ${clientTransactionId} paymentId=${prepared.paymentId} cents=${amountCents}`
    )

    return {
      status: PaymentSessionStatus.PENDING,
      data: {
        id: sessionId,
        clientTransactionId,
        currency_code: currencyCode,
        cart_id: cartId,
        country_code: countryCode,
        demo: false,
        provider: "payphone",
        paymentId: prepared.paymentId,
        payUrl,
        payWithCard: prepared.payWithCard,
        payWithPayPhone: prepared.payWithPayPhone,
        amount_cents: amountCents,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = { ...(input.data || {}) }

    if (!this.isLive()) {
      return {
        status: PaymentSessionStatus.AUTHORIZED,
        data: { ...data, demoStatus: "approved" },
      }
    }

    const transactionId = Number(data.payphoneTransactionId)
    const clientTxId = String(data.clientTransactionId || "")

    if (!Number.isInteger(transactionId) || transactionId <= 0 || !clientTxId) {
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...data,
          message: "Payphone no envió el id de la transacción.",
        },
      }
    }

    const confirmed = await confirmPayphoneSale({
      token: this.options_.token as string,
      id: transactionId,
      clientTxId,
    })

    const approved =
      confirmed.transactionStatus === "Approved" || confirmed.statusCode === 3

    this.logger_?.info?.(
      `[payphone] confirm ${clientTxId} status=${confirmed.transactionStatus || "unknown"} code=${confirmed.statusCode ?? "none"}`
    )

    if (!approved) {
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...data,
          transactionStatus: confirmed.transactionStatus,
          statusCode: confirmed.statusCode,
          message: confirmed.message || "Payphone no aprobó el pago.",
        },
      }
    }

    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: {
        ...data,
        transactionStatus: confirmed.transactionStatus,
        statusCode: confirmed.statusCode,
        authorizationCode: confirmed.authorizationCode,
        transactionId: confirmed.transactionId,
        lastDigits: confirmed.lastDigits,
        cardBrand: confirmed.cardBrand,
      },
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        demoStatus: this.isLive() ? undefined : "captured",
        captured: true,
      },
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        demoStatus: "canceled",
      },
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data || {} }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    if (this.isLive()) {
      const transactionStatus = input.data?.transactionStatus

      if (transactionStatus === "Approved") {
        return { status: PaymentSessionStatus.AUTHORIZED }
      }

      if (transactionStatus === "Canceled") {
        return { status: PaymentSessionStatus.CANCELED }
      }

      return { status: PaymentSessionStatus.PENDING }
    }

    const demoStatus = input.data?.demoStatus as string | undefined

    switch (demoStatus) {
      case "approved":
        return { status: PaymentSessionStatus.AUTHORIZED }
      case "captured":
        return { status: PaymentSessionStatus.CAPTURED }
      case "canceled":
        return { status: PaymentSessionStatus.CANCELED }
      case "error":
        return { status: PaymentSessionStatus.ERROR }
      default:
        return { status: PaymentSessionStatus.PENDING }
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data || {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const data = { ...(input.data || {}) }
    const intent = data.intent
    delete data.intent

    if (intent === "prepare") {
      return this.prepareCheckout({ ...input, data })
    }

    if (intent === "attach") {
      return {
        status: PaymentSessionStatus.PENDING,
        data: {
          ...data,
          payphoneTransactionId: data.payphoneTransactionId,
          clientTransactionId: data.clientTransactionId,
        },
      }
    }

    const currencyCode = (input.currency_code || "usd").toUpperCase()

    return {
      status: PaymentSessionStatus.PENDING,
      data: {
        ...data,
        currency_code: currencyCode,
      },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        refunded_amount: input.amount,
      },
    }
  }

  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

export default PayphonePaymentProviderService
