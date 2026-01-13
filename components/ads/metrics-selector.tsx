"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings2 } from "lucide-react"

export const AVAILABLE_METRICS = [
    { id: 'spend', label: 'Spend', default: true },
    { id: 'impressions', label: 'Impressions', default: true },
    { id: 'clicks', label: 'Clicks', default: true },
    { id: 'cpc', label: 'CPC', default: true },
    { id: 'ctr', label: 'CTR', default: true },
    { id: 'cpm', label: 'CPM', default: false },
    { id: 'roas', label: 'ROAS', default: true },
    { id: 'purchases', label: 'Purchases', default: false },
    { id: 'revenue', label: 'Revenue', default: false },
    { id: 'conversions', label: 'Conversions', default: false },
    { id: 'conversionRate', label: 'Conv. Rate', default: false },
]

interface MetricsSelectorProps {
    selectedMetrics: string[]
    onMetricsChange: (metrics: string[]) => void
}

export function MetricsSelector({ selectedMetrics, onMetricsChange }: MetricsSelectorProps) {
    const [open, setOpen] = useState(false)

    const toggleMetric = (metricId: string) => {
        if (selectedMetrics.includes(metricId)) {
            onMetricsChange(selectedMetrics.filter(m => m !== metricId))
        } else {
            onMetricsChange([...selectedMetrics, metricId])
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/5"
                >
                    <Settings2 size={16} className="mr-2" />
                    Customize Columns ({selectedMetrics.length})
                </Button>
            </PopoverTrigger>
            <PopoverContent className="glass-panel border-white/20 w-64">
                <div className="space-y-3">
                    <div className="font-bold text-white text-sm">Select Metrics</div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {AVAILABLE_METRICS.map(metric => (
                            <label
                                key={metric.id}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                            >
                                <Checkbox
                                    checked={selectedMetrics.includes(metric.id)}
                                    onCheckedChange={() => toggleMetric(metric.id)}
                                />
                                <span className="text-sm text-white">{metric.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
