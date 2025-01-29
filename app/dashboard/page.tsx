"use client"

import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import OngoingMatches from "./components/OngoingMatches"
import OutstandingPayments from "./components/OutstandingPayments"
import CompletedMatches from "./components/CompletedMatches"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor ongoing matches, payments, and historical data
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="ongoing"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ongoing Matches
            </TabsTrigger>
            <TabsTrigger 
              value="outstanding"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Outstanding Payments
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Completed Matches
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 bg-card rounded-lg border border-border p-4">
            <TabsContent value="ongoing">
              <OngoingMatches />
            </TabsContent>

            <TabsContent value="outstanding">
              <OutstandingPayments />
            </TabsContent>

            <TabsContent value="completed">
              <CompletedMatches />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}
