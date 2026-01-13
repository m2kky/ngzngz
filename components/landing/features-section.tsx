import { Zap, Layout, Radio } from "lucide-react"

const features = [
    {
        title: "Auto-Strategy",
        description: "AI-powered campaign strategies generated in seconds.",
        icon: Zap,
        color: "text-yellow-400",
        gradient: "from-yellow-400/20 to-orange-500/20",
    },
    {
        title: "Content Studio",
        description: "Manage creative assets and workflows in one place.",
        icon: Layout,
        color: "text-blue-400",
        gradient: "from-blue-400/20 to-cyan-500/20",
    },
    {
        title: "Live Ads",
        description: "Real-time performance tracking across all platforms.",
        icon: Radio,
        color: "text-red-400",
        gradient: "from-red-400/20 to-pink-500/20",
    },
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10 flex flex-col gap-4">
                                <div className={`p-3 rounded-lg bg-white/5 w-fit ${feature.color}`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
