"use client"

import { useState, useEffect } from "react"

export interface Country {
  name: {
    common: string
    official: string
  }
  cca2: string
  flag: string
  flags: {
    png: string
    svg: string
  }
  region: string
  capital?: string[]
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCountries() {
      try {
        setLoading(true)
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flag,flags,region,capital")

        if (!response.ok) {
          throw new Error("Failed to fetch countries")
        }

        const data = await response.json()
        const sortedCountries = data.sort((a: Country, b: Country) => a.name.common.localeCompare(b.name.common))

        setCountries(sortedCountries)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  return { countries, loading, error }
}
