"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Home, 
  MessageSquare, 
  Bot, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Palette,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Activity,
  Sparkles,
  Building2,
  Globe,
  Shield
} from "lucide-react"

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home, description: "Overview & quick actions" },
  { name: "Templates", href: "/templates", icon: MessageSquare, description: "Message templates" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, description: "Performance metrics" },
  { name: "AI Agents", href: "/ai-agents", icon: Bot, description: "AI automation" },
  { name: "Teams", href: "/teams", icon: Users, description: "Team management" },
  { name: "Brand Setup", href: "/brand-setup", icon: Building2, description: "Brand configuration" },
  { name: "Brand Content", href: "/brand-content", icon: Palette, description: "Content management" },
  { name: "Social Posts", href: "/social-posts", icon: Globe, description: "Social media content" },
  { name: "Settings", href: "/settings", icon: Settings, description: "App settings" },
]

const quickActions = [
  { name: "Create Template", action: "create-template", icon: MessageSquare },
  { name: "Generate Content", action: "generate-content", icon: Brain },
  { name: "Schedule Message", action: "schedule-message", icon: Calendar },
  { name: "View Analytics", action: "view-analytics", icon: TrendingUp },
  { name: "Setup AI Agent", action: "setup-agent", icon: Bot },
]

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (value: string) => {
    setOpen(false)
    
    // Handle navigation
    const navItem = navigationItems.find(item => item.name.toLowerCase() === value.toLowerCase())
    if (navItem) {
      router.push(navItem.href)
      return
    }
    
    // Handle quick actions
    const action = quickActions.find(item => item.name.toLowerCase() === value.toLowerCase())
    if (action) {
      handleQuickAction(action.action)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create-template":
        router.push("/templates?action=create")
        break
      case "generate-content":
        router.push("/brand-content?action=generate")
        break
      case "schedule-message":
        router.push("/templates?action=schedule")
        break
      case "view-analytics":
        router.push("/analytics")
        break
      case "setup-agent":
        router.push("/ai-agents?action=setup")
        break
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search or jump to...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.name}
                value={item.name}
                onSelect={handleSelect}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Quick Actions">
            {quickActions.map((item) => (
              <CommandItem
                key={item.name}
                value={item.name}
                onSelect={handleSelect}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
