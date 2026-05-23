/**
 * 命理镜 - 八字排盘核心算法
 * 
 * 功能: 农历转换 / 四柱排盘 / 五行分析 / 十神分析
 * 支持: 1900-2100年
 */

// ====== 基本数据 ======

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI   = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const _WU_XING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水', '木', '木', '土', '火', '火', '土', '金', '金', '水', '水', '土']
const SHI_CHEN_NAME = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
const SHI_CHEN_RANGE = [
  '23:00-00:59', '01:00-02:59', '03:00-04:59', '05:00-06:59',
  '07:00-08:59', '09:00-10:59', '11:00-12:59', '13:00-14:59',
  '15:00-16:59', '17:00-18:59', '19:00-20:59', '21:00-22:59'
]

const TIAN_GAN_WU_XING: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

const _DI_ZHI_WU_XING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木',
  '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金',
  '酉': '金', '戌': '土', '亥': '水'
}

const TIAN_GAN_YIN_YANG: Record<string, string> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴'
}

const _DI_ZHI_YIN_YANG: Record<string, string> = {
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴',
  '辰': '阳', '巳': '阴', '午': '阳', '未': '阴',
  '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
}

const ZANG_GAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
}

const SHI_SHEN_MAP: Record<string, Record<string, string>> = {
  '木':  { '木': '比肩', '火': '食神', '土': '偏财', '金': '正官', '水': '偏印' },
  '火':  { '木': '正印', '火': '比肩', '土': '食神', '金': '偏财', '水': '正官' },
  '土':  { '木': '正官', '火': '正印', '土': '比肩', '金': '食神', '水': '偏财' },
  '金':  { '木': '偏财', '火': '正官', '土': '正印', '金': '比肩', '水': '食神' },
  '水':  { '木': '食神', '火': '偏财', '土': '正官', '金': '正印', '水': '比肩' }
}

// 阴阳区分十神
function getShiShen(riGan: string, otherGan: string): string {
  const riWx = TIAN_GAN_WU_XING[riGan]
  const otWx = TIAN_GAN_WU_XING[otherGan]
  const riYy = TIAN_GAN_YIN_YANG[riGan]
  const otYy = TIAN_GAN_YIN_YANG[otherGan]
  const base = SHI_SHEN_MAP[riWx]?.[otWx] || ''
  if (!base) return ''

  // 阴阳相同 = 偏, 不同 = 正
  const isSameYy = riYy === otYy
  if (base === '比肩') return isSameYy ? '比肩' : '劫财'
  if (base === '食神') return isSameYy ? '食神' : '伤官'
  if (base === '偏财') return isSameYy ? '偏财' : '正财'
  if (base === '正官') return isSameYy ? '七杀' : '正官'
  if (base === '偏印') return isSameYy ? '偏印' : '正印'
  return base
}

// ====== 农历数据表 (1900-2100) ======
// 编码方式: 
// bits 0-3: 闰月数(0=无闰月)
// bits 4-15: 12位, 每位代表一个月1=30天/0=29天
// bits 16-19: 闰月天数 1=30天/0=29天
// bits 20-31: 闰月后月份大小 (仅当有闰月时)
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x0aa50, 0x1aa54, 0x06ae0, // 2050-2059
  0x0a6e0, 0x093e0, 0x0d8e0, 0x0d8a0, 0x1da55, 0x0d550, 0x056a0, 0x1a5b4, 0x0a5d0, 0x092d0, // 2060-2069
  0x0d2b5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, // 2070-2079
  0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, // 2080-2089
  0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, // 2090-2099
  0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0  // 2100-2104
]

