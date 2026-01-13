import { TooltipRenderProps } from 'react-joyride';
import { Button } from "@/components/ui/button"
import { ArrowRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function TourTooltip({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    isLastStep,
}: TooltipRenderProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                {...tooltipProps}
                className="relative max-w-md rounded-3xl border border-white/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_40px_rgba(157,75,255,0.3)] p-6 text-white overflow-hidden"
                style={{
                    boxShadow: '0 0 25px rgba(157,75,255,0.4), inset 0 0 20px rgba(255,255,255,0.05)'
                }}
            >
                {/* Neon Glow Effects */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-xs font-bold shadow-lg">
                                {index + 1}
                            </div>
                            {step.title && (
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                                    {step.title}
                                </h3>
                            )}
                        </div>
                        <button
                            {...closeProps}
                            className="text-zinc-400 hover:text-white transition-colors hover:bg-white/10 p-1 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-zinc-200 mb-8 leading-relaxed text-sm font-medium">
                        {step.content}
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                        <div className="flex gap-2">
                            {index > 0 && (
                                <Button
                                    {...backProps}
                                    variant="ghost"
                                    size="sm"
                                    className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
                                >
                                    Back
                                </Button>
                            )}
                        </div>
                        <Button
                            {...primaryProps}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-6 font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-white/10 transition-all hover:scale-105"
                        >
                            {isLastStep ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
