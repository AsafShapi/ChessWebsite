import { Timer, BookOpen, LinkIcon } from 'lucide-react'
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarButton } from "../components/SidebarButton"
import { SidebarBadge } from "../components/SidebarBadge"
import { useNavigate } from 'react-router-dom'

export function SidebarGameModes({isLoggedIn}) {
  const navigate = useNavigate()
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Game Modes
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarButton icon={Timer} disabled tooltip="Quick Play">
              Quick Play
            </SidebarButton>
            <SidebarBadge>Soon</SidebarBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarButton icon={BookOpen} disabled tooltip="Play vs AI">
              Play vs AI
            </SidebarButton>
            <SidebarBadge>Soon</SidebarBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarButton 
              icon={LinkIcon} 
              disabled={!isLoggedIn}
              onClick={() => navigate('/')}
            >
              Join by Code
            </SidebarButton>
            {!isLoggedIn && <SidebarBadge>Login Required</SidebarBadge>}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

