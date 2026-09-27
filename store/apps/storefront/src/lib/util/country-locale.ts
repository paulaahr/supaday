const COUNTRY_LOCALES: Record<string, string> = {
  ar: "es-AR",
  cl: "es-CL",
  co: "es-CO",
  de: "de-DE",
  dk: "da-DK",
  ec: "es-EC",
  es: "es-ES",
  fr: "fr-FR",
  gb: "en-GB",
  it: "it-IT",
  mx: "es-MX",
  pe: "es-PE",
  se: "sv-SE",
  us: "en-US",
}

export const localeFromCountry = (countryCode?: string | null) => {
  if (!countryCode) {
    return "es-EC"
  }

  return COUNTRY_LOCALES[countryCode.toLowerCase()] || "en-US"
}
