import { GraduationCap, Trophy } from 'lucide-react'
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarButton } from "../components/SidebarButton"
import { SidebarBadge } from "../components/SidebarBadge"

export function SidebarLearnSection() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Learn
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarButton icon={GraduationCap} disabled tooltip="Tutorials">
              Tutorials
            </SidebarButton>
            <SidebarBadge>Soon</SidebarBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarButton icon={Trophy} disabled tooltip="Puzzles">
              Puzzles
            </SidebarButton>
            <SidebarBadge>Soon</SidebarBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

