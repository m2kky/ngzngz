import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import type { Client } from "../hooks/useClients";

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onClientClick?: (clientId: string) => void;
}

export function ClientsTable({ clients, isLoading, onClientClick }: ClientsTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground bg-muted/5">
        No clients found. Add your first client to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-75">Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onClientClick && onClientClick(client.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={client.logo_url || ""} />
                    <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    {client.website && (
                      <a 
                        href={client.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        {client.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{client.primary_contact_name || '-'}</span>
                  <span className="text-xs text-muted-foreground">{client.primary_contact_email || '-'}</span>
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