// 节气近似日期表 (每月节气的近似日, 1900-2100)
// [month][year] -> 节气日 (立春/惊蛰/清明/立夏/芒种/小暑/立秋/白露/寒露/立冬/大雪/小寒)
// 简化处理: 用近似公式计算
function getSolarTermDay(year: number, termIndex: number): number {
  // termIndex: 0=小寒,1=大寒,2=立春,3=雨水,4=惊蛰,5=春分,6=清明,7=谷雨,
  //            8=立夏,9=小满,10=芒种,11=夏至,12=小暑,13=大暑,14=立秋,
  //            15=处暑,16=白露,17=秋分,18=寒露,19=霜降,20=立冬,21=小雪,
  //            22=大雪,23=冬至
  // 简化公式: 基于天文计算的近似值
  const termDays = [
    5.4055 + 0.000242 * (year - 1900) - 0.0000003 * (year - 1900) * (year - 1900),  // 小寒
    20.1200 + 0.000242 * (year - 1900),  // 大寒
    4.1743 + 0.000242 * (year - 1900) - 0.0000003 * (year - 1900) * (year - 1900),  // 立春
    18.7058 + 0.000242 * (year - 1900) + 0.0000003 * (year - 1900) * (year - 1900),  // 雨水
    5.8733 + 0.000242 * (year - 1900) + 0.0000005 * (year - 1900) * (year - 1900),  // 惊蛰
    20.3678 + 0.000242 * (year - 1900),  // 春分
    5.3649 + 0.000242 * (year - 1900),  // 清明
    20.9318 + 0.000242 * (year - 1900),  // 谷雨
    6.1048 + 0.000242 * (year - 1900),  // 立夏
    21.1924 + 0.000242 * (year - 1900),  // 小满
    5.8153 + 0.000242 * (year - 1900),  // 芒种
    21.5339 + 0.000242 * (year - 1900),  // 夏至
    7.1432 + 0.000242 * (year - 1900),  // 小暑
    22.2836 + 0.000242 * (year - 1900),  // 大暑
    7.9025 + 0.000242 * (year - 1900),  // 立秋
    23.2450 + 0.000242 * (year - 1900),  // 处暑
    7.5550 + 0.000242 * (year - 1900),  // 白露
    22.9450 + 0.000242 * (year - 1900),  // 秋分
    8.2640 + 0.000242 * (year - 1900),  // 寒露
    23.5850 + 0.000242 * (year - 1900),  // 霜降
    7.9075 + 0.000242 * (year - 1900),  // 立冬
    22.4250 + 0.000242 * (year - 1900),  // 小雪
    7.1432 + 0.000242 * (year - 1900),  // 大雪
    22.0836 + 0.000242 * (year - 1900),  // 冬至
  ]
  
  return Math.floor(termDays[termIndex])
}

// 月份对应的节(月柱变化依据)
const _MONTH_JIE_INDEX = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0] // 立春,惊蛰,清明,立夏,芒种,小暑,立秋,白露,寒露,立冬,大雪,小寒

// ====== 核心算法 ======

/** 公历日期转农历 */
export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number
  lunarMonth: number
  lunarDay: number
  isLeap: boolean
} {
  if (year < 1900 || year > 2100) {
    throw new Error('仅支持1900-2100年')
  }

  // 以1900年1月31日(农历1900年正月初一)为基准
  const baseDate = new Date(1900, 0, 31) // Jan 31, 1900
  const targetDate = new Date(year, month - 1, day)
  const offset = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000)

  if (offset < 0) {
    throw new Error('日期超出范围')
  }

  let lunarYear = 1900
  let daysLeft = offset

  // 逐月计算
  for (let y = 0; y < LUNAR_INFO.length; y++) {
    const yearInfo = LUNAR_INFO[y]
    const leapMonth = yearInfo & 0xf
    let totalDays = 0

    // 计算普通月份天数
    for (let m = 0; m < 12; m++) {
      if ((yearInfo >> (4 + m)) & 1) totalDays += 30
      else totalDays += 29
    }

    // 加闰月天数
    const leapDays = leapMonth > 0 ? (((yearInfo >> 16) & 1) ? 30 : 29) : 0
    totalDays += leapDays

    if (daysLeft < totalDays) {
      lunarYear = 1900 + y
      
      // 算出当前月份
      let accDays = 0
      let _lunarMonth = 1
      let _isLeap = false
      
      for (let m = 0; m < 12; m++) {
        const monthDays = ((yearInfo >> (4 + m)) & 1) ? 30 : 29
        if (daysLeft < accDays + monthDays) {
          return {
            lunarYear,
            lunarMonth: m + 1,
            lunarDay: daysLeft - accDays + 1,
            isLeap: false
          }
        }
        accDays += monthDays
        
        // 处理闰月
        if (leapMonth > 0 && (m + 1) === leapMonth) {
          const leapDays2 = ((yearInfo >> 16) & 1) ? 30 : 29
          if (daysLeft < accDays + leapDays2) {
            return {
              lunarYear,
              lunarMonth: m + 1,
              lunarDay: daysLeft - accDays + 1,
              isLeap: true
            }
          }
          accDays += leapDays2
        }
      }
      
      // 应该不会到这里
      return {
        lunarYear,
        lunarMonth: 12,
        lunarDay: 1,
        isLeap: false
      }
    }
    
    daysLeft -= totalDays
  }

  throw new Error('日期超出范围')
}

