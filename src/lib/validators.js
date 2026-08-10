import { isForbiddenNumber } from './utils'

export const isFloatingNumber = (num) => num.length === 1
export const isPairNumber = (num) => num.length === 2 && num[0] === num[1]
export const isTripleNumber = (num) => num.length === 3 && num[0] === num[1] && num[1] === num[2]
export const is3Digit = (num) => num.length === 3
export const isGroupNumber = (num) => num.length === 5

export const validateGroupNumber = (num) => {
  if (num.length !== 5) return false
  const digits = new Set(num)
  return digits.size === 5
}

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

  if (entry.number.length === 4) {
    return 'ไม่รองรับเลข 4 หลัก'
  }

  if (isGroupNumber(entry.number) && !validateGroupNumber(entry.number)) {
    return 'หวยกลุ่มต้องเป็นเลข 5 หลักที่ไม่ซ้ำกัน'
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
