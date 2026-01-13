import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RecordHeader } from "./RecordHeader";
import { PropertiesRow, PropertyValue, type Property, type PropertyOption } from "./PropertiesRow";
import { RecordBody } from "./RecordBody";
import { CommentsActivity } from "./CommentsActivity";
import { Share2, MoreHorizontal, Star, ChevronsRight, Archive, Trash2, CheckSquare, User, Calendar, Tag, AlertCircle, FolderKanban, Users, PanelLeftOpen, LayoutTemplate, Maximize2, Minimize2, PanelRight, RectangleHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { supabase } from "@/lib/supabase";
import { useUpdateRecord } from "@/hooks/useUpdateRecord";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import { useProperties } from "@/hooks/useProperties";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { AddPropertyDialog } from "./AddPropertyDialog";
import type { RecordType } from "@/types/record";
import { cn } from "@/lib/utils";

interface RecordSheetProps {
  open: boolean;
  onClose: () => void;
  recordId: string | null;
  type: RecordType;
}

type ViewMode = 'side' | 'center' | 'full';

const STATUS_OPTIONS: Record<string, PropertyOption[]> = {
  task: [
    { label: 'Backlog', value: 'backlog' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Internal Review', value: 'internal_review' },
    { label: 'Client Review', value: 'client_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Done', value: 'done' },
  ],
  project: [
    { label: 'Planning', value: 'planning' },
    { label: 'Active', value: 'active' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Completed', value: 'completed' },
  ],
  client: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
};

const PRIORITY_OPTIONS: PropertyOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export function RecordSheet({ open, onClose, recordId, type }: RecordSheetProps) {
  const [mode, setMode] = useState<ViewMode>('side');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to true or persist
  
  const { updateRecord } = useUpdateRecord();
  const { archiveRecord, deleteRecord } = useDeleteRecord();
  const { properties: customPropertyDefinitions, updateProperty, deleteProperty, createProperty } = useProperties(type);
  const { members } = useWorkspaceMembers();

  const fetchRecord = async () => {
    if (!recordId || !open) return;
    
    setLoading(true);
    try {
      let query;
      if (type === 'task') {
        query = supabase.from('tasks').select('*, projects(name), clients(name)').eq('id', recordId).single();
      } else if (type === 'project') {
        query = supabase.from('projects').select('*, clients(name)').eq('id', recordId).single();
      } else {
        query = supabase.from('clients').select('*').eq('id', recordId).single();
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecord(data);
    } catch (error) {
      console.error('Error fetching record:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, open, type]);

  const handleUpdate = async (field: string, value: unknown) => {
    if (!recordId || !record) return;
    try {
      await updateRecord(type, recordId, { [field]: value }, record);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRecord((prev: any) => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error('Failed to update record:', error);
    }
  };

  const handleCustomPropertyUpdate = async (key: string, value: unknown) => {
    if (!recordId || !record) return;
    try {
      const currentProps = record.custom_properties || {};
      const newProps = { ...currentProps, [key]: value };
      
      await updateRecord(type, recordId, { custom_properties: newProps }, record);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRecord((prev: any) => ({ 
        ...prev, 
        custom_properties: newProps 
      }));
    } catch (error) {
      console.error('Failed to update custom property:', error);
    }
  };

    const handleArchive = async () => {
    if (!recordId) return;
    if (!confirm('Are you sure you want to archive this record?')) return;
    
    try {
      await archiveRecord(type, recordId);
      onClose();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async () => {
    if (!recordId) return;
    if (!confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) return;
    
    try {
      await deleteRecord(type, recordId);
      onClose();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };


  const contentProps = {
    open,
    onClose,
    recordId,
    type,
    mode,
    setMode,
    record,
    loading,
    members,
    handleUpdate,
    handleCustomPropertyUpdate,
    handleArchive,
    handleDelete,
    customPropertyDefinitions,
    updateProperty,
    deleteProperty,
    createProperty,
    isSidebarOpen,
    setIsSidebarOpen,
    propertyDialogOpen,
    setPropertyDialogOpen,
  };

  if (mode === 'center') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[1000px] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col [&>button[type=button]]:hidden bg-background" aria-describedby={undefined}>
           <DialogTitle className="sr-only">Record Details</DialogTitle>
           <DialogDescription className="sr-only">View and edit record details</DialogDescription>
           <RecordContent {...contentProps} />
        </DialogContent>
      </Dialog>
    );
  }

  if (mode === 'full') {
    return (
      <Sheet open={open} onOpenChange={onClose} modal={false}>
        <SheetContent 
          side="right"
          className="w-[calc(100vw-256px)] sm:max-w-none p-0 gap-0 overflow-hidden [&>button[type=button]]:hidden transition-all duration-300 bg-background border-l shadow-none"
          aria-describedby={undefined}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetTitle className="sr-only">Record Details</SheetTitle>
          <SheetDescription className="sr-only">View and edit record details</SheetDescription>
          <RecordContent {...contentProps} isFullScreen />
        </SheetContent>
      </Sheet>
    );
  }

  // Side mode (Default)
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        className="w-[1200px] sm:max-w-[1200px] flex p-0 gap-0 overflow-hidden [&>button[type=button]]:hidden transition-all duration-300 bg-background"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Record Details</SheetTitle>
        <SheetDescription className="sr-only">View and edit record details</SheetDescription>
        <RecordContent {...contentProps} />
      </SheetContent>
    </Sheet>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecordContent({ 
  onClose, 
  recordId, 
  type, 
  mode, 
  setMode,
  record,
  loading,
  members,
  handleUpdate,
  handleCustomPropertyUpdate,
  handleArchive,
  handleDelete,
  customPropertyDefinitions,
  updateProperty,
  deleteProperty,
  createProperty,
  isSidebarOpen,
  setIsSidebarOpen,
  propertyDialogOpen,
  setPropertyDialogOpen,
  isFullScreen = false
}: any) { // Using any for props briefly to avoid huge interface, in real app usage interface

  const handlePropertyDelete = async (propertyId: string) => {
    try {
      await deleteProperty(propertyId);
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  const handlePropertyEdit = async (propertyId: string, newName: string) => {
    try {
      await updateProperty(propertyId, { name: newName });
    } catch (error) {
      console.error('Failed to update property name:', error);
    }
  };

  const handlePropertyConfigUpdate = async (propertyId: string, newConfig: any) => {
    try {
      await updateProperty(propertyId, { config: newConfig });
    } catch (error) {
      console.error('Failed to update property config:', error);
    }
  };

  const getProperties = (): Property[] => {
    if (!record) return [];

    const props: Property[] = [];

    // Common Status Property
    if (STATUS_OPTIONS[type]) {
      props.push({
        id: 'status',
        label: 'Status',
        value: record.status,
        icon: AlertCircle,
        type: 'select',
        options: STATUS_OPTIONS[type],
        onUpdate: (val) => handleUpdate('status', val)
      });
    }

    if (type === 'task') {
      props.push({ 
        id: 'priority', 
        label: 'Priority', 
        value: record.priority,
        icon: Tag,
        type: 'select',
        options: PRIORITY_OPTIONS,
        onUpdate: (val) => handleUpdate('priority', val)
      });
      props.push({ 
        id: 'due_date', 
        label: 'Due Date', 
        value: record.due_date, 
        icon: Calendar,
        type: 'date',
        onUpdate: (val) => handleUpdate('due_date', val)
      });
      if (record.projects) {
        props.push({
          id: 'project',
          label: 'Project',
          value: <span className="text-sm text-primary hover:underline cursor-pointer">{record.projects.name}</span>,
          icon: FolderKanban,
          readonly: true
        });
      }
      if (record.clients) {
        props.push({
          id: 'client',
          label: 'Client',
          value: <span className="text-sm text-primary hover:underline cursor-pointer">{record.clients.name}</span>,
          icon: Users,
          readonly: true
        });
      }
    } else if (type === 'project') {
      props.push({ 
        id: 'start_date', 
        label: 'Start Date', 
        value: record.start_date, 
        icon: Calendar,
        type: 'date',
        onUpdate: (val) => handleUpdate('start_date', val)
      });
      if (record.clients) {
        props.push({
          id: 'client',
          label: 'Client',
          value: <span className="text-sm text-primary hover:underline cursor-pointer">{record.clients.name}</span>,
          icon: Users,
          readonly: true
        });
      }
    } else if (type === 'client') {
      props.push({ 
        id: 'website', 
        label: 'Website', 
        value: record.website ? <a href={record.website} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">{record.website}</a> : '-', 
        icon: Tag,
        readonly: true
      });
      props.push({
        id: 'contact',
        label: 'Contact',
        value: <div className="flex flex-col text-sm"><span>{record.primary_contact_name}</span><span className="text-xs text-muted-foreground">{record.primary_contact_email}</span></div>,
        icon: User,
        readonly: true
      });
    }

    // Custom Properties
    if (customPropertyDefinitions) {
      customPropertyDefinitions.forEach((def: any) => {
        const val = record.custom_properties?.[def.key];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const type = def.property_type as any;
        
        props.push({
          id: def.id,
          label: def.name,
          value: val,
          icon: Tag,
          type,
          options: def.config?.options,
          onUpdate: (val) => handleCustomPropertyUpdate(def.key, val),
          onDelete: () => handlePropertyDelete(def.id),
          onEdit: (newName) => handlePropertyEdit(def.id, newName),
          onConfigUpdate: (newConfig) => handlePropertyConfigUpdate(def.id, newConfig),
          onDuplicate: () => {
             if(confirm(`Duplicate "${def.name}"?`)) {
                createProperty({
                  name: def.name + ' Copy',
                  key: `${def.key}_copy_${Math.floor(Math.random() * 1000)}`,
                  property_type: def.property_type as any, 
                  config: def.config,
                  entity_type: type as any
                }); 
             }
          },
          onTypeChange: (newType) => {
             if(confirm(`Change type of "${def.name}" to ${newType}?`)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                updateProperty(def.id, { property_type: newType } as any).catch(console.error);
             }
          }
        });
      });
    }

    return props;
  };

  const getIcon = () => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'project': return FolderKanban;
      case 'client': return Users;
      default: return CheckSquare;
    }
  };

  const getTitle = () => {
    if (!record) return "";
    return record.title || record.name;
  };

  const getDescription = () => {
    if (!record) return "";
    return record.description || "";
  };

  return (
    <>
        {loading ? (
          <div className="flex items-center justify-center p-8 h-full w-full">Loading...</div>
        ) : recordId ? (
          <div className={cn("flex-1 flex min-w-0 h-full bg-background transition-all duration-300", isFullScreen ? "max-w-5xl mx-auto w-full border-x shadow-sm" : "")}>
            {/* Main Content (Left) */}
            <div className="flex-1 flex flex-col min-w-0 h-full bg-background">
               {/* Fixed Header */}
               <div className="flex items-center justify-between px-6 py-3 border-b bg-background z-10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={onClose}
                        className="hover:underline hover:text-foreground transition-colors"
                      >
                        {type === 'task' ? "Tasks" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
                      </button>
                      <span>/</span>
                      <span className="font-medium text-foreground">{getTitle()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                      {/* View Switcher */}
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Switch View">
                                <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                            <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem checked={mode === 'side'} onCheckedChange={() => setMode('side')}>
                               <PanelRight className="mr-2 h-4 w-4" />
                               Side Peek
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={mode === 'center'} onCheckedChange={() => setMode('center')}>
                               <RectangleHorizontal className="mr-2 h-4 w-4" />
                               Center Peek
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={mode === 'full'} onCheckedChange={() => setMode('full')}>
                               <Maximize2 className="mr-2 h-4 w-4" />
                               Full Page
                            </DropdownMenuCheckboxItem>
                         </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Sidebar Toggle - View Details */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Close Details" : "View Details"}
                      >
                        {isSidebarOpen ? (
                          <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                           <PanelLeftOpen className="h-4 w-4 text-muted-foreground rotate-180" /> 
                        )}
                      </Button>

                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Star className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleArchive}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleDelete} 
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="w-px h-4 bg-border mx-1" />

                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} title="Close Sheet">
                        {mode === 'center' || mode === 'full' ? <Minimize2 className="h-4 w-4 text-muted-foreground" /> : <ChevronsRight className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                  </div>
               </div>

               <ScrollArea className="flex-1 h-full"> 
                 <div className="flex flex-col min-h-full">
                    <div className="p-6 pb-0">
                       <RecordHeader 
                         icon={getIcon()} 
                         title={getTitle()} 
                         showToolbar={false}
                         onArchive={handleArchive}
                         onDelete={handleDelete}
                         isSidebarOpen={isSidebarOpen}
                         onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                       />
                       
                       {/* Property Summary (First 3) */}
                       <div className="mt-8 mb-2 flex items-start -ml-2">
                          {getProperties().slice(0, 3).map((prop) => (
                            <div key={prop.id} className="group flex flex-col gap-1.5 px-3 min-w-[140px]">
                               <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                  <prop.icon className="h-3.5 w-3.5" />
                                  <span className="truncate">{prop.label}</span>
                               </div>
                               <div className="min-h-[24px] flex items-center">
                                  <PropertyValue prop={prop as Property} members={members} />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <RecordBody 
                      description={getDescription()} 
                      onUpdate={(val) => handleUpdate('description', val)}
                    />
                    <CommentsActivity recordType={type} recordId={recordId || ''} />
                 </div>
               </ScrollArea>
            </div>

            {/* Properties Sidebar (Right) */}
            {isSidebarOpen && (
              <div className="w-[320px] border-l bg-muted/5 h-full flex flex-col transition-all duration-300 relative group/sidebar">
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSidebarOpen(false)} title="Close Sidebar">
                       <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                     </Button>
                  </div>
                <PropertiesRow 
                   properties={getProperties() as Property[]} 
                   members={members}
                   orientation="vertical"
                   onAddProperty={() => setPropertyDialogOpen(true)}
                />
              </div>
            )}
            
            <AddPropertyDialog 
               open={propertyDialogOpen} 
               onOpenChange={setPropertyDialogOpen}
               entityType={type}
               onCreate={async (input) => {
                 try {
                   await createProperty(input);
                 } catch (e) {
                   console.error(e);
                 }
               }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground w-full">
            Record not found
          </div>
        )}
    </>
  );
}
