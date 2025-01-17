"use client"

// import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import OngoingMatches from "./components/OngoingMatches"
import OutstandingPayments from "./components/OutstandingPayments"
import CompletedMatches from "./components/CompletedMatches"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ongoing">Ongoing Matches</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing">
          <OngoingMatches />
        </TabsContent>

        <TabsContent value="outstanding">
          <OutstandingPayments />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedMatches />
        </TabsContent>
      </Tabs>
    </div>
  )
} 