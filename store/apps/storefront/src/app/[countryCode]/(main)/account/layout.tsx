import { redirect } from "next/navigation"

/**
 * Demo en clase: sin login. Cualquier ruta /account redirige a la tienda.
 */
export default async function AccountPageLayout({
  params,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/store`)
}
