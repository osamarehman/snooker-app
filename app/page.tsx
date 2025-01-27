"use client"

import { useEffect, useState } from "react"
import { TableCard } from "@/components/TableCard"
import { getAvailableTables } from "@/app/actions/table"

interface Table {
  id: string
  tableNumber: number
}

export default function Home() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTables()
  }, [])

  async function loadTables() {
    try {
      const result = await getAvailableTables()
      if (result.success && result.data) {
        setTables(result.data)
      }
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <main className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <TableCard 
            key={table.id} 
            tableNumber={table.tableNumber} 
            onMatchCreated={loadTables}
          />
        ))}
      </div>
      {tables.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          All tables are currently occupied
        </p>
      )}
    </main>
  )
}
