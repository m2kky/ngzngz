"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Command, Users, MessageSquare, Zap, Search, Check, Database, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

// Duplicated GlassCard for isolation (or could be shared)
const DemoGlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            {children}
        </div>
    )
}

export const SenseiLiveDemo = () => {
    const [step, setStep] = useState(0);
    const [typedText, setTypedText] = useState("");
    const fullText = 'Does this headline hit? "Best Marketing Tool 2024"';

    useEffect(() => {
        let currentStep = 0;

        const sequence = async () => {
            // Reset
            setStep(0);
            setTypedText("");

            // Step 1: Typing
            await new Promise(r => setTimeout(r, 1000));
            setStep(1);
            for (let i = 0; i <= fullText.length; i++) {
                setTypedText(fullText.slice(0, i));
                await new Promise(r => setTimeout(r, 50)); // Typing speed
            }

            // Step 2: Sending/Thinking
            await new Promise(r => setTimeout(r, 500));
            setStep(2); // User message sent static, Sensei thinking

            // Step 3: Response
            await new Promise(r => setTimeout(r, 1500)); // Thinking time
            setStep(3);
        };

        const interval = setInterval(() => {
            sequence();
        }, 8000); // Loop every 8s

        sequence();

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <DemoGlassCard className="p-6 relative z-10 min-h-[300px] flex flex-col justify-end">
                <div className="space-y-6 w-full">
                    {/* User Message Area */}
                    <div className="flex justify-end min-h-[60px]">
                        <AnimatePresence>
                            {step >= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-zinc-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm"
                                >
                                    {typedText}
                                    {step === 1 && <span className="animate-pulse">|</span>}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sensei Area */}
                    <div className="flex justify-start items-end gap-3 min-h-[140px]">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] flex-shrink-0">
                            S
                        </div>

                        <div className="flex-1">
                            <AnimatePresence mode="wait">
                                {step === 2 && (
                                    <motion.div
                                        key="thinking"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex gap-1 h-10 items-center px-4"
                                    >
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="response"
                                        initial={{ opacity: 0, x: -10, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: "auto" }}
                                        className="bg-purple-900/30 border border-purple-500/20 rounded-2xl rounded-tl-sm p-4 text-sm w-full overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                                            <span className="text-xs font-bold text-purple-300">Analyzer Output</span>
                                            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/20">Vibe Score: 40/100 💀</span>
                                        </div>
                                        <p className="text-zinc-300 mb-3">Too generic, bestie. It gives "corporate PowerPoint". Try something like:</p>
                                        <div className="bg-black/30 p-3 rounded-lg border border-purple-500/10 flex items-center gap-3">
                                            <Sparkles className="w-4 h-4 text-[#ccff00]" />
                                            <p className="text-[#ccff00] font-bold">"The OS that runs your Empire." 🚀</p>
                                            <Button size="sm" className="ml-auto h-7 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs border border-purple-500/30">Copy</Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </DemoGlassCard>
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-50" />
        </div>
    )
}

export const SquadsLiveDemo = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const sequence = async () => {
            setStep(0);
            // 0: Initial state (empty or just header)
            await new Promise(r => setTimeout(r, 1000));
            setStep(1); // Message 1 appears

            await new Promise(r => setTimeout(r, 2000));
            setStep(2); // Sensei Detecting

            await new Promise(r => setTimeout(r, 1500));
            setStep(3); // Task Created
        };

        const interval = setInterval(() => {
            sequence();
        }, 10000);

        sequence();
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex justify-center">
            <DemoGlassCard className="p-6 w-full max-w-md relative z-10 min-h-[400px]">
                {/* Header */}
                <div className="border-b border-white/10 pb-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-bold flex items-center gap-2">#campaign-launch <span className="text-[10px] text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded-full">Team</span></span>
                    </div>
                    <Users className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="space-y-6">
                    {/* Message 1 */}
                    <AnimatePresence>
                        {step >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">S</div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-bold text-blue-400">Sarah</span>
                                        <span className="text-[10px] text-zinc-500">10:42 AM</span>
                                    </div>
                                    <p className="text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg rounded-tl-none border border-white/5">
                                        We need a new TikTok creative for the Black Friday push. Can someone handle that?
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sensei Logic */}
                    <AnimatePresence mode="wait">
                        {step === 2 && (
                            <motion.div
                                key="detecting"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex gap-3 items-center opacity-70"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center text-xs font-bold">S</div>
                                <div className="text-xs text-purple-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 animate-spin" /> Analyzing Intent...
                                </div>
                            </motion.div>
                        )}

                        {step >= 3 && (
                            <motion.div
                                key="task"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">S</div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-sm font-bold text-purple-400">Sensei</span>
                                        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1 rounded border border-purple-500/20">AI Ops</span>
                                    </div>
                                    <div className="bg-purple-900/20 border border-purple-500/40 rounded-xl p-0 overflow-hidden relative group">
                                        {/* Shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />

                                        <div className="p-3 border-b border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
                                                <Zap className="w-3 h-3 text-[#ccff00]" />
                                                Action Item Detected
                                            </div>
                                            <span className="text-[10px] text-zinc-500">Auto-created</span>
                                        </div>

                                        <div className="p-3">
                                            <div className="bg-black/40 rounded-lg p-3 border border-purple-500/10 mb-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 rounded border border-zinc-600 bg-zinc-900" />
                                                    <span className="font-bold text-sm text-white">Create TikTok Asset - Black Friday</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="text-zinc-500">Assignee:</div>
                                                    <div className="text-zinc-300 flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-zinc-700" /> @Karim</div>
                                                    <div className="text-zinc-500">Priority:</div>
                                                    <div className="text-red-400 font-bold">High 🔥</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-7 text-xs bg-[#ccff00] text-black hover:bg-[#b3ff00] w-full font-bold">Confirm Task</Button>
                                                <Button size="sm" className="h-7 text-xs bg-white/5 hover:bg-white/10 w-full text-zinc-400">Edit</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DemoGlassCard>
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-sm bg-purple-500/20 blur-[100px] -z-10" />
        </div>
    )
}




export const DojoLiveDemo = () => {
    const [xp, setXp] = useState(2450);
    const [level, setLevel] = useState(5);
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setXp(prev => {
                if (prev >= 2900) {
                    setShowLevelUp(true);
                    setTimeout(() => {
                        setLevel(l => l + 1);
                        setXp(0);
                        setTimeout(() => setShowLevelUp(false), 2000);
                    }, 500);
                    return 3000;
                }
                return prev + 50;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <DemoGlassCard className="p-8 h-full min-h-[400px] flex flex-col justify-between group overflow-hidden relative">
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="text-center">
                            <h2 className="text-6xl font-bold text-yellow-400 mb-2 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">LEVEL UP!</h2>
                            <p className="text-2xl text-white font-bold">Ninja Master → Grandmaster</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <motion.div
                    animate={showLevelUp ? { x: [-5, 5, -5, 5, 0] } : {}}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-orange-500/20">
                            Lvl {level}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Ninja Master</h3>
                            <p className="text-zinc-400">{Math.min(xp, 3000).toLocaleString()} XP / 3,000 XP</p>
                        </div>
                    </div>
                </motion.div>
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-8">
                    <motion.div
                        animate={{ width: `${(Math.min(xp, 3000) / 3000) * 100}%` }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 relative"
                    >
                        <div className="absolute top-0 right-0 w-full h-full bg-white/30 animate-[shimmer_1s_infinite]" />
                    </motion.div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((badge) => (
                    <div key={badge} className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 text-white text-xs flex items-center justify-center">🏆</div>
                        </div>
                    </div>
                ))}
            </div>
        </DemoGlassCard>
    )
}

export const BrandKitLiveDemo = () => {
    const [theme, setTheme] = useState(0);
    const themes = [
        { name: "Neon", colors: ["#FF3366", "#00C2FF", "#7000FF"] },
        { name: "Forest", colors: ["#2d6a4f", "#40916c", "#52b788"] },
        { name: "Executive", colors: ["#ea580c", "#f97316", "#fb923c"] }
    ];

    return (
        <DemoGlassCard className="p-8 min-h-[500px] flex flex-col">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <motion.div
                        key={theme}
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500"
                        style={{ backgroundColor: `${themes[theme].colors[0]}33` }}
                    >
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themes[theme].colors[0] }} />
                    </motion.div>
                    <div>
                        <h3 className="text-3xl font-bold">Brand Kit</h3>
                        <p className="text-xs text-zinc-400">Click to switch themes</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {themes.map((t, i) => (
                        <button
                            key={i}
                            onClick={() => setTheme(i)}
                            className={`px-4 py-2 rounded-full text-xs border transition-all ${theme === i ? 'bg-white text-black border-white scale-105 font-bold' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>
            <motion.div
                key={theme}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-black/40 rounded-2xl p-6 space-y-6 border border-white/5"
            >
                <div className="flex gap-4">
                    {themes[theme].colors.map((color, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="w-16 h-16 rounded-full shadow-lg border-2 border-white/10"
                            style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}
                        />
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="text-3xl font-bold" style={{ color: themes[theme].colors[0] }}>Inter Display</div>
                    <div className="text-xl text-zinc-400">The quick brown fox...</div>
                </div>
                <div className="space-y-3">
                    <div className="h-2 rounded-full w-full bg-white/5 overflow-hidden">
                        <motion.div
                            layoutId="bar"
                            className="h-full"
                            style={{ backgroundColor: themes[theme].colors[1] }}
                            initial={{ width: 0 }}
                            animate={{ width: "70%" }}
                        />
                    </div>
                    <Button className="w-full transition-colors duration-300" style={{ backgroundColor: themes[theme].colors[2] }}>Apply Changes</Button>
                </div>
            </motion.div>
        </DemoGlassCard>
    )
}

export const MeetingLiveDemo = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => (s + 1) % 4);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <DemoGlassCard className="p-8 min-h-[500px] flex flex-col">
            <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Zap className="w-6 h-6 text-indigo-400" />
                    </motion.div>
                </div>
                <h3 className="text-3xl font-bold mb-2">Meeting Dojo</h3>
                <p className="text-zinc-400">Real-time note taking that converts to tasks.</p>
            </div>

            <div className="flex-1 bg-black/20 rounded-2xl p-6 relative overflow-hidden border border-white/5">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                            <div className="flex gap-1 items-center h-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 bg-indigo-500 rounded-full"
                                        animate={{ height: [10, 40, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                            <p className="text-indigo-300 text-sm font-mono animate-pulse">Listening...</p>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pt-4">
                            <p className="text-zinc-500 text-sm">John: We need to finalize the Q3 budget.</p>
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-bold relative text-white pl-4 border-l-2 border-indigo-500"
                            >
                                Sarah: I'll create the draft by Friday.
                            </motion.p>
                        </motion.div>
                    )}
                    {step >= 2 && (
                        <motion.div key="task" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-0 left-0 right-0 bg-indigo-500/10 border-t border-indigo-500/30 p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]"><Zap className="w-4 h-4 text-white" /></div>
                                <div>
                                    <div className="text-white font-bold text-sm">New Task Created</div>
                                    <div className="text-indigo-300 text-xs">From transcript</div>
                                </div>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg text-zinc-300 text-sm mb-3 border border-indigo-500/10">Create Q3 Budget Draft</div>
                            <div className="flex justify-between items-center text-xs text-zinc-500">
                                <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-zinc-700" /> @Sarah</span>
                                <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded">Due: Friday</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DemoGlassCard>
    )
}

export const AutomationLiveDemo = () => {
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [step, setStep] = useState(0);

    const scenarios = [
        {
            name: "New Task Workflow",
            nodes: [
                { id: 1, label: "Task Created", icon: Zap, color: "green", x: 50, y: 100 },
                { id: 2, label: "Assign User", icon: Users, color: "blue", x: 250, y: 50 },
                { id: 3, label: "Notify Team", icon: MessageSquare, color: "orange", x: 250, y: 150 },
            ],
            pathWithGap: "M 120 100 C 180 100, 180 50, 210 50",
            path2: "M 120 100 C 180 100, 180 150, 210 150"
        },
        {
            name: "Client Update Flow",
            nodes: [
                { id: 1, label: "Task Done", icon: Check, color: "purple", x: 50, y: 100 },
                { id: 2, label: "Update CRM", icon: Database, color: "pink", x: 250, y: 50 },
                { id: 3, label: "Email Client", icon: Mail, color: "indigo", x: 250, y: 150 },
            ],
            pathWithGap: "M 120 100 C 180 100, 180 50, 210 50",
            path2: "M 120 100 C 180 100, 180 150, 210 150"
        }
    ];

    const currentScenario = scenarios[scenarioIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => {
                const nextStep = s + 1;
                if (nextStep > 5) { // Reset and switch scenario after delay
                    setScenarioIndex(prev => (prev + 1) % scenarios.length);
                    return 0;
                }
                return nextStep;
            });
        }, 1500); // Faster steps
        return () => clearInterval(interval);
    }, [scenarios.length]);

    return (
        <DemoGlassCard className="p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="w-48 h-48 text-indigo-500" />
            </div>

            <div className="absolute top-4 left-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={scenarioIndex}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{currentScenario.name}</span>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative h-[250px] w-full max-w-[400px] mx-auto mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={scenarioIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                            <defs>
                                <linearGradient id={`lineGradient-${scenarioIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                            {/* Line 1 -> 2 */}
                            <motion.path
                                d={currentScenario.pathWithGap}
                                fill="none"
                                stroke="#ffffff20"
                                strokeWidth="2"
                            />
                            <motion.path
                                d={currentScenario.pathWithGap}
                                fill="none"
                                stroke={`url(#lineGradient-${scenarioIndex})`}
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: step >= 1 ? 1 : 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />

                            {/* Line 1 -> 3 */}
                            <motion.path
                                d={currentScenario.path2}
                                fill="none"
                                stroke="#ffffff20"
                                strokeWidth="2"
                            />
                            <motion.path
                                d={currentScenario.path2}
                                fill="none"
                                stroke={`url(#lineGradient-${scenarioIndex})`}
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: step >= 2 ? 1 : 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                            />
                        </svg>

                        {/* Nodes */}
                        {currentScenario.nodes.map((node, i) => (
                            <motion.div
                                key={`${scenarioIndex}-${node.id}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="absolute w-16 h-16 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center z-10"
                                style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-zinc-400 bg-black/60 px-2 py-1 rounded border border-white/5`}>
                                    {node.label}
                                </div>

                                <div className={`w-10 h-10 rounded-xl bg-${node.color}-500/20 flex items-center justify-center relative`}>
                                    <node.icon className={`w-5 h-5 text-${node.color}-400`} />
                                    {/* Success Check */}
                                    <AnimatePresence>
                                        {step >= (i + 1) && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-green-500 border-2 border-black flex items-center justify-center"
                                            >
                                                <Check className="w-3 h-3 text-white font-bold" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {/* Pulse ring */}
                                {step === (i + 1) && (
                                    <div className={`absolute inset-0 rounded-2xl border-2 border-${node.color}-500 blur-sm animate-pulse`} />
                                )}
                            </motion.div>
                        ))}

                        {/* Data Packets */}
                        {step >= 1 && (
                            <motion.div
                                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
                                initial={{ offsetDistance: "0%" }}
                                animate={{ offsetDistance: "100%" }}
                                style={{ offsetPath: `path('${currentScenario.pathWithGap}')` }}
                                transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                            />
                        )}
                        {step >= 2 && (
                            <motion.div
                                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
                                initial={{ offsetDistance: "0%" }}
                                animate={{ offsetDistance: "100%" }}
                                style={{ offsetPath: `path('${currentScenario.path2}')` }}
                                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2, repeat: Infinity, repeatDelay: 1 }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="text-center mt-8 h-6">
                <AnimatePresence mode="wait">
                    {step === 0 && <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-500 text-sm">Listening for event...</motion.p>}
                    {step > 0 && step < 4 && <motion.p key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-blue-400 font-bold text-sm flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> Running Workflow...</motion.p>}
                    {step >= 4 && <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-green-400 font-bold text-sm flex items-center justify-center gap-2"><Check className="w-4 h-4" /> executed successfully</motion.p>}
                </AnimatePresence>
            </div>
        </DemoGlassCard>
    )
}
