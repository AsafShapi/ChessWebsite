import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarButton } from "../components/SidebarButton"

export function SidebarMainMenu() {
  const navigate = useNavigate()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Main Menu
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarButton 
              icon={Home} 
              onClick={() => navigate('/')}
            >
              Home
            </SidebarButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

