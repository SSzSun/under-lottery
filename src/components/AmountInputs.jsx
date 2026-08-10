export default function AmountInputs({ entry, onAmountChange }) {
  if (!entry.number) return null

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      {entry.amounts.map((amount, amountIndex) => (
        <div key={amountIndex} className="flex items-center gap-1.5 sm:gap-2">
          {amountIndex > 0 && <span className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium">×</span>}
          <input
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(entry.id, amountIndex, e.target.value)}
            className="w-20 sm:w-24 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-xs sm:text-sm text-center font-medium"
            placeholder="฿ 100"
            inputMode="decimal"
          />
        </div>
      ))}
    </div>
  )
}
