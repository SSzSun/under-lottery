export default function BetTypeSelector({ entry, onBetTypeChange, disabled = false }) {
  const getBetTypeOptions = (number) => ['บน', 'ล่าง']

  return entry.number ? (
    <div className="flex gap-1.5 flex-1">
      {getBetTypeOptions(entry.number).map(type => (
        <button
          key={type}
          type="button"
          onClick={() => onBetTypeChange(entry.id, type)}
          disabled={disabled}
          className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            entry.betType === type || entry.betType === `ลอย${type}`
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  ) : null
}
