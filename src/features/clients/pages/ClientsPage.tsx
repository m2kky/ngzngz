import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useClients } from "../hooks/useClients";
import { ClientsTable } from "../components/ClientsTable";
import { NewClientDialog } from "../components/NewClientDialog";
import { RecordSheet } from "@/components/records/RecordSheet";

export function ClientsPage() {
  const { clients, loading } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships and details.</p>
        </div>
        <NewClientDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </NewClientDialog>
      </div>

      <ClientsTable 
        clients={clients} 
        isLoading={loading} 
        onClientClick={setSelectedClientId}
      />

      <RecordSheet
        open={!!selectedClientId}
        onClose={() => setSelectedClientId(null)}
        recordId={selectedClientId}
        type="client"
      />
    </div>
  );
}
