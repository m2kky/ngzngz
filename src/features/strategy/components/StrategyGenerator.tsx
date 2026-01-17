import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'playful', label: 'Playful' },
  { value: 'luxurious', label: 'Luxurious' },
] as const;

export type Tone = typeof TONES[number]['value'];

export interface AudienceDetails {
  demographics: string;
  painPoints: string;
  desires: string;
  currentSituation: string;
}

interface StrategyGeneratorProps {
  onGenerate: (
    product: string,
    audience: string,
    audienceDetails: AudienceDetails,
    targetMarket: string,
    tone: Tone
  ) => void;
  isGenerating: boolean;
}

export function StrategyGenerator({ onGenerate, isGenerating }: StrategyGeneratorProps) {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [audienceDetails, setAudienceDetails] = useState<AudienceDetails>({
    demographics: '',
    painPoints: '',
    desires: '',
    currentSituation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product.trim() && audience.trim()) {
      onGenerate(product.trim(), audience.trim(), audienceDetails, targetMarket.trim(), tone);
    }
  };

  const updateAudienceDetails = (field: keyof AudienceDetails, value: string) => {
    setAudienceDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="product" className="text-sm font-medium">
            Product / Service
          </Label>
          <Input
            id="product"
            placeholder="e.g., Digital Marketing Course"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            disabled={isGenerating}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="targetMarket" className="text-sm font-medium">
            Target Market
          </Label>
          <Input
            id="targetMarket"
            placeholder="e.g., Egypt, Saudi Arabia, Gulf"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audience" className="text-sm font-medium">
          Target Audience
        </Label>
        <Input
          id="audience"
          placeholder="e.g., Small business owners looking to increase sales"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          disabled={isGenerating}
        />
      </div>

      {/* Advanced Audience Details Toggle */}
      <Button
        id="advanced-toggle"
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <span className="text-sm">Additional audience details (optional)</span>
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
          <div className="space-y-1.5">
            <Label htmlFor="demographics" className="text-sm font-medium">
              Demographics
            </Label>
            <Input
              id="demographics"
              placeholder="e.g., Men 25-45, living in major cities"
              value={audienceDetails.demographics}
              onChange={(e) => updateAudienceDetails('demographics', e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="painPoints" className="text-sm font-medium">
              Pain Points
            </Label>
            <Textarea
              id="painPoints"
              placeholder="e.g., Struggling to reach new customers, traditional marketing not working"
              value={audienceDetails.painPoints}
              onChange={(e) => updateAudienceDetails('painPoints', e.target.value)}
              className="min-h-[70px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desires" className="text-sm font-medium">
              Goals & Desires
            </Label>
            <Textarea
              id="desires"
              placeholder="e.g., Increase sales, build a strong brand, reach larger audience"
              value={audienceDetails.desires}
              onChange={(e) => updateAudienceDetails('desires', e.target.value)}
              className="min-h-[70px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currentSituation" className="text-sm font-medium">
              Current Situation
            </Label>
            <Textarea
              id="currentSituation"
              placeholder="e.g., Have a small business, rely on word of mouth only"
              value={audienceDetails.currentSituation}
              onChange={(e) => updateAudienceDetails('currentSituation', e.target.value)}
              className="min-h-[70px] resize-none"
              disabled={isGenerating}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5" id="tone">
        <Label htmlFor="tone-select" className="text-sm font-medium">
          Tone & Style
        </Label>
        <Select value={tone} onValueChange={(v) => setTone(v as Tone)} disabled={isGenerating}>
          <SelectTrigger id="tone-select">
            <SelectValue placeholder="Select a tone" />
          </SelectTrigger>
          <SelectContent>
            {TONES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        id="generate-button"
        type="submit"
        disabled={!product.trim() || !audience.trim() || isGenerating}
        className="w-full h-11 font-medium"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? 'Generating Strategy...' : 'Generate Strategy'}
      </Button>
    </form>
  );
}