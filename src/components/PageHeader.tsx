'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    leftContent?: ReactNode
    rightContent?: ReactNode
}

export default function PageHeader({ title, leftContent, rightContent }: PageHeaderProps) {
    return (
        <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50 h-16 px-4">
            <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-2 w-1/3">
                    {leftContent}
                </div>

                {/* Center: Title */}
                <div className="flex items-center justify-center w-1/3">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap">
                        {title}
                    </h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    {rightContent}
                </div>
            </div>
        </header>
    )
}
