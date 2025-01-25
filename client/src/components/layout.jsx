import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "./sidebar/index"
import { ThemeProvider } from "./theme-provider"
import { SetUsernameDialog } from "./set-username-dialog"

export function Layout({ children }) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <Sidebar />
                <SidebarInset className="bg-background">{children}</SidebarInset>
                <SetUsernameDialog />
            </SidebarProvider>
        </ThemeProvider>
    )
}

