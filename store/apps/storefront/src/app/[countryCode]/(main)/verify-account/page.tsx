import { redirect } from "next/navigation"

export default async function VerifyAccountPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/store`)
}
