import { useEffect } from 'react'
import { Rates, ecRates } from '../types/api_cb'

export const CURRENCY = 'currency'
export const API_CB_BASE_V2 = 'https://api.coinbase.com/v2' as const
export const API_CB_ER = `${API_CB_BASE_V2}/exchange-rates` as const

export const API_CB_V2 = {
  BASE: API_CB_BASE_V2,
  EXCHANGE_RATE: API_CB_ER,
  SEARCH_KEYS: {
    CURRENCY: CURRENCY,
  } as const,
}

export const API_CB_ER_URL = new URL(API_CB_ER)

const GetExchangeRates = async (
  currency: string,
  setRates: React.Dispatch<React.SetStateAction<ecRates>>
) => {
  const searchKey = API_CB_V2.SEARCH_KEYS.CURRENCY

  API_CB_ER_URL.searchParams.append(searchKey, 'USD')

  const fetched = await fetch(API_CB_ER_URL.href)
    .then((response) => {
      return response.json()
    })
    .then((result) => {
      return result.data
    })

  setRates(fetched)
}

export default GetExchangeRates
