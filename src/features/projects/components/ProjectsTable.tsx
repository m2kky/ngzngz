import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar } from "lucide-react";
import type { Project } from "../hooks/useProjects";
import { format } from "date-fns";

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  onProjectClick?: (projectId: string) => void;
}

export function ProjectsTable({ projects, isLoading, onProjectClick }: ProjectsTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground bg-muted/5">
        No projects found. Create your first project to get started.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "default";
      case 'completed': return "secondary"; // Should be green ideally but using badge variants
      case 'planning': return "outline";
      case 'on_hold': return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onProjectClick && onProjectClick(project.id)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{project.name}</span>
                  {project.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">{project.description}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {project.clients ? project.clients.name : <span className="text-muted-foreground italic">Internal</span>}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(project.status) as any}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : '-'}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
