import { User, Users, History } from 'lucide-react'
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarButton } from "../components/SidebarButton"
import { SidebarBadge } from "../components/SidebarBadge"

export function SidebarProfileSection({ isLoggedIn, onOpenFriends }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Profile
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarButton 
              icon={User} 
              disabled
              tooltip="My Profile"
            >
              My Profile
            </SidebarButton>
            <SidebarBadge>Soon</SidebarBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarButton 
              icon={Users}
              tooltip="Friends"
              onClick={onOpenFriends}
              disabled={!isLoggedIn}
            >
              Friends
            </SidebarButton>
            {!isLoggedIn && <SidebarBadge>Login Required</SidebarBadge>}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarButton 
              icon={History}
              disabled
              tooltip="Match History"
            >
              Match History
            </SidebarButton>
            <SidebarBadge>Soon</SidebarBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

