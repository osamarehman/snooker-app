"use client"

import { motion } from "framer-motion"
import DailyExpenses from "../components/DailyExpenses"

export default function ExpensesPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-primary">Daily Expenses</h1>
        <p className="text-muted-foreground">
          Track and manage your daily business expenses
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-card rounded-lg border border-border p-4">
          <DailyExpenses />
        </div>
      </motion.div>
    </div>
  )
}
