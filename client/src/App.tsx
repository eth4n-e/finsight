import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import StockWatcher from '@/pages/StockWatcher'
import Library from '@/pages/Library'
import Simulator from '@/pages/Simulator'
import Marketplace from '@/pages/Marketplace'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/watcher" replace />} />
        <Route path="/watcher" element={<StockWatcher />} />
        <Route path="/library" element={<Library />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </Layout>
  )
}
