import { SidebarMenuButton } from "@/components/ui/sidebar"

export function SidebarButton({ icon: Icon, children, ...props }) {
  return (
    <SidebarMenuButton {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </SidebarMenuButton>
  )
}

