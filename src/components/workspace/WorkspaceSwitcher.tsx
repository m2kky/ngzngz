
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/hooks/useWorkspace"
import { ChevronDown, Plus, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

export function WorkspaceSwitcher() {
  const { workspace, workspaces, switchWorkspace } = useWorkspace()
  const navigate = useNavigate()

  if (!workspace) return null

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between px-2 py-6 hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent/50"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-8 w-8 rounded-md border border-border">
              {workspace.logo_url && <AvatarImage src={workspace.logo_url} alt={workspace.name} />}
              <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                {getInitials(workspace.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left overflow-hidden">
              <span className="text-sm font-semibold truncate w-full max-w-[120px]">
                {workspace.name}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full max-w-[120px]">
                {workspace.slug}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start" side="bottom" sideOffset={4}>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch Workspace
        </DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem 
            key={w.id} 
            onClick={() => switchWorkspace(w.id)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar className="h-6 w-6 rounded-sm border border-border">
                {w.logo_url && <AvatarImage src={w.logo_url} alt={w.name} />}
                <AvatarFallback className="rounded-sm bg-primary/10 text-[10px] text-primary">
                  {getInitials(w.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{w.name}</span>
            </div>
            {w.id === workspace.id && <Check className="h-4 w-4 shrink-0 opacity-50" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
            className="cursor-pointer gap-2"
            onClick={() => navigate('/onboarding')}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-dashed text-muted-foreground">
            <Plus className="h-4 w-4" />
          </div>
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
