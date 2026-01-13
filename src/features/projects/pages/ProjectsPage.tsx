import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { ProjectsTable } from "../components/ProjectsTable";
import { NewProjectDialog } from "../components/NewProjectDialog";
import { RecordSheet } from "@/components/records/RecordSheet";

export function ProjectsPage() {
  const { projects, loading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Track and manage your ongoing projects.</p>
        </div>
        <NewProjectDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </NewProjectDialog>
      </div>

      <ProjectsTable 
        projects={projects} 
        isLoading={loading} 
        onProjectClick={setSelectedProjectId}
      />

      <RecordSheet
        open={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
        recordId={selectedProjectId}
        type="project"
      />
    </div>
  );
}
