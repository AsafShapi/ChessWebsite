import { SidebarMenuBadge } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SidebarBadge({ children, className, ...props }) {
  return (
    <SidebarMenuBadge 
      className={cn(
        "text-xs text-muted-foreground group-data-[collapsible=icon]:hidden",
        className
      )} 
      {...props}
    >
      {children}
    </SidebarMenuBadge>
  )
}

