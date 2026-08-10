import { X } from 'lucide-react'
import EntryForm from './EntryForm'

export default function AddEntryModal({ isOpen, onClose, currentDraw, forbiddenNumbers, onSubmit, initialBuyerName = '' }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl animate-slide-up custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">บันทึกหวย</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-3)] p-1.5 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <EntryForm
            currentDraw={currentDraw}
            forbiddenNumbers={forbiddenNumbers}
            onSubmit={(data) => {
              onSubmit(data)
              onClose()
            }}
            onCancel={onClose}
            initialBuyerName={initialBuyerName}
          />
        </div>
      </div>
    </div>
  )
}
