import type { BaZiResult } from '../lib/bazi'
import { formatBaZi } from '../lib/bazi'

interface Props {
  result: BaZiResult
}

const WU_XING_COLORS: Record<string, string> = {
  '金': 'text-yellow-300',
  '木': 'text-green-300',
  '水': 'text-blue-300',
  '火': 'text-red-300',
  '土': 'text-yellow-600',
}

const _WU_XING_BG: Record<string, string> = {
  '金': 'bg-yellow-900/30 border-yellow-700/40',
  '木': 'bg-green-900/30 border-green-700/40',
  '水': 'bg-blue-900/30 border-blue-700/40',
  '火': 'bg-red-900/30 border-red-700/40',
  '土': 'bg-yellow-900/30 border-yellow-700/40',
}

export default function BaZiResult({ result }: Props) {
  const pillars = [
    { label: '年柱', gan: result.yearGan, zhi: result.yearZhi, shiShen: result.shiShen[0], cangGan: result.cangGan[0] },
    { label: '月柱', gan: result.monthGan, zhi: result.monthZhi, shiShen: result.shiShen[1], cangGan: result.cangGan[1] },
    { label: '日柱', gan: result.dayGan, zhi: result.dayZhi, shiShen: result.shiShen[2], cangGan: result.cangGan[2] },
    { label: '时柱', gan: result.hourGan, zhi: result.hourZhi, shiShen: result.shiShen[3], cangGan: result.cangGan[3] },
  ]

  return (
    <div className="mt-6 space-y-5 animate-fadeIn">
      {/* 八字牌匾 */}
      <div className="p-6 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20 
        shadow-xl shadow-black/30 backdrop-blur-sm">
        
        {/* 八字大字 */}
        <div className="text-center mb-4">
          <div className="text-3xl md:text-4xl font-bold tracking-[0.15em] text-[#F0D68A] font-serif">
            {formatBaZi(result)}
          </div>
          <div className="text-[#8a7a5a] text-xs mt-2 tracking-wider">
            {result.shengXiao}年 · {result.riZhu}命
          </div>
        </div>

        {/* 四柱表格 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {pillars.map(p => (
            <div key={p.label} className="text-center">
              {/* 柱名 */}
              <div className="text-[#8a7a5a] text-xs mb-2 tracking-wider">{p.label}</div>
              {/* 天干 */}
              <div className="text-2xl font-bold text-[#e8d8b8] mb-1">{p.gan}</div>
              {/* 十神 */}
              <div className="text-[10px] text-[#D4A853]/70 mb-1">{p.shiShen}</div>
              <div className="border-t border-[#D4A853]/20 my-1" />
              {/* 地支 */}
              <div className="text-2xl font-bold text-[#e8d8b8] mb-1">{p.zhi}</div>
              {/* 藏干 */}
              <div className="text-[10px] text-[#6a5a4a] space-x-1">
                {p.cangGan.map((cg, i) => (
                  <span key={i}>{cg}</span>
                ))}
              </div>
              <div className="border-t border-[#D4A853]/10 my-1" />
              {/* 纳音 */}
              <div className="text-[9px] text-[#5a4a3a]">
                {result.yearNaYin}
              </div>
            </div>
          ))}
        </div>

        {/* 日主信息 */}
        <div className="text-center text-xs text-[#6a5a4a]">
          日主 <span className="text-[#D4A853]">{result.dayGan}</span> 为{result.riZhuWuXing}命 · {result.riZhuYinYang}性
        </div>
      </div>

      {/* 五行分析 */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20 
        shadow-xl shadow-black/30 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-[#D4A853] mb-4 tracking-wider text-center">
          五行平衡
        </h3>
        <div className="space-y-2">
          {Object.entries(result.wuXingTongJi).map(([wx, count]) => (
            <div key={wx} className="flex items-center gap-3">
              <span className={`w-6 text-center text-sm font-bold ${WU_XING_COLORS[wx]}`}>{wx}</span>
              <div className="flex-1 h-4 rounded-full bg-[#0a0a1a]/60 border border-[#D4A853]/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    wx === '金' ? 'bg-gradient-r from-yellow-700/60 to-yellow-500/40' :
                    wx === '木' ? 'bg-gradient-r from-green-700/60 to-green-500/40' :
                    wx === '水' ? 'bg-gradient-r from-blue-700/60 to-blue-500/40' :
                    wx === '火' ? 'bg-gradient-r from-red-700/60 to-red-500/40' :
                    'bg-gradient-r from-yellow-800/60 to-yellow-600/40'
                  }`}
                  style={{ width: `${Math.min(count / 3 * 100, 100)}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-[#8a7a5a]">{count.toFixed(1)}</span>
            </div>
          ))}
        </div>

        {result.wuXingQue.length > 0 && (
          <div className="mt-3 text-xs text-center text-red-400/70">
            命缺{result.wuXingQue.map(w => `${w}`).join('、')}
          </div>
        )}
      </div>

      {/* 喜用神/忌神 */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20 
        shadow-xl shadow-black/30 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-[#D4A853] mb-4 tracking-wider text-center">
          喜用 & 忌神
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-green-900/10 border border-green-700/20">
            <div className="text-green-400 text-xs mb-1">喜用神</div>
            <div className="text-lg font-bold text-green-300">
              {result.xiYong.join('、')}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-red-900/10 border border-red-700/20">
            <div className="text-red-400 text-xs mb-1">忌神</div>
            <div className="text-lg font-bold text-red-300">
              {result.jiShen.join('、')}
            </div>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-[#8a7a5a]">
          宜从事与 {result.xiYong.join('、')} 相关的行业
        </div>
      </div>

      {/* 命理评语 */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20 
        shadow-xl shadow-black/30 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-[#D4A853] mb-3 tracking-wider text-center">
          命理解读
        </h3>
        <div className="text-xs text-[#c8b898] leading-relaxed whitespace-pre-line">
          {result.summary}
        </div>
      </div>
    </div>
  )
}
