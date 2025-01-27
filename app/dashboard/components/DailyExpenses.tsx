"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createExpense, getExpenses, type ExpenseFormData } from "@/app/actions/expenses"
import type { Expense, ExpenseTag } from "@prisma/client"

const EXPENSE_TAGS: ExpenseTag[] = ["FOOD", "MAINTENANCE", "UTILITIES", "SALARY", "OTHER"]

export default function DailyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    tag: "OTHER",
    quantity: 1,
    rate: 0
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createExpense(formData)
      if (result.success) {
        setFormData({
          description: "",
          tag: "OTHER",
          quantity: 1,
          rate: 0
        })
        await loadExpenses()
      }
    } catch (error) {
      console.error('Error creating expense:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter expense description"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.tag}
                  onValueChange={value => setFormData(prev => ({ ...prev, tag: value as ExpenseTag }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TAGS.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag.charAt(0) + tag.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate (Rs)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rate}
                  onChange={e => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Add Expense</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500">No expenses recorded</p>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">{expense.description}</h3>
                    <p className="text-sm text-gray-500">Category: {expense.tag.toLowerCase()}</p>
                    <p>Quantity: {expense.quantity}</p>
                    <p>Rate: Rs {expense.rate.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                    <p className="font-medium text-red-600 mt-2">
                      Total: Rs {expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 