/** 计算日柱 (日干支序号 0-59) */
function getDayGanZhiIndex(year: number, month: number, day: number): number {
  // 基准: 1900年1月1日 = 甲午日 (干支序号30)
  const baseDate = new Date(1900, 0, 1)
  const targetDate = new Date(year, month - 1, day)
  const offset = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000)
  return ((30 + offset) % 60 + 60) % 60
}

/** 获取年柱 (根据立春分界) */
function getYearGanZhi(year: number, month: number, day: number): { gan: string; zhi: string; index: number } {
  // 立春日之前算上一年
  const liChunDay = getSolarTermDay(year, 2) // 立春是第2个节气
  let effectiveYear = year
  if (month < 2 || (month === 2 && day < liChunDay)) {
    effectiveYear = year - 1
  }
  const gan = (effectiveYear - 4) % 10
  const zhi = (effectiveYear - 4) % 12
  return {
    gan: TIAN_GAN[(gan + 10) % 10],
    zhi: DI_ZHI[(zhi + 12) % 12],
    index: ((effectiveYear - 4) % 60 + 60) % 60
  }
}

/** 获取月柱 (根据节气) */
function getMonthGanZhi(year: number, month: number, day: number, yearGan: string): { gan: string; zhi: string } {
  // 确定月支 (根据节气)
  let monthZhi: number
  const yearGanIdx = TIAN_GAN.indexOf(yearGan)
  
  // 根据节气判断月柱地支
  if (month === 1) {
    const daHan = getSolarTermDay(year - 1, 23) // 大寒
    if (day >= daHan) monthZhi = 11 // 丑月
    else monthZhi = 11 // 丑月从上一年小寒开始
  } else {
    // 查找当月对应的节
    // 节: 立春(2月), 惊蛰(3月), 清明(4月), 立夏(5月), 芒种(6月), 
    //     小暑(7月), 立秋(8月), 白露(9月), 寒露(10月), 立冬(11月), 大雪(12月), 小寒(1月)
    const jieMap: Record<number, { jieIdx: number; diZhi: number }> = {
      2:  { jieIdx: 2,  diZhi: 2 },  // 立春 -> 寅
      3:  { jieIdx: 4,  diZhi: 3 },  // 惊蛰 -> 卯
      4:  { jieIdx: 6,  diZhi: 4 },  // 清明 -> 辰
      5:  { jieIdx: 8,  diZhi: 5 },  // 立夏 -> 巳
      6:  { jieIdx: 10, diZhi: 6 },  // 芒种 -> 午
      7:  { jieIdx: 12, diZhi: 7 },  // 小暑 -> 未
      8:  { jieIdx: 14, diZhi: 8 },  // 立秋 -> 申
      9:  { jieIdx: 16, diZhi: 9 },  // 白露 -> 酉
      10: { jieIdx: 18, diZhi: 10 }, // 寒露 -> 戌
      11: { jieIdx: 20, diZhi: 11 }, // 立冬 -> 亥
      12: { jieIdx: 22, diZhi: 0 },  // 大雪 -> 子
    }
    
    const map = jieMap[month]
    if (map) {
      const jieDay = getSolarTermDay(year, map.jieIdx)
      if (day >= jieDay) {
        monthZhi = map.diZhi
      } else {
        monthZhi = map.diZhi - 1
        if (monthZhi < 0) monthZhi = 11
      }
    } else {
      // 1月: 丑月(小寒之后)
      monthZhi = 11
    }
  }

  // 五虎遁: 根据年干推算月干
  // 甲己之年丙作首, 乙庚之岁戊为头, 丙辛必定寻庚起, 
  // 丁壬壬位顺行流, 若问戊癸何方发, 甲寅之上好追求
  const monthGanStarts = [2, 4, 6, 8, 0] // 丙戊庚壬甲
  const yearGanGroup = Math.floor(yearGanIdx / 2) % 5
  const monthGan = (monthGanStarts[yearGanGroup] + monthZhi) % 10

  return { gan: TIAN_GAN[monthGan], zhi: DI_ZHI[monthZhi] }
}

