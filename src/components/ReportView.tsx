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

interface ReportViewProps {
    data: TreeMapNode | null
}

type TimeRange = '1W' | '1M' | '1Y'

export default function ReportView({ data }: ReportViewProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [timeRange, setTimeRange] = useState<TimeRange>('1W')
    const [selectedBar, setSelectedBar] = useState<any | null>(null)

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

    // Filter stocks based on search
    const filteredStocks = useMemo(() => {
        if (!searchQuery) return allStocks
        const query = searchQuery.toLowerCase()
        return allStocks.filter(stock =>
            stock.ticker.toLowerCase().includes(query) ||
            stock.name.toLowerCase().includes(query) ||
            stock.sector.toLowerCase().includes(query) ||
            stock.index.toLowerCase().includes(query)
        )
    }, [allStocks, searchQuery])

    // Aggregate data for the chart based on filtered stocks
    const chartData = useMemo(() => {
        if (filteredStocks.length === 0) return []

        // Initialize aggregation
        let aggregated: any[] = []

        if (timeRange === '1W') {
            // 5 days: M T W T F
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

        // Sum up values
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
                    aggregated[index].date = point.date // Keep last date found
                    if (point.isToday) aggregated[index].isToday = true
                }
            })
        })

        // Average the values
        return aggregated.map(item => ({
            ...item,
            value: item.count > 0 ? item.value / item.count : 0
        })).filter(item => item.count > 0) // Remove empty slots (future days)

    }, [filteredStocks, timeRange])

    const maxAbsValue = Math.max(...chartData.map(d => Math.abs(d.value)), 0.1) // Avoid div by 0

    return (
        <div className="w-full h-full bg-slate-950 flex flex-col p-4 md:p-6 relative">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search ticker, sector..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-700 text-white focus-visible:ring-slate-600"
                    />
                </div>

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

            {/* Chart Area */}
            <div className="flex-1 flex items-end justify-center gap-4 md:gap-8 pb-20">
                {chartData.map((bar, index) => {
                    const heightPercentage = Math.min((Math.abs(bar.value) / maxAbsValue) * 80, 100) // Max 80% height
                    const isPositive = bar.value >= 0

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-3 group cursor-pointer"
                            onClick={() => setSelectedBar(bar)}
                        >
                            {/* Bar */}
                            <div className="relative w-12 md:w-16 h-[300px] flex items-end justify-center">
                                <div
                                    className={cn(
                                        "w-full rounded-t-sm transition-all duration-300",
                                        isPositive ? "bg-blue-500" : "bg-orange-500",
                                        bar.isToday ? "opacity-90" : "opacity-40 group-hover:opacity-70"
                                    )}
                                    style={{ height: `${heightPercentage}%` }}
                                >
                                    {/* Value Label on top of bar */}
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {bar.value.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            {/* Axis Label */}
                            <div className={cn(
                                "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-colors",
                                bar.isToday ? "bg-white text-slate-950 opacity-90" : "bg-slate-800 text-slate-400"
                            )}>
                                {bar.label}
                            </div>
                        </div>
                    )
                })}

                {chartData.length === 0 && (
                    <div className="text-slate-500">No data available</div>
                )}
            </div>

            {/* Bottom Sheet Detail */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-[20px] transition-transform duration-300 ease-out shadow-2xl z-50",
                selectedBar ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Drawer Handle */}
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mt-4 mb-2" />

                {selectedBar && (
                    <div className="px-4 pb-10">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-2xl font-bold text-white">
                                {timeRange === '1W' ? 'Daily Performance' : timeRange === '1M' ? 'Weekly Performance' : 'Quarterly Performance'}
                            </h3>
                            <button
                                onClick={() => setSelectedBar(null)}
                                className="text-slate-400 hover:text-white text-sm"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 rounded-lg bg-slate-800">
                                <div className="text-sm text-slate-400">Date</div>
                                <div className="text-xl font-mono font-bold text-white">{selectedBar.date}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-800">
                                <div className="text-sm text-slate-400">Average Change</div>
                                <div className={cn(
                                    "text-2xl font-mono font-bold",
                                    selectedBar.value >= 0 ? "text-blue-400" : "text-orange-400"
                                )}>
                                    {selectedBar.value > 0 ? '+' : ''}{selectedBar.value.toFixed(2)}%
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-800">
                                <div className="text-sm text-slate-400">Data Points</div>
                                <div className="text-xl font-mono text-white">{selectedBar.count} stocks</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
