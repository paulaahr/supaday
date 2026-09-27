import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[color:var(--bg-component)] px-5 py-4 small:flex-row small:items-center small:justify-between">
      <div>
        <Heading level="h2" className="font-serif text-xl text-usfq-black">
          ¿Ya tienes cuenta?
        </Heading>
        <Text className="txt-medium text-grey-50 mt-1">
          Inicia sesión para guardar tu carrito y ver pedidos del campus.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            className="h-10 border-usfq-red text-usfq-red"
            data-testid="sign-in-button"
          >
            Iniciar sesión
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