/** 获取日柱 */
function getDayGanZhi(year: number, month: number, day: number): { gan: string; zhi: string; index: number } {
  const index = getDayGanZhiIndex(year, month, day)
  return {
    gan: TIAN_GAN[index % 10],
    zhi: DI_ZHI[index % 12],
    index
  }
}

/** 获取时柱 */
function getHourGanZhi(dayGan: string, hour: number): { gan: string; zhi: string } {
  // 确定时支: 23-1=子(0), 1-3=丑(1), 3-5=寅(2) ...
  const hourZhi = Math.floor(((hour + 1) % 24) / 2)

  // 五鼠遁: 根据日干推算时干
  // 甲己还加甲, 乙庚丙作初, 丙辛从戊起, 丁壬庚子居, 戊癸何方发, 壬子是真途
  const dayGanIdx = TIAN_GAN.indexOf(dayGan)
  const hourStarts = [0, 2, 4, 6, 8] // 甲丙戊庚壬
  const startGroup = Math.floor(dayGanIdx / 2) % 5
  const hourGan = (hourStarts[startGroup] + hourZhi) % 10

  return { gan: TIAN_GAN[hourGan], zhi: DI_ZHI[hourZhi] }
}

// ====== 公开接口 ======

export interface BaZiResult {
  yearGan: string
  yearZhi: string
  monthGan: string
  monthZhi: string
  dayGan: string
  dayZhi: string
  hourGan: string
  hourZhi: string
  shengXiao: string
  riZhu: string  // 日主(日干五行+阴阳)
  riZhuWuXing: string
  riZhuYinYang: string
  yearNaYin: string
  monthNaYin: string
  dayNaYin: string
  hourNaYin: string
  shiShen: string[]  // 四柱十神
  cangGan: string[][]  // 藏干
  wuXingTongJi: Record<string, number>  // 五行统计
  wuXingQue: string[]  // 缺失五行
  xiYong: string[]  // 喜用神
  jiShen: string[]  // 忌神
  summary: string  // 简评
  birthInfo: {
    year: number
    month: number
    day: number
    hour: number
    lunarMonth: number
    lunarDay: number
    isLeap: boolean
  }
}

const NAYIN_MAP: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

function getNaYin(gan: string, zhi: string): string {
  return NAYIN_MAP[gan + zhi] || ''
}

