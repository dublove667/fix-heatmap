'use client'

import { Stock } from "@/lib/dummyData"
import BottomSheet from "./BottomSheet"

interface StockDetailProps {
    stock: Stock | null
    isOpen: boolean
    onClose: () => void
}

export default function StockDetail({ stock, isOpen, onClose }: StockDetailProps) {
    if (!stock) return null

    const isPositive = stock.change >= 0
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500'

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={`${stock.ticker} - ${stock.name}`}
        >
            <div className="text-sm text-slate-400 mb-4 px-2">
                {stock.sector}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800">
                    <div className="text-sm text-slate-400">Price</div>
                    <div className="text-2xl font-mono font-bold text-white">
                        ${stock.price.toFixed(2)}
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800">
                    <div className="text-sm text-slate-400">Change</div>
                    <div className={`text-2xl font-mono font-bold ${colorClass}`}>
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800">
                    <div className="text-sm text-slate-400">Market Cap</div>
                    <div className="text-xl font-mono text-white">
                        ${(stock.value / 1e9).toFixed(2)}B
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800">
                    <div className="text-sm text-slate-400">Volume (24h)</div>
                    <div className="text-xl font-mono text-white">
                        {(Math.random() * 100).toFixed(1)}M
                    </div>
                </div>
            </div>
        </BottomSheet>
    )
}
