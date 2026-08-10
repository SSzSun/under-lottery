export default function ReverseModeSelector({ entry, onReverseModeChange }) {
  if (entry.number.length !== 3 || (entry.betType !== 'ล่าง' && entry.betType !== 'ลอยล่าง')) {
    return null
  }

  return (
    <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
      <button
        type="button"
        onClick={() => onReverseModeChange(entry.id, 'หมุนหน้า')}
        className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all font-medium text-xs ${
          entry.reverseMode === 'หมุนหน้า'
            ? 'bg-purple-500 text-white shadow-sm'
            : 'bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-purple-400'
        }`}
      >
        หมุนหน้า
      </button>
      <button
        type="button"
        onClick={() => onReverseModeChange(entry.id, 'หมุนท้าย')}
        className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all font-medium text-xs ${
          entry.reverseMode === 'หมุนท้าย'
            ? 'bg-purple-500 text-white shadow-sm'
            : 'bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-purple-400'
        }`}
      >
        หมุนท้าย
      </button>
    </div>
  )
}