/** 生辰八字主分析 */
export function calculateBaZi(birthYear: number, birthMonth: number, birthDay: number, birthHour: number): BaZiResult {
  const lunar = solarToLunar(birthYear, birthMonth, birthDay)

  // 排四柱
  const yearPillar = getYearGanZhi(birthYear, birthMonth, birthDay)
  const monthPillar = getMonthGanZhi(birthYear, birthMonth, birthDay, yearPillar.gan)
  const dayPillar = getDayGanZhi(birthYear, birthMonth, birthDay)
  const hourPillar = getHourGanZhi(dayPillar.gan, birthHour)

  // 日主
  const riZhuWuXing = TIAN_GAN_WU_XING[dayPillar.gan]
  const riZhuYinYang = TIAN_GAN_YIN_YANG[dayPillar.gan]

  // 生肖
  const shengXiao = SHENG_XIAO[DI_ZHI.indexOf(yearPillar.zhi)]

  // 纳音
  const yearNaYin = getNaYin(yearPillar.gan, yearPillar.zhi)
  const monthNaYin = getNaYin(monthPillar.gan, monthPillar.zhi)
  const dayNaYin = getNaYin(dayPillar.gan, dayPillar.zhi)
  const hourNaYin = getNaYin(hourPillar.gan, hourPillar.zhi)

  // 藏干
  const cangGan = [
    ZANG_GAN[yearPillar.zhi] || [],
    ZANG_GAN[monthPillar.zhi] || [],
    ZANG_GAN[dayPillar.zhi] || [],
    ZANG_GAN[hourPillar.zhi] || [],
  ]

  // 十神
  const allGan = [yearPillar.gan, monthPillar.gan, dayPillar.gan, hourPillar.gan]
  const shiShen = allGan.map(g => getShiShen(dayPillar.gan, g))
  
  // 五行统计 (日柱为主)
  const wuXingTongJi: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  
  // 统计天干五行
  for (const g of allGan) {
    const wx = TIAN_GAN_WU_XING[g]
    if (wx) wuXingTongJi[wx]++
  }
  
  // 统计藏干五行
  for (const cgArr of cangGan) {
    for (const cg of cgArr) {
      const wx = TIAN_GAN_WU_XING[cg]
      if (wx) wuXingTongJi[wx] += 0.5 // 藏干权重减半
    }
  }

  // 缺失五行
  const wuXingQue = Object.entries(wuXingTongJi)
    .filter(([_, v]) => v === 0)
    .map(([k]) => k)

  // 喜用神/忌神 (简化: 根据日主五行生克和全局判断)
  const riZhuWx = TIAN_GAN_WU_XING[dayPillar.gan]
  const xiYong: string[] = []
  const jiShen: string[] = []
  
  // 生我者为印(喜), 我克者为财(喜)
  const wuxingCycle = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水', '木']
  const riZhuIdx = wuxingCycle.indexOf(riZhuWx)
  
  // 喜: 生我的和我生的
  const shengWo = wuxingCycle[(riZhuIdx + 0) % 10]
  const woSheng = wuxingCycle[(riZhuIdx + 2) % 10]
  if (!xiYong.includes(shengWo)) xiYong.push(shengWo)
  if (!xiYong.includes(woSheng)) xiYong.push(woSheng)
  
  // 忌: 克我的
  const keWo = wuxingCycle[(riZhuIdx + 4) % 10]
  if (!jiShen.includes(keWo)) jiShen.push(keWo)

  // 根据缺失五行补充喜用
  if (wuXingQue.length > 0) {
    for (const q of wuXingQue) {
      if (!xiYong.includes(q)) xiYong.push(q)
    }
  }
  
  // 调整: 如果喜用和忌神有重叠
  const finalXiYong = xiYong.filter(x => !jiShen.includes(x))
  const finalJiShen = jiShen.filter(j => !finalXiYong.includes(j) && j !== riZhuWx)

  // 生成简评
  const summary = generateSummary(dayPillar.gan, riZhuWx, riZhuYinYang, wuXingTongJi, finalXiYong, finalJiShen)

  return {
    yearGan: yearPillar.gan,
    yearZhi: yearPillar.zhi,
    monthGan: monthPillar.gan,
    monthZhi: monthPillar.zhi,
    dayGan: dayPillar.gan,
    dayZhi: dayPillar.zhi,
    hourGan: hourPillar.gan,
    hourZhi: hourPillar.zhi,
    shengXiao,
    riZhu: `${dayPillar.gan}${riZhuWuXing}${riZhuYinYang}`,
    riZhuWuXing,
    riZhuYinYang,
    yearNaYin,
    monthNaYin,
    dayNaYin,
    hourNaYin,
    shiShen,
    cangGan,
    wuXingTongJi,
    wuXingQue,
    xiYong: finalXiYong,
    jiShen: finalJiShen,
    summary,
    birthInfo: {
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour: birthHour,
      lunarMonth: lunar.lunarMonth,
      lunarDay: lunar.lunarDay,
      isLeap: lunar.isLeap
    }
  }
}

