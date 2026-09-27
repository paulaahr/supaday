import { handlePayphoneReturn } from "@lib/payphone/handle-return"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return handlePayphoneReturn(req, req.nextUrl.searchParams.get("cart_id"))
}
