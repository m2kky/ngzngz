import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Upload, Download, Search, Trash2, Edit2, Copy, Check, 
  FileJson, FileCode, FileType, Loader2, ArrowLeft, Palette, Type, Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

type BrandKit = Database['public']['Tables']['brand_kits']['Row'] & {
  clients?: { name: string } | null;
};

const fontOptions = [
  { name: 'Inter', type: 'Sans Serif' },
  { name: 'Roboto', type: 'Sans Serif' },
  { name: 'Poppins', type: 'Sans Serif' },
  { name: 'Playfair Display', type: 'Serif' },
  { name: 'Merriweather', type: 'Serif' },
  { name: 'Montserrat', type: 'Sans Serif' },
  { name: 'Open Sans', type: 'Sans Serif' },
  { name: 'Lato', type: 'Sans Serif' },
];

export function BrandKitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [isFontDialogOpen, setIsFontDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Editing State
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [colorForm, setColorForm] = useState({ name: '', hex: '#000000', type: 'primary' });
  const [editingFontIndex, setEditingFontIndex] = useState<number | null>(null); // 0 for Heading, 1 for Body

  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && workspace) {
      fetchBrandKit();
    }
  }, [id, workspace?.id]);

  const fetchBrandKit = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_kits')
        .select(`*, clients:client_id (name)`)
        .eq('id', id)
        .single();

      if (error) throw error;
      setBrandKit(data as BrandKit);
    } catch (err: any) {
      console.error('Error fetching brand kit:', err);
      toast.error("Failed to load brand kit");
    } finally {
      setLoading(false);
    }
  };

  const updateBrandKit = async (updates: Partial<BrandKit>) => {
    if (!brandKit) return;
    try {
      const { error } = await supabase
        .from('brand_kits')
        .update(updates)
        .eq('id', brandKit.id);

      if (error) throw error;
      setBrandKit({ ...brandKit, ...updates });
      toast.success("Brand kit updated");
    } catch (err: any) {
      console.error('Error updating brand kit:', err);
      toast.error("Failed to update brand kit");
    }
  };

  // --- Colors ---
  const getColors = () => {
    return Array.isArray(brandKit?.colors) ? brandKit?.colors as any[] : [];
  };

  const handleSaveColor = async () => {
    if (!colorForm.name) {
      toast.error("Please enter a color name");
      return;
    }

    const currentColors = getColors();
    let newColors = [...currentColors];

    if (editingColorIndex !== null) {
      newColors[editingColorIndex] = { ...colorForm };
    } else {
      newColors.push({ ...colorForm });
    }

    await updateBrandKit({ colors: newColors });
    setIsColorDialogOpen(false);
    setEditingColorIndex(null);
    setColorForm({ name: '', hex: '#000000', type: 'primary' });
  };

  const handleDeleteColor = async (index: number) => {
    if (confirm("Delete this color?")) {
      const currentColors = getColors();
      const newColors = currentColors.filter((_, i) => i !== index);
      await updateBrandKit({ colors: newColors });
    }
  };

  const openAddColor = () => {
    setEditingColorIndex(null);
    setColorForm({ name: '', hex: '#000000', type: 'primary' });
    setIsColorDialogOpen(true);
  };

  const openEditColor = (color: any, index: number) => {
    setEditingColorIndex(index);
    setColorForm({ name: color.name, hex: color.hex, type: color.type || 'primary' });
    setIsColorDialogOpen(true);
  };

  // --- Typography ---
  const getFonts = () => {
    const fonts = Array.isArray(brandKit?.typography) ? brandKit?.typography as string[] : [];
    return {
      heading: fonts[0] || 'Inter',
      body: fonts[1] || 'Inter'
    };
  };

  const handleSaveFont = async (fontName: string) => {
    const currentFonts = Array.isArray(brandKit?.typography) ? [...(brandKit?.typography as string[])] : [];
    // Ensure at least 2 elements
    if (currentFonts.length < 2) {
      while (currentFonts.length < 2) currentFonts.push('Inter');
    }

    if (editingFontIndex !== null) {
      currentFonts[editingFontIndex] = fontName;
      await updateBrandKit({ typography: currentFonts });
      setIsFontDialogOpen(false);
    }
  };

  // --- Assets (Guidelines) ---
  const getAssets = () => {
    return Array.isArray(brandKit?.guidelines) ? brandKit?.guidelines as string[] : [];
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const uploadToast = toast.loading(`Uploading ${file.name}...`);

      try {
        // 1. Upload to Storage (assuming 'brand-assets' bucket exists, or use 'public')
        // We'll use a generic 'uploads' bucket if 'brand-assets' doesn't exist, or try to create it.
        // For now, let's assume 'brand_assets' bucket from reference.
        const { data, error: uploadError } = await supabase.storage
           .from('brand_assets')
           .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
           .from('brand_assets')
           .getPublicUrl(fileName);

        // 3. Update Database
        const currentAssets = getAssets();
        await updateBrandKit({ guidelines: [...currentAssets, publicUrl] });

        toast.dismiss(uploadToast);
        toast.success("Upload successful");
      } catch (err: any) {
        console.error(err);
        toast.dismiss(uploadToast);
        toast.error("Upload failed: " + err.message);
      } finally {
         // Reset input
         if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAsset = async (index: number) => {
    if(confirm("Delete this asset?")) {
       const currentAssets = getAssets();
       const newAssets = currentAssets.filter((_, i) => i !== index);
       await updateBrandKit({ guidelines: newAssets });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brandKit) {
    return <div className="p-8 text-center">Brand Kit not found</div>;
  }

  const colors = getColors();
  const fonts = getFonts();
  const assets = getAssets();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/brand-kits')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
             <h1 className="text-2xl font-bold text-foreground">{brandKit.name}</h1>
             <p className="text-muted-foreground text-sm">Client: {brandKit.clients?.name || 'Internal'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="w-4 h-4" />
            Export Kit
          </Button>
          <Button size="sm" className="gap-2" onClick={handleUploadClick}>
            <Upload className="w-4 h-4" />
            Upload Assets
          </Button>
        </div>
      </div>

      {/* Brand Overview Card - Mimicking Reference */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {brandKit.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">{brandKit.name}</h2>
              <p className="text-muted-foreground mb-3">Brand Identity & Assets</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Created: {new Date(brandKit.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{colors.length} Colors</span>
                <span>•</span>
                <span>{assets.length} Assets</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Palette */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" /> Color Palette
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" onClick={openAddColor}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div 
                    className="w-full aspect-square rounded-xl mb-2 border border-border/20 relative overflow-hidden shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => openEditColor(color, i)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDeleteColor(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground truncate">{color.name}</p>
                    <p
                      className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors font-mono"
                      onClick={() => {
                        navigator.clipboard.writeText(color.hex);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      {color.hex}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="h-5 w-5" /> Typography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                onClick={() => { setEditingFontIndex(0); setIsFontDialogOpen(true); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Heading Font</p>
                  <Edit2 className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: fonts.heading }}>{fonts.heading}</p>
                <p className="text-muted-foreground" style={{ fontFamily: fonts.heading }}>The quick brown fox jumps over the lazy dog</p>
              </div>

              <div
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                onClick={() => { setEditingFontIndex(1); setIsFontDialogOpen(true); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Body Font</p>
                  <Edit2 className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-2xl text-foreground mb-1" style={{ fontFamily: fonts.body }}>{fonts.body}</p>
                <p className="text-muted-foreground" style={{ fontFamily: fonts.body }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Brand Assets ({assets.length})
          </CardTitle>
          <div className="relative w-[200px]">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search assets..." className="pl-9 h-9 bg-muted/30" />
          </div>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No assets uploaded yet</p>
              <Button variant="link" onClick={handleUploadClick}>Upload your first asset</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-square rounded-xl bg-muted/30 border border-border/20 overflow-hidden"
                >
                  <img 
                    src={url} 
                    alt={`Asset ${i}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for non-images
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-4xl">📄</span>`;
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => window.open(url, '_blank')}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteAsset(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Dialogs --- */}

      {/* Color Dialog */}
      <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingColorIndex !== null ? 'Edit Color' : 'Add New Color'}</DialogTitle>
            <DialogDescription>Manage your brand palette color.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input 
                value={colorForm.name} 
                onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })} 
                placeholder="e.g. Primary Dark" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={colorForm.hex} 
                  onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })} 
                  className="w-12 h-10 p-1 cursor-pointer" 
                />
                <Input 
                  value={colorForm.hex} 
                  onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })} 
                  placeholder="#000000" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveColor}>{editingColorIndex !== null ? 'Update Color' : 'Add Color'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Font Dialog */}
      <Dialog open={isFontDialogOpen} onOpenChange={setIsFontDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Typography</DialogTitle>
            <DialogDescription>Choose a font family from the library.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
            {fontOptions.map(font => {
              const currentFont = editingFontIndex === 0 ? fonts.heading : fonts.body;
              return (
                <div
                  key={font.name}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border ${currentFont === font.name ? 'border-primary bg-primary/5' : 'border-border/40 hover:bg-muted/50'}`}
                  onClick={() => handleSaveFont(font.name)}
                >
                  <div className="flex-1">
                    <p className="font-medium" style={{ fontFamily: font.name }}>{font.name}</p>
                    <p className="text-xs text-muted-foreground">{font.type}</p>
                  </div>
                  {currentFont === font.name && <Check className="w-4 h-4 text-primary" />}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        colors={colors}
        fonts={fonts}
      />
    </div>
  );
}

// --- Export Dialog Component ---
interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colors: any[];
  fonts: { heading: string; body: string };
}

function ExportDialog({ open, onOpenChange, colors, fonts }: ExportDialogProps) {
  const [format, setFormat] = useState('css');
  const [selectedSections, setSelectedSections] = useState({ colors: true, typography: true, assets: true });

  const generateCode = () => {
    if (format === 'css') {
      return `:root {
  /* Brand Colors */
${colors.map((c) => `  --color-${c.name.toLowerCase().replace(/\s+/g, '-')}: ${c.hex};`).join('\n')}

  /* Typography */
  --font-heading: '${fonts.heading}', sans-serif;
  --font-body: '${fonts.body}', sans-serif;
}`;
    }
    if (format === 'tailwind') {
      return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${colors.map((c) => `        '${c.name.toLowerCase().replace(/\s+/g, '-')}': '${c.hex}',`).join('\n')}
      },
      fontFamily: {
        heading: ['${fonts.heading}', 'sans-serif'],
        body: ['${fonts.body}', 'sans-serif'],
      }
    }
  }
}`;
    }
    if (format === 'json') {
      return JSON.stringify({ colors, fonts, version: "1.0.0" }, null, 2);
    }
    return '';
  };

  const handleDownload = () => {
     const code = generateCode();
     const blob = new Blob([code], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `brand-kit.${format === 'tailwind' ? 'js' : format}`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
     toast.success("Download started!");
     onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl">Export Brand Kit</DialogTitle>
            <DialogDescription>
              Download your brand assets and code tokens in your preferred format.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-1 overflow-hidden mt-6">
          {/* Sidebar Controls */}
          <div className="w-[280px] p-6 border-r border-border/50 space-y-8 h-full flex flex-col bg-muted/10">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Include</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-colors" checked={selectedSections.colors} onCheckedChange={(c) => setSelectedSections(prev => ({ ...prev, colors: !!c }))} />
                  <label htmlFor="include-colors" className="text-sm font-medium leading-none">Color Palette</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-typography" checked={selectedSections.typography} onCheckedChange={(c) => setSelectedSections(prev => ({ ...prev, typography: !!c }))} />
                  <label htmlFor="include-typography" className="text-sm font-medium leading-none">Typography</label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Format</h4>
              <div className="space-y-2">
                <Button
                  variant={format === 'css' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setFormat('css')}
                >
                  <FileCode className="w-4 h-4 mr-2" /> CSS Variables
                </Button>
                <Button
                  variant={format === 'tailwind' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setFormat('tailwind')}
                >
                  <FileType className="w-4 h-4 mr-2" /> Tailwind Config
                </Button>
                <Button
                  variant={format === 'json' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setFormat('json')}
                >
                  <FileJson className="w-4 h-4 mr-2" /> JSON Data
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col h-full bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 bg-white/5">
              <span className="text-xs text-muted-foreground font-mono">
                {format === 'css' ? 'styles.css' : format === 'tailwind' ? 'tailwind.config.js' : 'brand.json'}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => {
                navigator.clipboard.writeText(generateCode());
                toast.success("Copied code!");
              }}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <pre className="font-mono text-sm text-[rgb(201,209,217)] leading-relaxed">
                <code>{generateCode()}</code>
              </pre>
            </ScrollArea>
            <div className="p-4 border-t border-border/10 bg-white/5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" /> Download Package
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}