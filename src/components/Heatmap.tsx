'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3-hierarchy'
import { TreeMapNode, Stock } from '@/lib/dummyData'

interface HeatmapProps {
    data: TreeMapNode
    onStockClick?: (stock: Stock) => void
    colorBlindMode?: boolean
    isMobile?: boolean
    onDrillDown?: (node: TreeMapNode) => void
    breadcrumbs?: TreeMapNode[]
}

export default function Heatmap({
    data,
    onStockClick,
    colorBlindMode = false,
    isMobile = false,
    onDrillDown,
    breadcrumbs = []
}: HeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const layoutRef = useRef<any[]>([])

    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setDimensions({ width, height })
            }
        })

        resizeObserver.observe(containerRef.current)

        return () => resizeObserver.disconnect()
    }, [])

    useEffect(() => {
        if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = dimensions.width * dpr
        canvas.height = dimensions.height * dpr
        canvas.style.width = `${dimensions.width}px`
        canvas.style.height = `${dimensions.height}px`
        ctx.scale(dpr, dpr)

        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, dimensions.width, dimensions.height)

        if (!data) return

        // FIX: Only sum values for stock nodes to avoid double counting internal nodes
        const root = d3.hierarchy(data)
            .sum(d => d.type === 'stock' ? (d.value || 0) : 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0))

        const treemap = d3.treemap<TreeMapNode>()
            .size([dimensions.width, dimensions.height])
            .paddingOuter(0)
            .round(true)

        if (isMobile) {
            treemap.paddingTop(0).paddingInner(1)
        } else {
            // Desktop: Reserve space for headers based on node type
            // Index: 20px, Sector: 19px (1px gap for 18px header)
            treemap.paddingTop((node) => {
                if (node.data.type === 'index') return 20
                if (node.data.type === 'sector') return 19
                return 0
            }).paddingInner(2) // Increase inner padding for better separation
        }

        treemap(root)

        layoutRef.current = []

        const getColor = (change: number) => {
            if (colorBlindMode) {
                if (change > 0) {
                    const intensity = Math.min(change / 3, 1)
                    return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`
                } else {
                    const intensity = Math.min(Math.abs(change) / 3, 1)
                    return `rgba(249, 115, 22, ${0.3 + intensity * 0.7})`
                }
            } else {
                if (change > 0) {
                    const intensity = Math.min(change / 3, 1)
                    return `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`
                } else {
                    const intensity = Math.min(Math.abs(change) / 3, 1)
                    return `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`
                }
            }
            return '#334155'
        }

        if (isMobile) {
            const nodes = root.children || []
            layoutRef.current = nodes

            nodes.forEach((node: any) => {
                const { x0, y0, x1, y1 } = node
                const width = x1 - x0
                const height = y1 - y0

                let change = 0
                let label = node.data.name

                if (node.data.type === 'stock') {
                    change = node.data.data.change
                    label = node.data.data.ticker
                } else {
                    const leaves = node.leaves()
                    const totalValue = leaves.reduce((sum: number, leaf: any) => sum + (leaf.data.value || 0), 0)
                    const weightedChange = leaves.reduce((sum: number, leaf: any) => {
                        return sum + (leaf.data.data?.change || 0) * (leaf.data.value || 0)
                    }, 0)
                    change = totalValue ? weightedChange / totalValue : 0
                }

                ctx.fillStyle = getColor(change)
                ctx.fillRect(x0, y0, width, height)

                ctx.strokeStyle = '#0f172a'
                ctx.lineWidth = 1
                ctx.strokeRect(x0, y0, width, height)

                if (width > 40 && height > 18) {
                    ctx.fillStyle = '#ffffff'
                    ctx.font = 'bold 10px "JetBrains Mono", monospace'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(label, x0 + width / 2, y0 + height / 2)

                    if (node.data.type === 'stock') {
                        ctx.font = '10px "JetBrains Mono", monospace'
                        ctx.fillText(`${change > 0 ? '+' : ''}${change.toFixed(2)}%`, x0 + width / 2, y0 + height / 2 + 14)
                    }
                }
            })

        } else {
            const clickableNodes: any[] = []

            // 1. Draw Index Headers
            root.descendants().forEach((node: any) => {
                if (node.data.type === 'index') {
                    const { x0, y0, x1 } = node
                    const width = x1 - x0
                    const height = 20

                    ctx.fillStyle = '#475569'
                    ctx.fillRect(x0, y0, width, height)

                    if (width > 60) {
                        ctx.fillStyle = '#f8fafc'
                        ctx.font = 'bold 10px "JetBrains Mono", monospace'
                        ctx.textAlign = 'left'
                        ctx.textBaseline = 'middle'
                        ctx.fillText(node.data.name, x0 + 6, y0 + height / 2)
                    }

                    ctx.strokeStyle = '#0f172a'
                    ctx.lineWidth = 1
                    ctx.strokeRect(x0, y0, width, node.y1 - node.y0)

                    clickableNodes.push({
                        x0,
                        y0,
                        x1,
                        y1: y0 + height,
                        data: node.data
                    })
                }
            })

            // 2. Draw Sector Headers (in reserved paddingTop space)
            root.descendants().forEach((node: any) => {
                if (node.data.type === 'sector') {
                    const { x0, y0, x1 } = node
                    const width = x1 - x0
                    const height = 18

                    if (width > 50) {
                        // Calculate weighted average change for the sector
                        const leaves = node.leaves()
                        const totalValue = leaves.reduce((sum: number, leaf: any) => sum + (leaf.data.value || 0), 0)
                        const weightedChange = leaves.reduce((sum: number, leaf: any) => {
                            return sum + (leaf.data.data?.change || 0) * (leaf.data.value || 0)
                        }, 0)
                        const avgChange = totalValue ? weightedChange / totalValue : 0

                        // Apply color based on change and colorBlindMode
                        if (colorBlindMode) {
                            if (avgChange > 0) {
                                ctx.fillStyle = 'rgba(59, 130, 246, 0.7)' // Blue
                            } else {
                                ctx.fillStyle = 'rgba(249, 115, 22, 0.7)' // Orange
                            }
                        } else {
                            if (avgChange > 0) {
                                ctx.fillStyle = 'rgba(34, 197, 94, 0.7)' // Green
                            } else {
                                ctx.fillStyle = 'rgba(239, 68, 68, 0.7)' // Red
                            }
                        }

                        ctx.fillRect(x0, y0, width, height)

                        ctx.fillStyle = '#ffffff' // White text for better contrast on colored bg
                        ctx.font = 'bold 10px "JetBrains Mono", monospace'
                        ctx.textAlign = 'left'
                        ctx.textBaseline = 'middle'
                        ctx.fillText(node.data.name, x0 + 4, y0 + height / 2)

                        ctx.strokeStyle = '#0f172a'
                        ctx.lineWidth = 1
                        ctx.strokeRect(x0, y0, width, node.y1 - node.y0)

                        clickableNodes.push({
                            x0,
                            y0,
                            x1,
                            y1: y0 + height,
                            data: {
                                ...node.data,
                                parentIndex: node.parent?.data.name
                            }
                        })
                    }
                }
            })

            // 3. Draw Stocks
            const leaves = root.leaves()

            leaves.forEach((leaf: any) => {
                const { x0, y0, x1, y1 } = leaf
                const width = x1 - x0
                const height = y1 - y0
                const stock = leaf.data.data

                if (!stock) return

                ctx.fillStyle = getColor(stock.change)
                ctx.fillRect(x0, y0, width, height)

                if (width > 30 && height > 18) {
                    ctx.fillStyle = '#ffffff'
                    ctx.font = 'bold 10px "JetBrains Mono", monospace'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(stock.ticker, x0 + width / 2, y0 + height / 2 - 6)

                    ctx.font = '10px "JetBrains Mono", monospace'
                    ctx.fillText(`${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}%`, x0 + width / 2, y0 + height / 2 + 6)
                }

                clickableNodes.push(leaf)
            })

            layoutRef.current = clickableNodes
        }

    }, [data, dimensions, colorBlindMode, isMobile])

    const handleClick = (e: React.MouseEvent) => {
        if (!canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const hit = layoutRef.current.find((node: any) => {
            return x >= node.x0 && x <= node.x1 && y >= node.y0 && y <= node.y1
        })

        if (hit) {
            if (isMobile && hit.data.type !== 'stock' && onDrillDown) {
                onDrillDown(hit.data)
            }
            else if (!isMobile && hit.data.type === 'index' && onDrillDown) {
                onDrillDown(hit.data)
            }
            else if (!isMobile && hit.data.type === 'sector' && onDrillDown) {
                onDrillDown(hit.data)
            }
            else if (hit.data.type === 'stock' && onStockClick) {
                onStockClick(hit.data.data)
            }
        }
    }

    return (
        <div className="w-full h-full flex flex-col overflow-y-auto bg-slate-950">
            <div
                ref={containerRef}
                className="flex-1 w-full cursor-pointer py-4 md:py-6 min-h-[calc(100vh-140px)]"
            >
                <canvas
                    ref={canvasRef}
                    onClick={handleClick}
                />
            </div>
        </div>
    )
}
