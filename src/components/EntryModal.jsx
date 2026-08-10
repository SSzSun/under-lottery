import { useState } from 'react'
import { X, User, Edit3, Trash2, FileText, Save, XCircle, Plus } from 'lucide-react'
import { calculateBuyerTotal } from '../lib/utils'
import { isFloatingNumber, isPairNumber, isTripleNumber, is3Digit } from '../lib/validators'
import BetTypeSelector from './BetTypeSelector'
import ReverseModeSelector from './ReverseModeSelector'
import AmountInputs from './AmountInputs'

export default function EntryModal({ buyer, entries, onClose, onDelete, onUpdate, onAddEntries, onDeleteSingleEntry, isCurrentDraw = true }) {
  const [filter, setFilter] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editedEntries, setEditedEntries] = useState({})
  const [entriesToDelete, setEntriesToDelete] = useState(new Set())

  const filteredEntries = entries.filter(entry => {
    if (filter === '2digit') return entry.number.length === 2
    if (filter === '3digit') return entry.number.length === 3
    if (filter === 'บน') return entry.bet_type === 'บน' || entry.bet_type === 'ลอยบน'
    if (filter === 'ล่าง') return entry.bet_type === 'ล่าง' || entry.bet_type === 'ลอยล่าง'
    return true
  })

  const groupedByType = filteredEntries.reduce((acc, entry) => {
    const type = entry.bet_type.replace('ลอย', '')
    if (!acc[type]) acc[type] = []
    acc[type].push(entry)
    return acc
  }, {})

  const total = calculateBuyerTotal(filteredEntries)

  const betTypeOrder = ['บน', 'ล่าง']
  const sortedTypes = Object.keys(groupedByType).sort((a, b) => {
    return betTypeOrder.indexOf(a) - betTypeOrder.indexOf(b)
  })

  const filterButtons = [
    { key: 'all', label: 'ทั้งหมด', count: entries.length },
    { key: '2digit', label: '2 หลัก', count: entries.filter(e => e.number.length === 2).length },
    { key: '3digit', label: '3 หลัก', count: entries.filter(e => e.number.length === 3).length },
    { key: 'บน', label: 'บน', count: entries.filter(e => e.bet_type === 'บน' || e.bet_type === 'ลอยบน').length },
    { key: 'ล่าง', label: 'ล่าง', count: entries.filter(e => e.bet_type === 'ล่าง' || e.bet_type === 'ลอยล่าง').length }
  ]

  const shouldLimitToOneAmount = (num, reverseMode) => isFloatingNumber(num) || isPairNumber(num) || isTripleNumber(num) || reverseMode

  const handleStartEdit = () => {
    const initial = {}
    filteredEntries.forEach(entry => {
      const amounts = entry.amount.toString().split('x')
      initial[entry.id] = {
        id: entry.id,
        number: entry.number,
        betType: entry.bet_type,
        amounts: amounts.length > 0 ? amounts : [''],
        reverseMode: entry.reverse_mode || null
      }
    })
    setEditedEntries(initial)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedEntries({})
    setEntriesToDelete(new Set())
  }

  const handleNumberChange = (entryId, value) => {
    if (!/^\d{0,3}$/.test(value)) return

    setEditedEntries(prev => {
      const entry = prev[entryId]
      let newBetType = entry.betType

      if (value.length === 1) {
        newBetType = entry.betType === 'ล่าง' || entry.betType === 'ลอยล่าง' ? 'ลอยล่าง' : 'ลอยบน'
      } else {
        if (entry.betType.includes('ลอย')) {
          newBetType = entry.betType === 'ลอยล่าง' ? 'ล่าง' : 'บน'
        }
      }

      const newReverseMode = value.length === 3 ? entry.reverseMode : null
      const newAmounts = shouldLimitToOneAmount(value, newReverseMode) ? [entry.amounts[0] || ''] : entry.amounts

      return {
        ...prev,
        [entryId]: { ...entry, number: value, betType: newBetType, amounts: newAmounts, reverseMode: newReverseMode }
      }
    })
  }

  const handleBetTypeChange = (entryId, type) => {
    setEditedEntries(prev => {
      const entry = prev[entryId]

      if (entry.number.length === 1) {
        return {
          ...prev,
          [entryId]: { ...entry, betType: type === 'ล่าง' ? 'ลอยล่าง' : 'ลอยบน' }
        }
      }

      const newReverseMode = (entry.number.length === 3 && type !== 'ล่าง') ? null : entry.reverseMode

      return {
        ...prev,
        [entryId]: { ...entry, betType: type, reverseMode: newReverseMode }
      }
    })
  }

  const handleAmountChange = (entryId, index, value) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return

    setEditedEntries(prev => {
      const entry = prev[entryId]
      const newAmounts = [...entry.amounts]
      newAmounts[index] = value

      const limit = shouldLimitToOneAmount(entry.number, entry.reverseMode) ? 1 : 3
      if (value && index === newAmounts.length - 1 && newAmounts.length < limit) {
        newAmounts.push('')
      }

      return {
        ...prev,
        [entryId]: { ...entry, amounts: newAmounts }
      }
    })
  }

  const handleReverseModeChange = (entryId, mode) => {
    setEditedEntries(prev => {
      const entry = prev[entryId]
      const newMode = entry.reverseMode === mode ? null : mode
      const newAmounts = newMode ? [entry.amounts[0] || ''] : entry.amounts
      return {
        ...prev,
        [entryId]: { ...entry, reverseMode: newMode, amounts: newAmounts }
      }
    })
  }

  const handleSaveAll = async () => {
    // First, handle updates
    const updates = Object.entries(editedEntries).map(([entryId, entry]) => {
      if (entriesToDelete.has(entryId)) return Promise.resolve()

      const filledAmounts = entry.amounts.filter(a => a.trim())
      const amountStr = filledAmounts.join('x')

      const originalEntry = entries.find(e => e.id === entryId)
      const hasChanges = entry.number !== originalEntry.number ||
        entry.betType !== originalEntry.bet_type ||
        amountStr !== originalEntry.amount.toString() ||
        entry.reverseMode !== originalEntry.reverse_mode

      if (hasChanges) {
        return onUpdate(entryId, entry.number, entry.betType, amountStr, entry.reverseMode)
      }
      return Promise.resolve()
    })

    await Promise.all(updates)

    // Then, handle deletions
    const deletions = Array.from(entriesToDelete).map(entryId => onDeleteSingleEntry(entryId))
    await Promise.all(deletions)

    setIsEditing(false)
    setEditedEntries({})
    setEntriesToDelete(new Set())
  }

  const handleMarkForDeletion = (entryId) => {
    setEntriesToDelete(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-[var(--border)] shadow-2xl animate-slide-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-card)]/95 border-b border-[var(--border)] px-3 sm:px-6 py-3 sm:py-5 z-10">
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[var(--bg-3)] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] truncate mb-0.5 sm:mb-1">{buyer.name}</h2>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">{entries.length} รายการ</span>
                  <span className="text-[var(--text-secondary)]">•</span>
                  <span className="font-semibold text-[var(--accent)]">฿{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isCurrentDraw && !isEditing && (
                <>
                  <button
                    onClick={() => onAddEntries(buyer)}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-[var(--bg-3)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium rounded-lg transition-all text-xs sm:text-sm border border-[var(--border)]"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">เพิ่ม</span>
                  </button>
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">แก้ไข</span>
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-[var(--danger)] hover:bg-red-600 text-white font-medium rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">ลบ</span>
                  </button>
                </>
              )}

              {isEditing && (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-[var(--bg-3)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium rounded-lg transition-all text-xs sm:text-sm border border-[var(--border)]"
                  >
                    <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">ยกเลิก</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">บันทึก</span>
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-[var(--bg-3)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-1 px-1">
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-all ${
                  filter === btn.key
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-[var(--bg-3)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border)]'
                }`}
              >
                {btn.label} <span className="opacity-75">({btn.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {sortedTypes.map(type => (
            <div key={type}>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${type === 'บน' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                {type}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {groupedByType[type].map(entry => {
                  const editedEntry = editedEntries[entry.id]
                  const isEditingThis = isEditing && editedEntry

                  return (
                    <div key={entry.id} className="bg-[var(--bg-3)] rounded-lg p-3 sm:p-4 border border-[var(--border-light)] hover:border-[var(--border)] transition-colors">
                      {isEditingThis ? (
                        <div className={`space-y-2.5 sm:space-y-3 ${entriesToDelete.has(entry.id) ? 'opacity-50' : ''}`}>
                          <div className="flex items-start gap-2">
                            <input
                              type="text"
                              value={editedEntry.number}
                              onChange={(e) => handleNumberChange(entry.id, e.target.value)}
                              disabled={entriesToDelete.has(entry.id)}
                              className="w-16 sm:w-20 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[var(--text-primary)] text-base sm:text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all tracking-wider disabled:opacity-50"
                              maxLength={3}
                              inputMode="numeric"
                            />
                            <BetTypeSelector
                              entry={editedEntry}
                              onBetTypeChange={handleBetTypeChange}
                              disabled={entriesToDelete.has(entry.id)}
                            />
                            {isCurrentDraw && (
                              <button
                                onClick={() => handleMarkForDeletion(entry.id)}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${
                                  entriesToDelete.has(entry.id)
                                    ? 'text-white bg-[var(--danger)] hover:bg-red-700'
                                    : 'text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50'
                                }`}
                                title={entriesToDelete.has(entry.id) ? 'ยกเลิกการลบ' : 'ทำเครื่องหมายเพื่อลบ'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {!entriesToDelete.has(entry.id) && (
                            <>
                              <ReverseModeSelector
                                entry={editedEntry}
                                onReverseModeChange={handleReverseModeChange}
                              />

                              <AmountInputs
                                entry={editedEntry}
                                onAmountChange={handleAmountChange}
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <span className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-wider">{entry.number}</span>
                            <span className={`text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium ${
                              entry.bet_type.includes('บน')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {entry.bet_type}
                            </span>
                            {entry.reverse_mode && (
                              <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                                {entry.reverse_mode}
                              </span>
                            )}
                          </div>
                          <span className="text-base sm:text-lg font-semibold text-[var(--accent)] whitespace-nowrap">฿{entry.amount}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
