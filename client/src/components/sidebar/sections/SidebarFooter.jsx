import { Settings, LogOut, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarFooter as Footer, SidebarTrigger } from "@/components/ui/sidebar"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoginDialog } from "@/components/login-dialog"

export function SidebarFooter({ isLoggedIn, user, isSettingsOpen, onSettingsChange, onLogout }) {
  return (
      <Footer className="p-4 space-y-4 group-data-[collapsible=icon]:p-2">
        <SidebarTrigger className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center" />

        {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <Avatar>
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>{user?.username?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium leading-none truncate">
                    {user?.username || user?.email?.split("@")[0] || "User"}
                  </p>
                </div>
              </div>
              <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white group-data-[collapsible=icon]:p-2 relative group/premium"
                  size="lg"
                  tooltip="Upgrade to Premium"
              >
                <Sparkles className="h-4 w-4" />
                <span className="ml-2 group-data-[collapsible=icon]:hidden group-hover/premium:opacity-0 transition-opacity">
              Upgrade to Premium
            </span>
                <span className="ml-2 group-data-[collapsible=icon]:hidden absolute inset-0 flex items-center justify-center opacity-0 group-hover/premium:opacity-100 transition-opacity">
              Coming Soon
            </span>
              </Button>
            </>
        ) : (
            <LoginDialog>
              <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-data-[collapsible=icon]:p-2 flex items-center gap-2"
              >
                <User className="h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">Sign in</span>
              </Button>
            </LoginDialog>
        )}

        <Collapsible open={isSettingsOpen} onOpenChange={onSettingsChange} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
              <Settings className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm">Dark Mode</span>
              <ThemeToggle />
            </div>
            <Button variant="ghost" className="w-full justify-start text-sm" disabled>
              All Settings
              <span className="ml-auto text-xs text-muted-foreground">Soon</span>
            </Button>
            {isLoggedIn && (
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </Footer>
  )
}

