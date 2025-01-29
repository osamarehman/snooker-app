"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  PlusCircle, 
  Tag, 
  FileText, 
  Hash, 
  DollarSign, 
  Calendar, 
  Receipt,
  Utensils,
  Wrench,
  Lightbulb,
  Users,
  HelpCircle
} from "lucide-react"
import { createExpense, getExpenses, type ExpenseFormData } from "@/app/actions/expenses"
import type { Expense, ExpenseTag } from "@prisma/client"

const EXPENSE_TAGS: { tag: ExpenseTag; icon: React.ElementType; color: string }[] = [
  { tag: "FOOD", icon: Utensils, color: "text-orange-500" },
  { tag: "MAINTENANCE", icon: Wrench, color: "text-blue-500" },
  { tag: "UTILITIES", icon: Lightbulb, color: "text-yellow-500" },
  { tag: "SALARY", icon: Users, color: "text-green-500" },
  { tag: "OTHER", icon: HelpCircle, color: "text-gray-500" }
]

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"
        />
      </div>
    );
  }

  const getTagDetails = (tag: ExpenseTag) => {
    return EXPENSE_TAGS.find(t => t.tag === tag) || EXPENSE_TAGS[4]; // Default to OTHER
  };

  return (
    <div className="space-y-6">
        <Card
          className="animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PlusCircle className="w-5 h-5" />
              New Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Description
                  </Label>
                  <Input
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter expense description"
                    className="focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Category
                  </Label>
                  <Select
                    value={formData.tag}
                    onValueChange={value => setFormData(prev => ({ ...prev, tag: value as ExpenseTag }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_TAGS.map(({ tag, icon: Icon, color }) => (
                        <SelectItem key={tag} value={tag}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            {tag.charAt(0) + tag.slice(1).toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Rate (Rs)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={e => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add Expense
              </Button>
            </form>
          </CardContent>
        </Card>

      <div className="expenses-list">
        <AnimatePresence mode="wait">
          {expenses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 space-y-4 bg-muted/20 rounded-lg"
            >
              <Receipt className="w-12 h-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-primary">No Expenses</h2>
              <p className="text-muted-foreground text-center">
                Start adding your daily business expenses to track them.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {expenses.map((expense, index) => {
              const { icon: TagIcon, color } = getTagDetails(expense.tag);
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.2,
                    delay: index * 0.05 
                  }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-muted ${color}`}>
                              <TagIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{expense.description}</h3>
                              <p className="text-sm text-muted-foreground">
                                {expense.tag.charAt(0) + expense.tag.slice(1).toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-muted/20 rounded-lg">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Quantity: {expense.quantity}</p>
                            <p className="text-sm text-muted-foreground">Rate: Rs {expense.rate.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-red-600">
                              Rs {expense.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
