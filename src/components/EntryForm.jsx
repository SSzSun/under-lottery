import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { createEntries } from '../lib/utils'
import { validateEntry, validateBuyer } from '../lib/validators'
import { useEntryEditor } from '../hooks/useEntryEditor'
import EntryCard from './EntryCard'

export default function EntryForm({ currentDraw, forbiddenNumbers, onSubmit, onCancel, initialBuyerName = '' }) {
  const [buyerName, setBuyerName] = useState(initialBuyerName)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [buyers, setBuyers] = useState([])
  const nameInputRef = useRef(null)

  const {
    entries,
    setEntries,
    handleNumberChange,
    handleBetTypeChange,
    handleReverseModeChange,
    handleAmountChange
  } = useEntryEditor([{ id: Date.now(), number: '', betType: 'บน', amounts: [''], reverseMode: null }])

  useEffect(() => {
    const loadBuyers = async () => {
      const { supabase } = await import('../lib/supabase')
      const { data } = await supabase.from('buyers').select('name').order('name')
      if (data) setBuyers(data.map(b => b.name))
    }
    loadBuyers()
  }, [])

  const addEntry = () => {
    setEntries(prev => [...prev, { id: Date.now(), number: '', betType: 'บน', amounts: [''], reverseMode: null }])
  }

  const removeEntry = (id) => {
    if (entries.length === 1) return
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const buyerError = validateBuyer(buyerName, entries)
    if (buyerError) {
      setError(buyerError)
      return
    }

    for (const entry of entries) {
      const entryError = validateEntry(entry, forbiddenNumbers)
      if (entryError) {
        setError(entryError)
        return
      }
    }

    // Check for duplicates within the form
    const entryKeys = new Set()
    for (const entry of entries) {
      const key = `${entry.number}-${entry.betType}`
      if (entryKeys.has(key)) {
        setError(`เลข ${entry.number} ${entry.betType} ซ้ำในฟอร์ม`)
        return
      }
      entryKeys.add(key)
    }

    const allEntries = entries.flatMap(entry => {
      const filledAmounts = entry.amounts.filter(a => a.trim())
      const amountStr = filledAmounts.join('x')
      return createEntries({ number: entry.number, betType: entry.betType, amountStr, reverseMode: entry.reverseMode })
    })

    onSubmit({
      buyerName: buyerName.trim(),
      drawId: currentDraw.id,
      entries: allEntries
    })

    setBuyerName('')
    setEntries([{ id: Date.now(), number: '', betType: 'บน', amounts: [''], reverseMode: null }])
  }

  const filteredBuyers = buyers.filter(name =>
    name.toLowerCase().includes(buyerName.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">ชื่อลูกค้า</label>
        <input
          ref={nameInputRef}
          type="text"
          value={buyerName}
          onChange={(e) => {
            setBuyerName(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm"
          placeholder="ระบุชื่อผู้ซื้อ"
          autoComplete="off"
        />
        {showSuggestions && buyerName && filteredBuyers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
            {filteredBuyers.slice(0, 5).map((name, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBuyerName(name)
                  setShowSuggestions(false)
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-3)] transition-colors text-sm text-[var(--text-primary)] border-b border-[var(--border-light)] last:border-b-0"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--text-primary)]">รายการแทง</label>
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onNumberChange={handleNumberChange}
            onBetTypeChange={handleBetTypeChange}
            onReverseModeChange={handleReverseModeChange}
            onAmountChange={handleAmountChange}
            onRemove={removeEntry}
            canRemove={entries.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="w-full bg-[var(--bg-2)] border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--bg-3)] text-[var(--text-secondary)] py-2.5 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        เพิ่มรายการ
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[var(--danger)] px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <span className="font-medium">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] hover:bg-[var(--bg-3)] text-[var(--text-primary)] font-medium py-2.5 rounded-lg transition-all text-sm"
          >
            ยกเลิก
          </button>
        )}
        <button
          type="submit"
          className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-2.5 rounded-lg transition-all text-sm shadow-sm"
        >
          บันทึก
        </button>
      </div>
    </form>
  )
}
