"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TableCard } from "@/components/TableCard"
import { getAvailableTables, initializeTables } from "@/app/actions/table"

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
      // Initialize tables first
      await initializeTables()
      const result = await getAvailableTables()
      console.log('Load tables result:', result)
      if (result.success && result.data) {
        console.log('Setting tables:', result.data)
        setTables(result.data)
      } else {
        console.error('Failed to load tables:', result)
      }
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin"
        />
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-primary">Snooker Tables</h1>
        <p className="text-muted-foreground">Manage your snooker tables and track ongoing matches</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {tables.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {tables.map((table, index) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TableCard 
                  tableNumber={table.tableNumber} 
                  onMatchCreated={loadTables}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center p-12 space-y-4 bg-muted/20 rounded-lg"
          >
            <div className="text-4xl">🎱</div>
            <h2 className="text-xl font-semibold text-primary">All Tables Occupied</h2>
            <p className="text-muted-foreground text-center">
              All snooker tables are currently in use. Check back soon for availability.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
