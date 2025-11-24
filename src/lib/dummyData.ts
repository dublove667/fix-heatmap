export interface Stock {
    id: string
    ticker: string
    name: string
    sector: string
    index: string
    price: number
    change: number
    value: number
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
                value: baseValue
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

    console.log('=== DUMMY DATA DEBUG ===')
    console.log('Total indices:', children.length)
    children.forEach(index => {
        const stockCount = index.children?.reduce((sum, sector) => sum + (sector.children?.length || 0), 0) || 0
        console.log(`${index.name}: ${stockCount} stocks, value: ${index.value}`)
    })
    console.log('Total stocks:', children.reduce((sum, idx) =>
        sum + (idx.children?.reduce((s, sec) => s + (sec.children?.length || 0), 0) || 0), 0))
    console.log('========================')

    return result
}
