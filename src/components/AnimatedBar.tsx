'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedBarProps {
    label: string
    value: number
    maxAbsValue: number
    color: 'orange' | 'blue'
    isToday?: boolean
    isActive?: boolean
    onClick?: () => void
}

export default function AnimatedBar({
    label,
    value,
    maxAbsValue,
    color,
    isToday = false,
    isActive = false,
    onClick
}: AnimatedBarProps) {
    const [animationProgress, setAnimationProgress] = useState(0)

    useEffect(() => {
        // Reset animation
        setAnimationProgress(0)

        // Animate from 0 to 1 over 1 second with delay based on index
        const duration = 1000
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic function for smooth animation
            const eased = 1 - Math.pow(1 - progress, 3)
            setAnimationProgress(eased)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        // Small delay to ensure component is mounted
        setTimeout(() => requestAnimationFrame(animate), 50)
    }, [value])

    const heightPercentage = Math.min((Math.abs(value) / maxAbsValue) * 80, 100) * animationProgress
    const isPositive = value >= 0
    const strokeColor = color === 'orange' ? '#f97316' : '#3b82f6'

    return (
        <div
            className="flex flex-col items-center gap-3 group cursor-pointer"
            onClick={onClick}
        >
            {/* SVG Bar Container */}
            <div className="relative w-12 md:w-16 h-[300px] flex items-end justify-center">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 64 300"
                    className="overflow-visible"
                >
                    {/* Bar Rectangle */}
                    <rect
                        x="28"
                        y={300 - (heightPercentage * 3)}
                        width="4"
                        height={heightPercentage * 3}
                        fill={strokeColor}
                        className={cn(
                            "transition-opacity duration-300",
                            isActive ? "opacity-100" : isToday ? "opacity-90" : "opacity-40 group-hover:opacity-70"
                        )}
                        rx="2"
                        ry="2"
                    />

                    {/* Value Label on hover */}
                    <text
                        x="32"
                        y={300 - (heightPercentage * 3) - 10}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                        {value.toFixed(2)}%
                    </text>
                </svg>
            </div>

            {/* Axis Label */}
            <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-colors",
                isActive ? "bg-emerald-500 text-white" : isToday ? "bg-white text-slate-950 opacity-90" : "bg-slate-800 text-slate-400"
            )}>
                {label}
            </div>
        </div>
    )
}
