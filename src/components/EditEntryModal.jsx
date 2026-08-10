import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

export default function EditEntryModal({ entry, onClose, onUpdate }) {
  const [amount, setAmount] = useState(entry.amount.toString())
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!amount) {
      setError('กรุณากรอกจำนวนเงิน')
      return
    }

    if (amount.includes('x')) {
      const parts = amount.split('x')
      if (parts.length < 2 || parts.length > 3 || parts.some(p => isNaN(parseFloat(p.trim())))) {
        setError('รูปแบบไม่ถูกต้อง (เช่น 100x100 หรือ 100x50x30)')
        return
      }
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('จำนวนเงินไม่ถูกต้อง')
      return
    }

    onUpdate(entry.id, amount)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] rounded-xl max-w-md w-full border border-[var(--border)] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">แก้ไขจำนวนเงิน</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-3)] p-1.5 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-[var(--bg-3)] rounded-lg p-4 border border-[var(--border-light)]">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-[var(--text-primary)] bg-[var(--bg-card)] px-4 py-2 rounded-lg tracking-wider border border-[var(--border)] shadow-sm">
                {entry.number}
              </div>
              <div className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium">
                {entry.bet_type}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">จำนวนเงิน</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-lg font-semibold text-center"
              placeholder="100 หรือ 100x100 หรือ 100x50x30"
              autoFocus
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">ใช้ x คั่นหากมีหลายจำนวน (สูงสุด 3 จำนวน)</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-[var(--danger)] px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] hover:bg-[var(--bg-3)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg transition-all text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm text-sm"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
