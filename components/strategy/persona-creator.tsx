"use client"

import { useState } from "react"
import { Save, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface PersonaCreatorProps {
    onClose: () => void
    onSave: (persona: any) => void
    initialData?: any
}

export function PersonaCreator({ onClose, onSave, initialData }: PersonaCreatorProps) {
    // Core Profile
    const [personaName, setPersonaName] = useState(initialData?.name || "")
    const [ageRange, setAgeRange] = useState(initialData?.core_profile?.ageRange || "")
    const [gender, setGender] = useState(initialData?.core_profile?.gender || "")
    const [location, setLocation] = useState(initialData?.core_profile?.location || "")
    const [education, setEducation] = useState(initialData?.core_profile?.education || "")
    const [familyStatus, setFamilyStatus] = useState(initialData?.core_profile?.familyStatus || "")
    const [bio, setBio] = useState(initialData?.core_profile?.bio || "")

    // Professional Background
    const [jobTitle, setJobTitle] = useState(initialData?.professional?.jobTitle || "")
    const [companySize, setCompanySize] = useState(initialData?.professional?.companySize || "")
    const [industry, setIndustry] = useState(initialData?.professional?.industry || "")
    const [experience, setExperience] = useState(initialData?.professional?.experience || "")
    const [reportsTo, setReportsTo] = useState(initialData?.professional?.reportsTo || "")
    const [successMetrics, setSuccessMetrics] = useState<string[]>(initialData?.professional?.successMetrics || [])
    const [responsibilities, setResponsibilities] = useState<string[]>(initialData?.professional?.responsibilities || [])

    // Goals & Challenges
    const [primaryGoal, setPrimaryGoal] = useState(initialData?.goals?.primaryGoal || "")
    const [secondaryGoals, setSecondaryGoals] = useState<string[]>(initialData?.goals?.secondaryGoals || [])
    const [painPoints, setPainPoints] = useState<string[]>(initialData?.goals?.painPoints || [])
    const [challenges, setChallenges] = useState<string[]>(initialData?.goals?.challenges || [])
    const [fears, setFears] = useState(initialData?.goals?.fears || "")

    // Purchasing Behavior
    const [buyingRole, setBuyingRole] = useState(initialData?.purchasing?.buyingRole || "")
    const [budgetAuthority, setBudgetAuthority] = useState(initialData?.purchasing?.budgetAuthority || "")
    const [infoSources, setInfoSources] = useState<string[]>(initialData?.purchasing?.infoSources || [])
    const [preferredContent, setPreferredContent] = useState(initialData?.purchasing?.preferredContent || "")
    const [buyingTrigger, setBuyingTrigger] = useState(initialData?.purchasing?.buyingTrigger || "")
    const [keySuccessFactors, setKeySuccessFactors] = useState<string[]>(initialData?.purchasing?.keySuccessFactors || [])

    // Technology
    const [techComfort, setTechComfort] = useState(initialData?.technology?.techComfort || "")
    const [currentTools, setCurrentTools] = useState<string[]>(initialData?.technology?.currentTools || [])
    const [commChannels, setCommChannels] = useState<string[]>(initialData?.technology?.commChannels || [])
    const [devices, setDevices] = useState(initialData?.technology?.devices || "")

    // Solution
    const [howWeHelp, setHowWeHelp] = useState(initialData?.solution?.howWeHelp || "")
    const [howWeSolve, setHowWeSolve] = useState(initialData?.solution?.howWeSolve || "")
    const [valueProposition, setValueProposition] = useState(initialData?.solution?.valueProposition || "")
    const [finalQuote, setFinalQuote] = useState(initialData?.solution?.finalQuote || "")

    const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        if (value.trim()) {
            setter((prev) => [...prev, value.trim()])
        }
    }

    const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        const persona = {
            name: personaName,
            core_profile: { ageRange, gender, location, education, familyStatus, bio },
            professional: { jobTitle, companySize, industry, experience, reportsTo, successMetrics, responsibilities },
            goals: { primaryGoal, secondaryGoals, painPoints, challenges, fears },
            purchasing: { buyingRole, budgetAuthority, infoSources, preferredContent, buyingTrigger, keySuccessFactors },
            technology: { techComfort, currentTools, commChannels, devices },
            solution: { howWeHelp, howWeSolve, valueProposition, finalQuote },
        }

        onSave(persona)
        toast.success("Persona saved! 🎯")
    }

    const ArrayInput = ({
        label,
        items,
        setItems,
        placeholder,
    }: {
        label: string
        items: string[]
        setItems: React.Dispatch<React.SetStateAction<string[]>>
        placeholder: string
    }) => {
        const [input, setInput] = useState("")

        return (
            <div>
                <Label>{label}</Label>
                <div className="space-y-2 mt-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="flex-1 text-sm bg-zinc-950 px-3 py-2 rounded border border-zinc-800">
                                {item}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => removeArrayItem(setItems, index)} className="h-8 w-8">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    addArrayItem(setItems, input)
                                    setInput("")
                                }
                            }}
                            placeholder={placeholder}
                            className="bg-zinc-950 border-zinc-800"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                addArrayItem(setItems, input)
                                setInput("")
                            }}
                        >
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="bg-zinc-950 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-8">
                {/* Header */}
                <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white">Create Buyer Persona</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={24} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* 1. Core Profile */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">1. Core Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Persona Name *</Label>
                                <Input
                                    value={personaName}
                                    onChange={(e) => setPersonaName(e.target.value)}
                                    placeholder="Marketing Manager Mark"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Age Range</Label>
                                <Input
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(e.target.value)}
                                    placeholder="35-45"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Gender</Label>
                                <Input
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    placeholder="Male"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Urban areas in North America"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Education Level</Label>
                                <Input
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                    placeholder="Bachelor's Degree (Business)"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Family Status</Label>
                                <Input
                                    value={familyStatus}
                                    onChange={(e) => setFamilyStatus(e.target.value)}
                                    placeholder="Married, two children"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Bio / Quote</Label>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="I need efficient tools to prove ROI quickly."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 2. Professional Background */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">2. Professional Background</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Job Title</Label>
                                <Input
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="Director of Digital Marketing"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Company Size</Label>
                                <Input
                                    value={companySize}
                                    onChange={(e) => setCompanySize(e.target.value)}
                                    placeholder="50-200 employees"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Industry</Label>
                                <Input
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="B2B SaaS"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Experience Level</Label>
                                <Input
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    placeholder="10+ years"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Reports To</Label>
                                <Input
                                    value={reportsTo}
                                    onChange={(e) => setReportsTo(e.target.value)}
                                    placeholder="Chief Marketing Officer (CMO)"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="col-span-2">
                                <ArrayInput
                                    label="Success Metrics"
                                    items={successMetrics}
                                    setItems={setSuccessMetrics}
                                    placeholder="Lead Volume, Conversion Rate..."
                                />
                            </div>
                            <div className="col-span-2">
                                <ArrayInput
                                    label="Key Responsibilities (3-5)"
                                    items={responsibilities}
                                    setItems={setResponsibilities}
                                    placeholder="Managing content calendar..."
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 3. Goals & Challenges */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">3. Goals, Pain Points & Challenges</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Primary Goal</Label>
                                <Textarea
                                    value={primaryGoal}
                                    onChange={(e) => setPrimaryGoal(e.target.value)}
                                    placeholder="Increase pipeline contribution by 25% this quarter"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <ArrayInput
                                label="Secondary Goals"
                                items={secondaryGoals}
                                setItems={setSecondaryGoals}
                                placeholder="Streamline cross-departmental communication..."
                            />
                            <ArrayInput
                                label="Frustrations / Pain Points"
                                items={painPoints}
                                setItems={setPainPoints}
                                placeholder="Data is siloed across too many tools..."
                            />
                            <ArrayInput
                                label="Current Challenges"
                                items={challenges}
                                setItems={setChallenges}
                                placeholder="Limited budget/resources..."
                            />
                            <div>
                                <Label>What do they fear?</Label>
                                <Textarea
                                    value={fears}
                                    onChange={(e) => setFears(e.target.value)}
                                    placeholder="Missing quota, losing their job..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 4. Purchasing Behavior */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">4. Purchasing Behavior & Decision-Making</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Role in Buying Process</Label>
                                <Input
                                    value={buyingRole}
                                    onChange={(e) => setBuyingRole(e.target.value)}
                                    placeholder="Initiator, Influencer, Approver..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Budget Authority</Label>
                                <Input
                                    value={budgetAuthority}
                                    onChange={(e) => setBudgetAuthority(e.target.value)}
                                    placeholder="Full approval for purchases under $10,000"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="col-span-2">
                                <ArrayInput
                                    label="Information Sources"
                                    items={infoSources}
                                    setItems={setInfoSources}
                                    placeholder="Industry webinars, LinkedIn thought leaders..."
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Preferred Content Format</Label>
                                <Input
                                    value={preferredContent}
                                    onChange={(e) => setPreferredContent(e.target.value)}
                                    placeholder="Quick video tutorials, Detailed white papers..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Buying Trigger</Label>
                                <Textarea
                                    value={buyingTrigger}
                                    onChange={(e) => setBuyingTrigger(e.target.value)}
                                    placeholder="A new compliance regulation is implemented..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="col-span-2">
                                <ArrayInput
                                    label="Key Success Factors"
                                    items={keySuccessFactors}
                                    setItems={setKeySuccessFactors}
                                    placeholder="Ease of integration, Excellent customer support..."
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 5. Technology & Tools */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">5. Technology & Tools</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Tech Comfort</Label>
                                <Input
                                    value={techComfort}
                                    onChange={(e) => setTechComfort(e.target.value)}
                                    placeholder="Early adopter, Skeptical of new tools..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <ArrayInput
                                label="Current Tools Used"
                                items={currentTools}
                                setItems={setCurrentTools}
                                placeholder="Salesforce, HubSpot, Microsoft Excel..."
                            />
                            <ArrayInput
                                label="Communication Channels"
                                items={commChannels}
                                setItems={setCommChannels}
                                placeholder="Email, LinkedIn InMail, Slack..."
                            />
                            <div>
                                <Label>Devices Used</Label>
                                <Input
                                    value={devices}
                                    onChange={(e) => setDevices(e.target.value)}
                                    placeholder="Primarily desktop/laptop, frequently checks mobile"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 6. Your Solution */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">6. Your Solution (Bridging the Gap)</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>How we help their Goal</Label>
                                <Textarea
                                    value={howWeHelp}
                                    onChange={(e) => setHowWeHelp(e.target.value)}
                                    placeholder="Our automation feature reduces manual reporting time..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>How we solve their Pain</Label>
                                <Textarea
                                    value={howWeSolve}
                                    onChange={(e) => setHowWeSolve(e.target.value)}
                                    placeholder="Our unified dashboard eliminates the need to pull data..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <Label>Our Value Proposition</Label>
                                <Textarea
                                    value={valueProposition}
                                    onChange={(e) => setValueProposition(e.target.value)}
                                    placeholder="We provide the most accurate, real-time data for faster decisions..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 7. Final Quote */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">7. Quote / Mantra</h3>
                        <div>
                            <Label>Final Quote</Label>
                            <Textarea
                                value={finalQuote}
                                onChange={(e) => setFinalQuote(e.target.value)}
                                placeholder="I need technology that integrates seamlessly and provides clear, actionable insights..."
                                className="mt-2 bg-zinc-950 border-zinc-800"
                            />
                        </div>
                    </Card>
                </div>

                {/* Footer */}
                <div className="h-16 border-t border-zinc-900 flex items-center justify-end gap-3 px-6 bg-zinc-950">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-[#ccff00] text-black hover:bg-[#b3ff00]">
                        <Save size={16} className="mr-2" />
                        Save Persona
                    </Button>
                </div>
            </div>
        </div>
    )
}
