'use client'

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Stock } from "@/lib/dummyData"

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
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="bg-slate-900 border-slate-800 text-white rounded-t-[20px]">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mt-4 mb-2" />
                <DrawerHeader className="text-left">
                    <DrawerTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        {stock.ticker}
                        <span className="text-sm font-normal text-slate-400">{stock.name}</span>
                    </DrawerTitle>
                    <DrawerDescription className="text-slate-400">
                        {stock.sector}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 grid grid-cols-2 gap-4 pb-10">
                    <div className="p-4 rounded-lg bg-slate-800">
                        <div className="text-sm text-slate-400">Price</div>
                        <div className="text-2xl font-mono font-bold">
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
                        <div className="text-xl font-mono">
                            ${(stock.value / 1e9).toFixed(2)}B
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-800">
                        <div className="text-sm text-slate-400">Volume (24h)</div>
                        <div className="text-xl font-mono">
                            {(Math.random() * 100).toFixed(1)}M
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
