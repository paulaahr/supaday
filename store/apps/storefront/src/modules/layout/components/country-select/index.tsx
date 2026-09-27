"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useMemo } from "react"
import ReactCountryFlag from "react-country-flag"

import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type CountryOption = {
  country: string
  region: string
  label: string
  currency: string
}

type CountrySelectProps = {
  toggleState?: StateType
  regions: HttpTypes.StoreRegion[]
  variant?: "menu" | "nav"
}

const CountrySelect = ({
  toggleState,
  regions,
  variant = "menu",
}: CountrySelectProps) => {
  const { countryCode } = useParams()
  const code = Array.isArray(countryCode) ? countryCode[0] : countryCode
  const currentPath = usePathname().split(`/${code}`)[1]

  const state = toggleState?.state
  const close = toggleState?.close

  const options = useMemo(() => {
    return (
      regions
        ?.map((r) => {
          return r.countries?.map((c) => ({
            country: c.iso_2 ?? "",
            region: r.id,
            label: c.display_name ?? "",
            currency: (r.currency_code ?? "").toUpperCase(),
          }))
        })
        .flat()
        .filter((o): o is CountryOption => !!o)
        .sort((a, b) => a.label.localeCompare(b.label)) || []
    )
  }, [regions])

  // Always derived (never undefined → defined) so Listbox stays controlled.
  const current = useMemo(() => {
    if (!code) {
      return null
    }
    return options.find((o) => o.country === code) ?? null
  }, [options, code])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
    close?.()
  }

  if (variant === "nav") {
    return (
      <Listbox
        as="div"
        className="relative"
        onChange={handleChange}
        value={current}
      >
        <ListboxButton className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs tracking-wide text-white transition-all duration-300 hover:bg-white/20">
          {current ? (
            <>
              <ReactCountryFlag
                svg
                style={{ width: "14px", height: "14px" }}
                countryCode={current.country}
              />
              <span className="hidden xsmall:inline">{current.label}</span>
              <span className="rounded-full bg-usfq-red px-2 py-0.5 font-semibold">
                {current.currency}
              </span>
            </>
          ) : (
            <span>País / moneda</span>
          )}
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute right-0 top-[calc(100%+8px)] z-[900] max-h-80 w-64 overflow-y-auto rounded-2xl bg-white py-2 text-usfq-black shadow-xl no-scrollbar">
            {options.map((o) => (
              <ListboxOption
                key={`${o.country}-${o.region}`}
                value={o}
                className="cursor-pointer px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-usfq-cream data-[focus]:bg-usfq-cream"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <ReactCountryFlag
                      svg
                      style={{ width: "16px", height: "16px" }}
                      countryCode={o.country}
                    />
                    {o.label}
                  </span>
                  <span className="text-xs font-semibold text-usfq-red">
                    {o.currency}
                  </span>
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </Listbox>
    )
  }

  return (
    <div>
      <Listbox as="span" onChange={handleChange} value={current}>
        <ListboxButton className="py-1 w-full">
          <div className="txt-compact-small flex items-start gap-x-2">
            <span>Enviar a:</span>
            {current && (
              <span className="txt-compact-small flex items-center gap-x-2">
                <ReactCountryFlag
                  svg
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  countryCode={current.country}
                />
                {current.label}
                <span className="normal-case text-usfq-red">
                  ({current.currency})
                </span>
              </span>
            )}
          </div>
        </ListboxButton>
        <div className="flex relative w-full min-w-[320px]">
          <Transition
            show={state}
            as={Fragment}
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className="absolute -bottom-[calc(100%-36px)] left-0 xsmall:left-auto xsmall:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-2xl w-full"
              static
            >
              {options.map((o) => {
                return (
                  <ListboxOption
                    key={`${o.country}-${o.region}`}
                    value={o}
                    className="py-2 hover:bg-usfq-cream px-3 cursor-pointer flex items-center justify-between gap-x-2 transition-colors duration-200"
                  >
                    <span className="flex items-center gap-x-2">
                      <ReactCountryFlag
                        svg
                        style={{
                          width: "16px",
                          height: "16px",
                        }}
                        countryCode={o.country}
                      />{" "}
                      {o.label}
                    </span>
                    <span className="normal-case text-usfq-red">
                      {o.currency}
                    </span>
                  </ListboxOption>
                )
              })}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default CountrySelect
