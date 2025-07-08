"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCountries } from "@/hooks/use-countries"
import Image from "next/image";

interface CountrySelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function CountrySelector({
  value,
  onValueChange,
  placeholder = "Selecciona un país",
  label,
  className,
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const { countries, loading, error } = useCountries()

  const selectedCountry = countries.find((country) => country.cca2 === value)

  // Filtrar países basado en la búsqueda
  const filteredCountries = React.useMemo(() => {
    if (!searchValue) return countries

    return countries.filter((country) => {
      const searchLower = searchValue.toLowerCase()
      return (
        country.name.common.toLowerCase().includes(searchLower) ||
        country.name.official.toLowerCase().includes(searchLower) ||
        country.region.toLowerCase().includes(searchLower) ||
        (country.capital && country.capital[0]?.toLowerCase().includes(searchLower))
      )
    })
  }, [countries, searchValue])

  React.useEffect(() => {
    if (open) {
      setSearchValue("")
    }
  }, [open])

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label>{label}</Label>}
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label>{label}</Label>}
        <Button variant="outline" className="w-full justify-between font-normal bg-transparent" disabled>
          <span className="text-muted-foreground">Error cargando países</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    )
  }

  const CountryList = ({ setOpen }: { setOpen: (open: boolean) => void }) => (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Buscar país..."
        className="h-9"
        value={searchValue}
        onValueChange={setSearchValue}
        autoFocus
      />
      <CommandList>
        <CommandEmpty>No se encontraron países.</CommandEmpty>
        <CommandGroup>
          {filteredCountries.map((country) => (
            <CommandItem
              key={country.cca2}
              value={country.cca2}
              onSelect={() => {
                onValueChange?.(country.cca2)
                setOpen(false)
                // Remover esta línea: setSearchValue("")
              }}
              className="flex items-center gap-2"
            >
              <Image
                src={country.flags.svg || "/placeholder.svg"}
                alt={`${country.name.common} flag`}
                width={20}
                height={14}
                className="w-5 h-4 object-cover rounded-sm"
                crossOrigin="anonymous"
              />
              <span className="flex-1">{country.name.common}</span>
              <Check className={cn("ml-auto h-4 w-4", value === country.cca2 ? "opacity-100" : "opacity-0")} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )

  if (isDesktop) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label htmlFor="country-selector">{label}</Label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="country-selector"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal bg-transparent"
            >
              <div className="flex items-center gap-2">
                {selectedCountry ? (
                  <>
                    <Image
                      src={selectedCountry.flags.svg || "/placeholder.svg"}
                      alt={`${selectedCountry.name.common} flag`}
                      width={20}
                      height={14}
                      className="w-5 h-4 object-cover rounded-sm"
                      crossOrigin="anonymous"
                    />
                    <span>{selectedCountry.name.common}</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{placeholder}</span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <CountryList setOpen={setOpen} />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor="country-selector">{label}</Label>}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button id="country-selector" variant="outline" className="w-full justify-between font-normal bg-transparent">
            <div className="flex items-center gap-2">
              {selectedCountry ? (
                <>
                  <Image
                    src={selectedCountry.flags.svg || "/placeholder.svg"}
                    alt={`${selectedCountry.name.common} flag`}
                    width={20}
                    height={14}
                    className="w-5 h-4 object-cover rounded-sm"
                    crossOrigin="anonymous"
                  />
                  <span>{selectedCountry.name.common}</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{placeholder}</span>
                </>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <CountryList setOpen={setOpen} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
