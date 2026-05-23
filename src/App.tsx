import { useState } from 'react'
import BaZiForm from './components/BaZiForm'
import BaZiResult from './components/BaZiResult'
import PalmReading from './components/PalmReading'
import type { BaZiResult as BaZiResultType } from './lib/bazi'

type Tab = 'bazi' | 'palm'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('bazi')
  const [result, setResult] = useState<BaZiResultType | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2a] to-[#1a0a0a]">
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4A853] to-transparent opacity-50" />
      
      {/* 头部 */}
      <header className="relative pt-8 pb-4 px-4 text-center">
        <div className="inline-block">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider">
            <span className="bg-gradient-to-r from-[#F0D68A] via-[#D4A853] to-[#B8860B] bg-clip-text text-transparent">
              命理镜
            </span>
          </h1>
          <p className="text-[#8a7a5a] text-sm mt-1 tracking-widest">
            八字排盘 · 手相解析
          </p>
        </div>
        <div className="absolute top-0 right-4 text-[#D4A853]/10 text-8xl select-none font-serif leading-none">
          命
        </div>
      </header>

      {/* Tab 切换 */}
      <div className="flex justify-center gap-1 px-4 mt-2">
        <button
          onClick={() => setActiveTab('bazi')}
          className={`px-6 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'bazi'
              ? 'bg-gradient-to-b from-[#1a1520] to-[#0f0f2a] text-[#D4A853] border-b-2 border-[#D4A853] shadow-lg shadow-[#D4A853]/5'
              : 'text-[#6a5a4a] hover:text-[#8a7a5a] hover:bg-[#1a1520]/50'
          }`}
        >
          🏛 生辰八字
        </button>
        <button
          onClick={() => setActiveTab('palm')}
          className={`px-6 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'palm'
              ? 'bg-gradient-to-b from-[#1a1520] to-[#0f0f2a] text-[#D4A853] border-b-2 border-[#D4A853] shadow-lg shadow-[#D4A853]/5'
              : 'text-[#6a5a4a] hover:text-[#8a7a5a] hover:bg-[#1a1520]/50'
          }`}
        >
          ✋ 手相解析
        </button>
      </div>

      {/* 内容区 */}
      <div className="px-4 pb-12">
        {activeTab === 'bazi' && (
          <div className="max-w-lg mx-auto">
            {!result ? (
              <BaZiForm onResult={setResult} />
            ) : (
              <div className="space-y-4">
                <BaZiResult result={result} />
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-2.5 rounded-lg border border-[#D4A853]/30 text-[#D4A853] text-sm 
                    hover:bg-[#D4A853]/10 transition-all duration-300 cursor-pointer"
                >
                  重新排盘
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'palm' && (
          <div className="max-w-lg mx-auto">
            <PalmReading />
          </div>
        )}
      </div>

      {/* 底部 */}
      <footer className="text-center pb-6 text-[#4a3a2a] text-xs tracking-wider">
        命理镜 · 仅供娱乐参考
      </footer>
    </div>
  )
}

export default App
