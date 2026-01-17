import { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/views/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStrategies, type Strategy } from "../hooks/useStrategies";
import { useClients } from "@/features/clients/hooks/useClients";

import { StrategyGenerator, type Tone, type AudienceDetails } from "../components/StrategyGenerator";
import { StrategyExportView } from "../components/StrategyExportView";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archived", color: "bg-red-100 text-red-800" },
];

export function StrategyPage() {
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy } = useStrategies();
  const { clients } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    status: "draft",
    situation: {
      market_overview: "",
      competitors: "",
      swot: { strengths: "", weaknesses: "", opportunities: "", threats: "" }
    },
    objectives: {
      business_goals: "",
      marketing_goals: "",
      kpis: ""
    },
    strategy: {
      target_audience_summary: "",
      positioning: "",
      key_messages: ""
    },
    tactics: {
      channels: "",
      content_plan: ""
    },
    action: {
      budget: "",
      timeline: "",
      responsibilities: ""
    },
    control: {
      metrics: "",
      reporting_schedule: ""
    },
    buyer_personas: [] as Array<{ name: string; age: string; bio: string; pain_points: string }>,
  });
  
  const [viewMode, setViewMode] = useState<'generator' | 'editor'>('editor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingStrategy, setViewingStrategy] = useState<Strategy | null>(null);

  const parseField = (field: string | null, fallback: any) => {
    if (!field) return fallback;
    try {
      return JSON.parse(field);
    } catch {
      // If not JSON, return as the first field of the fallback structure (or "general" field)
      const keys = Object.keys(fallback);
      if (keys.length > 0) {
        return { ...fallback, [keys[0]]: field };
      }
      return fallback;
    }
  };

  const handleOpenDialog = (strategy?: Strategy) => {
    if (strategy) {
      setEditingStrategy(strategy);
      setFormData({
        title: strategy.title,
        client_id: strategy.client_id,
        status: strategy.status,
        situation: parseField(strategy.situation, { market_overview: "", competitors: "", swot: { strengths: "", weaknesses: "", opportunities: "", threats: "" } }),
        objectives: parseField(strategy.objectives, { business_goals: "", marketing_goals: "", kpis: "" }),
        strategy: parseField(strategy.strategy, { target_audience_summary: "", positioning: "", key_messages: "" }),
        tactics: parseField(strategy.tactics, { channels: "", content_plan: "" }),
        action: parseField(strategy.action, { budget: "", timeline: "", responsibilities: "" }),
        control: parseField(strategy.control, { metrics: "", reporting_schedule: "" }),
        buyer_personas: Array.isArray(strategy.buyer_personas) ? strategy.buyer_personas : [],
      });
      setViewMode('editor');
    } else {
      setEditingStrategy(null);
      setFormData({
        title: "",
        client_id: "",
        status: "draft",
        situation: { market_overview: "", competitors: "", swot: { strengths: "", weaknesses: "", opportunities: "", threats: "" } },
        objectives: { business_goals: "", marketing_goals: "", kpis: "" },
        strategy: { target_audience_summary: "", positioning: "", key_messages: "" },
        tactics: { channels: "", content_plan: "" },
        action: { budget: "", timeline: "", responsibilities: "" },
        control: { metrics: "", reporting_schedule: "" },
        buyer_personas: [],
      });
      setViewMode('generator');
    }
    setIsDialogOpen(true);
  };

  const handleGeneratorSubmit = async (
    product: string,
    audience: string,
    audienceDetails: AudienceDetails,
    targetMarket: string,
    tone: Tone
  ) => {
    setIsGenerating(true);
    
    try {
      // Attempt to call AI Edge Function
      const { data, error } = await supabase.functions.invoke('generate-strategy', {
        body: { product, audience, audienceDetails, targetMarket, tone },
      });

      if (error) {
         // Check if it's a connection error or a functional error
         console.error("Supabase Function Error:", error);
         throw error;
      }
      
      if (data?.error) {
        console.error("AI Service Error:", data.error);
        throw new Error(data.error);
      }

      const generated = data.strategy;
      
      setFormData(prev => ({
        ...prev,
        title: `${product} Strategy`,
        situation: {
          ...prev.situation,
          market_overview: generated.market_overview || `Target Market: ${targetMarket}\nSituation: ${audienceDetails.currentSituation}`,
          competitors: generated.competitors || "",
          swot: generated.swot || prev.situation.swot
        },
        objectives: {
          ...prev.objectives,
          business_goals: generated.business_goals || "",
          marketing_goals: generated.marketing_goals || `Audience Desires: ${audienceDetails.desires}`,
          kpis: generated.kpis || ""
        },
        strategy: {
          ...prev.strategy,
          target_audience_summary: generated.target_audience_summary || `Audience: ${audience}\nDemographics: ${audienceDetails.demographics}`,
          positioning: generated.positioning || `Tone: ${tone}`,
          key_messages: generated.key_messages || ""
        },
        tactics: {
          ...prev.tactics,
          channels: generated.channels || "",
          content_plan: generated.content_plan || `Address pain points: ${audienceDetails.painPoints}`
        },
        action: {
          ...prev.action,
          timeline: generated.timeline || "",
          responsibilities: generated.responsibilities || "",
          budget: generated.budget || ""
        },
        control: {
          ...prev.control,
          metrics: generated.metrics || "",
          reporting_schedule: generated.reporting_schedule || ""
        }
      }));

      toast.success("Strategy generated successfully!");
    } catch (err) {
      console.warn("AI generation failed, falling back to simulation:", err);
      toast.info("AI Service unreachable, using offline simulation.");
      
      // Fallback Simulation
      setFormData(prev => ({
        ...prev,
        title: `${product} Strategy`,
        situation: {
          ...prev.situation,
          market_overview: `Target Market: ${targetMarket}\nCurrent Situation: ${audienceDetails.currentSituation || 'N/A'}`,
        },
        objectives: {
          ...prev.objectives,
          marketing_goals: `Audience Desires: ${audienceDetails.desires || 'N/A'}`,
        },
        strategy: {
          ...prev.strategy,
          positioning: `Tone: ${tone}\n\nApproach for ${audience}`,
        },
        tactics: {
          ...prev.tactics,
          content_plan: `Address pain points: ${audienceDetails.painPoints || 'N/A'}`,
        },
      }));
    } finally {
      setIsGenerating(false);
      setViewMode('editor');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStrategy(null);
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      client_id: formData.client_id,
      status: formData.status,
      situation: JSON.stringify(formData.situation),
      objectives: JSON.stringify(formData.objectives),
      strategy: JSON.stringify(formData.strategy),
      tactics: JSON.stringify(formData.tactics),
      action: JSON.stringify(formData.action),
      control: JSON.stringify(formData.control),
      buyer_personas: formData.buyer_personas,
    };

    try {
      if (editingStrategy) {
        await updateStrategy(editingStrategy.id, payload);
      } else {
        await createStrategy(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save strategy:", error);
    }
  };

  const handleDelete = async (strategyId: string) => {
    if (confirm("Are you sure you want to delete this strategy?")) {
      try {
        await deleteStrategy(strategyId);
      } catch (error) {
        console.error("Failed to delete strategy:", error);
      }
    }
  };

  const handleAddPersona = () => {
    setFormData(prev => ({
      ...prev,
      buyer_personas: [...prev.buyer_personas, { name: "", age: "", bio: "", pain_points: "" }],
    }));
  };

  const handleRemovePersona = (index: number) => {
    setFormData(prev => ({
      ...prev,
      buyer_personas: prev.buyer_personas.filter((_, i) => i !== index),
    }));
  };

  const handlePersonaChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      buyer_personas: prev.buyer_personas.map((persona, i) =>
        i === index ? { ...persona, [field]: value } : persona
      ),
    }));
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "clients.name",
      header: "Client",
      cell: ({ row }: { row: { original: Strategy } }) => {
        const clientName = row.original.clients?.name || "No client";
        return <span>{clientName}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Strategy } }) => {
        const status = row.original.status;
        const option = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
        return <Badge className={option.color}>{option.label}</Badge>;
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Strategy } }) => {
        const strategy = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingStrategy(strategy)}
              title="View & Export"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog(strategy)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(strategy.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategies</h1>
          <p className="text-muted-foreground">
            Manage your marketing strategies using the SOSTAC framework.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Strategy
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable columns={columns} data={strategies} />
      )}

      {viewingStrategy && (
        <StrategyExportView
          strategy={viewingStrategy}
          onClose={() => setViewingStrategy(null)}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'generator' 
                ? "Generate New Strategy" 
                : (editingStrategy ? "Edit Strategy" : "New Strategy Details")}
            </DialogTitle>
            <DialogDescription>
              {viewMode === 'generator'
                ? "Let AI help you kickstart your strategy with a few details."
                : "Fill in the SOSTAC framework details for your marketing strategy."}
            </DialogDescription>
          </DialogHeader>

          {viewMode === 'generator' ? (
            <div className="py-4">
              <StrategyGenerator onGenerate={handleGeneratorSubmit} isGenerating={isGenerating} />
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setViewMode('editor')}>
                  Skip to manual entry
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Q4 Product Launch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="situation" className="w-full">
              <TabsList className="grid grid-cols-6">
                <TabsTrigger value="situation">Situation</TabsTrigger>
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="tactics">Tactics</TabsTrigger>
                <TabsTrigger value="action">Action</TabsTrigger>
                <TabsTrigger value="control">Control</TabsTrigger>
              </TabsList>

              <TabsContent value="situation" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Market Overview</Label>
                    <Textarea
                      placeholder="Current market trends and status"
                      value={formData.situation.market_overview}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        situation: { ...prev.situation, market_overview: e.target.value }
                      }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Competitor Analysis</Label>
                    <Textarea
                      placeholder="Key competitors and their positions"
                      value={formData.situation.competitors}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        situation: { ...prev.situation, competitors: e.target.value }
                      }))}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>SWOT Analysis</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Strengths</Label>
                      <Textarea
                        value={formData.situation.swot.strengths}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          situation: { ...prev.situation, swot: { ...prev.situation.swot, strengths: e.target.value } }
                        }))}
                        rows={3}
                        className="bg-green-50/50 dark:bg-green-950/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Weaknesses</Label>
                      <Textarea
                        value={formData.situation.swot.weaknesses}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          situation: { ...prev.situation, swot: { ...prev.situation.swot, weaknesses: e.target.value } }
                        }))}
                        rows={3}
                        className="bg-red-50/50 dark:bg-red-950/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Opportunities</Label>
                      <Textarea
                        value={formData.situation.swot.opportunities}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          situation: { ...prev.situation, swot: { ...prev.situation.swot, opportunities: e.target.value } }
                        }))}
                        rows={3}
                        className="bg-blue-50/50 dark:bg-blue-950/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Threats</Label>
                      <Textarea
                        value={formData.situation.swot.threats}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          situation: { ...prev.situation, swot: { ...prev.situation.swot, threats: e.target.value } }
                        }))}
                        rows={3}
                        className="bg-orange-50/50 dark:bg-orange-950/10"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Business Goals</Label>
                  <Textarea
                    placeholder="Overall business objectives"
                    value={formData.objectives.business_goals}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      objectives: { ...prev.objectives, business_goals: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marketing Goals</Label>
                  <Textarea
                    placeholder="Specific marketing objectives (SMART)"
                    value={formData.objectives.marketing_goals}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      objectives: { ...prev.objectives, marketing_goals: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KPIs</Label>
                  <Textarea
                    placeholder="Key Performance Indicators to track"
                    value={formData.objectives.kpis}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      objectives: { ...prev.objectives, kpis: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Target Audience Summary</Label>
                  <Textarea
                    placeholder="Brief summary of target segments"
                    value={formData.strategy.target_audience_summary}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      strategy: { ...prev.strategy, target_audience_summary: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Positioning</Label>
                  <Textarea
                    placeholder="Brand positioning statement"
                    value={formData.strategy.positioning}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      strategy: { ...prev.strategy, positioning: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key Messages</Label>
                  <Textarea
                    placeholder="Core messages to communicate"
                    value={formData.strategy.key_messages}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      strategy: { ...prev.strategy, key_messages: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="tactics" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Channels</Label>
                  <Textarea
                    placeholder="Marketing channels (e.g., Social, Email, SEO)"
                    value={formData.tactics.channels}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tactics: { ...prev.tactics, channels: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content Plan</Label>
                  <Textarea
                    placeholder="Content types and frequency"
                    value={formData.tactics.content_plan}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tactics: { ...prev.tactics, content_plan: e.target.value }
                    }))}
                    rows={5}
                  />
                </div>
              </TabsContent>

              <TabsContent value="action" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Textarea
                    placeholder="Estimated budget allocation"
                    value={formData.action.budget}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, budget: e.target.value }
                    }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <Textarea
                    placeholder="Key milestones and dates"
                    value={formData.action.timeline}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, timeline: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsibilities</Label>
                  <Textarea
                    placeholder="Team roles and assignments"
                    value={formData.action.responsibilities}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, responsibilities: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="control" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Metrics</Label>
                  <Textarea
                    placeholder="Metrics to measure success"
                    value={formData.control.metrics}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      control: { ...prev.control, metrics: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reporting Schedule</Label>
                  <Textarea
                    placeholder="When and how reports will be delivered"
                    value={formData.control.reporting_schedule}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      control: { ...prev.control, reporting_schedule: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Buyer Personas Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Buyer Personas</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPersona}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Persona
                </Button>
              </div>

              {formData.buyer_personas.map((persona, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Persona {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePersona(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`persona-name-${index}`}>Name</Label>
                      <Input
                        id={`persona-name-${index}`}
                        value={persona.name}
                        onChange={(e) => handlePersonaChange(index, "name", e.target.value)}
                        placeholder="e.g., Tech-Savvy Tom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`persona-age-${index}`}>Age</Label>
                      <Input
                        id={`persona-age-${index}`}
                        value={persona.age}
                        onChange={(e) => handlePersonaChange(index, "age", e.target.value)}
                        placeholder="e.g., 25-35"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`persona-bio-${index}`}>Bio</Label>
                    <Textarea
                      id={`persona-bio-${index}`}
                      value={persona.bio}
                      onChange={(e) => handlePersonaChange(index, "bio", e.target.value)}
                      placeholder="Brief description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`persona-pain-points-${index}`}>Pain Points</Label>
                    <Textarea
                      id={`persona-pain-points-${index}`}
                      value={persona.pain_points}
                      onChange={(e) => handlePersonaChange(index, "pain_points", e.target.value)}
                      placeholder="List pain points separated by commas"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingStrategy ? "Update Strategy" : "Create Strategy"}
              </Button>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}