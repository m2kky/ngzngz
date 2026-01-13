import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Settings2, Trash2, Edit2, Plus, GripVertical, Check, Upload, File as FileIcon, Link as LinkIcon, Copy, ArrowRightLeft } from "lucide-react";
import type { WorkspaceMemberProfile } from "@/hooks/useWorkspaceMembers";

export type PropertyType = 'text' | 'select' | 'date' | 'custom' | 'person' | 'files' | 'url' | 'email' | 'number' | 'multi_select' | 'checkbox';

export interface PropertyOption {
  label: string;
  value: string;
  color?: string;
}

export interface Property {
  id: string;
  label: string;
  value: any;
  icon: React.ElementType;
  type?: PropertyType;
  options?: PropertyOption[];
  onUpdate?: (value: any) => void;
  readonly?: boolean;
  onDelete?: () => void;
  onEdit?: (newName: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfigUpdate?: (newConfig: any) => void;
  onDuplicate?: () => void;
  onTypeChange?: (newType: PropertyType) => void;
}

interface PropertiesRowProps {
  properties: Property[];
  members?: WorkspaceMemberProfile[];
  onAddProperty?: () => void;
  orientation?: 'horizontal' | 'vertical';
  showTitle?: boolean;
  showAddButton?: boolean;
}

// PropertyValue component is defined below.

export function PropertiesRow({ 
  properties, 
  members = [], 
  onAddProperty, 
  orientation = 'horizontal',
  showTitle = true,
  showAddButton = true
}: PropertiesRowProps) {
  if (orientation === 'vertical') {
     return (
        <ScrollArea className="h-full w-full">
           <div className="flex flex-col w-full p-4 gap-4">
              {showTitle && (
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                   <Settings2 className="h-4 w-4" /> Properties
                </div>
              )}
              
              {properties.map((prop) => (
                <div key={prop.id} className="flex flex-col gap-1.5 group">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground w-full">
                         {prop.readonly ? (
                            <div className="flex items-center gap-2 w-full">
                               <prop.icon className="h-3.5 w-3.5" />
                               <span className="text-xs">{prop.label}</span>
                            </div>
                         ) : (
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-6 p-1 -ml-1 gap-2 text-muted-foreground hover:text-foreground font-normal w-full justify-start">
                                     <prop.icon className="h-3.5 w-3.5" />
                                     <span className="text-xs">{prop.label}</span>
                                  </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="start" className="w-56">
                                 <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Property Options</DropdownMenuLabel>
                                 <DropdownMenuItem onClick={() => {
                                     const newName = prompt("Enter new property name:", prop.label);
                                     if (newName && newName !== prop.label) prop.onEdit?.(newName);
                                 }}>
                                   <Edit2 className="mr-2 h-4 w-4" /> Rename
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => prop.onDuplicate?.()}>
                                   <Copy className="mr-2 h-4 w-4" /> Duplicate
                                 </DropdownMenuItem>
                                 <DropdownMenuSub>
                                   <DropdownMenuSubTrigger>
                                     <ArrowRightLeft className="mr-2 h-4 w-4" /> Type
                                   </DropdownMenuSubTrigger>
                                   <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                      {['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'person', 'files', 'url', 'email'].map(t => (
                                         <DropdownMenuItem key={t} onClick={() => prop.onTypeChange?.(t as PropertyType)} disabled={prop.type === t}>
                                            {t === prop.type && <Check className="mr-2 h-4 w-4" />}
                                            <span className="capitalize">{t.replace('_', ' ')}</span>
                                         </DropdownMenuItem>
                                      ))}
                                   </DropdownMenuSubContent>
                                 </DropdownMenuSub>
                                 {(prop.type === 'select' || prop.type === 'multi_select') && (
                                    <DropdownMenuSub>
                                     <DropdownMenuSubTrigger>
                                       <Settings2 className="mr-2 h-4 w-4" /> Edit Options
                                     </DropdownMenuSubTrigger>
                                     <DropdownMenuSubContent className="w-48">
                                       <DropdownMenuItem onSelect={(e) => {
                                          e.preventDefault(); 
                                          const label = prompt("Option Label:");
                                          if (label) {
                                            const newOption = { label, value: label.toLowerCase(), color: 'gray' };
                                            const newOptions = [...(prop.options || []), newOption];
                                            prop.onConfigUpdate?.({ options: newOptions });
                                          }
                                       }}>
                                         <Plus className="mr-2 h-4 w-4" /> Add Option
                                       </DropdownMenuItem>
                                       <DropdownMenuSeparator />
                                       {prop.options?.map((opt, i) => (
                                         <DropdownMenuItem key={i} className="justify-between group/opt">
                                           <span>{opt.label}</span>
                                           <Trash2 
                                             className="h-3 w-3 text-muted-foreground opacity-0 group-hover/opt:opacity-100 hover:text-destructive cursor-pointer"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               const newOptions = prop.options?.filter((_, idx) => idx !== i);
                                               prop.onConfigUpdate?.({ options: newOptions });
                                             }}
                                           />
                                         </DropdownMenuItem>
                                       ))}
                                     </DropdownMenuSubContent>
                                   </DropdownMenuSub>
                                 )}
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { if(confirm(`Delete "${prop.label}"?`)) prop.onDelete?.(); }}>
                                   <Trash2 className="mr-2 h-4 w-4" /> Delete Property
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         )}
                      </div>
                   </div>
                   <div className="min-h-[28px] flex items-center">
                      <PropertyValue prop={prop} members={members} />
                   </div>
                </div>
              ))}
              
              {showAddButton && onAddProperty && (
                <Button variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground justify-start" onClick={onAddProperty}>
                   <Plus className="mr-2 h-3.5 w-3.5" /> Add Property
                </Button>
              )}
           </div>
        </ScrollArea>
     );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap border-b bg-muted/30">
      <div className="flex w-max space-x-6 p-4">
        {properties.map((prop) => (
          <div key={prop.id} className="w-[200px] flex flex-col gap-2 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <prop.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{prop.label}</span>
              </div>
              {!prop.readonly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Property Options</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        const newName = prompt("Enter new property name:", prop.label);
                        if (newName && newName !== prop.label) prop.onEdit?.(newName);
                    }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => prop.onDuplicate?.()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Type
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                         {['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'person', 'files', 'url', 'email'].map(t => (
                            <DropdownMenuItem key={t} onClick={() => prop.onTypeChange?.(t as PropertyType)} disabled={prop.type === t}>
                               {t === prop.type && <Check className="mr-2 h-4 w-4" />}
                               <span className="capitalize">{t.replace('_', ' ')}</span>
                            </DropdownMenuItem>
                         ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {(prop.type === 'select' || prop.type === 'multi_select') && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings2 className="mr-2 h-4 w-4" />
                          Edit Options
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          <DropdownMenuItem onSelect={(e) => {
                             e.preventDefault(); // Prevent close
                             const label = prompt("Option Label:");
                             if (label) {
                               const newOption = { label, value: label.toLowerCase(), color: 'gray' };
                               const newOptions = [...(prop.options || []), newOption];
                               prop.onConfigUpdate?.({ options: newOptions });
                             }
                          }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {prop.options?.map((opt, i) => (
                            <DropdownMenuItem key={i} className="justify-between group/opt">
                              <span>{opt.label}</span>
                              <Trash2 
                                className="h-3 w-3 text-muted-foreground opacity-0 group-hover/opt:opacity-100 hover:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newOptions = prop.options?.filter((_, idx) => idx !== i);
                                  prop.onConfigUpdate?.({ options: newOptions });
                                }}
                              />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if(confirm(`Delete "${prop.label}"?`)) {
                          prop.onDelete?.();
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Property
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="h-8 flex items-center">
              <PropertyValue prop={prop} members={members} />
            </div>
          </div>
        ))}

        {onAddProperty && (
          <Button variant="outline" className="h-auto flex-col gap-2 p-4 w-[150px] border-dashed text-muted-foreground hover:text-primary hover:border-primary" onClick={onAddProperty}>
            <Plus className="h-6 w-6" />
            <span>Add Property</span>
          </Button>
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function PropertyValue({ prop, members }: { prop: Property, members: WorkspaceMemberProfile[] }) {
  const [value, setValue] = React.useState(prop.value);

  React.useEffect(() => {
    setValue(prop.value);
  }, [prop.value]);

  const handleBlur = () => {
    if (value !== prop.value) {
      prop.onUpdate?.(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  if (prop.readonly) {
    if (prop.type === 'person') {
       const userIds = Array.isArray(prop.value) ? prop.value : (prop.value ? [prop.value] : []);
       const selectedMembers = members.filter(m => userIds.includes(m.id));
       return (
         <div className="flex -space-x-2">
           {selectedMembers.map(m => (
             <Avatar key={m.id} className="h-6 w-6 border-2 border-background">
               <AvatarImage src={m.avatar_url} />
               <AvatarFallback className="text-[10px]">{m.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
             </Avatar>
           ))}
           {selectedMembers.length === 0 && <span className="text-sm text-muted-foreground">-</span>}
         </div>
       );
    }
    if (prop.type === 'files') {
      const files = (Array.isArray(prop.value) ? prop.value : []) as {name: string, url: string}[];
       return (
           <div className="flex flex-col gap-1 w-full">
             {files.map((f, i) => (
               <div key={i} className="flex items-center gap-1 text-xs bg-muted/50 px-1 py-0.5 rounded group/file w-full justify-between">
                 <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline truncate text-blue-500">
                   <FileIcon className="h-3 w-3" /> <span className="truncate">{f.name}</span>
                 </a>
               </div>
             ))}
              {files.length === 0 && <span className="text-sm text-muted-foreground">-</span>}
           </div>
       );
    }
    if (prop.type === 'url') {
      const url = prop.value as string;
      return url ? (
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-500 hover:underline">
             <LinkIcon className="h-3 w-3" />
             <span className="truncate max-w-[150px]">{url}</span>
          </a>
      ) : <span className="text-sm text-muted-foreground">-</span>;
    }
    if (prop.type === 'multi_select') {
      const selectedValues = (Array.isArray(prop.value) ? prop.value : []) as string[];
      const options = prop.options || [];
      const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
      const orphanValues = selectedValues.filter(v => !options.find(o => o.value === v));
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(opt => (
             <Badge key={opt.value} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal" style={opt.color ? { backgroundColor: opt.color + '20', color: opt.color } : undefined}>
               {opt.label}
             </Badge>
          ))}
          {orphanValues.map(val => (
             <Badge key={val} variant="outline" className="px-1.5 py-0 text-[10px] font-normal text-muted-foreground">
               {val}
             </Badge>
          ))}
          {selectedValues.length === 0 && <span className="text-sm text-muted-foreground">-</span>}
        </div>
      );
    }
     // Default readonly
     return <div className="text-sm truncate min-h-[20px] flex items-center">{prop.value}</div>;
  }

  // Edit Mode
  if (prop.type === 'person') {
       const userIds = Array.isArray(prop.value) ? prop.value : (prop.value ? [prop.value] : []);
       const selectedMembers = members.filter(m => userIds.includes(m.id));
       return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 -ml-2 px-2 text-sm font-normal justify-start hover:bg-muted/50 p-0">
              {selectedMembers.length > 0 ? (
                 <div className="flex -space-x-1 items-center">
                    {selectedMembers.map(m => (
                      <Avatar key={m.id} className="h-5 w-5 border-2 border-background">
                        <AvatarImage src={m.avatar_url} />
                        <AvatarFallback className="text-[8px]">{m.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">{selectedMembers.map(m => m.full_name).join(', ')}</span>
                 </div>
              ) : (
                <span className="text-muted-foreground opacity-50">Empty</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]" align="start">
            <Command>
              <CommandInput placeholder="Select person..." />
              <CommandList>
                <CommandEmpty>No members found.</CommandEmpty>
                <CommandGroup>
                  {members.map((member) => (
                    <CommandItem
                      key={member.id}
                      onSelect={() => {
                        const currentIds = (Array.isArray(prop.value) ? prop.value : (prop.value ? [prop.value] : [])) as string[];
                        const newIds = currentIds.includes(member.id) 
                          ? currentIds.filter(id => id !== member.id)
                          : [...currentIds, member.id];
                        prop.onUpdate?.(newIds);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          (Array.isArray(prop.value) && prop.value.includes(member.id)) || prop.value === member.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                         <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <span>{member.full_name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
       );
  }

  if (prop.type === 'files') {
      const files = (Array.isArray(prop.value) ? prop.value : []) as {name: string, url: string}[];
      return (
        <div className="flex flex-col items-start gap-1 w-full">
           <div className="flex flex-col gap-1 w-full">
             {files.map((f, i) => (
               <div key={i} className="flex items-center gap-1 text-xs bg-muted/50 px-1 py-0.5 rounded group/file w-full justify-between">
                 <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline truncate text-blue-500">
                   <FileIcon className="h-3 w-3" /> <span className="truncate">{f.name}</span>
                 </a>
                 <div className="hidden group-hover/file:block cursor-pointer" onClick={() => {
                   const newFiles = files.filter((_, idx) => idx !== i);
                   prop.onUpdate?.(newFiles);
                }}><Trash2 className="h-3 w-3 text-red-500" /></div>
               </div>
             ))}
           </div>
            <Button variant="ghost" size="sm" className="h-6 px-1 text-xs text-muted-foreground w-full justify-start" onClick={() => {
                const url = prompt("Enter File URL (Upload not implemented yet):");
                if(url) {
                   const name = url.split('/').pop() || 'File';
                   prop.onUpdate?.([...files, {name, url}]);
                }
            }}>
              <Upload className="h-3 w-3 mr-1" /> Add File
            </Button>
        </div>
      );
  }

  if (prop.type === 'checkbox') {
    return (
      <div className="flex items-center h-full">
         <Checkbox 
           checked={!!prop.value} 
           onCheckedChange={(checked) => prop.onUpdate?.(checked)}
           className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
         />
      </div>
    );
  }

  if (prop.type === 'multi_select') {
      const selectedValues = (Array.isArray(prop.value) ? prop.value : []) as string[];
      const options = prop.options || [];
      const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
      const orphanValues = selectedValues.filter(v => !options.find(o => o.value === v));

      const renderBadges = () => (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(opt => (
             <Badge key={opt.value} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal" style={opt.color ? { backgroundColor: opt.color + '20', color: opt.color } : undefined}>
               {opt.label}
             </Badge>
          ))}
          {orphanValues.map(val => (
             <Badge key={val} variant="outline" className="px-1.5 py-0 text-[10px] font-normal text-muted-foreground">
               {val}
             </Badge>
          ))}
        </div>
      );

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto min-h-[32px] -ml-2 px-2 py-1 text-sm font-normal justify-start hover:bg-muted/50 p-0 whitespace-normal text-left">
              {selectedValues.length > 0 ? renderBadges() : <span className="text-muted-foreground opacity-50">Empty</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]" align="start">
            <Command>
              <CommandInput placeholder="Select options..." />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                         const isActive = selectedValues.includes(option.value);
                         const newValue = isActive 
                           ? selectedValues.filter(v => v !== option.value) 
                           : [...selectedValues, option.value];
                         prop.onUpdate?.(newValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                         {option.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />}
                         <span>{option.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
  }

  if (prop.type === 'select') {
    return (
      <Select 
        value={typeof prop.value === 'string' ? prop.value : undefined} 
        onValueChange={prop.onUpdate}
      >
        <SelectTrigger className="h-7 px-2 text-xs border-0 bg-transparent hover:bg-muted focus:ring-0 focus:ring-offset-0 w-fit min-w-[100px] shadow-none">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {prop.options?.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (prop.type === 'date') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"ghost"}
            className={cn(
              "h-7 px-2 text-xs border-0 bg-transparent hover:bg-muted justify-start text-left font-normal w-fit min-w-[100px]",
              !prop.value && "text-muted-foreground"
            )}
          >
            {prop.value ? format(new Date(prop.value), "MMM d, yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={prop.value ? new Date(prop.value) : undefined}
            onSelect={(date) => prop.onUpdate && prop.onUpdate(date ? format(date, 'yyyy-MM-dd') : null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Default to Input for text, number, email, url (editable), etc.
  return (
    <Input 
      value={value || ''} 
      onChange={(e) => setValue(e.target.value)} 
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="h-7 px-2 text-xs border-transparent hover:border-input focus:border-input bg-transparent shadow-none" 
      placeholder="Empty"
    />
  );
}



