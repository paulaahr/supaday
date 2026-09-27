import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PayphonePaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [PayphonePaymentProviderService],
})
