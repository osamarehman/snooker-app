"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Clock, 
  CreditCard, 
  CheckSquare,
  Receipt
} from "lucide-react"

const links = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Ongoing Matches",
    href: "/dashboard/ongoing",
    icon: Clock
  },
  {
    name: "Outstanding Payments",
    href: "/dashboard/payments",
    icon: CreditCard
  },
  {
    name: "Completed Matches",
    href: "/dashboard/completed",
    icon: CheckSquare
  },
  {
    name: "Daily Expenses",
    href: "/dashboard/expenses",
    icon: Receipt
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                pathname === link.href ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : ""
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
