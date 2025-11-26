'use client'

import { cn } from "@/lib/utils"

interface BottomSheetProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-[20px] transition-transform duration-300 ease-out shadow-2xl z-50",
            isOpen ? "translate-y-0" : "translate-y-full"
        )}>
            {/* Drawer Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mt-4 mb-2" />

            <div className="px-4 pb-10">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-2xl font-bold text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-sm"
                    >
                        Close
                    </button>
                </div>

                {children}
            </div>
        </div>
    )
}