/** 生成命理评语 */
function generateSummary(
  dayGan: string,
  wuXing: string,
  yinYang: string,
  tongJi: Record<string, number>,
  xiYong: string[],
  jiShen: string[]
): string {
  const riZhuDesc: Record<string, string> = {
    '甲': '甲木参天，栋梁之材。性格正直仁厚，有领导才能，但易刚愎自用。',
    '乙': '乙木柔韧，附阴而生。性格温和灵活，善于应变，但缺乏决断力。',
    '丙': '丙火如日，光明磊落。性格热情奔放，慷慨大方，但易焦躁冲动。',
    '丁': '丁火如灯，内敛含蓄。性格细腻温和，思虑周全，但易多疑忧虑。',
    '戊': '戊土厚重，信义为本。性格稳重踏实，言出必行，但易固执保守。',
    '己': '己土肥沃，包容万物。性格宽厚仁慈，善于包容，但易优柔寡断。',
    '庚': '庚金锋锐，刚毅果断。性格坚强勇敢，有魄力，但易锋芒太露。',
    '辛': '辛金珠玉，精致细腻。性格聪慧敏感，追求完美，但易斤斤计较。',
    '壬': '壬水浩荡，智慧深远。性格机智灵活，心胸宽广，但易善变不定。',
    '癸': '癸水润物，思维缜密。性格温柔含蓄，足智多谋，但易阴郁内敛。'
  }

  let summary = riZhuDesc[dayGan] || ''
  summary += `\n● 日主为${dayGan}${wuXing}${yinYang}命。`
  
  // 五行强弱判断
  const maxWx = Object.entries(tongJi).sort((a, b) => b[1] - a[1])[0]
  
  // 计算缺失五行
  const wuXingQue = Object.entries(tongJi)
    .filter(([_, v]) => v === 0)
    .map(([k]) => k)
  
  if (maxWx[1] > 2) {
    summary += `\n● ${wuXing}命格局，${maxWx[0]}气较旺。`
  } else if (maxWx[1] >= 1.5) {
    summary += `\n● 五行基本平衡，${maxWx[0]}气稍旺。`
  } else {
    summary += `\n● 五行均衡，气质中和。`
  }

  if (wuXingQue.length > 0) {
    summary += `\n● 命缺${wuXingQue.join('、')}，需${xiYong.join('、')}补益。`
  }

  summary += `\n● 喜用神: ${xiYong.join('、')}，忌神: ${jiShen.join('、')}。`
  summary += `\n● 宜从事与${xiYong.join('、')}相关的行业，避开${jiShen.join('、')}属性的事务。`

  return summary
}

/** 获取出生时辰 */
export function getShiChen(hour: number): string {
  const idx = Math.floor(((hour + 1) % 24) / 2)
  return `${SHI_CHEN_NAME[idx]} (${SHI_CHEN_RANGE[idx]})`
}

/** 获取时辰地支索引 */
export function getShiChenIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2)
}

/** 八字字符串 */
export function formatBaZi(result: BaZiResult): string {
  return `${result.yearGan}${result.yearZhi} ${result.monthGan}${result.monthZhi} ${result.dayGan}${result.dayZhi} ${result.hourGan}${result.hourZhi}`
}
