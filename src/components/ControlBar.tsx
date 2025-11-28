'use client'

import { ReactNode } from 'react'

interface ControlBarProps {
    children: ReactNode
}

export default function ControlBar({ children }: ControlBarProps) {
    return (
        <div className="bg-slate-900/50 border-b border-slate-800 px-4">
            <div className="max-w-[1280px] mx-auto py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                {children}
            </div>
        </div>
    )
}
