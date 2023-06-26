import React, { KeyboardEvent, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { Input } from '../ui/input'
import Combobox from '../ui/comboBox'
import { ecRates, Rates } from '../../types/api_cb'
import CryptoLogo from '../../assets/svgs/cryptoLogo'
import GetExchangeRates from '../../api/getCurrencies'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'

import { CRYPTO_ENUM } from '../../enums/enums'

type CardProps = React.ComponentProps<typeof Card>

interface Investments {
  [key: string]: Investment
}

interface Inputs {
  [key: string]: boolean
}

interface Investment {
  name: string
  percentage: string
  ecRate: string
}

interface selected {
  [key: number]: string
}

type GenerateInvestmentStrategyProps = {
  investments: Investments
  toInvest: string
  currency: string
}

const calculateExchangeRate = (
  capital: string,
  ecRate: string,
  percentage: string
) => {
  return parseFloat(capital) * Number(`0.${percentage}`) * parseFloat(ecRate)
}

const GenerateInvestmentStrategy = ({
  investments,
  toInvest,
}: GenerateInvestmentStrategyProps) => {
  const investmentStrategies = Object.values(investments).map(
    (investment, index) => {
      const { name, percentage, ecRate } = investment
      if (!!percentage)
        return (
          <div key={name}>
            Buy {calculateExchangeRate(toInvest, ecRate, percentage)} of {name.toUpperCase()}
          </div>
        )
      else {
        return ''
      }
    }
  )

  return <>{investmentStrategies}</>
}

const generateComboBoxItems = (items: string[]) => {
  return items.map((item) => {
    return { label: item, value: item.toLowerCase() }
  })
}

const handleAmountKeyDown = (event: KeyboardEvent) => {
  const { key } = event
  const value = (event.target as HTMLInputElement).value
  const decimalLength = 2
  const decimalSeparator = '.'
  const decimalIndex = value.indexOf(decimalSeparator)
  const decimalLimit =
    decimalIndex !== -1 &&
    value.slice(decimalIndex, -1).length === decimalLength
  const isDecimal = value.includes(decimalSeparator)

  const isDecimalFormatted = isDecimal && decimalLimit

  const isNotNumberKey = !/[0-9]/.test(key)
  const isNotAllowedKey = ![
    '.',
    'Backspace',
    'Delete',
    'Enter',
    'Escape',
    'Period',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
  ].includes(key)

  const isNotActiveKey =
    (isNotNumberKey || isDecimalFormatted) && isNotAllowedKey

  if (isNotActiveKey) {
    event.preventDefault()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  const { key } = event
  const length = (event.target as HTMLInputElement).value.length === 2

  const isNotNumberKey = !/[0-9]/.test(key)
  const isNotAllowedKey = ![
    'Backspace',
    'Delete',
    'Enter',
    'Escape',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
  ].includes(key)

  const isNotActiveKey = isNotNumberKey && isNotAllowedKey

  if (isNotActiveKey) {
    event.preventDefault()
  }

  if (length && isNotAllowedKey) {
    event.preventDefault()
  }
}

const handleEcOnChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  selectedItem: string,
  updateInvestments: React.Dispatch<React.SetStateAction<Investments>>,
  investments: Investments,
  setExchangeRates: React.Dispatch<React.SetStateAction<ecRates>>,
  exchangeRates: ecRates
) => {
  const {
    target: { value: percentage },
  } = event
  if (selectedItem) {
    GetExchangeRates(selectedItem, setExchangeRates)
    const { rates } = exchangeRates
    let ecRate = ''

    if (rates) {
      ecRate =
        exchangeRates.rates[selectedItem.toUpperCase() as keyof Rates] || ''
    }

    updateInvestments({
      ...investments,
      [selectedItem]: { name: selectedItem, percentage, ecRate },
    })
  }
}

const GenerateAllocationSelectors = ({
  numberOfSelectors = 2,
  updateInvestments,
  investments,
  handleOnChange,
  exchangeRates,
  setExchangeRates,
}: {
  numberOfSelectors: number
  updateInvestments: React.Dispatch<React.SetStateAction<Investments>>
  investments: Investments
  handleOnChange: any
  exchangeRates: ecRates
  setExchangeRates: React.Dispatch<React.SetStateAction<ecRates>>
}) => {
  const [selected, updateSelected] = useState({} as selected)
  const selectCurrency = 'Select Currency'
  const cryptoValues = Object.values(CRYPTO_ENUM) as string[]
  const cryptoComboBoxItems = generateComboBoxItems(cryptoValues)
  const [inputsDisabled, setInputsDisabled] = useState({
    0: true,
    1: true,
  } as Inputs)

  const allocationSelectors = [...new Array(numberOfSelectors)].map(
    (_v, index) => {
      const selectedItem = selected[index]

      return (
        <div key={index} className='flex justify-around'>
          <Combobox
            items={cryptoComboBoxItems}
            prompt={selectCurrency}
            onChange={(value: string) => { 
              updateInvestments({...investments, [value]: {} as Investment})
              updateSelected({ ...selected, [index]: value })
              setInputsDisabled({ ...inputsDisabled, [index]: false })

              const siblingInput = document.querySelector(
                `[data-key="${selectedItem}"]`
              ) as HTMLInputElement
              if (siblingInput) siblingInput.value = ''
            }}
          />
          <Input
            data-key={selectedItem}
            type='text'
            disabled={
              Object.keys(inputsDisabled).length === 0 || inputsDisabled[index]
            }
            onKeyDown={(event) => handleKeyDown(event)}
            onChange={(event) => {
              handleEcOnChange(
                event,
                selectedItem,
                updateInvestments,
                investments,
                setExchangeRates,
                exchangeRates
              )
            }}
            placeholder={`% to allocate ${
              selectedItem ? `in ${selectedItem.toUpperCase()}` : ''
            }`}
            className='w-[200px]'
          />
        </div>
      )
    }
  )

  return <>{allocationSelectors}</>
}

const CalculateCard = ({ className, ...props }: CardProps) => {
  const [investments, updateInvestments] = useState({} as Investments)
  const [exchangeRates, setExchangeRates] = useState({} as ecRates)
  const [toInvest, updateToInvest] = useState('')
  const currency = 'USD'

  console.log('investments', investments)

  return (
    <Card className={cn('self-center', className)} {...props}>
      <CardHeader className='bg-amber-300 rounded-t-md border-b-2 '>
        <div className='flex items-center justify-between space-x-4'>
          <div className='flex items-center space-x-4'>
            <div className='w-16'>
              <CryptoLogo />
            </div>
            <div>
              <CardTitle className='text-stone-950'>
                Crypto Asset Allocations Calculator
              </CardTitle>
              <CardDescription className='text-stone-950 font-bold pt-3'>
                A JustWork Lab's Engineering Challenge
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='mt-6 grid gap-4'>
        <div className='relative pb-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Select Distribution
            </span>
          </div>
        </div>
        <div className='flex relative justify-around px-3'>
          <div className='relative w-full'>
            <div className='text-lg absolute my-1.5 ml-3.5'>$</div>
            <Input
              type='text'
              onKeyDown={(event) => handleAmountKeyDown(event)}
              onChange={(event) => {
                updateToInvest(event.target.value)
              }}
              placeholder='Amount to invest in USD'
              className='w-full pl-7 text-md'
            />
          </div>
        </div>
        <GenerateAllocationSelectors
          exchangeRates={exchangeRates}
          handleOnChange={handleEcOnChange}
          investments={investments}
          numberOfSelectors={2}
          setExchangeRates={setExchangeRates}
          updateInvestments={updateInvestments}
        />
        <div className='relative py-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Investment Portfolio Strategy
            </span>
          </div>
        </div>
        <GenerateInvestmentStrategy
          currency={currency}
          investments={investments}
          toInvest={toInvest}
        />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default CalculateCard
