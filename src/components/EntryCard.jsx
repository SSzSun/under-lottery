import { X } from 'lucide-react'
import BetTypeSelector from './BetTypeSelector'
import ReverseModeSelector from './ReverseModeSelector'
import AmountInputs from './AmountInputs'

export default function EntryCard({ entry, onNumberChange, onBetTypeChange, onReverseModeChange, onAmountChange, onRemove, canRemove }) {
  return (
    <div className="bg-[var(--bg-3)] border border-[var(--border-light)] rounded-lg p-3">
      <div className="flex items-start gap-2 mb-3">
        <input
          type="text"
          value={entry.number}
          onChange={(e) => onNumberChange(entry.id, e.target.value)}
          className="w-24 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-lg font-bold text-center placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all tracking-wider"
          placeholder="เลข"
          maxLength={3}
          inputMode="numeric"
        />

        <BetTypeSelector entry={entry} onBetTypeChange={onBetTypeChange} />

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 p-1.5 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <ReverseModeSelector entry={entry} onReverseModeChange={onReverseModeChange} />

      <AmountInputs entry={entry} onAmountChange={onAmountChange} />
    </div>
  )
}
