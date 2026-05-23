import { useState } from 'react'
import { calculateBaZi, getShiChen } from '../lib/bazi'
import type { BaZiResult } from '../lib/bazi'

interface Props {
  onResult: (result: BaZiResult) => void
}

export default function BaZiForm({ onResult }: Props) {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('12')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    const h = parseInt(hour)

    if (!year || !month || !day) {
      setError('请填写完整的出生日期')
      return
    }

    if (y < 1900 || y > 2100) {
      setError('仅支持1900-2100年')
      return
    }

    if (m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 23) {
      setError('日期或时间不合法')
      return
    }

    setLoading(true)
    try {
      const result = calculateBaZi(y, m, d, h)
      onResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算出错')
    } finally {
      setLoading(false)
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, '0')}:00 - ${getShiChen(i)}`
  }))

  return (
    <div className="mt-6 p-6 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20 shadow-xl shadow-black/30 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-[#D4A853] mb-6 tracking-wider text-center">
        输入出生信息
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 年月日 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[#8a7a5a] mb-1.5 tracking-wider">年</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder="1990"
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a1a]/60 border border-[#D4A853]/20 
                text-[#e8d8b8] text-sm placeholder-[#4a3a2a]/60
                focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-[#D4A853]/20
                transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a7a5a] mb-1.5 tracking-wider">月</label>
            <input
              type="number"
              value={month}
              onChange={e => setMonth(e.target.value)}
              placeholder="1"
              min={1}
              max={12}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a1a]/60 border border-[#D4A853]/20 
                text-[#e8d8b8] text-sm placeholder-[#4a3a2a]/60
                focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-[#D4A853]/20
                transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a7a5a] mb-1.5 tracking-wider">日</label>
            <input
              type="number"
              value={day}
              onChange={e => setDay(e.target.value)}
              placeholder="1"
              min={1}
              max={31}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a1a]/60 border border-[#D4A853]/20 
                text-[#e8d8b8] text-sm placeholder-[#4a3a2a]/60
                focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-[#D4A853]/20
                transition-all duration-300"
            />
          </div>
        </div>

        {/* 时辰 */}
        <div>
          <label className="block text-xs text-[#8a7a5a] mb-1.5 tracking-wider">出生时辰</label>
          <select
            value={hour}
            onChange={e => setHour(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a1a]/60 border border-[#D4A853]/20 
              text-[#e8d8b8] text-sm
              focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-[#D4A853]/20
              transition-all duration-300 appearance-none cursor-pointer"
          >
            {hours.map(h => (
              <option key={h.value} value={h.value} className="bg-[#0a0a1a] text-[#e8d8b8]">
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-red-400 text-xs text-center py-2 bg-red-900/20 rounded-lg border border-red-900/30">
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#B8860B] 
            text-[#0a0a1a] font-semibold text-sm tracking-wider
            hover:from-[#e0b860] hover:to-[#c8940a]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 shadow-lg shadow-[#D4A853]/20 cursor-pointer"
        >
          {loading ? '🔮 推演中...' : '🔮 开始排盘'}
        </button>
      </form>

      {/* 装饰文字 */}
      <div className="mt-6 text-center text-[#3a2a1a] text-xs tracking-[0.3em] select-none font-serif">
        天 地 玄 黄 · 宇 宙 洪 荒
      </div>
    </div>
  )
}
