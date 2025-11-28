'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Heatmap from '@/components/Heatmap'
import StockDetail from '@/components/StockDetail'
import PageHeader from '@/components/PageHeader'
import ControlBar from '@/components/ControlBar'
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
import { ChevronRight, Home as HomeIcon, BarChart3 } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function Home() {
  const router = useRouter()
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

    const checkMobile = () => {
      const wasMobile = isMobile
      const nowMobile = window.innerWidth <= 768
      setIsMobile(nowMobile)

      // Clear breadcrumbs when switching from mobile to desktop
      if (wasMobile && !nowMobile) {
        setBreadcrumbs([])
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile])

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

      // Also update selectedIndex/selectedSector for consistency when switching to desktop
      if (node.type === 'index') {
        setSelectedIndex(node.name)
        setSelectedSector('All')
      } else if (node.type === 'sector') {
        const parentIndex = (node as any).parentIndex
        if (parentIndex) {
          setSelectedIndex(parentIndex)
        }
        setSelectedSector(node.name)
      }
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index)
    setBreadcrumbs(newBreadcrumbs)

    // Update selectedIndex/selectedSector based on breadcrumb navigation
    if (newBreadcrumbs.length === 0) {
      setSelectedIndex('All')
      setSelectedSector('All')
    } else {
      const lastNode = newBreadcrumbs[newBreadcrumbs.length - 1]
      if (lastNode.type === 'index') {
        setSelectedIndex(lastNode.name)
        setSelectedSector('All')
      } else if (lastNode.type === 'sector') {
        const parentIndex = (lastNode as any).parentIndex
        if (parentIndex) {
          setSelectedIndex(parentIndex)
        }
        setSelectedSector(lastNode.name)
      }
    }
  }

  const resetView = () => {
    setBreadcrumbs([])
    setSelectedIndex('All')
    setSelectedSector('All')
  }

  // Filter Data
  const filteredData = useMemo(() => {
    if (!data) return null

    let result = data

    // Apply breadcrumbs if in mobile drill-down mode
    if (breadcrumbs.length > 0) {
      result = breadcrumbs[breadcrumbs.length - 1]
    }
    // Apply filters for desktop
    else {
      // Filter by selected index
      if (selectedIndex !== 'All') {
        const indexNode = data.children?.find(c => c.name === selectedIndex)
        if (indexNode) {
          result = indexNode

          // Filter by selected sector within index
          if (selectedSector !== 'All') {
            const sectorNode = indexNode.children?.find(c => c.name === selectedSector)
            if (sectorNode) {
              result = sectorNode
            }
          }
        }
      } else if (selectedSector !== 'All') {
        // Index is All, but Sector is selected
        // Create a virtual root node containing only the selected sectors from all indices
        const sectorNodes: TreeMapNode[] = []

        data.children?.forEach(indexNode => {
          const matchingSector = indexNode.children?.find(c => c.name === selectedSector)
          if (matchingSector) {
            // Clone the sector node to avoid mutating original data
            sectorNodes.push({ ...matchingSector, name: `${indexNode.name} - ${matchingSector.name}` })
          }
        })

        if (sectorNodes.length > 0) {
          result = {
            ...data,
            children: sectorNodes
          }
        }
      }

      // Apply search filter if query exists
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filterNodes = (node: TreeMapNode): TreeMapNode | null => {
          if (node.type === 'stock') {
            return node.name.toLowerCase().includes(lowerCaseQuery) ? node : null;
          }

          if (!node.children) return null;

          const filteredChildren = node.children
            .map(filterNodes)
            .filter(Boolean) as TreeMapNode[];

          return filteredChildren.length > 0 ? { ...node, children: filteredChildren } : null;
        };

        const filteredResult = filterNodes(result);
        if (filteredResult) {
          result = filteredResult;
        } else {
          // If no stocks match, return an empty node structure
          result = { ...result, children: [] };
        }
      }
    }

    return result
  }, [data, breadcrumbs, selectedIndex, selectedSector, searchQuery])

  // Get available sectors for the dropdown based on selected index
  const availableSectors = useMemo(() => {
    if (!data) return []

    if (selectedIndex === 'All') {
      // Collect all unique sectors from all indices
      const sectors = new Set<string>()
      data.children?.forEach(indexNode => {
        indexNode.children?.forEach(sectorNode => {
          sectors.add(sectorNode.name)
        })
      })
      return Array.from(sectors).sort()
    }

    const indexNode = data.children?.find(c => c.name === selectedIndex)
    return indexNode?.children?.map(c => c.name) || []
  }, [data, selectedIndex])

  if (!data) return <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* Header */}
      <PageHeader
        title="Stock Heatmap"
        leftContent={
          <button
            onClick={() => router.push('/report')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Switch to Report View"
          >
            <BarChart3 className="w-6 h-6" />
          </button>
        }
        rightContent={
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden md:inline">Color Blind</span>
            <Switch
              checked={colorBlindMode}
              onCheckedChange={setColorBlindMode}
            />
          </div>
        }
      />

      {/* Controls Bar */}
      <ControlBar>
        {/* Search Bar */}
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white w-full"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar justify-end">
          <Select value={selectedIndex} onValueChange={(val) => {
            setSelectedIndex(val)
            setSelectedSector('All')
          }}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700">
              <SelectValue placeholder="Index" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Indices</SelectItem>
              <SelectItem value="S&P 500">S&P 500</SelectItem>
              <SelectItem value="Nasdaq 100">Nasdaq 100</SelectItem>
              <SelectItem value="Dow Jones">Dow Jones</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedSector}
            onValueChange={setSelectedSector}
          >
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Sectors</SelectItem>
              {availableSectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ControlBar>

      {/* Breadcrumbs (Mobile Only) */}
      {isMobile && breadcrumbs.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-800 px-4">
          <div className="max-w-[1280px] mx-auto py-2 flex items-center gap-2 overflow-x-auto">
            <button onClick={resetView} className="p-1">
              <HomeIcon className="w-4 h-4 text-slate-400" />
            </button>
            {breadcrumbs.map((node, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <button
                  onClick={() => handleBreadcrumbClick(i + 1)}
                  className="text-sm font-medium text-slate-200"
                >
                  {node.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full px-4">
        <div className="max-w-[1280px] mx-auto relative overflow-hidden flex flex-col h-full">
          {filteredData && (
            <Heatmap
              data={filteredData}
              onStockClick={handleStockClick}
              onDrillDown={handleDrillDown}
              colorBlindMode={colorBlindMode}
              isMobile={isMobile}
              breadcrumbs={breadcrumbs}
            />
          )}
        </div>
      </div>

      <div className="w-full h-[280px] flex items-center justify-center text-slate-500 font-bold text-2xl pb-10">
        dublove
      </div>

      {/* Stock Detail Modal (Heatmap Mode) */}
      <StockDetail
        stock={selectedStock}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </main>
  )
}
