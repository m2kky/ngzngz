import { useState } from "react";
import { Plus, Edit, Trash2, Copy, Palette, Type, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrandKits, type BrandKit } from "../hooks/useBrandKits";
import { useClients } from "@/features/clients/hooks/useClients";

type ColorEntry = {
  name: string;
  hex: string;
  type: string;
};

type VoiceSlider = Record<string, number>;

import { useNavigate } from "react-router-dom";

export function BrandKitPage() {
  const navigate = useNavigate();
  const { brandKits, loading, createBrandKit, updateBrandKit, deleteBrandKit } = useBrandKits();
  const { clients } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrandKit, setEditingBrandKit] = useState<BrandKit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    voice_sliders: {} as VoiceSlider,
    colors: [] as ColorEntry[],
    typography: [] as string[],
    guidelines: [] as string[],
  });

  const handleOpenDialog = (brandKit?: BrandKit) => {
    if (brandKit) {
      setEditingBrandKit(brandKit);
      setFormData({
        name: brandKit.name,
        client_id: brandKit.client_id,
        voice_sliders: typeof brandKit.voice_sliders === 'object' ? brandKit.voice_sliders : {},
        colors: Array.isArray(brandKit.colors) ? brandKit.colors : [],
        typography: Array.isArray(brandKit.typography) ? brandKit.typography : [],
        guidelines: Array.isArray(brandKit.guidelines) ? brandKit.guidelines : [],
      });
    } else {
      setEditingBrandKit(null);
      setFormData({
        name: "",
        client_id: "",
        voice_sliders: {},
        colors: [],
        typography: [],
        guidelines: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBrandKit(null);
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      client_id: formData.client_id,
      voice_sliders: formData.voice_sliders,
      colors: formData.colors,
      typography: formData.typography,
      guidelines: formData.guidelines,
    };

    try {
      if (editingBrandKit) {
        await updateBrandKit(editingBrandKit.id, payload);
      } else {
        await createBrandKit(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save brand kit:", error);
    }
  };

  const handleDelete = async (brandKitId: string) => {
    if (confirm("Are you sure you want to delete this brand kit?")) {
      try {
        await deleteBrandKit(brandKitId);
      } catch (error) {
        console.error("Failed to delete brand kit:", error);
      }
    }
  };

  const handleAddColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: "", hex: "#000000", type: "primary" }],
    }));
  };

  const handleRemoveColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleColorChange = (index: number, field: keyof ColorEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      ),
    }));
  };

  const handleAddTypography = () => {
    setFormData(prev => ({
      ...prev,
      typography: [...prev.typography, ""],
    }));
  };

  const handleRemoveTypography = (index: number) => {
    setFormData(prev => ({
      ...prev,
      typography: prev.typography.filter((_, i) => i !== index),
    }));
  };

  const handleTypographyChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      typography: prev.typography.map((font, i) => i === index ? value : font),
    }));
  };

  const handleAddGuideline = () => {
    setFormData(prev => ({
      ...prev,
      guidelines: [...prev.guidelines, ""],
    }));
  };

  const handleRemoveGuideline = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guidelines: prev.guidelines.filter((_, i) => i !== index),
    }));
  };

  const handleGuidelineChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      guidelines: prev.guidelines.map((url, i) => i === index ? value : url),
    }));
  };

  const handleVoiceSliderChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      voice_sliders: { ...prev.voice_sliders, [key]: value },
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied: ${text}`);
    });
  };

  const renderColorPalette = (colors: ColorEntry[]) => {
    return (
      <div className="flex flex-wrap gap-2">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className="relative group cursor-pointer"
            onClick={() => copyToClipboard(color.hex)}
          >
            <div
              className="w-12 h-12 rounded-lg border"
              style={{ backgroundColor: color.hex }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <Copy className="h-5 w-5 text-white" />
            </div>
            <div className="text-xs mt-1 truncate">{color.name}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderVoiceSliders = (sliders: VoiceSlider) => {
    const defaultSliders = {
      "Formal/Casual": 50,
      "Serious/Funny": 50,
      "Modern/Classic": 50,
      "Bold/Subtle": 50,
    };

    const merged = { ...defaultSliders, ...sliders };

    return Object.entries(merged).map(([label, value]) => (
      <div key={label} className="space-y-2">
        <div className="flex justify-between">
          <Label>{label}</Label>
          <span className="text-sm text-muted-foreground">{value}%</span>
        </div>
        <div className="relative pt-1">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Kits</h1>
          <p className="text-muted-foreground">
            Manage visual identity and brand guidelines for your clients.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Brand Kit
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandKits.map((kit) => {
            const clientName = kit.clients?.name || "No client";
            const colors = Array.isArray(kit.colors) ? kit.colors : [];
            return (
              <div
                key={kit.id}
                className="border rounded-lg p-4 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/brand-kits/${kit.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{kit.name}</h3>
                    <p className="text-sm text-muted-foreground">{clientName}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(kit);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(kit.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Color Palette Preview */}
                  {colors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-4 w-4" />
                        <span className="text-sm font-medium">Colors</span>
                      </div>
                      <div className="flex gap-1">
                        {colors.slice(0, 5).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color.hex }}
                            title={`${color.name}: ${color.hex}`}
                          />
                        ))}
                        {colors.length > 5 && (
                          <div className="w-8 h-8 rounded border flex items-center justify-center text-xs">
                            +{colors.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Typography Preview */}
                  {Array.isArray(kit.typography) && kit.typography.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Type className="h-4 w-4" />
                        <span className="text-sm font-medium">Typography</span>
                      </div>
                      <div className="space-y-1">
                        {kit.typography.slice(0, 3).map((font, idx) => (
                          <div key={idx} className="text-sm truncate" style={{ fontFamily: font }}>
                            {font}
                          </div>
                        ))}
                        {kit.typography.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{kit.typography.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guidelines Preview */}
                  {Array.isArray(kit.guidelines) && kit.guidelines.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Guidelines</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {kit.guidelines.length} image{kit.guidelines.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrandKit ? "Edit Brand Kit" : "Create New Brand Kit"}
            </DialogTitle>
            <DialogDescription>
              Define visual identity including colors, typography, tone of voice, and guidelines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Primary Brand Kit"
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

            <Tabs defaultValue="voice" className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="voice">Tone of Voice</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              </TabsList>

              <TabsContent value="voice" className="space-y-6 pt-4">
                <div className="space-y-4">
                  {renderVoiceSliders(formData.voice_sliders, true)}
                  <div className="space-y-2">
                    <Label>Add Custom Slider</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Slider label (e.g., Professional/Creative)"
                        id="new-slider-label"
                      />
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Color Palette</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Color
                    </Button>
                  </div>

                  {formData.colors.map((color, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Color {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColor(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`color-name-${index}`}>Name</Label>
                          <Input
                            id={`color-name-${index}`}
                            value={color.name}
                            onChange={(e) => handleColorChange(index, "name", e.target.value)}
                            placeholder="e.g., Primary Blue"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`color-hex-${index}`}>Hex Code</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`color-hex-${index}`}
                              value={color.hex}
                              onChange={(e) => handleColorChange(index, "hex", e.target.value)}
                              placeholder="#000000"
                            />
                            <div
                              className="w-10 h-10 rounded border"
                              style={{ backgroundColor: color.hex }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`color-type-${index}`}>Type</Label>
                          <Select
                            value={color.type}
                            onValueChange={(value) => handleColorChange(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="accent">Accent</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.colors.length > 0 && (
                    <div className="border-t pt-4">
                      <Label className="text-lg font-semibold">Preview</Label>
                      {renderColorPalette(formData.colors)}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="typography" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Font Family</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTypography}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Font
                    </Button>
                  </div>

                  {formData.typography.map((font, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={font}
                        onChange={(e) => handleTypographyChange(index, e.target.value)}
                        placeholder="e.g., Inter, sans-serif"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTypography(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="guidelines" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Do's & Don'ts Images</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddGuideline}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Image URL
                    </Button>
                  </div>

                  {formData.guidelines.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => handleGuidelineChange(index, e.target.value)}
                          placeholder="https://example.com/image.png"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGuideline(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {url && (
                        <div className="border rounded p-2">
                          <img
                            src={url}
                            alt={`Guideline ${index + 1}`}
                            className="max-h-32 mx-auto"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingBrandKit ? "Update Brand Kit" : "Create Brand Kit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}