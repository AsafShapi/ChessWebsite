import { CastleIcon} from 'lucide-react'
import { SidebarHeader as Header, SidebarTrigger } from "@/components/ui/sidebar"

export function SidebarHeader() {
  return (
    <Header className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <CastleIcon className="h-6 w-6" />
          <span className="text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis group-data-[collapsible=icon]:hidden">
            Chess Game
          </span>
        </div>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden lg:flex hidden" />
      </div>
    </Header>
  )
}

