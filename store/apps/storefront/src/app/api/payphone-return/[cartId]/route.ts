import { handlePayphoneReturn } from "@lib/payphone/handle-return"
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await context.params
  return handlePayphoneReturn(req, cartId)
}
