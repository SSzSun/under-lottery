import { isForbiddenNumber } from './utils'

export const isFloatingNumber = (num) => num.length === 1
export const isPairNumber = (num) => num.length === 2 && num[0] === num[1]
export const isTripleNumber = (num) => num.length === 3 && num[0] === num[1] && num[1] === num[2]
export const is3Digit = (num) => num.length === 3

export const validateBuyer = (buyerName, entries) => {
  if (!buyerName.trim()) {
    return 'กรุณากรอกชื่อ'
  }
  return null
}

export const validateEntry = (entry, forbiddenNumbers) => {
  if (!entry.number) {
    return 'กรุณากรอกเลขทุกรายการ'
  }

  const filledAmounts = entry.amounts.filter(a => a.trim())
  if (filledAmounts.length === 0) {
    return 'กรุณากรอกจำนวนเงินอย่างน้อย 1 ช่อง'
  }

  if (filledAmounts.some(a => isNaN(parseFloat(a)))) {
    return 'จำนวนเงินไม่ถูกต้อง'
  }

  if (isForbiddenNumber(entry.number, forbiddenNumbers)) {
    return `เลข ${entry.number} เป็นเลขอั้น`
  }

  return null
}
