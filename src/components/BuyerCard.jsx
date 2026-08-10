import { User, ChevronRight } from 'lucide-react'
import { calculateBuyerTotal } from '../lib/utils'

export default function BuyerCard({ buyer, entries, onClick }) {
  const total = calculateBuyerTotal(entries)

  return (
    <button
      onClick={onClick}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] hover:shadow-sm transition-all text-left w-full group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-3)] flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
              {buyer.name}
            </h3>
            <span className="px-2 py-0.5 bg-[var(--bg-3)] text-[var(--text-secondary)] text-xs font-medium rounded-full">
              {entries.length}
            </span>
          </div>
          <div className="text-xl font-bold text-[var(--accent)]">
            ฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
      </div>
    </button>
  )
}
