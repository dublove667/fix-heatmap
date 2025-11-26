'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReportView from '@/components/ReportView'
import { generateDummyData, TreeMapNode } from '@/lib/dummyData'
import { LayoutGrid } from 'lucide-react'

export default function ReportPage() {
    const router = useRouter()
    const [data, setData] = useState<TreeMapNode | null>(null)

    useEffect(() => {
        setData(generateDummyData())
    }, [])

    if (!data) {
        return (
            <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-white">
                Loading...
            </div>
        )
    }

    return (
        <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50 h-16 px-4">
                <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between">
                    {/* Left: Back to Heatmap */}
                    <div className="flex items-center gap-2 w-1/3">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Switch to Heatmap View"
                        >
                            <LayoutGrid className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Center: Title */}
                    <div className="flex items-center justify-center w-1/3">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap">
                            Stock Report
                        </h1>
                    </div>

                    {/* Right: Placeholder */}
                    <div className="w-1/3"></div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 w-full px-4">
                <div className="max-w-[1280px] mx-auto relative overflow-hidden flex flex-col h-full">
                    <ReportView data={data} />
                </div>
            </div>

            <div className="w-full h-[280px] flex items-center justify-center text-slate-500 font-bold text-2xl pb-10">
                dublove
            </div>
        </main>
    )
}
