'use client'

import { useState, useMemo } from 'react'
import { TreeMapNode, Stock } from '@/lib/dummyData'
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import AnimatedBar from './AnimatedBar'

interface ReportViewProps {
    data: TreeMapNode | null
}

type TimeRange = '1W' | '1M' | '1Y'
type ViewMode = 'single' | 'multi'

export default function ReportView({ data }: ReportViewProps) {
    const [searchQuery, setSearchQuery] = useState('S&P 500')
    const [timeRange, setTimeRange] = useState<TimeRange>('1W')
    const [viewMode, setViewMode] = useState<ViewMode>('single')
    const [selectedIndex, setSelectedIndex] = useState('S&P 500')
    const [selectedBar, setSelectedBar] = useState<any | null>(null)
    const [selectedDay, setSelectedDay] = useState<number | null>(null) // Track selected day index
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

    const handleDayClick = (index: number) => {
        setSelectedDay(index)
        setIsBottomSheetOpen(true)
    }

    // Flatten all stocks for search
    const allStocks = useMemo(() => {
        if (!data) return []
        const stocks: Stock[] = []
        const traverse = (node: TreeMapNode) => {
            if (node.type === 'stock' && node.data) {
                stocks.push(node.data)
            }
            if (node.children) {
                node.children.forEach(traverse)
            }
        }
        traverse(data)
        return stocks
    }, [data])

    // Filter stocks based on search or selected index
    const filteredStocks = useMemo(() => {
        if (viewMode === 'single') {
            // Single view: filter by search query (index name)
            const query = searchQuery.toLowerCase()
            return allStocks.filter(stock =>
                stock.index.toLowerCase().includes(query)
            )
        } else {
            // Multi view: filter by selected index
            return allStocks.filter(stock =>
                stock.index === selectedIndex
            )
        }
    }, [allStocks, searchQuery, selectedIndex, viewMode])

    // Aggregate data for change rate (등락률)
    const changeRateData = useMemo(() => {
        if (filteredStocks.length === 0) return []

        let aggregated: any[] = []

        if (timeRange === '1W') {
            aggregated = [
                { label: 'M', value: 0, count: 0, date: '', isToday: false },
                { label: 'T', value: 0, count: 0, date: '', isToday: false },
                { label: 'W', value: 0, count: 0, date: '', isToday: false },
                { label: 'T', value: 0, count: 0, date: '', isToday: false },
                { label: 'F', value: 0, count: 0, date: '', isToday: false },
            ]
        } else if (timeRange === '1M') {
            aggregated = [
                { label: 'W1', value: 0, count: 0, date: '' },
                { label: 'W2', value: 0, count: 0, date: '' },
                { label: 'W3', value: 0, count: 0, date: '' },
                { label: 'W4', value: 0, count: 0, date: '' },
            ]
        } else {
            aggregated = [
                { label: 'Q1', value: 0, count: 0, date: '' },
                { label: 'Q2', value: 0, count: 0, date: '' },
                { label: 'Q3', value: 0, count: 0, date: '' },
                { label: 'Q4', value: 0, count: 0, date: '' },
            ]
        }

        filteredStocks.forEach(stock => {
            if (!stock.history) return

            let historyData: any[] = []
            if (timeRange === '1W') historyData = stock.history.daily
            else if (timeRange === '1M') historyData = stock.history.weekly
            else historyData = stock.history.quarterly

            historyData.forEach((point, index) => {
                if (aggregated[index]) {
                    aggregated[index].value += point.value
                    aggregated[index].count += 1
                    aggregated[index].date = point.date
                    if (point.isToday) aggregated[index].isToday = true
                }
            })
        })

        return aggregated.map(item => ({
            ...item,
            value: item.count > 0 ? item.value / item.count : 0
        })).filter(item => item.count > 0)

    }, [filteredStocks, timeRange])

    // Aggregate data for volume (총거래량)
    const volumeData = useMemo(() => {
        if (filteredStocks.length === 0) return []

        let aggregated: any[] = []

        if (timeRange === '1W') {
            aggregated = [
                { label: 'M', value: 0, count: 0, date: '', isToday: false },
                { label: 'T', value: 0, count: 0, date: '', isToday: false },
                { label: 'W', value: 0, count: 0, date: '', isToday: false },
                { label: 'T', value: 0, count: 0, date: '', isToday: false },
                { label: 'F', value: 0, count: 0, date: '', isToday: false },
            ]
        } else if (timeRange === '1M') {
            aggregated = [
                { label: 'W1', value: 0, count: 0, date: '' },
                { label: 'W2', value: 0, count: 0, date: '' },
                { label: 'W3', value: 0, count: 0, date: '' },
                { label: 'W4', value: 0, count: 0, date: '' },
            ]
        } else {
            aggregated = [
                { label: 'Q1', value: 0, count: 0, date: '' },
                { label: 'Q2', value: 0, count: 0, date: '' },
                { label: 'Q3', value: 0, count: 0, date: '' },
                { label: 'Q4', value: 0, count: 0, date: '' },
            ]
        }

        // Simulate volume data based on stock value
        filteredStocks.forEach(stock => {
            if (!stock.history) return

            let historyData: any[] = []
            if (timeRange === '1W') historyData = stock.history.daily
            else if (timeRange === '1M') historyData = stock.history.weekly
            else historyData = stock.history.quarterly

            historyData.forEach((point, index) => {
                if (aggregated[index]) {
                    // Simulate volume based on stock value
                    const volumeValue = stock.value * (0.001 + Math.random() * 0.002)
                    aggregated[index].value += volumeValue
                    aggregated[index].count += 1
                    aggregated[index].date = point.date
                    if (point.isToday) aggregated[index].isToday = true
                }
            })
        })

        return aggregated.map(item => ({
            ...item,
            value: item.count > 0 ? item.value / item.count : 0
        })).filter(item => item.count > 0)

    }, [filteredStocks, timeRange])

    const maxAbsChangeRate = Math.max(...changeRateData.map(d => Math.abs(d.value)), 0.1)
    const maxAbsVolume = Math.max(...volumeData.map(d => Math.abs(d.value)), 0.1)

    // Calculate comment data for selected day
    const commentData = useMemo(() => {
        // Find the active day index (selectedDay or default based on timeRange)
        let activeDayIndex: number

        if (selectedDay !== null) {
            activeDayIndex = selectedDay
        } else {
            // For Week mode, use today's index
            // For Month/Year mode, use the last item (most recent week/quarter)
            if (timeRange === '1W') {
                activeDayIndex = changeRateData.findIndex(d => d.isToday)
            } else {
                // Use last item for Month (W4) and Year (Q4)
                activeDayIndex = changeRateData.length - 1
            }
        }

        if (activeDayIndex === -1 || !changeRateData[activeDayIndex]) {
            return null
        }

        const activeDay = changeRateData[activeDayIndex]
        const activeVolume = volumeData[activeDayIndex]

        // Calculate period averages
        const avgChangeRate = changeRateData.reduce((sum, d) => sum + d.value, 0) / changeRateData.length
        const avgVolume = volumeData.reduce((sum, d) => sum + d.value, 0) / volumeData.length

        // Calculate percentage differences
        const changeRateDiff = ((activeDay.value - avgChangeRate) / Math.abs(avgChangeRate)) * 100
        const volumeDiff = ((activeVolume.value - avgVolume) / avgVolume) * 100

        // Determine period text based on timeRange
        let periodText = '이번주'
        let unitText = '일'
        if (timeRange === '1M') {
            periodText = '이번달'
            unitText = '주'
        } else if (timeRange === '1Y') {
            periodText = '올해'
            unitText = '분기'
        }

        return {
            label: activeDay.label,
            date: activeDay.date,
            changeRate: activeDay.value,
            changeRateDiff,
            volume: activeVolume.value,
            volumeDiff,
            isToday: activeDay.isToday,
            periodText,
            unitText
        }
    }, [changeRateData, volumeData, selectedDay, timeRange])

    return (
        <div className="w-full h-full bg-slate-950 flex flex-col p-4 md:p-6 relative">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
                {viewMode === 'single' ? (
                    <>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search index..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-slate-900 border-slate-700 text-white focus-visible:ring-slate-600"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Select value={viewMode} onValueChange={(val: ViewMode) => setViewMode(val)}>
                                <SelectTrigger className="w-[120px] bg-slate-900 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                    <SelectItem value="single">단일 보기</SelectItem>
                                    <SelectItem value="multi">모아 보기</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
                                <SelectTrigger className="w-[120px] bg-slate-900 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                    <SelectItem value="1W">1 Week</SelectItem>
                                    <SelectItem value="1M">1 Month</SelectItem>
                                    <SelectItem value="1Y">1 Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-2 w-full justify-end">
                        <Select value={viewMode} onValueChange={(val: ViewMode) => setViewMode(val)}>
                            <SelectTrigger className="w-[120px] bg-slate-900 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="single">단일 보기</SelectItem>
                                <SelectItem value="multi">모아 보기</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedIndex} onValueChange={setSelectedIndex}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="S&P 500">S&P 500</SelectItem>
                                <SelectItem value="Nasdaq 100">Nasdaq 100</SelectItem>
                                <SelectItem value="Dow Jones">Dow Jones</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
                            <SelectTrigger className="w-[120px] bg-slate-900 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="1W">1 Week</SelectItem>
                                <SelectItem value="1M">1 Month</SelectItem>
                                <SelectItem value="1Y">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Outer Wrapper (no styles) */}
            <div>
                {/* Comment Box */}
                {commentData && (
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {commentData.isToday ? (
                                        timeRange === '1W' ? '오늘' :
                                            timeRange === '1M' ? '이번주' :
                                                '이번 분기'
                                    ) : commentData.label}의 시장 분석
                                </h3>
                                <div className="space-y-2 text-sm text-slate-300">
                                    <p>
                                        <span className="font-semibold text-orange-400">총거래량</span>은
                                        {commentData.periodText} 평균 대비 <span className={cn(
                                            "font-bold",
                                            commentData.volumeDiff > 0 ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {Math.abs(commentData.volumeDiff).toFixed(1)}% {commentData.volumeDiff > 0 ? '많아졌고' : '적어졌고'}
                                        </span>,
                                    </p>
                                    <p>
                                        <span className="font-semibold text-blue-400">가격 등락률</span>은
                                        평균 대비 <span className={cn(
                                            "font-bold",
                                            commentData.changeRateDiff > 0 ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {Math.abs(commentData.changeRateDiff).toFixed(1)}% {commentData.changeRateDiff > 0 ? '올랐습니다' : '내려갔습니다'}
                                        </span>.
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">
                                {commentData.date}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Wrapper with Legend */}
                <div className="relative bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    {/* Legend - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-4 text-sm z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-orange-500 rounded-full"></div>
                            <span className="text-slate-300">총거래량</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
                            <span className="text-slate-300">등락률</span>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 flex items-end justify-center gap-6 md:gap-10 pb-10 pt-8">
                        {changeRateData.map((bar, index) => {
                            const volumeBar = volumeData[index]

                            // Determine if this bar is active (same logic as commentData)
                            let isActive = false
                            if (selectedDay !== null) {
                                isActive = selectedDay === index
                            } else {
                                // For Week mode, check if it's today
                                // For Month/Year mode, check if it's the last item
                                if (timeRange === '1W') {
                                    isActive = bar.isToday
                                } else {
                                    isActive = index === changeRateData.length - 1
                                }
                            }

                            return (
                                <div key={index} className="flex gap-1 items-end">
                                    {/* Volume Bar (Orange) */}
                                    {volumeBar && (
                                        <AnimatedBar
                                            label={volumeBar.label}
                                            value={volumeBar.value}
                                            maxAbsValue={maxAbsVolume}
                                            color="orange"
                                            isToday={volumeBar.isToday}
                                            isActive={isActive}
                                            onClick={() => handleDayClick(index)}
                                        />
                                    )}

                                    {/* Change Rate Bar (Blue) */}
                                    <AnimatedBar
                                        label={bar.label}
                                        value={bar.value}
                                        maxAbsValue={maxAbsChangeRate}
                                        color="blue"
                                        isToday={bar.isToday}
                                        isActive={isActive}
                                        onClick={() => handleDayClick(index)}
                                    />
                                </div>
                            )
                        })}

                        {changeRateData.length === 0 && (
                            <div className="text-slate-500">No data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Sheet Detail */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-[20px] transition-transform duration-300 ease-out shadow-2xl z-50",
                isBottomSheetOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Drawer Handle */}
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mt-4 mb-2" />

                {commentData && (
                    <div className="px-4 pb-10">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-2xl font-bold text-white">
                                {commentData.label} 상세 정보
                            </h3>
                            <button
                                onClick={() => setIsBottomSheetOpen(false)}
                                className="text-slate-400 hover:text-white text-sm"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 rounded-lg bg-slate-800">
                                <div className="text-sm text-slate-400">Date</div>
                                <div className="text-xl font-mono font-bold text-white">{commentData.date}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-800">
                                    <div className="text-sm text-slate-400">총거래량</div>
                                    <div className="text-xl font-mono font-bold text-orange-400">
                                        {commentData.volume.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-800">
                                    <div className="text-sm text-slate-400">등락률</div>
                                    <div className={cn(
                                        "text-xl font-mono font-bold",
                                        commentData.changeRate >= 0 ? "text-blue-400" : "text-orange-400"
                                    )}>
                                        {commentData.changeRate > 0 ? '+' : ''}{commentData.changeRate.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
