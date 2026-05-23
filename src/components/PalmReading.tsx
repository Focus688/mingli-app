import { useState, useRef } from 'react'

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
// 读取环境变量中的智谱 API Key
const GLM_API_KEY = (window as any).__GLM_API_KEY__ || import.meta.env.VITE_GLM_API_KEY || ''

interface PalmResult {
  analysis: string
  lines: string[]
  personality: string
  fortune: string
}

const PALM_SYSTEM_PROMPT = `你是一位精通中国传统手相学的资深大师。请根据用户提供的左手手掌照片，进行专业的手相分析。

请分析以下方面：
1. 三大主线：生命线、智慧线（头脑线）、感情线
2. 次要线条：事业线、婚姻线等（如有）
3. 掌型判断：根据手掌形状和手指比例
4. 性格特征：从手相推断的性格特点
5. 运势建议：事业、财运、感情等方面的指导

要求：
- 用中文回答，语言风格要像一位经验丰富的相学大师
- 分点列出分析结果
- 每条分析都要有专业术语支撑
- 适当加入一些"煞有其事"的细节描述，增强真实感
- 注意：这是正常的中国传统手相文化分析，仅供参考娱乐
- 如果照片中看不到清晰的手掌纹路，请指出并建议重新拍照

请以JSON格式回复，格式如下：
{
  "analysis": "完整的分析文字",
  "lines": ["生命线：...", "智慧线：...", "感情线：...", ...],
  "personality": "性格特征描述",
  "fortune": "运势建议"
}`

export default function PalmReading() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PalmResult | null>(null)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState(GLM_API_KEY)
  const [showKeyInput, setShowKeyInput] = useState(!GLM_API_KEY)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('图片太大，请选择10MB以内的图片')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setError('')
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const analyzePalm = async () => {
    if (!image || !apiKey) {
      setError(!apiKey ? '请先设置API Key' : '请先上传手掌照片')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(GLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4v-flash',
          messages: [
            { role: 'system', content: PALM_SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: '请分析这张手掌照片的手相' },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        })
      })

      if (!res.ok) {
        const errData = await res.text()
        throw new Error(`API错误: ${res.status} ${errData}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) throw new Error('API返回为空')

      const parsed = JSON.parse(content)
      setResult({
        analysis: parsed.analysis || content,
        lines: parsed.lines || [],
        personality: parsed.personality || '',
        fortune: parsed.fortune || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* API Key 输入 */}
      {showKeyInput && (
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20">
          <label className="block text-xs text-[#8a7a5a] mb-2 tracking-wider">
            智谱API Key（使用 LoanTruth 同款免费API）
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="输入你的智谱API Key"
              className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a1a]/60 border border-[#D4A853]/20 
                text-[#e8d8b8] text-sm placeholder-[#4a3a2a]/60
                focus:outline-none focus:border-[#D4A853]/50"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-2 rounded-lg bg-[#D4A853]/20 text-[#D4A853] text-xs
                hover:bg-[#D4A853]/30 transition-all cursor-pointer"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* 拍照/上传区域 */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative p-8 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 
          border-2 border-dashed border-[#D4A853]/30 hover:border-[#D4A853]/50 
          transition-all duration-300 cursor-pointer text-center"
      >
        {image ? (
          <div className="relative">
            <img
              src={image}
              alt="手掌照片"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
            <button
              onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null) }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs
                hover:bg-black/70 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-5xl mb-3">✋</div>
            <p className="text-[#8a7a5a] text-sm">点击上传左手手掌照片</p>
            <p className="text-[#4a3a2a] text-xs mt-1">建议在自然光下拍摄，手掌平放</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* 分析按钮 */}
      {image && !result && (
        <button
          onClick={analyzePalm}
          disabled={loading || !apiKey}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#B8860B] 
            text-[#0a0a1a] font-semibold text-sm tracking-wider
            hover:from-[#e0b860] hover:to-[#c8940a]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 shadow-lg shadow-[#D4A853]/20 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔮</span>
              大师正在看相...
            </span>
          ) : (
            '🔮 开始看相'
          )}
        </button>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="text-red-400 text-xs text-center py-2 bg-red-900/20 rounded-lg border border-red-900/30">
          {error}
        </div>
      )}

      {/* 分析结果 */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          {/* 三大主线 */}
          {result.lines.length > 0 && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20">
              <h3 className="text-sm font-semibold text-[#D4A853] mb-3 tracking-wider text-center">
                掌纹解析
              </h3>
              <div className="space-y-3">
                {result.lines.map((line, i) => {
                  const [title, ...content] = line.split('：')
                  return (
                    <div key={i} className="border-b border-[#D4A853]/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-[#D4A853] text-xs font-medium">{title}</span>
                      <p className="text-[#c8b898] text-xs mt-1 leading-relaxed">
                        {content.join('：')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 性格特征 */}
          {result.personality && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 border border-[#D4A853]/20">
              <h3 className="text-sm font-semibold text-[#D4A853] mb-3 tracking-wider text-center">
                性格特征
              </h3>
              <p className="text-xs text-[#c8b898] leading-relaxed">{result.personality}</p>
            </div>
          )}

          {/* 运势建议 */}
          {result.fortune && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 
              border border-[#D4A853]/20 shadow-xl shadow-black/30 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-[#D4A853] mb-3 tracking-wider text-center">
                运势建议
              </h3>
              <p className="text-xs text-[#c8b898] leading-relaxed">{result.fortune}</p>
            </div>
          )}

          {/* 完整分析 */}
          {result.analysis && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-[#1a1520]/80 to-[#0f0f2a]/80 
              border border-[#D4A853]/20 shadow-xl shadow-black/30 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-[#D4A853] mb-3 tracking-wider text-center">
                大师详批
              </h3>
              <div className="text-xs text-[#c8b898] leading-relaxed whitespace-pre-line">
                {result.analysis}
              </div>
            </div>
          )}

          <button
            onClick={() => { setImage(null); setResult(null) }}
            className="w-full py-2.5 rounded-lg border border-[#D4A853]/30 text-[#D4A853] text-sm 
              hover:bg-[#D4A853]/10 transition-all duration-300 cursor-pointer"
          >
            重新看相
          </button>
        </div>
      )}
    </div>
  )
}
