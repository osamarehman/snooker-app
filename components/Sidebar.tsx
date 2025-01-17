"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Table2,
  Receipt,
  Settings,
  HelpCircle,
  Menu,
  X
} from "lucide-react"

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
    label: "Daily Expenses",
    icon: Receipt,
    href: "/expenses",
    color: "text-pink-700",
  },
  {
    label: "Support",
    icon: HelpCircle,
    href: "/support",
    color: "text-emerald-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Hamburger Menu */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-6 left-4 z-50 p-2 rounded-lg bg-[#111827] text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 pt-[2vh] z-40 w-[60vw] md:w-[15vw] bg-[#111827] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col min-h-screen">
          <div className="px-3 py-2 flex-1 mt-16 lg:mt-0"> {/* Added top margin for mobile */}
            <Link href="/" className="flex items-center pl-3 mb-14">
              <h1 className="text-2xl font-bold">
                Snooker Club
              </h1>
            </Link>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false)
                    }
                  }}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      {/* <main className="flex-1 lg:ml-64 p-4 mt-16 lg:mt-0"> */}
      {/* </main> */}
    </div>
  )
}