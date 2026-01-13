import { Button } from "@/components/ui/button";
import { Share2, MoreHorizontal, Star, Archive, Trash2, PanelRightOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecordHeaderProps {
  icon: React.ElementType;
  title: string;
  breadcrumbs?: string[];
  isFavorite?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function RecordHeader({ 
  icon: Icon, 
  title, 
  breadcrumbs, 
  isFavorite, 
  isSidebarOpen,
  onToggleSidebar,
  onArchive,
  onDelete,
  showToolbar = true,
}: RecordHeaderProps & { showToolbar?: boolean }) {
  return (
    <div className="flex flex-col gap-4 pb-4 border-b">
      {/* Top Bar: Breadcrumbs & Actions */}
      {showToolbar && (
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-2 text-xs">
            {breadcrumbs?.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {onToggleSidebar && !isSidebarOpen && (
               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSidebar} title="Open properties sidebar">
                 <PanelRightOpen className="h-4 w-4" />
               </Button>
            )}
  
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onArchive} disabled={!onArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete} 
                  disabled={!onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
  
  
          </div>
        </div>
      )}

      {/* Title Area */}
      <div className="flex items-start gap-3 px-1">
        <div className="mt-1 p-2 rounded-md bg-secondary text-secondary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
      </div>
    </div>
  );
}
