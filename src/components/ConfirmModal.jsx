import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in" onClick={onCancel}>
      <div
        className="bg-[var(--bg-card)] rounded-xl max-w-md w-full border border-[var(--border)] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">ยืนยันการลบ</h3>
              <p className="text-sm text-[var(--text-secondary)]">{message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] hover:bg-[var(--bg-3)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg transition-all text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[var(--danger)] hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-all text-sm shadow-sm"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
