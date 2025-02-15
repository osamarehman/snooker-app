"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Table2,
  Receipt,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  File
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from '@supabase/auth-helpers-nextjs'

const routes = [
  {
    label: "Home",
    icon: Table2,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-violet-500",
  },
  {
    label: "Expenses",
    icon: Receipt,
    href: "/dashboard/expenses",
    color: "text-pink-700",
  },
  {
    label: "Reports",
    icon: File,
    href: "/dashboard/reports",
    color: "text-orange-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    label: "Help",
    icon: HelpCircle,
    href: "/dashboard/help",
  },
]

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className={cn(
      "relative min-h-screen border-r px-4 pb-10 pt-24",
      isCollapsed ? "w-20" : "w-72"
    )}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-4 top-4 p-2 hover:bg-muted rounded-lg"
      >
        {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      <div className="space-y-4">
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors",
                pathname === route.href ? "bg-muted" : "hover:bg-muted",
                isCollapsed && "justify-center px-2"
              )}
            >
              <route.icon className={cn("h-6 w-6", route.color)} />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </div>

        {user && (
          <div className="pt-4 border-t">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-100/50 w-full",
                isCollapsed && "justify-center px-2"
              )}
            >
              <LogOut className="h-6 w-6" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
