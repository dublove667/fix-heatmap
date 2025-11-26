export interface Stock {
    id: string
    ticker: string
    name: string
    sector: string
    index: string
    price: number
    change: number
    value: number
    history: {
        daily: { date: string, value: number, label: string, isToday?: boolean }[]
        weekly: { date: string, value: number, label: string }[]
        quarterly: { date: string, value: number, label: string }[]
    }
}

export interface TreeMapNode {
    name: string
    value?: number
    children?: TreeMapNode[]
    data?: Stock
    type?: 'index' | 'sector' | 'stock'
}

const SECTORS = [
    'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary',
    'Communication Services', 'Industrials', 'Consumer Staples',
    'Energy', 'Utilities', 'Real Estate', 'Materials'
]

// Index configurations: name and stock count
const INDEX_CONFIGS = [
    { name: 'S&P 500', count: 500 },
    { name: 'Nasdaq 100', count: 100 },
    { name: 'Dow Jones', count: 30 }
]

export function generateDummyData(): TreeMapNode {
    const children: TreeMapNode[] = []
    let stockIdCounter = 0

    // Helper to generate history
    const generateHistory = (baseValue: number) => {
        const daily = []
        const weekly = []
        const quarterly = []

        // 1 Week (Daily) - M T W T F
        const days = ['M', 'T', 'W', 'T', 'F']
        // Simulate "Today" is random between 0-4 (Mon-Fri) or just fixed for demo
        // Let's assume today is Friday for full data, or random to show "future hidden"
        // For consistent demo, let's say today is Thursday (index 3)
        const todayIndex = 3

        let currentValue = baseValue

        for (let i = 0; i < 5; i++) {
            const change = (Math.random() * 4) - 2 // -2% to +2%
            currentValue = currentValue * (1 + change / 100)

            // Only add data if it's today or before
            if (i <= todayIndex) {
                daily.push({
                    date: `2024-11-${25 + i}`,
                    value: change, // Store percentage change for the bar chart
                    label: days[i],
                    isToday: i === todayIndex
                })
            }
        }

        // 1 Month (Weekly) - 4 Weeks
        for (let i = 0; i < 4; i++) {
            const change = (Math.random() * 10) - 5
            weekly.push({
                date: `Week ${i + 1}`,
                value: change,
                label: `W${i + 1}`
            })
        }

        // 1 Year (Quarterly) - 4 Quarters
        for (let i = 0; i < 4; i++) {
            const change = (Math.random() * 20) - 10
            quarterly.push({
                date: `Q${i + 1}`,
                value: change,
                label: `Q${i + 1}`
            })
        }

        return { daily, weekly, quarterly }
    }

    // Generate stocks for each index with fixed counts
    for (const indexConfig of INDEX_CONFIGS) {
        const indexStocks: Stock[] = []

        // Generate exact number of stocks for this index
        for (let i = 0; i < indexConfig.count; i++) {
            const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)]
            const baseValue = Math.random() * 1000000000
            const change = (Math.random() * 10) - 5

            indexStocks.push({
                id: `stock-${stockIdCounter}`,
                ticker: `${indexConfig.name === 'S&P 500' ? 'SPX' : indexConfig.name === 'Nasdaq 100' ? 'NDX' : 'DJI'}${i}`,
                name: `${indexConfig.name} Stock ${i}`,
                sector,
                index: indexConfig.name,
                price: Math.random() * 1000,
                change,
                value: baseValue,
                history: generateHistory(baseValue)
            })

            stockIdCounter++
        }

        // Group by Sector within this Index
        const sectorChildren: TreeMapNode[] = []

        for (const sectorName of SECTORS) {
            const sectorStocks = indexStocks.filter(s => s.sector === sectorName)
            if (sectorStocks.length === 0) continue

            sectorChildren.push({
                name: sectorName,
                type: 'sector',
                children: sectorStocks.map(s => ({
                    name: s.ticker,
                    type: 'stock',
                    value: s.value,
                    data: s
                })),
                value: sectorStocks.reduce((sum, s) => sum + s.value, 0)
            })
        }

        if (sectorChildren.length > 0) {
            children.push({
                name: indexConfig.name,
                type: 'index',
                children: sectorChildren,
                value: sectorChildren.reduce((sum, sector) => sum + (sector.value || 0), 0)
            })
        }
    }

    const result = {
        name: 'Market',
        children
    }

    return result
}
