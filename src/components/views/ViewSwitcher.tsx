import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  LayoutList, 
  KanbanSquare, 
  CalendarDays, 
  Plus, 
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type ViewType = 'list' | 'board' | 'calendar';

interface View {
  id: string;
  name: string;
  type: ViewType;
  isCustom: boolean;
}

const DEFAULT_VIEWS: View[] = [
  { id: 'default-list', name: 'All Tasks', type: 'list', isCustom: false },
  { id: 'default-board', name: 'Board', type: 'board', isCustom: false },
];

export function ViewSwitcher() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentViewType = (searchParams.get('view') as ViewType) || 'list';
  
  // TODO: Fetch from supabase saved_views table
  const [views, setViews] = useState<View[]>(DEFAULT_VIEWS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const activeView = views.find(v => v.type === currentViewType) || views[0];

  const handleSwitch = (view: View) => {
    setSearchParams({ view: view.type });
  };

  const handleStartEdit = (view: View, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(view.id);
    setEditName(view.name);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setViews(views.map(v => v.id === editingId ? { ...v, name: editName } : v));
    setEditingId(null);
    // TODO: persist to DB
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  const getViewIcon = (type: ViewType) => {
    switch (type) {
      case 'board': return <KanbanSquare className="w-4 h-4" />;
      case 'calendar': return <CalendarDays className="w-4 h-4" />;
      default: return <LayoutList className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 -mb-2 scrollbar-none">
      {views.map((view) => {
        const isActive = currentViewType === view.type && !editingId; // Simple logic for now
        
        if (editingId === view.id) {
          return (
            <div key={view.id} className="flex items-center px-2 py-1 bg-[#2c2c2c] rounded-md border border-[#3c3c3c]">
              {getViewIcon(view.type)}
              <Input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className="h-5 w-24 border-0 p-0 pl-2 bg-transparent focus-visible:ring-0 text-sm"
              />
            </div>
          );
        }

        return (
          <div
            key={view.id}
            onClick={() => handleSwitch(view)}
            className={cn(
              "group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer select-none",
              isActive 
                ? "bg-[#2c2c2c] text-white shadow-sm" 
                : "text-muted-foreground hover:bg-[#2c2c2c]/50 hover:text-white"
            )}
          >
            {getViewIcon(view.type)}
            <span>{view.name}</span>
            
            {/* Context Menu for renaming (only basic implementation for custom views or if allowed) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div 
                  role="button"
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-[#3c3c3c] transition-opacity",
                    isActive && "opacity-100" // Always show options for active view
                  )}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 bg-[#1e1e1e] border-[#2c2c2c] text-white">
                <DropdownMenuItem onClick={(e) => handleStartEdit(view, e as any)}>
                  <Pencil className="w-4 h-4 mr-2" /> Rename
                </DropdownMenuItem>
                {view.isCustom && (
                  <>
                    <DropdownMenuSeparator className="bg-[#2c2c2c]" />
                    <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}

      <div className="w-px h-5 bg-[#2c2c2c] mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#1e1e1e] border-[#2c2c2c] text-white">
          <DropdownMenuItem onClick={() => {
            const newView: View = { 
              id: Date.now().toString(), 
              name: 'New Board', 
              type: 'board', 
              isCustom: true 
            };
            setViews([...views, newView]);
            setSearchParams({ view: 'board' }); // Switch to it
            setTimeout(() => {
                setEditingId(newView.id);
                setEditName(newView.name);
            }, 100);
          }}>
            <KanbanSquare className="w-4 h-4 mr-2" /> Board
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
             const newView: View = { 
              id: Date.now().toString(), 
              name: 'New Table', 
              type: 'list', 
              isCustom: true 
            };
            setViews([...views, newView]);
            setSearchParams({ view: 'list' });
             setTimeout(() => {
                setEditingId(newView.id);
                setEditName(newView.name);
            }, 100);
          }}>
            <LayoutList className="w-4 h-4 mr-2" /> Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
