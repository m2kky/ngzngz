import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table2, Kanban, Calendar, Settings2, SlidersHorizontal } from "lucide-react";
import type { DataViewConfig, ViewType } from "./hooks/useDataViewConfig";

export interface ColumnDefinition {
  id: string;
  label: string;
  canHide?: boolean;
}

interface DataViewToolbarProps {
  config: DataViewConfig;
  onViewChange: (view: ViewType) => void;
  onVisibilityChange: (columnId: string, isVisible: boolean) => void;
  availableColumns: ColumnDefinition[];
}

export function DataViewToolbar({
  config,
  onViewChange,
  onVisibilityChange,
  availableColumns
}: DataViewToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-1">
      {/* View Switcher */}
      <Tabs value={config.viewType} onValueChange={(v) => onViewChange(v as ViewType)} className="h-8">
        <TabsList className="h-8 bg-muted/50">
          <TabsTrigger value="list" className="h-6 px-2 text-xs">
            <Table2 className="mr-1.5 h-3.5 w-3.5" />
            Table
          </TabsTrigger>
          <TabsTrigger value="board" className="h-6 px-2 text-xs">
            <Kanban className="mr-1.5 h-3.5 w-3.5" />
            Board
          </TabsTrigger>
          <TabsTrigger value="calendar" className="h-6 px-2 text-xs">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Calendar
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        {/* Properties / Columns Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              Properties
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Visible Properties</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableColumns.map((column) => {
              if (column.canHide === false) return null;
              
              const isVisible = config.visibleColumns[column.id] !== false;
              
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={isVisible}
                  onCheckedChange={(checked) => onVisibilityChange(column.id, checked)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Grouping (Placeholder for future) */}
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground" disabled>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Group By
        </Button>
      </div>
    </div>
  );
}
