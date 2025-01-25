import { useState } from "react"
import { useSelector } from "react-redux"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CastleIcon } from 'lucide-react'
import { Sidebar as CustomSidebar, SidebarContent } from "@/components/ui/sidebar"
import { FriendsPanel } from '../friends-panel'
import { SidebarHeader } from "./sections/SidebarHeader"
import { SidebarMainMenu } from "./sections/SidebarMainMenu"
import { SidebarGameModes } from "./sections/SidebarGameModes"
import { SidebarLearnSection } from "./sections/SidebarLearnSection"
import { SidebarProfileSection } from "./sections/SidebarProfileSection"
import { SidebarFooter } from "./sections/SidebarFooter"

export function Sidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFriendsPanelOpen, setIsFriendsPanelOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const user = useSelector(state => state.auth.user)
  const isLoggedIn = !!user

  const handleLogout = () => {
    window.location.href = '/api/logout'
  }

  const sidebarContent = (
    <>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMainMenu />
        <SidebarGameModes isLoggedIn={isLoggedIn} />
        <SidebarLearnSection />
        <SidebarProfileSection 
          isLoggedIn={isLoggedIn}
          onOpenFriends={() => setIsFriendsPanelOpen(true)}
        />
      </SidebarContent>
      <SidebarFooter 
        isLoggedIn={isLoggedIn}
        user={user}
        isSettingsOpen={isSettingsOpen}
        onSettingsChange={setIsSettingsOpen}
        onLogout={handleLogout}
      />
    </>
  )
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <CustomSidebar collapsible="icon">
          {sidebarContent}
        </CustomSidebar>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed left-4 top-4 z-40"
        >
          <CastleIcon className="h-6 w-6" />
        </Button>
        <SheetContent side="left" className="p-0 w-[280px]">
          <CustomSidebar collapsible="none">
            {sidebarContent}
          </CustomSidebar>
        </SheetContent>
      </Sheet>
      
      <FriendsPanel 
        isOpen={isFriendsPanelOpen}
        onClose={() => setIsFriendsPanelOpen(false)}
      />
    </>
  )
}

