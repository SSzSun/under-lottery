import { useState, useEffect } from 'react'
import { Plus, Search, Ban, TrendingUp, Users, Hash, Calendar } from 'lucide-react'
import { supabase } from './lib/supabase'
import { calculateDrawDate } from './lib/utils'
import BuyerCard from './components/BuyerCard'
import EntryModal from './components/EntryModal'
import AddEntryModal from './components/AddEntryModal'
import Toast from './components/Toast'
import ConfirmModal from './components/ConfirmModal'

export default function App() {
  const [currentDraw, setCurrentDraw] = useState(null)
  const [availableDraws, setAvailableDraws] = useState([])
  const [selectedDrawId, setSelectedDrawId] = useState(null)
  const [buyers, setBuyers] = useState([])
  const [entries, setEntries] = useState([])
  const [forbiddenNumbers, setForbiddenNumbers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForbidden, setShowForbidden] = useState(false)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newForbidden, setNewForbidden] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  // Initialize app
  useEffect(() => {
    initializeApp()
  }, [])

  // Load entries when selected draw changes
  useEffect(() => {
    if (selectedDrawId) {
      loadEntries(selectedDrawId)
      loadForbiddenNumbers()
    }
  }, [selectedDrawId])

  const initializeApp = async () => {
    try {
      // Get or create current draw
      const draw = await getCurrentDraw()
      setCurrentDraw(draw)

      // Load draws from last 2 months
      const draws = await loadRecentDraws()
      setAvailableDraws(draws)
      setSelectedDrawId(draw.id)

      // Load data
      await Promise.all([
        loadBuyers(),
        loadEntries(draw.id),
        loadForbiddenNumbers()
      ])
    } catch (error) {
      console.error('Error initializing app:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentDraws = async () => {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const cutoffDate = twoMonthsAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .gte('actual_date', cutoffDate)
      .order('actual_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  const getCurrentDraw = async () => {
    const { drawDate, actualDate } = calculateDrawDate()

    // Check if draw exists
    let { data: existingDraw, error: fetchError } = await supabase
      .from('draws')
      .select('*')
      .eq('draw_date', drawDate)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (existingDraw) return existingDraw

    // Create new draw
    const { data: newDraw, error } = await supabase
      .from('draws')
      .insert([{
        draw_date: drawDate,
        actual_date: actualDate
      }])
      .select()
      .single()

    if (error) throw error
    return newDraw
  }

  const loadBuyers = async () => {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .order('name')

    if (error) throw error
    setBuyers(data || [])
  }

  const loadEntries = async (drawId) => {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('draw_id', drawId)
      .order('created_at', { ascending: false })

    if (error) throw error
    setEntries(data || [])
  }

  const loadForbiddenNumbers = async () => {
    if (!selectedDrawId) return

    const { data, error } = await supabase
      .from('forbidden_numbers')
      .select('*')
      .eq('draw_id', selectedDrawId)
      .order('created_at', { ascending: false })

    if (error) throw error
    setForbiddenNumbers(data || [])
  }

  const handleSubmit = async (formData) => {
    try {
      const { buyerName, drawId, entries: newEntries } = formData

      let buyer = buyers.find(b => b.name === buyerName)
      if (!buyer) {
        const { data: newBuyer, error: buyerError } = await supabase
          .from('buyers')
          .insert([{ name: buyerName }])
          .select()
          .single()

        if (buyerError) throw buyerError
        buyer = newBuyer
        setBuyers(prev => [...prev, buyer])
      }

      // Check for duplicates with existing entries
      const existingEntries = entries.filter(e => e.buyer_id === buyer.id && e.draw_id === drawId)
      for (const newEntry of newEntries) {
        const isDuplicate = existingEntries.some(
          e => e.number === newEntry.number && e.bet_type === newEntry.betType
        )
        if (isDuplicate) {
          setToast({ type: 'warning', message: `เลข ${newEntry.number} ${newEntry.betType} มีอยู่แล้ว` })
          return
        }
      }

      const entriesToInsert = newEntries.map(entry => ({
        buyer_id: buyer.id,
        draw_id: drawId,
        number: entry.number,
        bet_type: entry.betType,
        amount: entry.amount,
        reverse_mode: entry.reverseMode
      }))

      const { error: entriesError } = await supabase
        .from('entries')
        .insert(entriesToInsert)

      if (entriesError) {
        if (entriesError.code === '23505') {
          setToast({ type: 'warning', message: 'มีรายการนี้อยู่แล้ว (เลข + ประเภทซ้ำ)' })
        } else {
          throw entriesError
        }
        return
      }

      await loadEntries(drawId)
      setToast({ type: 'success', message: 'บันทึกสำเร็จ' })
    } catch (error) {
      console.error('Error submitting:', error)
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + error.message })
    }
  }

  const handleDeleteEntry = async (buyerId) => {
    setConfirmModal({
      message: 'ต้องการลบลูกค้าและรายการทั้งหมดของลูกค้านี้?',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('entries')
            .delete()
            .eq('buyer_id', buyerId)
            .eq('draw_id', selectedDrawId)

          if (error) throw error

          setEntries(prev => prev.filter(e => !(e.buyer_id === buyerId && e.draw_id === selectedDrawId)))
          setSelectedBuyer(null)
          setToast({ type: 'success', message: 'ลบสำเร็จ' })
        } catch (error) {
          console.error('Error deleting entries:', error)
          setToast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + error.message })
        } finally {
          setConfirmModal(null)
        }
      }
    })
  }

  const handleDeleteSingleEntry = async (entryId) => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error

      setEntries(prev => prev.filter(e => e.id !== entryId))
      setToast({ type: 'success', message: 'ลบรายการสำเร็จ' })
    } catch (error) {
      console.error('Error deleting single entry:', error)
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + error.message })
    }
  }

  const handleUpdateEntry = async (entryId, newNumber, newBetType, newAmount, newReverseMode = null) => {
    try {
      const { error } = await supabase
        .from('entries')
        .update({
          number: newNumber,
          bet_type: newBetType,
          amount: newAmount,
          reverse_mode: newReverseMode
        })
        .eq('id', entryId)

      if (error) throw error

      setEntries(prev => prev.map(e =>
        e.id === entryId ? { ...e, number: newNumber, bet_type: newBetType, amount: newAmount, reverse_mode: newReverseMode } : e
      ))
      setToast({ type: 'success', message: 'แก้ไขสำเร็จ' })
    } catch (error) {
      console.error('Error updating entry:', error)
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + error.message })
    }
  }

  const handleAddEntriesToBuyer = (buyer) => {
    setShowAddEntry(buyer.name)
  }

  const handleAddForbidden = async () => {
    const trimmed = newForbidden.trim()

    if (!trimmed || !/^\d{1,3}$/.test(trimmed)) {
      setToast({ type: 'warning', message: 'กรุณากรอกเลขที่ต้องการอั้น (1-3 หลัก)' })
      return
    }

    if (parseInt(trimmed) > 999) {
      setToast({ type: 'warning', message: 'เลขต้องไม่เกิน 999' })
      return
    }

    try {
      const { error } = await supabase
        .from('forbidden_numbers')
        .insert([{ number: trimmed, draw_id: currentDraw.id }])

      if (error) {
        if (error.code === '23505') {
          setToast({ type: 'warning', message: 'เลขนี้อยู่ในรายการอั้นแล้ว' })
        } else {
          throw error
        }
        return
      }

      await loadForbiddenNumbers()
      setNewForbidden('')
      setToast({ type: 'success', message: 'เพิ่มเลขอั้นสำเร็จ' })
    } catch (error) {
      console.error('Error adding forbidden number:', error)
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + error.message })
    }
  }

  const handleDeleteForbidden = async (id) => {
    setConfirmModal({
      message: 'ต้องการลบเลขอั้นนี้?',
      onConfirm: async () => {
        try {
          // Check if forbidden number belongs to current draw
          const forbiddenNumber = forbiddenNumbers.find(f => f.id === id)
          if (forbiddenNumber && forbiddenNumber.draw_id !== currentDraw.id) {
            setToast({ type: 'warning', message: 'ลบได้เฉพาะเลขอั้นในงวดปัจจุบันเท่านั้น' })
            setConfirmModal(null)
            return
          }

          const { error } = await supabase
            .from('forbidden_numbers')
            .delete()
            .eq('id', id)

          if (error) throw error

          setForbiddenNumbers(prev => prev.filter(f => f.id !== id))
          setToast({ type: 'success', message: 'ลบสำเร็จ' })
        } catch (error) {
          console.error('Error deleting forbidden number:', error)
          setToast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + error.message })
        } finally {
          setConfirmModal(null)
        }
      }
    })
  }

  // Filter buyers by search term
  const filteredBuyers = buyers.filter(buyer => {
    const buyerEntries = entries.filter(e => e.buyer_id === buyer.id)
    if (buyerEntries.length === 0) return false

    const matchName = buyer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchNumber = buyerEntries.some(e =>
      e.number.includes(searchTerm)
    )

    return matchName || matchNumber
  })

  // Calculate stats
  const totalSales = entries.reduce((sum, entry) => {
    const amounts = entry.amount.toString().split('x').map(a => parseFloat(a))
    return sum + amounts.reduce((s, a) => s + a, 0)
  }, 0)

  const totalCustomers = buyers.filter(buyer =>
    entries.some(e => e.buyer_id === buyer.id)
  ).length

  const numberFrequency = entries.reduce((acc, entry) => {
    acc[entry.number] = (acc[entry.number] || 0) + 1
    return acc
  }, {})

  const topNumbers = Object.entries(numberFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-1)]">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">⏳</div>
          <div className="text-xl text-[var(--text-secondary)]">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    )
  }

  if (!currentDraw) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-1)]">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <div className="text-xl text-red-400">ไม่สามารถโหลดข้อมูลงวดได้</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-6 py-3 rounded-full transition-all"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
                ระบบจดหวยไทย
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">งวดวันที่</span>
                  <select
                    value={selectedDrawId || ''}
                    onChange={(e) => setSelectedDrawId(e.target.value)}
                    className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all cursor-pointer hover:border-[var(--primary)] text-xs sm:text-sm"
                  >
                    {availableDraws.map(draw => (
                      <option key={draw.id} value={draw.id}>
                        {draw.draw_date}
                        {draw.id === currentDraw.id && ' (งวดปัจจุบัน)'}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="hidden sm:inline w-1 h-1 bg-[var(--border)] rounded-full"></span>
                <button
                  onClick={() => setShowForbidden(!showForbidden)}
                  className="flex items-center gap-1 sm:gap-1.5 hover:text-[var(--text-primary)] transition-colors px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-[var(--bg-3)] border border-transparent hover:border-[var(--border)]"
                >
                  <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">เลขอั้น ({forbiddenNumbers.length})</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAddEntry(true)}
              disabled={selectedDrawId !== currentDraw.id}
              className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              title={selectedDrawId !== currentDraw.id ? 'สามารถบันทึกได้เฉพาะงวดปัจจุบัน' : ''}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              บันทึกหวย
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[var(--success)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-0.5">ยอดขายรวม</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    ฿{totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--info)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-0.5">จำนวนลูกค้า</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{totalCustomers}</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-secondary)] mb-1">เลขยอดนิยม</div>
                  <div className="flex gap-2 flex-wrap">
                    {topNumbers.length > 0 ? (
                      topNumbers.slice(0, 3).map(([num, count]) => (
                        <span key={num} className="px-2.5 py-1 bg-[var(--bg-3)] text-[var(--text-primary)] text-sm font-bold rounded-md border border-[var(--border)]">
                          {num}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ban className="w-6 h-6 text-[var(--danger)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-secondary)] mb-1">เลขอั้น</div>
                  <div className="flex gap-2 flex-wrap">
                    {forbiddenNumbers.length > 0 ? (
                      forbiddenNumbers.slice(0, 5).map(fn => (
                        <span key={fn.id} className="px-2.5 py-1 bg-red-50 text-[var(--danger)] text-sm font-bold rounded-md border border-red-200">
                          {fn.number}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">-</span>
                    )}
                    {forbiddenNumbers.length > 5 && (
                      <button
                        onClick={() => setShowForbidden(true)}
                        className="px-2.5 py-1 bg-[var(--bg-3)] text-[var(--text-secondary)] text-xs font-medium rounded-md border border-[var(--border)] hover:border-[var(--danger)] transition-colors"
                      >
                        +{forbiddenNumbers.length - 5}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Forbidden Numbers Section */}
        {showForbidden && (
          <div className="mb-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 animate-slide-down">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5" />
              เลขอั้นทั้งหมด
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newForbidden}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d{0,3}$/.test(val)) {
                    setNewForbidden(val)
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddForbidden()}
                disabled={selectedDrawId !== currentDraw.id}
                className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="กรอกเลขที่ต้องการอั้น (1-3 หลัก)"
                inputMode="numeric"
                maxLength={3}
              />
              <button
                onClick={handleAddForbidden}
                disabled={selectedDrawId !== currentDraw.id}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-lg transition-all font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                เพิ่ม
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {forbiddenNumbers.map(fn => {
                const isCurrentDraw = fn.draw_id === currentDraw.id
                return (
                  <div
                    key={fn.id}
                    className="bg-[var(--bg-3)] border border-[var(--border-light)] rounded-lg px-3 py-2 flex justify-between items-center hover:border-[var(--danger)] transition-all"
                  >
                    <span className="text-[var(--text-primary)] font-semibold text-sm">{fn.number}</span>
                    {isCurrentDraw ? (
                      <button
                        onClick={() => handleDeleteForbidden(fn.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--danger)] text-lg font-medium transition-all ml-2"
                      >
                        ×
                      </button>
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs ml-2">🔒</span>
                    )}
                  </div>
                )
              })}
              {forbiddenNumbers.length === 0 && (
                <div className="col-span-full text-center text-[var(--text-muted)] py-8 text-sm">
                  ยังไม่มีเลขอั้น
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm"
              placeholder="ค้นหาชื่อลูกค้าหรือเลข..."
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredBuyers.map(buyer => {
            const buyerEntries = entries.filter(e => e.buyer_id === buyer.id)
            return (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                entries={buyerEntries}
                onClick={() => setSelectedBuyer(buyer)}
              />
            )
          })}

          {filteredBuyers.length === 0 && (
            <div className="col-span-full text-center text-[var(--text-muted)] py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
              {buyers.length === 0 ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-[var(--bg-3)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <div className="text-base font-medium text-[var(--text-secondary)]">ยังไม่มีรายการซื้อหวย</div>
                  <div className="text-sm text-[var(--text-muted)]">กดปุ่ม "บันทึกหวย" เพื่อเริ่มต้น</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Search className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-30" />
                  <div className="text-base">ไม่พบผลลัพธ์ที่ค้นหา</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmModal}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />

      <AddEntryModal
        isOpen={!!showAddEntry}
        onClose={() => setShowAddEntry(false)}
        currentDraw={currentDraw}
        forbiddenNumbers={forbiddenNumbers}
        onSubmit={handleSubmit}
        initialBuyerName={typeof showAddEntry === 'string' ? showAddEntry : ''}
      />

      {selectedBuyer && (
        <EntryModal
          buyer={selectedBuyer}
          entries={entries.filter(e => e.buyer_id === selectedBuyer.id)}
          onClose={() => setSelectedBuyer(null)}
          onDelete={() => handleDeleteEntry(selectedBuyer.id)}
          onDeleteSingleEntry={handleDeleteSingleEntry}
          onUpdate={handleUpdateEntry}
          onAddEntries={handleAddEntriesToBuyer}
          isCurrentDraw={selectedDrawId === currentDraw.id}
        />
      )}
    </div>
  )
}
