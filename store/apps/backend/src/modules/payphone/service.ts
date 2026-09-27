import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
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

type PayphoneOptions = {
  demo?: boolean
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
      demo: true,
      storefrontUrl: "http://localhost:8000",
      ...options,
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const id = randomUUID()
    const clientTransactionId = `pp-demo-${Date.now()}`
    const amount = Number(input.amount)
    const currencyCode = (input.currency_code || "usd").toUpperCase()
    const base = (this.options_.storefrontUrl || "http://localhost:8000").replace(
      /\/$/,
      ""
    )

    const params = new URLSearchParams({
      id,
      clientTransactionId,
      amount: String(amount),
      currency: currencyCode,
    })

    const payUrl = `${base}/payphone-demo?${params.toString()}`

    this.logger_?.info?.(
      `[payphone-demo] initiatePayment ${clientTransactionId} amount=${amount} ${currencyCode}`
    )

    return {
      id,
      status: PaymentSessionStatus.PENDING,
      data: {
        id,
        clientTransactionId,
        amount,
        currency_code: currencyCode,
        demo: true,
        demoStatus: "pending",
        payUrl,
        provider: "payphone",
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = { ...(input.data || {}) }
    const demoStatus = data.demoStatus as string | undefined

    // Demo provider: authorize once the shopper confirmed on the demo page,
    // or when placeOrder runs after that redirect (session may still be pending).
    if (this.options_.demo !== false) {
      return {
        status: PaymentSessionStatus.AUTHORIZED,
        data: { ...data, demoStatus: "approved" },
      }
    }

    if (demoStatus !== "approved") {
      return {
        status: PaymentSessionStatus.ERROR,
        data,
      }
    }

    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data,
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        demoStatus: "captured",
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
    const amount = Number(input.amount)
    const currencyCode = (input.currency_code || "usd").toUpperCase()
    const data = {
      ...(input.data || {}),
      amount,
      currency_code: currencyCode,
    }

    return {
      status: PaymentSessionStatus.PENDING,
      data,
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
