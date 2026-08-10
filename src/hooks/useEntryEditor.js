import { useState } from 'react'

const isFloatingNumber = (num) => num.length === 1
const isPairNumber = (num) => num.length === 2 && num[0] === num[1]
const isTripleNumber = (num) => num.length === 3 && num[0] === num[1] && num[1] === num[2]
const shouldLimitToOneAmount = (num, reverseMode) => isFloatingNumber(num) || isPairNumber(num) || isTripleNumber(num) || reverseMode

export function useEntryEditor(initialEntries = []) {
  const [entries, setEntries] = useState(initialEntries)

  const handleNumberChange = (id, value) => {
    if (!/^\d{0,3}$/.test(value)) return

    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry

      let newBetType = entry.betType
      if (value.length === 1) {
        newBetType = entry.betType === 'ล่าง' ? 'ลอยล่าง' : 'ลอยบน'
      } else {
        if (entry.betType.includes('ลอย')) {
          newBetType = entry.betType === 'ลอยล่าง' ? 'ล่าง' : 'บน'
        }
      }

      const newReverseMode = (value.length === 3 && (newBetType === 'ล่าง' || newBetType === 'ลอยล่าง')) ? entry.reverseMode : null
      const newAmounts = shouldLimitToOneAmount(value, newReverseMode) ? [entry.amounts[0] || ''] : entry.amounts

      return { ...entry, number: value, betType: newBetType, amounts: newAmounts, reverseMode: newReverseMode }
    }))
  }

  const handleBetTypeChange = (id, type) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry

      if (entry.number.length === 1) {
        return { ...entry, betType: type === 'ล่าง' ? 'ลอยล่าง' : 'ลอยบน' }
      }

      const newReverseMode = (type === 'ล่าง' && entry.number.length === 3) ? entry.reverseMode : null
      const newAmounts = shouldLimitToOneAmount(entry.number, newReverseMode) ? [entry.amounts[0] || ''] : entry.amounts

      return { ...entry, betType: type, reverseMode: newReverseMode, amounts: newAmounts }
    }))
  }

  const handleReverseModeChange = (id, mode) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry
      const newReverseMode = entry.reverseMode === mode ? null : mode
      const newAmounts = shouldLimitToOneAmount(entry.number, newReverseMode) ? [entry.amounts[0] || ''] : entry.amounts
      return { ...entry, reverseMode: newReverseMode, amounts: newAmounts }
    }))
  }

  const handleAmountChange = (id, index, value) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return

    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry

      const newAmounts = [...entry.amounts]
      newAmounts[index] = value

      const limit = shouldLimitToOneAmount(entry.number, entry.reverseMode) ? 1 : 3
      if (value && index === newAmounts.length - 1 && newAmounts.length < limit) {
        newAmounts.push('')
      }

      return { ...entry, amounts: newAmounts }
    }))
  }

  return {
    entries,
    setEntries,
    handleNumberChange,
    handleBetTypeChange,
    handleReverseModeChange,
    handleAmountChange
  }
}
