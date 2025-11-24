'use client'

import { useEffect, useState, useMemo } from 'react'
import Heatmap from '@/components/Heatmap'
import StockDetail from '@/components/StockDetail'
import { generateDummyData, TreeMapNode, Stock } from '@/lib/dummyData'
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronRight, Home as HomeIcon } from 'lucide-react'

export default function Home() {
  const [data, setData] = useState<TreeMapNode | null>(null)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState('All')
  const [selectedSector, setSelectedSector] = useState('All')
  const [colorBlindMode, setColorBlindMode] = useState(false)

  // Responsive & Navigation State
  const [isMobile, setIsMobile] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<TreeMapNode[]>([])

  useEffect(() => {
    // Generate data on client side to avoid hydration mismatch with random numbers
    setData(generateDummyData())

    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock)
    setIsDetailOpen(true)
  }

  const handleDrillDown = (node: TreeMapNode) => {
    if (node.type === 'stock') return

    // Desktop: Index header click = select that Index
    if (node.type === 'index' && !isMobile) {
      setSelectedIndex(node.name)
      setSelectedSector('All') // Reset sector filter
      return
    }

    // Desktop: Sector header click = select parent Index + Sector
    if (node.type === 'sector' && !isMobile) {
      const parentIndex = (node as any).parentIndex
      if (parentIndex) {
        setSelectedIndex(parentIndex) // Set parent Index
      }
      setSelectedSector(node.name) // Set Sector
      return
    }

    // Mobile: drill down navigation
    if (isMobile) {
      setBreadcrumbs(prev => [...prev, node])
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index))
  }

  const resetView = () => {
    setBreadcrumbs([])
  }

  // Filter Data
  const filteredData = useMemo(() => {
    if (!data) return null

    console.log('=== FILTER DEBUG ===')
    console.log('Selected Index:', selectedIndex)
    console.log('Selected Sector:', selectedSector)
    console.log('Raw data children:', data.children?.length)

    let result = data

    // Apply breadcrumbs if in mobile drill-down mode
    if (breadcrumbs.length > 0) {
      result = breadcrumbs[breadcrumbs.length - 1]
    }
    // Apply filters for desktop
    else {
      // Filter by selected index
      if (selectedIndex !== 'All') {
        const indexNode = data.children?.find(child => child.name === selectedIndex)
        if (indexNode) {
          result = indexNode
          console.log('Filtered to index:', selectedIndex, 'sectors:', indexNode.children?.length)
        }
      }

      // Filter by selected sector
      if (selectedSector !== 'All' && result.children) {
        const sectorNode = result.children.find(child => child.name === selectedSector)
        if (sectorNode) {
          result = sectorNode
          console.log('Filtered to sector:', selectedSector, 'stocks:', sectorNode.children?.length)
        }
      }
    }

    console.log('Final filtered result:', result)
    console.log('====================')

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      const filterNode = (node: TreeMapNode): TreeMapNode | null => {
        if (node.type === 'stock') {
          const match = node.data?.ticker.toLowerCase().includes(query) ||
            node.data?.name.toLowerCase().includes(query)
          return match ? node : null
        }

        if (node.children) {
          const filteredKids = node.children.map(filterNode).filter((n): n is TreeMapNode => n !== null)
          if (filteredKids.length > 0) {
            return { ...node, children: filteredKids }
          }
        }
        return null
      }

      const filtered = filterNode(data)
      return filtered || { name: 'No Results', children: [] }
    }

    return result
  }, [data, selectedIndex, selectedSector, searchQuery, breadcrumbs])

  if (!data) return <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>

  return (
    <main className="w-full h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950 text-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && breadcrumbs.length > 0 ? (
              <button onClick={resetView} className="p-1 hover:bg-slate-800 rounded">
                <HomeIcon size={20} />
              </button>
            ) : null}
            <h1 className="text-lg font-bold font-mono">
              {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Stock Heatmap'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">A11y</span>
            <Switch
              checked={colorBlindMode}
              onCheckedChange={setColorBlindMode}
            />
          </div>
        </div>

        {/* Breadcrumbs for Mobile */}
        {isMobile && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-slate-400 overflow-x-auto">
            <span onClick={resetView} className="cursor-pointer hover:text-white">Market</span>
            {breadcrumbs.map((node, i) => (
              <div key={i} className="flex items-center gap-1">
                <ChevronRight size={14} />
                <span
                  onClick={() => handleBreadcrumbClick(i + 1)}
                  className={`cursor-pointer hover:text-white ${i === breadcrumbs.length - 1 ? 'text-white font-bold' : ''}`}
                >
                  {node.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Input
            placeholder="Search ticker..."
            className="bg-slate-900 border-slate-700 text-white min-w-[120px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select value={selectedIndex} onValueChange={(val) => {
            setSelectedIndex(val)
            setSelectedSector('All')
            resetView()
          }}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Index" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Indices</SelectItem>
              <SelectItem value="S&P 500">S&P 500</SelectItem>
              <SelectItem value="Nasdaq 100">Nasdaq 100</SelectItem>
              <SelectItem value="Dow Jones">Dow Jones</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={(val) => {
            setSelectedSector(val)
            resetView()
          }}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Sectors</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Financials">Financials</SelectItem>
              <SelectItem value="Consumer Discretionary">Cons. Disc.</SelectItem>
              <SelectItem value="Communication Services">Comm. Svcs</SelectItem>
              <SelectItem value="Industrials">Industrials</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        {filteredData && (filteredData.children?.length ?? 0) > 0 ? (
          <Heatmap
            data={filteredData}
            onStockClick={handleStockClick}
            colorBlindMode={colorBlindMode}
            isMobile={isMobile}
            onDrillDown={handleDrillDown}
            breadcrumbs={breadcrumbs}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No results found
          </div>
        )}
      </div>

      <StockDetail
        stock={selectedStock}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </main>
  )
}
