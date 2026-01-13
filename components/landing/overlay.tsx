"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Shield, Zap, Users, Layout, Lock, Star, Trophy, Target, BarChart3, Video, Palette, Briefcase, Command, Sparkles, Binoculars, MessageSquare, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { SenseiLiveDemo, SquadsLiveDemo, DojoLiveDemo, BrandKitLiveDemo, MeetingLiveDemo, AutomationLiveDemo } from "./live-demos"

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onMouseMove={handleMouseMove}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] group ${className}`}
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15), transparent 40%)`
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

export function Overlay() {
    return (
        <div className="relative z-10 w-full overflow-x-hidden text-white selection:bg-purple-500/30">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-20">
                <div className="max-w-5xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-zinc-300">The Operating System for Gen Z Agencies</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter relative group"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 relative z-10">
                            Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Agency Work</span>
                        </span>
                        {/* Glitch Layers */}
                        <span className="absolute top-0 left-0 -ml-1 opacity-0 group-hover:opacity-70 animate-glitch-1 text-red-500 pointer-events-none">
                            Future of <br /> Agency Work
                        </span>
                        <span className="absolute top-0 left-0 ml-1 opacity-0 group-hover:opacity-70 animate-glitch-2 text-blue-500 pointer-events-none">
                            Future of <br /> Agency Work
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-400 max-w-2xl mx-auto"
                    >
                        Automate strategy, streamline content, and scale your agency with the world's first AI-native operating system.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/auth">
                            <Button size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-200 transition-all text-lg">
                                Enter the Dojo <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="#dojo">
                            <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white transition-all text-lg">
                                Explore Features
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Dashboard Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-16 w-full max-w-6xl mx-auto perspective-1000"
                >
                    <div className="relative rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm transform hover:scale-[1.01] transition-transform duration-700 ease-out">
                        <Image
                            src="/dashboard.png"
                            alt="Ninja Gen Z Dashboard"
                            width={1920}
                            height={1080}
                            className="rounded-lg shadow-2xl w-full h-auto"
                            priority
                        />
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl -z-10" />
                    </div>
                </motion.div>
            </section>

            {/* The Dojo (Gamification) */}
            <section id="dojo" className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="text-5xl font-bold mb-6">The Dojo</h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Gamify your workflow. Earn XP, unlock badges, and climb the leaderboard.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <DojoLiveDemo />

                        <div className="space-y-6">
                            {[
                                { title: "XP System", desc: "Earn XP for every task completed, deal closed, and strategy shipped." },
                                { title: "Badges & Achievements", desc: "Unlock legendary badges for hitting milestones and maintaining streaks." },
                                { title: "Trophy Room", desc: "Showcase your agency's awards and certifications in a dedicated 3D space." },
                                { title: "Sound Effects", desc: "Satisfying audio feedback for every interaction to keep dopamine high." }
                            ].map((feature, i) => (
                                <GlassCard key={i} className="p-6 flex items-start gap-4 hover:bg-white/10">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-1">{feature.title}</h4>
                                        <p className="text-zinc-400 text-sm">{feature.desc}</p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sensei AI Agent */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 text-sm font-bold"
                            >
                                <Zap className="w-4 h-4" /> New Feature
                            </motion.div>
                            <h2 className="text-5xl font-bold">Meet Sensei <br /><span className="text-zinc-500">Your AI Co-Founder</span></h2>
                            <p className="text-xl text-zinc-400">Not just a chatbot. A creative director, data analyst, and vibes manager all in one.</p>

                            <div className="space-y-4">
                                <GlassCard className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">AI Vibe Check</h4>
                                        <p className="text-sm text-zinc-400">Paste your copy and let Sensei rate it based on Gen Z trends. No more cringe content.</p>
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Command className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Action Mode</h4>
                                        <p className="text-sm text-zinc-400">"Sensei, create a task for Sarah." Done. Sensei executes complex workflows directly.</p>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        <div className="relative">
                            <SenseiLiveDemo />
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Kit & Meeting Dojo */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Brand Kit */}
                    <BrandKitLiveDemo />

                    {/* Meeting Dojo */}
                    <MeetingLiveDemo />
                </div>
            </section>

            {/* Smart Squads */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <SquadsLiveDemo />
                        </div>
                        <div className="space-y-8 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-bold">
                                <Users className="w-4 h-4" /> Team Ops
                            </div>
                            <h2 className="text-5xl font-bold">Smart Squads <br /><span className="text-zinc-500">That actually work</span></h2>
                            <p className="text-xl text-zinc-400">Context-aware chats that automatically turn conversations into tasks, docs, and calendar invites.</p>

                            <div className="space-y-4">
                                <GlassCard className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Context-Aware Chat</h4>
                                        <p className="text-sm text-zinc-400">Sensei listens to your squad's chat and understands the project context instantly.</p>
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Auto-Task Creation</h4>
                                        <p className="text-sm text-zinc-400">"We need a new banner." Sensei creates the task, assigns it, and sets the deadline.</p>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agency OS Grid */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">Complete Agency OS</h2>
                        <p className="text-xl text-zinc-400">Everything else you need to run your empire.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Command, title: "Command Center", desc: "Cmd+K to navigate anywhere." },
                            { icon: Users, title: "Squads", desc: "Manage teams and permissions." },
                            { icon: Target, title: "Strategy Hub", desc: "AI-generated marketing plans." },
                            { icon: Layout, title: "Client Portal", desc: "Share progress with clients." },
                            { icon: Lock, title: "Role Management", desc: "Granular permission controls." },
                            { icon: Zap, title: "Automations", desc: "Connect your favorite tools." },
                            { icon: Star, title: "Reviews", desc: "Collect and showcase testimonials." },
                            { icon: Shield, title: "Security", desc: "Enterprise-grade protection." }
                        ].map((item, i) => (
                            <GlassCard key={i} className="p-6 text-center hover:bg-white/10 transition-colors">
                                <item.icon className="w-8 h-8 mx-auto mb-4 text-zinc-400" />
                                <h4 className="font-bold mb-1">{item.title}</h4>
                                <p className="text-xs text-zinc-500">{item.desc}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Automation Demo */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-bold">
                                <Zap className="w-4 h-4" /> Workflow Automation
                            </div>
                            <h2 className="text-5xl font-bold">Automate the <br /><span className="text-zinc-500">Busy Work</span></h2>
                            <p className="text-xl text-zinc-400">Connect your favorite tools and let Ninja Gen Z handle the repetitive tasks. No code required.</p>

                            <div className="space-y-4">
                                <GlassCard className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Auto-Assignment</h4>
                                        <p className="text-sm text-zinc-400">Automatically assign tasks to the right person based on tags or priority.</p>
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Instant Notifications</h4>
                                        <p className="text-sm text-zinc-400">Keep the team in sync with automated updates to Slack or Email.</p>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                        <div className="relative">
                            <AutomationLiveDemo />
                        </div>
                    </div>
                </div>
            </section>

            {/* Integrations */}
            <section className="py-20 border-y border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                    <p className="text-zinc-400">Works seamlessly with your favorite tools</p>
                </div>
                <div className="flex gap-16 items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder for Logos - In a real app, use SVGs */}
                    {["Slack", "Notion", "Figma", "Linear", "Discord", "OpenAI", "Stripe", "Intercom"].map((tool) => (
                        <span key={tool} className="text-2xl font-bold text-white">{tool}</span>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-zinc-400">From chaos to clarity in 3 simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Connect Your World", desc: "Sync your ad accounts, invite your squad, and set up your brand kit." },
                            { step: "02", title: "Automate The Boring", desc: "Let AI handle reporting, meeting notes, and routine tasks." },
                            { step: "03", title: "Scale With Zen", desc: "Focus on strategy and creative while Ninja Gen Z runs the ops." }
                        ].map((item, i) => (
                            <div key={i} className="relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="text-6xl font-bold text-white/10 mb-6">{item.step}</div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-zinc-400">{item.desc}</p>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="w-8 h-8 text-white/20" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-5xl font-bold text-white">Enterprise-Grade <br /> <span className="text-blue-400">Security</span></h2>
                        <p className="text-xl text-zinc-400">Your data is protected by state-of-the-art encryption and security protocols.</p>
                        <ul className="space-y-4">
                            {["Full-Spectrum Encryption", "Plug & Protect", "Global-Grade Integrations"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-300">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-blue-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 flex justify-center">
                        {/* Holographic Shield */}
                        <div className="relative w-64 h-64 perspective-1000">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[80px] animate-pulse" />
                            <div className="relative w-full h-full animate-float">
                                <Shield className="w-full h-full text-blue-400/80 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" strokeWidth={1} />
                                {/* Rotating Rings */}
                                <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin-slow" style={{ transform: 'rotateX(60deg)' }} />
                                <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-spin-reverse-slow" style={{ transform: 'rotateY(60deg)' }} />
                                {/* Scanning Line */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent animate-scan" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">Loved by Gen Z Agencies</h2>
                        <p className="text-xl text-zinc-400">Join the movement defining the next era of marketing.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { quote: "Ninja Gen Z completely changed how we operate. The gamification keeps the team addicted to working.", author: "Sarah J.", role: "CEO, HypeHouse Agency" },
                            { quote: "Finally, a tool that doesn't feel like a spreadsheet from 1999. It's fast, beautiful, and actually works.", author: "Mike T.", role: "Founder, Viral Labs" },
                            { quote: "The Ad Center alone saved us 10 hours a week on reporting. Clients love the new portal too.", author: "Jessica L.", role: "Head of Growth, Zoomer Media" }
                        ].map((item, i) => (
                            <GlassCard key={i} className="p-8">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-lg text-zinc-300 mb-6">"{item.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                                    <div>
                                        <div className="font-bold">{item.author}</div>
                                        <div className="text-xs text-zinc-500">{item.role}</div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-32 px-4 relative">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">FAQ</h2>
                        <p className="text-xl text-zinc-400">Got questions? We've got answers.</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Is there a free trial?", a: "Yes! You can try the Pro plan for 14 days, no credit card required." },
                            { q: "Can I invite clients?", a: "Absolutely. The Client Portal allows you to share specific views with unlimited clients." },
                            { q: "Does it integrate with Slack?", a: "Yes, we have a native Slack integration for notifications and quick actions." },
                            { q: "What happens to my data?", a: "Your data is encrypted and stored securely. You own 100% of your data." }
                        ].map((item, i) => (
                            <GlassCard key={i} className="p-6 cursor-pointer hover:bg-white/10">
                                <h4 className="text-lg font-bold mb-2">{item.q}</h4>
                                <p className="text-zinc-400">{item.a}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">Simple Pricing</h2>
                        <p className="text-xl text-zinc-400">Start free, upgrade as you grow.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Starter", price: "Free", features: ["Up to 3 Members", "Basic Analytics", "1 Workspace"] },
                            { name: "Pro", price: "$49", features: ["Unlimited Members", "Advanced AI", "Client Portal", "Priority Support"], popular: true },
                            { name: "Enterprise", price: "Custom", features: ["Dedicated Success Manager", "Custom Integrations", "SLA", "Audit Logs"] },
                        ].map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-3xl border backdrop-blur-md transition-all duration-300 ${plan.popular ? 'bg-white/10 border-purple-500/50 shadow-2xl shadow-purple-500/20 scale-105 z-10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500 text-white text-sm font-bold">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold text-white mb-6">{plan.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3 text-zinc-300">
                                            <Check className="w-4 h-4 text-purple-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full h-12 rounded-xl ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : 'bg-white/10 hover:bg-white/20'} text-white`}>
                                    Get Started
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-6xl font-bold text-white tracking-tighter">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Ascend?</span></h2>
                    <p className="text-xl text-zinc-400">Join thousands of agencies building the future.</p>
                    <Link href="/auth">
                        <Button size="lg" className="h-14 px-10 rounded-full bg-white text-black hover:bg-zinc-200 transition-all text-xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
                            Start Your Journey
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-zinc-500 text-sm border-t border-white/5">
                <p>© 2025 Ninja Gen Z. All rights reserved.</p>
            </footer>
        </div>
    )
}
