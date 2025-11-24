import { create } from 'zustand'

interface StockState {
    stocks: any[] // TODO: Define Stock type
    setStocks: (stocks: any[]) => void
}

export const useStockStore = create<StockState>((set) => ({
    stocks: [],
    setStocks: (stocks) => set({ stocks }),
}))
