import { X, Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useRef } from 'react'

export default function ReportModal({ buyers, entries, drawDate, onClose }) {
  const reportRef = useRef(null)

  const groupedData = buyers.map(buyer => {
    const buyerEntries = entries.filter(e => e.buyer_id === buyer.id)

    const grouped = {
      บน: [],
      ล่าง: []
    }

    buyerEntries.forEach(entry => {
      let category = entry.bet_type
      if (entry.bet_type === 'ลอยบน' || entry.bet_type === 'กลุ่ม') category = 'บน'
      else if (entry.bet_type === 'ลอยล่าง') category = 'ล่าง'

      const isFloating = entry.bet_type.includes('ลอย')
      const isGroup = entry.bet_type === 'กลุ่ม'
      const reverseText = entry.reverse_mode ? entry.reverse_mode : ''
      const floatingText = isFloating ? 'ลอย' : ''
      const groupText = isGroup ? 'กลุ่ม' : ''
      const tags = [floatingText, groupText, reverseText].filter(Boolean)

      grouped[category].push({
        number: entry.number,
        amount: entry.amount,
        tags
      })
    })

    const total = buyerEntries.reduce((sum, e) => {
      const amounts = e.amount.toString().split('x').map(a => parseFloat(a))
      return sum + amounts.reduce((s, a) => s + a, 0)
    }, 0)

    const entryCount = buyerEntries.length

    return { buyer, grouped, total, entryCount }
  }).filter(item => item.total > 0)

  // Sort by entry count descending (most entries first)
  groupedData.sort((a, b) => b.entryCount - a.entryCount)

  const handleDownload = async () => {
    if (!reportRef.current) return

    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0A0D12'
      })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `รายงานหวย-${drawDate}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'รายงานหวย',
          text: `รายงานหวย งวดวันที่ ${drawDate}`
        })
      } else {
        // Fallback to download link
        const link = document.createElement('a')
        link.download = `รายงานหวย-${drawDate}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  const columns = [[], [], [], []]
  const columnHeights = [0, 0, 0, 0]

  groupedData.forEach((item) => {
    const shortestIndex = columnHeights.indexOf(Math.min(...columnHeights))
    columns[shortestIndex].push(item)
    columnHeights[shortestIndex] += item.entryCount
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[var(--bg-card)] rounded-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">รายงานหวย</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              บันทึกรูป
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-3)] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div ref={reportRef} data-report-content className="bg-[#0A0D12] p-8 rounded-xl">
            <h1 className="text-2xl font-bold text-center text-[#F8FAFC] mb-6">
              รายงานหวย งวดวันที่ {drawDate}
            </h1>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="space-y-4">
                  {column.map(({ buyer, grouped, total }) => (
                    <div key={buyer.id} className="bg-[#0F131C] rounded-lg p-4 border border-[#1E293B]">
                      <h3 className="font-bold text-lg text-[#F8FAFC] mb-3 pb-2 border-b border-[#334155]">
                        {buyer.name}
                      </h3>

                      {grouped.บน.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-[#60A5FA] mb-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#60A5FA]"></span>
                            บน
                          </div>
                          <div className="space-y-1">
                            {grouped.บน.map((entry, i) => (
                              <div key={i} className="flex justify-between text-sm pl-3 gap-2">
                                <span className="font-mono font-semibold text-[#F8FAFC]">{entry.number}</span>
                                <div className="flex items-center gap-1.5 flex-1 justify-end">
                                  {entry.tags.length > 0 && (
                                    <span className="text-xs text-[#60A5FA] opacity-75">
                                      [{entry.tags.join(' ')}]
                                    </span>
                                  )}
                                  <span className="text-[#93C5FD]">{entry.amount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {grouped.ล่าง.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-[#FB923C] mb-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#FB923C]"></span>
                            ล่าง
                          </div>
                          <div className="space-y-1">
                            {grouped.ล่าง.map((entry, i) => (
                              <div key={i} className="flex justify-between text-sm pl-3 gap-2">
                                <span className="font-mono font-semibold text-[#F8FAFC]">{entry.number}</span>
                                <div className="flex items-center gap-1.5 flex-1 justify-end">
                                  {entry.tags.length > 0 && (
                                    <span className="text-xs text-[#FB923C] opacity-75">
                                      [{entry.tags.join(' ')}]
                                    </span>
                                  )}
                                  <span className="text-[#FDBA74]">{entry.amount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 mt-2 border-t border-[#334155] flex justify-between items-center">
                        <span className="text-xs text-[#94A3B8]">รวม</span>
                        <span className="font-bold text-[#38BDF8]">฿{total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="bg-[#0F131C] rounded-lg p-4 border border-[#1E293B] text-center">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <span className="text-[#94A3B8] text-sm">ยอดรวมทั้งหมด:</span>
                  <span className="font-bold text-xl text-[#38BDF8] ml-2">
                    ฿{entries.reduce((sum, e) => {
                      const amounts = e.amount.toString().split('x').map(a => parseFloat(a))
                      return sum + amounts.reduce((s, a) => s + a, 0)
                    }, 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-px h-6 bg-[#1E293B]"></div>
                <div>
                  <span className="text-[#94A3B8] text-sm">ลูกค้าทั้งหมด:</span>
                  <span className="font-bold text-xl text-[#F8FAFC] ml-2">{groupedData.length} คน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
