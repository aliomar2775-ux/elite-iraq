"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useApp } from "@/lib/app-state"

export const TAB_PATHS: Record<string, string> = {
  dashboard: "/",
  overview: "/",
  "/": "/",
  products: "/products",
  orders: "/orders",
  chatbot: "/chatbot",
  channels: "/channels",
  billing: "/billing",
  settings: "/settings",
  clearance: "/clearance",
}

export function pathToTab(pathname: string): string {
  if (!pathname || pathname === "/") return "dashboard"
  const match = Object.entries(TAB_PATHS).find(([, path]) => path === pathname)
  return match?.[0] ?? "dashboard"
}

export function useNavigateTab() {
  const router = useRouter()
  const { setActiveTab, setGlobalSearchQuery } = useApp()

  return useCallback(
    (tab: string, searchQuery = "") => {
      setActiveTab(tab)
      setGlobalSearchQuery(searchQuery)
      const path = TAB_PATHS[tab] || "/"
      router.push(searchQuery && (tab === "products" || tab === "orders") ? path : path)
    },
    [router, setActiveTab, setGlobalSearchQuery]
  )
}
