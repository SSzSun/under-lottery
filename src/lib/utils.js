// คำนวณงวดหวยตามวันที่
export const calculateDrawDate = (date = new Date()) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  // วันที่ 1-15 ของเดือน → งวดวันที่ 1
  // วันที่ 16-31 ของเดือน → งวดวันที่ 16
  const drawDay = day <= 15 ? 1 : 16

  return {
    drawDate: `${drawDay}/${month}/${year}`,
    actualDate: `${year}-${String(month).padStart(2, '0')}-${String(drawDay).padStart(2, '0')}`
  }
}

// แยก amount format: "100" หรือ "50x80"
export const parseAmount = (amountStr) => {
  if (amountStr.includes('x')) {
    return amountStr.split('x').map(n => parseFloat(n.trim()))
  }
  return [parseFloat(amountStr)]
}

// สร้าง entries จาก input form
export const createEntries = (data) => {
  const { number, betType, amountStr, reverseMode } = data
  return [{ number, betType, amount: amountStr, reverseMode: reverseMode || null }]
}

// ตรวจสอบเลขอั้น
export const isForbiddenNumber = (number, forbiddenList) => {
  return forbiddenList.some(fn => fn.number === number)
}

// คำนวณยอดรวมของ buyer
export const calculateBuyerTotal = (entries) => {
  return entries.reduce((sum, entry) => {
    const amounts = parseAmount(entry.amount.toString())
    return sum + amounts.reduce((acc, n) => acc + n, 0)
  }, 0)
}
