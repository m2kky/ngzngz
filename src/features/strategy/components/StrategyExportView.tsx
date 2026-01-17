import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { Strategy } from "../types";

interface StrategyExportViewProps {
  strategy: Strategy;
  onClose: () => void;
}

export function StrategyExportView({ strategy, onClose }: StrategyExportViewProps) {
  const parseJSON = (data: string | any) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  };

  const situation = parseJSON(strategy.situation);
  const objectives = parseJSON(strategy.objectives);
  const strat = parseJSON(strategy.strategy);
  const tactics = parseJSON(strategy.tactics);
  const action = parseJSON(strategy.action);
  const control = parseJSON(strategy.control);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Overlay background to close */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

        {/* Content */}
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-card shadow-xl rounded-2xl border border-border">
          {/* Header - No Print */}
          <div className="flex items-center justify-between p-6 border-b border-border print:hidden">
            <h2 className="text-2xl font-bold">Strategy Export Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
              </Button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="p-8 print:p-0 bg-white text-black dark:bg-zinc-950 dark:text-zinc-50 print:bg-white print:text-black">
            <div className="max-w-3xl mx-auto space-y-8 print:space-y-4">
              {/* Title */}
              <div className="text-center border-b-2 border-black/10 pb-6 mb-8 print:mb-4">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{strategy.title}</h1>
                <p className="text-sm text-gray-500 uppercase tracking-widest">SOSTAC® Marketing Strategy</p>
              </div>

              {/* 1. Situation */}
              <section className="break-inside-avoid">
                <h3 className="text-xl font-bold uppercase border-l-4 border-black pl-3 mb-4 flex items-center gap-2 bg-gray-50 p-2">
                  <span className="text-2xl text-gray-400 font-black">01</span> Situation Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6 pl-4">
                  <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Market Overview</h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{situation.market_overview || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Competitors</h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{situation.competitors || 'N/A'}</p>
                  </div>
                </div>
                {situation.swot && (
                  <div className="mt-4 pl-4">
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">SWOT Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 p-3 rounded border border-green-100 print:border-gray-200">
                        <strong className="block text-green-800 mb-1">Strengths</strong>
                        {situation.swot.strengths}
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-100 print:border-gray-200">
                        <strong className="block text-red-800 mb-1">Weaknesses</strong>
                        {situation.swot.weaknesses}
                      </div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-100 print:border-gray-200">
                        <strong className="block text-blue-800 mb-1">Opportunities</strong>
                        {situation.swot.opportunities}
                      </div>
                      <div className="bg-orange-50 p-3 rounded border border-orange-100 print:border-gray-200">
                        <strong className="block text-orange-800 mb-1">Threats</strong>
                        {situation.swot.threats}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* 2. Objectives */}
              <section className="break-inside-avoid">
                <h3 className="text-xl font-bold uppercase border-l-4 border-black pl-3 mb-4 flex items-center gap-2 bg-gray-50 p-2">
                  <span className="text-2xl text-gray-400 font-black">02</span> Objectives
                </h3>
                <div className="pl-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Business Goals</h4>
                      <p className="whitespace-pre-wrap text-sm">{objectives.business_goals || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Marketing Goals</h4>
                      <p className="whitespace-pre-wrap text-sm">{objectives.marketing_goals || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-100 print:border-gray-200">
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">KPIs</h4>
                    <p className="whitespace-pre-wrap text-sm font-mono">{objectives.kpis || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* 3. Strategy */}
              <section className="break-inside-avoid">
                <h3 className="text-xl font-bold uppercase border-l-4 border-black pl-3 mb-4 flex items-center gap-2 bg-gray-50 p-2">
                  <span className="text-2xl text-gray-400 font-black">03</span> Strategy
                </h3>
                <div className="pl-4 grid md:grid-cols-3 gap-6">
                   <div className="md:col-span-3">
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Positioning</h4>
                    <p className="text-lg font-serif italic text-gray-700">"{strat.positioning || 'N/A'}"</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Target Audience</h4>
                    <p className="whitespace-pre-wrap text-sm">{strat.target_audience_summary || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Key Messages</h4>
                    <p className="whitespace-pre-wrap text-sm">{strat.key_messages || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* 4. Tactics & Action */}
              <section className="break-inside-avoid">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold uppercase border-l-4 border-black pl-3 mb-4 flex items-center gap-2 bg-gray-50 p-2">
                      <span className="text-2xl text-gray-400 font-black">04</span> Tactics
                    </h3>
                    <div className="pl-4 space-y-4">
                       <div>
                        <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Channels</h4>
                        <p className="whitespace-pre-wrap text-sm">{tactics.channels || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Content Plan</h4>
                        <p className="whitespace-pre-wrap text-sm">{tactics.content_plan || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase border-l-4 border-black pl-3 mb-4 flex items-center gap-2 bg-gray-50 p-2">
                      <span className="text-2xl text-gray-400 font-black">05</span> Action
                    </h3>
                    <div className="pl-4 space-y-4">
                       <div>
                        <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Timeline</h4>
                        <p className="whitespace-pre-wrap text-sm">{action.timeline || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Responsibilities</h4>
                        <p className="whitespace-pre-wrap text-sm">{action.responsibilities || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Budget</h4>
                        <p className="whitespace-pre-wrap text-sm font-mono">{action.budget || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Control */}
              <section className="break-inside-avoid pb-8">
                <h3 className="text-xl font-bold uppercase border-l-4 border-black pl-3 mb-4 flex items-center gap-2 bg-gray-50 p-2">
                  <span className="text-2xl text-gray-400 font-black">06</span> Control
                </h3>
                 <div className="grid md:grid-cols-2 gap-6 pl-4">
                  <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Metrics & Measurement</h4>
                    <p className="whitespace-pre-wrap text-sm">{control.metrics || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500 mb-1">Reporting Schedule</h4>
                    <p className="whitespace-pre-wrap text-sm">{control.reporting_schedule || 'N/A'}</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: static;
            overflow: visible;
          }
          .min-h-screen {
            min-height: auto;
          }
          .bg-card {
            box-shadow: none;
            border: none;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:space-y-4 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-y-reverse: 0;
            margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(1rem * var(--tw-space-y-reverse));
          }
          /* Make the printable content visible */
          .fixed .inline-block,
          .fixed .inline-block * {
            visibility: visible;
          }
          .fixed .inline-block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}