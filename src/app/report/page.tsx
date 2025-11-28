'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReportView from '@/components/ReportView'
import PageHeader from '@/components/PageHeader'
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
            <PageHeader
                title="Stock Report"
                leftContent={
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Switch to Heatmap View"
                    >
                        <LayoutGrid className="w-6 h-6" />
                    </button>
                }
            />

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
