import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Search, Bell, CheckCircle, Clock, Plus, Settings, Zap, Target, Users, FileText, 
  MessageSquare, BarChart3, Ghost, MoreVertical, Layers, Archive, Menu, X, ChevronRight, 
  Image as ImageIcon, Send, Lock, TrendingUp, Globe, Binoculars, LogOut, Filter, ArrowUpDown, 
  MoreHorizontal, List as ListIcon, Trash2, Sparkles, Loader2, ThumbsDown, Minimize2
} from 'lucide-react';

// --- GEMINI API CONFIGURATION ---
const apiKey = ""; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

async function callGemini(prompt, systemInstruction = "") {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      }
    );
    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sensei is taking a nap (Error).";
  } catch (error) {
    console.error("Gemini Error:", error);
    // Use an error message that fits the Gen Z persona
    return "Sensei says: The API connection is kinda sus rn. Try refreshing. 💀";
  }
}

// --- MOCK DATA ---
const MOCK_USER_AGENCY = { name: "Karim (Gen Z)", role: "Creative", xp: 1250, level: 5, avatar: "https://i.pravatar.cc/150?u=karim", type: "AGENCY" };
const MOCK_USER_CLIENT = { name: "Mr. Red Bull", role: "Client", xp: 0, level: 1, avatar: "https://i.pravatar.cc/150?u=client", type: "CLIENT" };
const WORKSPACES = [
  { id: 1, name: "Red Bull", color: "bg-blue-600", initials: "RB" },
  { id: 2, name: "Spotify", color: "bg-green-500", initials: "SP" },
  { id: 3, name: "Nike", color: "bg-zinc-100 text-black", initials: "NK" },
];

const INITIAL_TASKS = [
  // IMPORTANT: Added 'deadline_sort' for easier sorting
  { id: 101, title: "TikTok: Viral Dance Challenge", status: "DRAFT", deadline: "2023-11-25", deadlineDisplay: "Today", persona: "The Hype Beast", assignee: "https://i.pravatar.cc/150?u=1", priority: "High", cover: null, deadline_sort: new Date('2023-11-25') },
  { id: 102, title: "IG Reel: Behind the Scenes", status: "IN_PROGRESS", deadline: "2023-11-26", deadlineDisplay: "Tomorrow", persona: "Chill Streamer", assignee: "https://i.pravatar.cc/150?u=2", priority: "Medium", cover: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&q=80", deadline_sort: new Date('2023-11-26') },
  { id: 103, title: "LinkedIn: Thought Leadership", status: "CLIENT_REVIEW", deadline: "2023-11-28", deadlineDisplay: "In 2 days", persona: "Founder Mode", assignee: "https://i.pravatar.cc/150?u=3", priority: "Low", cover: null, deadline_sort: new Date('2023-11-28') },
  { id: 104, title: "Ad Copy: Black Friday", status: "APPROVED", deadline: "2023-12-01", deadlineDisplay: "Next Week", persona: "Deal Hunter", assignee: "https://i.pravatar.cc/150?u=4", priority: "High", cover: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&q=80", deadline_sort: new Date('2023-12-01') },
];
const COMPETITOR_ADS = [
  { id: 1, brand: "Monster Energy", copy: "Unleash the beast! ⚡️", img: "https://images.unsplash.com/photo-1622543925917-095a13c4aa2d?w=400&q=80", platform: "instagram" },
  { id: 2, brand: "Rockstar", copy: "Party like a rockstar tonight.", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", platform: "tiktok" },
];
const PERSONAS = [
  { id: 1, name: "The Zoomer Gamer", painPoints: "Lag, High Prices", tone: "Chaotic, Sarcastic" },
  { id: 2, name: "Corporate Baddie", painPoints: "Burnout, Meetings", tone: "Professional yet Savage" },
];
const TEAM_MEMBERS = [
    { id: 1, name: "Karim", role: "Creative Lead", status: "Online", avatar: "https://i.pravatar.cc/150?u=karim" },
    { id: 2, name: "Sarah", role: "Account Manager", status: "In Meeting", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { id: 3, name: "Omar", role: "Media Buyer", status: "Offline", avatar: "https://i.pravatar.cc/150?u=omar" },
];

// --- UTILITY UI COMPONENTS ---

const XPBar = ({ xp, level }) => (
  <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
    <div className="flex flex-col">
      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Ninja Level {level}</span>
      <div className="w-32 h-2 bg-zinc-800 rounded-full mt-1 overflow-hidden">
        <div className="h-full bg-[#ccff00] w-[60%] shadow-[0_0_10px_#ccff00]"></div>
      </div>
    </div>
    <span className="text-[#ccff00] font-mono text-xs font-bold">{xp} XP</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    DRAFT: "bg-zinc-800 text-zinc-400 border-zinc-700",
    IN_PROGRESS: "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20",
    AI_CHECK: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    INTERNAL_REVIEW: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    CLIENT_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    APPROVED: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || styles.DRAFT}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
    const colors = {
        High: "text-red-400 bg-red-400/10 border-red-400/20",
        Medium: "text-orange-400 bg-orange-400/10 border-orange-400/20",
        Low: "text-zinc-400 bg-zinc-800 border-zinc-700"
    };
    return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${colors[priority] || colors.Low}`}>
            {priority}
        </span>
    );
};

// --- UPDATED SENSEI WIDGET ---
const SenseiWidget = ({ toastMessage, onClearToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
      { sender: 'sensei', text: "Yo! I'm Sensei. Ask me anything about this tool or marketing. 👻" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isOpen]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => onClearToast(), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, onClearToast]);

  const handleSend = async () => {
      if (!input.trim()) return;
      const userMsg = input;
      setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
      setInput("");
      setIsTyping(true);

      const systemPrompt = `
        You are 'Sensei', the AI assistant for 'Ninja Gen Z OS', an agency operating system.
        
        **Your Persona:** - Gen Z marketer, sarcastic, high energy.
        - Uses slang like: 'no cap', 'bet', 'slay', 'sus', 'cooked'.
        - Use emojis frequently.
        - Helpful but keeps it real.

        **Knowledge Base (The Tool):**
        1. **Dashboard:** Overview of tasks, XP, and mentions.
        2. **Content Studio:** The core task manager. Has Kanban and List views. You can create tasks, drag them to change status (Draft -> In Progress -> Review -> Approved).
        3. **Strategy Hub:** Where you define Personas (target audience) and Brand Voice.
        4. **Ad Center:** For tracking campaign performance (ROAS, Spend) and campaign structure.
        5. **Competitor Intel:** A place to view and save competitor ads from Meta/TikTok.
        6. **Squad:** Manage team members.
        
        **Goal:** Answer the user's questions about how to use the tool or give marketing advice based on this context. Keep answers short (under 50 words).
      `;

      const response = await callGemini(userMsg, systemPrompt);
      
      setChatHistory(prev => [...prev, { sender: 'sensei', text: response }]);
      setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {!isOpen && toastMessage && (
        <div className="mb-4 bg-zinc-900 border border-[#a855f7] p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] max-w-sm animate-bounce-in relative overflow-hidden pointer-events-auto">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]"></div>
          <div className="flex items-start gap-3">
             <div className="bg-[#a855f7] p-1.5 rounded-lg">
                <Ghost size={16} className="text-white" />
             </div>
             <div>
               <p className="text-[#a855f7] text-xs font-bold uppercase mb-1">Sensei Notification</p>
               <p className="text-zinc-200 text-sm">{toastMessage}</p>
             </div>
          </div>
        </div>
      )}

      {isOpen && (
          <div className="mb-4 w-80 h-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
              <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <div className="bg-[#a855f7] p-1 rounded-md"><Ghost size={14} className="text-white"/></div>
                      <span className="font-bold text-white text-sm">Sensei Chat</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><Minimize2 size={16}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50">
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-zinc-800 text-white rounded-br-none' : 'bg-[#a855f7]/10 text-zinc-200 border border-[#a855f7]/20 rounded-bl-none'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isTyping && (
                      <div className="flex justify-start">
                          <div className="bg-[#a855f7]/10 text-[#a855f7] px-3 py-2 rounded-xl rounded-bl-none text-xs flex gap-1">
                              <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                          </div>
                      </div>
                  )}
                  <div ref={chatEndRef} />
              </div>

              <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Sensei..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                  />
                  <button onClick={handleSend} className="bg-[#a855f7] text-white p-2 rounded-lg hover:bg-[#9333ea]">
                      <Send size={14} />
                  </button>
              </div>
          </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-zinc-800 text-white' : 'bg-[#a855f7] text-white'}`}
      >
        {isOpen ? <X size={24} /> : <Ghost className="w-7 h-7" />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
        )}
      </button>
    </div>
  );
};

const TaskModal = ({ task, onClose, isNew, onSave, onDelete, showToast }) => {
  const [title, setTitle] = useState(task?.title || "New Task");
  const [status, setStatus] = useState(task?.status || "DRAFT");
  const [content, setContent] = useState(isNew ? "Type '/' to insert a block..." : "POV: You finally found a skincare routine that doesn't cost your entire rent. 💸✨");
  const [aiAnalysis, setAiAnalysis] = useState({ score: 0, feedback: "Click 'Check Vibe' to analyze." });
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Function to ensure we have a valid task object with all defaults
  const handleSaveClick = () => {
    const taskData = {
        ...task,
        title: title,
        status: status || 'DRAFT', // Default to DRAFT if status is missing
        // Set defaults for missing required fields (if new task)
        deadline: task?.deadline || "2023-12-31",
        deadlineDisplay: task?.deadlineDisplay || "Next Week",
        priority: task?.priority || "Medium",
        assignee: task?.assignee || "https://i.pravatar.cc/150?u=default",
        persona: task?.persona || "General",
        id: task?.id || Date.now(),
        deadline_sort: task?.deadline_sort || new Date('2023-12-31')
    };
    onSave(taskData);
    showToast(isNew ? "Task Created! 🚀" : "Changes Saved! 💾");
  };

  const handleVibeCheck = async () => {
    setIsAiAnalyzing(true);
    const systemPrompt = "You are 'Sensei', a Gen Z marketing creative director. Analyze text for tone. Return ONLY a JSON object with keys 'score' (number 0-100) and 'feedback' (string).";
    const userPrompt = `Title: ${title}\nContent: ${content}`;
    const result = await callGemini(userPrompt, systemPrompt);
    try {
        const cleanJson = result.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        setAiAnalysis(parsed);
        showToast(`Vibe Check: ${parsed.score}/100 🎯`);
    } catch (e) {
        setAiAnalysis({ score: 50, feedback: "Couldn't parse AI score." });
        showToast("AI vibe check failed (Format Error)");
    }
    setIsAiAnalyzing(false);
  };

  const handleAiGenerate = async () => {
      setIsAiGenerating(true);
      const result = await callGemini(`Title: ${title}`, "Write a short viral caption for Gen Z.");
      setContent(prev => prev + "\n\n" + result);
      setIsAiGenerating(false);
      showToast("Fresh content cooked up! 🍳");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-950 w-full max-w-6xl h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950">
           <div className="flex items-center gap-4">
              {/* Fix: Input value and onChange are correctly bound to 'title' state */}
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent text-white font-bold text-lg focus:outline-none focus:border-b border-[#ccff00]"/>
              <StatusBadge status={status} />
           </div>
           <div className="flex items-center gap-3">
              {!isNew && <button onClick={() => { onDelete(task.id); showToast("Task Archived"); }} className="text-zinc-500 hover:text-red-500 mr-2"><Trash2 size={18} /></button>}
              <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24} /></button>
           </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
           <div className="flex-1 overflow-y-auto p-12 bg-zinc-950">
              <div className="max-w-3xl mx-auto space-y-6">
                 <h1 className="text-4xl font-black text-white">{title}</h1>
                 <div className="group relative pl-4 border-l-2 border-transparent hover:border-zinc-700 transition-colors">
                    <textarea className="w-full bg-transparent text-zinc-300 text-lg leading-relaxed outline-none resize-none min-h-[100px]" value={content} onChange={(e) => setContent(e.target.value)} />
                 </div>
                 <div className="flex items-center gap-4 mt-4">
                    <button onClick={handleAiGenerate} disabled={isAiGenerating} className="flex items-center gap-2 px-3 py-1.5 bg-[#a855f7]/10 text-[#a855f7] rounded-lg text-xs font-bold border border-[#a855f7]/20">
                        {isAiGenerating ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />} 
                        {isAiGenerating ? "Sensei is writing..." : "Auto-Generate"}
                    </button>
                 </div>
              </div>
           </div>
           <div className="w-80 bg-zinc-900 border-l border-zinc-900 flex flex-col p-4">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 mb-4">
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-[#a855f7] font-bold text-sm flex gap-2"><Zap size={16}/> AI Score</span>
                     <button onClick={handleVibeCheck} disabled={isAiAnalyzing} className="text-[10px] bg-[#a855f7] text-white px-2 py-1 rounded">{isAiAnalyzing ? "..." : "Check"}</button>
                 </div>
                 <div className="text-zinc-300 text-xs italic">"{aiAnalysis.feedback}"</div>
              </div>
              <div className="mt-auto flex gap-2">
                 <button onClick={onClose} className="flex-1 bg-zinc-800 text-white py-2 rounded text-xs font-bold">Close</button>
                 <button onClick={handleSaveClick} className="flex-1 bg-[#ccff00] text-black py-2 rounded text-xs font-bold">Save</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- STANDALONE VIEWS ---

const DashboardView = ({ tasks, onNavigate }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-[#ccff00]/10"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Ninja 🥷</h2>
        <p className="text-zinc-400 mb-6">You have {tasks.filter(t=>t.status!=='APPROVED').length} active tasks.</p>
        <button onClick={() => onNavigate('CONTENT')} className="bg-[#ccff00] text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">View My Tasks</button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <h3 className="text-zinc-400 text-sm font-medium uppercase">Weekly XP</h3>
         <div className="text-4xl font-bold text-white mt-2">2,450</div>
      </div>
    </div>
  </div>
);

const ArchivesView = () => (
    <div className="animate-fade-in flex flex-col items-center justify-center h-[60vh] text-zinc-500">
        <Archive size={64} className="mb-4 text-zinc-700"/>
        <h2 className="text-xl font-bold text-white">Archives</h2>
        <p>No archived projects yet. Keep shipping! 🚀</p>
    </div>
);

const SquadView = ({ showToast }) => (
    <div className="animate-fade-in">
        <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold text-white">Squad</h2>
        <button onClick={() => showToast("Invite link copied!")} className="bg-[#ccff00] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#b3ff00]">Invite Member</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map(m => (
                <div key={m.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <img src={m.avatar} className="w-16 h-16 rounded-full" />
                    <div><h3 className="text-white font-bold">{m.name}</h3><p className="text-zinc-500 text-sm">{m.role}</p></div>
                </div>
            ))}
        </div>
    </div>
);

const CompetitorIntelView = ({ showToast }) => (
    <div className="animate-fade-in h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Competitor Intel</h2>
          <div className="relative"><Search className="absolute left-3 top-2 text-zinc-500" size={14}/><input className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 text-sm text-white w-64" placeholder="Search Brand..."/></div>
       </div>
       <div className="grid grid-cols-2 gap-6 h-full overflow-hidden">
          <div className="overflow-y-auto space-y-4 pr-2">
              {COMPETITOR_ADS.map(ad => (
                  <div key={ad.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className="flex justify-between mb-2"><span className="text-white font-bold">{ad.brand}</span><span className="text-xs text-zinc-500">{ad.platform}</span></div>
                      <p className="text-zinc-400 text-sm mb-2">"{ad.copy}"</p>
                      <button onClick={() => showToast("Ad Saved!")} className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded">Save</button>
                  </div>
              ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 flex-col">
              <Globe size={48} className="mb-4 opacity-20"/>
              <p>Meta API Disconnected</p>
              <button onClick={() => showToast("Connecting API...")} className="mt-2 bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 px-4 py-2 rounded-lg text-sm font-bold">Connect</button>
          </div>
       </div>
    </div>
);

const StrategyView = ({ showToast }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsights = async (personaName) => {
    setIsLoading(true);
    setSuggestions(null); // Clear previous suggestions
    
    // Gemini Prompt to act as a cultural analyst and generate structured data
    const prompt = `Act as an expert Gen Z cultural anthropologist and digital marketing strategist. Based on the Persona Name "${personaName}", generate 3 unique, modern 'Pain Points' and 5 'Tone Keywords' that would resonate with them. Return the result ONLY as a JSON object with keys: 'pain_points' (array of strings) and 'tone_keywords' (array of strings).`;
    
    const result = await callGemini(prompt, "You are a professional JSON generator. Your output must be valid JSON.");

    try {
        const cleanJson = result.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        setSuggestions(parsed);
        showToast(`Sensei found new insights for ${personaName}! 🧠`);
    } catch (e) {
        setSuggestions({ error: "Sensei failed to parse the vibes." });
        showToast("AI insight generation failed (Parsing Error).");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Strategy Hub</h2>
        <button onClick={() => showToast("New Persona Created!")} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm font-medium border border-zinc-700">+ New Persona</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERSONAS.map(p => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white">{p.name}</h3>
            <p className="text-zinc-400 text-sm mt-2 mb-4">Pain Points: {p.painPoints}</p>
            
            {/* New LLM Feature Button */}
            <button 
                onClick={() => handleGenerateInsights(p.name)} 
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#a855f7]/10 text-[#a855f7] rounded-lg text-xs font-bold border border-[#a855f7]/20 hover:bg-[#a855f7]/20 transition-colors"
            >
                {isLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />} 
                {isLoading ? "Generating..." : "Generate Insights"}
            </button>
          </div>
        ))}
      </div>

      {/* Persona Suggestions Display */}
      {suggestions && (
        <div className="mt-8 p-6 bg-zinc-900 border border-[#a855f7] rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-fade-in">
            <h3 className="text-xl font-bold text-[#a855f7] mb-4 flex items-center gap-2">
                <Zap size={20} /> Sensei Persona Refinement
            </h3>
            
            {suggestions.error ? (
                <p className="text-red-400">{suggestions.error}</p>
            ) : (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold text-zinc-300 mb-2">Suggested Pain Points:</h4>
                        <ul className="list-disc pl-5 text-zinc-400 space-y-1 text-sm">
                            {suggestions.pain_points?.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-300 mb-2">Suggested Tone Keywords:</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.tone_keywords?.map((keyword, index) => (
                                <span key={index} className="bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded-full text-xs font-mono border border-[#ccff00]/20">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

    </div>
  );
};

const AdCenterView = ({ showToast }) => (
  <div className="h-full flex flex-col animate-fade-in">
     <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">Ad Center</h2>
     <button onClick={() => showToast("Starting Campaign Wizard...")} className="bg-[#ccff00] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#b3ff00]">New Campaign</button>
     </div>
     <div className="flex items-center justify-center h-full border border-zinc-800 rounded-xl bg-zinc-900/50"><p className="text-zinc-500">Ad Performance Charts (Mock)</p></div>
  </div>
);

const ClientPortalView = ({ tasks, onApprove, onReject, showToast }) => (
    <div className="animate-fade-in max-w-5xl mx-auto pt-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Approvals Pending</h2>
            <p className="text-zinc-400">You have {tasks.filter(t => t.status === 'CLIENT_REVIEW').length} items waiting.</p>
        </div>
        <div className="space-y-4">
            {tasks.filter(t => t.status === 'CLIENT_REVIEW').map(task => (
                <div key={task.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex gap-6 items-center">
                     <h3 className="text-xl font-bold text-white flex-1">{task.title}</h3>
                     <div className="flex gap-2">
                        <button onClick={() => onApprove(task.id)} className="px-4 py-2 bg-[#ccff00] text-black font-bold rounded text-sm hover:bg-green-400">Approve</button>
                        <button onClick={() => onReject(task.id)} className="px-4 py-2 bg-red-800/50 text-red-300 font-bold rounded text-sm hover:bg-red-800">Request Edit</button>
                     </div>
                </div>
            ))}
        </div>
    </div>
);

// --- KANBAN & LIST VIEWS ---

const KanbanColumn = ({ title, status, color, tasks, onTaskClick, onDragStart, onDragOver, onDrop }) => (
  <div 
      className="flex-shrink-0 w-80 flex flex-col h-full bg-zinc-900/30 rounded-xl border border-zinc-800/50 overflow-hidden"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
  >
    <div className={`p-4 border-b border-zinc-800/50 flex justify-between items-center bg-gradient-to-r from-zinc-900 to-transparent`}>
       <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${color}`}></div><span className="text-sm font-bold text-zinc-200 uppercase">{title}</span></div>
       <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === status).length}</span>
    </div>
    <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] scrollbar-thin scrollbar-thumb-zinc-800">
      {tasks.filter(t => t.status === status).map(task => (
           <div 
             key={task.id} 
             onClick={() => onTaskClick(task)}
             draggable
             onDragStart={(e) => onDragStart(e, task.id)}
             className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-lg hover:border-[#ccff00]/40 cursor-pointer group"
           >
              <div className="flex justify-between mb-3"><PriorityBadge priority={task.priority} /></div>
              <h4 className="text-zinc-100 text-sm font-bold leading-snug mb-3 group-hover:text-[#ccff00]">{task.title}</h4>
              <div className="flex justify-between pt-3 border-t border-zinc-900"><img src={task.assignee} className="w-6 h-6 rounded-full" /><span className="text-zinc-600 text-xs flex gap-1 items-center"><Clock size={10}/> {task.deadlineDisplay}</span></div>
           </div>
      ))}
    </div>
  </div>
);

const ListView = ({ tasks, onTaskClick }) => (
    <div className="space-y-2 pb-4">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-zinc-500 text-xs font-bold uppercase tracking-wider border-b border-zinc-800">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-1">Action</div>
        </div>
        {tasks.map(task => (
            <div key={task.id} onClick={() => onTaskClick(task)} className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg items-center cursor-pointer group transition-colors">
                <div className="col-span-5 font-medium text-white group-hover:text-[#ccff00]">{task.title}</div>
                <div className="col-span-2"><StatusBadge status={task.status}/></div>
                <div className="col-span-2 flex items-center gap-2"><img src={task.assignee} className="w-6 h-6 rounded-full" /><span className="text-zinc-400 text-xs truncate">{task.persona}</span></div>
                <div className="col-span-2"><PriorityBadge priority={task.priority}/></div>
                <div className="col-span-1 text-zinc-500 hover:text-white"><MoreHorizontal size={16}/></div>
            </div>
        ))}
    </div>
);

const SortDropdown = ({ onSortChange, currentSort }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border ${isOpen ? 'border-[#ccff00] text-[#ccff00]' : 'border-zinc-800 text-zinc-400'} text-xs hover:text-white`}
            >
                <ArrowUpDown size={14} /> 
                {currentSort === 'DEFAULT' ? 'Sort' : `By ${currentSort}`}
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 p-2">
                    {/* Sort options */}
                    <button onClick={() => { onSortChange('PRIORITY'); setIsOpen(false); }} className="block w-full text-left text-white text-xs py-1 hover:bg-zinc-800 rounded px-2">Priority</button>
                    <button onClick={() => { onSortChange('DEADLINE'); setIsOpen(false); }} className="block w-full text-left text-white text-xs py-1 hover:bg-zinc-800 rounded px-2">Deadline</button>
                    <button onClick={() => { onSortChange('DEFAULT'); setIsOpen(false); }} className="block w-full text-left text-white text-xs py-1 hover:bg-zinc-800 rounded px-2">Default</button>
                </div>
            )}
        </div>
    );
};

const ContentStudioView = ({ 
    tasks, viewMode, setViewMode, 
    filterPriority, setFilterPriority, showFilterMenu, setShowFilterMenu, 
    onNewTask, onTaskClick, onDragStart, onDragOver, onDrop, // Correctly destructured props
    onSortChange, currentSort
}) => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-2xl font-bold text-white">Content Studio</h2>
            <div className="flex items-center gap-3">
                 <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                     <button onClick={() => setViewMode('BOARD')} className={`p-1.5 rounded transition-colors ${viewMode === 'BOARD' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}><Layers size={14}/></button>
                     <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded transition-colors ${viewMode === 'LIST' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}><ListIcon size={14}/></button>
                 </div>
                 <div className="h-6 w-[1px] bg-zinc-800"></div>
                 {/* New Sort Dropdown */}
                 <SortDropdown onSortChange={onSortChange} currentSort={currentSort} />

                 <div className="h-6 w-[1px] bg-zinc-800"></div>

                 <div className="relative">
                    <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border ${filterPriority !== 'ALL' || showFilterMenu ? 'border-[#ccff00] text-[#ccff00]' : 'border-zinc-800 text-zinc-400'} text-xs hover:text-white`}><Filter size={14} /> {filterPriority === 'ALL' ? 'Filter' : filterPriority}</button>
                    {showFilterMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 p-2">
                            <button onClick={() => setFilterPriority('ALL')} className="block w-full text-left text-white text-xs py-1 hover:bg-zinc-800 rounded px-2">All</button>
                            <button onClick={() => setFilterPriority('High')} className="block w-full text-left text-white text-xs py-1 hover:bg-zinc-800 rounded px-2">High Priority</button>
                            <button onClick={() => setFilterPriority('Medium')} className="block w-full text-left text-white text-xs py-1 hover:bg-zinc-800 rounded px-2">Medium Priority</button>
                        </div>
                    )}
                 </div>
                 <button onClick={onNewTask} className="bg-[#ccff00] text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#b3ff00]"><Plus size={16} /> New Task</button>
            </div>
        </div>
        
        {viewMode === 'BOARD' ? (
            <div className="flex-1 flex gap-4 overflow-x-auto pb-6 px-1">
                {/* Fixed the ReferenceError by using the prop names (onDragStart, onDragOver) */}
                <KanbanColumn title="Drafting" status="DRAFT" color="bg-zinc-500" tasks={tasks} onTaskClick={onTaskClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
                <KanbanColumn title="In Progress" status="IN_PROGRESS" color="bg-[#a855f7]" tasks={tasks} onTaskClick={onTaskClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
                <KanbanColumn title="Review" status="CLIENT_REVIEW" color="bg-blue-500" tasks={tasks} onTaskClick={onTaskClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
                <KanbanColumn title="Approved" status="APPROVED" color="bg-[#ccff00]" tasks={tasks} onTaskClick={onTaskClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
            </div>
        ) : (
            <ListView tasks={tasks} onTaskClick={onTaskClick} />
        )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [currentWorkspace, setCurrentWorkspace] = useState(WORKSPACES[0]);
  const [activeModule, setActiveModule] = useState('CONTENT'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [currentUser, setCurrentUser] = useState(MOCK_USER_AGENCY);
  const [contentViewMode, setContentViewMode] = useState('BOARD'); 
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [currentSort, setCurrentSort] = useState('DEFAULT'); // New State for sorting

  const showToast = (msg, isRandom = false) => {
      if (typeof msg !== 'string' && !isRandom) return; 
      if (isRandom) {
          const msgs = ["Yo! That headline is strictly Millennial 💀.", "Burnout Alert: You've been online for 4 hours.", "Pro Tip: Use the Filter button."];
          setToastMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      } else {
          setToastMessage(msg);
      }
  };

  // Sorting Handler
  const handleSortChange = (sortType) => {
      setCurrentSort(sortType);
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      let sortedTasks = [...tasks];

      if (sortType === 'PRIORITY') {
          sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      } else if (sortType === 'DEADLINE') {
          // Sort by date ascending (closest first)
          sortedTasks.sort((a, b) => a.deadline_sort.getTime() - b.deadline_sort.getTime());
      }
      // Only set tasks if sorting applied to avoid unnecessary re-renders for 'DEFAULT'
      if (sortType !== 'DEFAULT') {
          setTasks(sortedTasks);
      } else {
          // Reset to initial (Mock) order if requested
          setTasks(INITIAL_TASKS);
      }
  };


  // Filter Logic
  const filteredTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
  });

  // Handlers
  const handleDragStart = (e, taskId) => { e.dataTransfer.setData("taskId", taskId); };
  const handleDragOver = (e) => { e.preventDefault(); };
  
  // Handlers for status change (Darg & Drop) - MODIFIED for fun
  const handleDrop = (e, status) => {
      const taskId = parseInt(e.dataTransfer.getData("taskId"));
      const task = tasks.find(t => t.id === taskId);
      
      if (!task || task.status === status) return; // Ignore if task not found or status didn't change

      const updatedTasks = tasks.map(t => { 
          if (t.id === taskId) return { ...t, status }; 
          return t; 
      });
      setTasks(updatedTasks);
      
      // --- NEW FUN NOTIFICATION LOGIC (Sensei Toast) ---
      const userName = currentUser.name.split('(')[0].trim(); // e.g., 'Karim'
      let funMessage = "";

      switch (status) {
          case 'IN_PROGRESS':
              funMessage = `تمام يا ${userName}! '${task.title}' دلوقتي في الملعب وبيتشغل عليه 🚀.`;
              break;
          case 'CLIENT_REVIEW':
              funMessage = `وداعاً يا تاسك! '${task.title}' طار على العميل. ${userName} استنى الرياكشن 😂.`;
              break;
          case 'APPROVED':
              funMessage = `يا نينجا! ${userName} جاب الأفرود 👑. التاسك جاهز للنشر يا مدير!`;
              break;
          case 'DRAFT':
              funMessage = `هيييه! '${task.title}' رجع للمسودة ⏪. لازم ${userName} يروق عليه عشان يرجع slay!`;
              break;
          default:
              funMessage = `تم تحديث حالة '${task.title}'. مفيش وقت للكلام، يلا شغل! ⏰`;
      }
      
      showToast(funMessage, false);
  };
  
  const handleSaveTask = (taskData) => {
      if (isNewTask) setTasks([...tasks, taskData]);
      else setTasks(tasks.map(t => t.id === taskData.id ? taskData : t));
      setSelectedTask(null); setIsNewTask(false);
  };
  const handleDeleteTask = (taskId) => {
      if (window.confirm("Delete this task?")) { setTasks(tasks.filter(t => t.id !== taskId)); setSelectedTask(null); }
  };
  const handleClientApprove = (taskId) => {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'APPROVED' } : t));
      showToast("Approved! 🚀");
  };
  
  // New Reject Handler
  const handleClientReject = (taskId) => {
      const reason = window.prompt("Please enter the reason for requesting edits (Mandatory for client).");
      if (reason) {
          setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'DRAFT' } : t));
          showToast(`Rejected. Reason sent: "${reason}" 📝`);
      } else {
          showToast("Rejection cancelled. Reason is mandatory.");
      }
  };


  return (
    <div className="flex h-screen bg-zinc-950 font-sans text-zinc-200 overflow-hidden selection:bg-[#ccff00] selection:text-black">
      {/* 1. WORKSPACE SWITCHER */}
      <div className="w-[72px] flex-shrink-0 bg-zinc-950 border-r border-zinc-900 flex flex-col items-center py-4 space-y-4 z-20">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ccff00] to-green-400 flex items-center justify-center text-black font-black text-xl cursor-pointer">N</div>
        {WORKSPACES.map(ws => (
          <button key={ws.id} onClick={() => setCurrentWorkspace(ws)} className={`w-12 h-12 rounded-[24px] flex items-center justify-center text-sm font-bold ${currentWorkspace.id === ws.id ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}>{ws.initials}</button>
        ))}
      </div>

      {/* 2. INNER SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0 opacity-0'} flex-shrink-0 bg-zinc-950 border-r border-zinc-900 flex flex-col transition-all duration-300`}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-900"><h1 className="font-bold text-lg truncate text-white">{currentWorkspace.name}</h1></div>
        <div className="flex-1 py-6 px-3 space-y-1">
          {currentUser.type === "AGENCY" ? (
             <>
                <button onClick={() => setActiveModule('DASHBOARD')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='DASHBOARD'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><Layout size={18} /> Dashboard</button>
                <button onClick={() => setActiveModule('CONTENT')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='CONTENT'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><FileText size={18} /> Content Studio</button>
                <button onClick={() => setActiveModule('INTEL')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='INTEL'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><Binoculars size={18} /> Intel</button>
                <button onClick={() => setActiveModule('STRATEGY')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='STRATEGY'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><Target size={18} /> Strategy</button>
                <button onClick={() => setActiveModule('ADS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='ADS'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><BarChart3 size={18} /> Ad Center</button>
                <button onClick={() => setActiveModule('SQUAD')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='SQUAD'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><Users size={18} /> Squad</button>
                <button onClick={() => setActiveModule('ARCHIVES')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeModule==='ARCHIVES'?'bg-[#ccff00] text-black':'text-zinc-400'}`}><Archive size={18} /> Archives</button>
             </>
          ) : (
             <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-[#ccff00] text-black"><CheckCircle size={18} /> Approvals</button>
          )}
        </div>
        <div className="p-4 border-t border-zinc-900">
           <button onClick={() => { if(currentUser.type==='AGENCY') { setCurrentUser(MOCK_USER_CLIENT); setActiveModule('PORTAL'); showToast("Client View"); } else { setCurrentUser(MOCK_USER_AGENCY); setActiveModule('DASHBOARD'); showToast("Agency View"); } }} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-zinc-500 hover:text-[#ccff00] border border-zinc-800 rounded-lg"><LogOut size={12}/> Switch Role</button>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-500 hover:text-white"><Menu size={20} /></button>
              {currentUser.type === 'AGENCY' && <div className="relative w-full max-w-md"><Search className="absolute left-3 top-2 text-zinc-500" size={16} /><input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 text-sm text-white focus:outline-none focus:border-[#ccff00]" /></div>}
           </div>
           <div className="flex items-center gap-6">{currentUser.type === 'AGENCY' && <XPBar xp={currentUser.xp} level={currentUser.level} />}<Bell size={20} className="text-zinc-400" /></div>
        </div>

        <div className="flex-1 overflow-auto p-8 relative">
           {currentUser.type === 'CLIENT' ? <ClientPortalView tasks={tasks} onApprove={handleClientApprove} onReject={handleClientReject} showToast={showToast} /> : (
               <>
                 {activeModule === 'DASHBOARD' && <DashboardView tasks={tasks} onNavigate={setActiveModule} />}
                 {activeModule === 'STRATEGY' && <StrategyView showToast={showToast} />}
                 {activeModule === 'CONTENT' && <ContentStudioView 
                    tasks={filteredTasks} 
                    viewMode={contentViewMode} setViewMode={setContentViewMode}
                    filterPriority={filterPriority} setFilterPriority={setFilterPriority}
                    showFilterMenu={showFilterMenu} setShowFilterMenu={setShowFilterMenu}
                    onNewTask={() => { setSelectedTask({}); setIsNewTask(true); }}
                    onTaskClick={(task) => { setSelectedTask(task); setIsNewTask(false); }}
                    onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                    onSortChange={handleSortChange} currentSort={currentSort}
                 />}
                 {activeModule === 'ADS' && <AdCenterView showToast={showToast} />}
                 {activeModule === 'INTEL' && <CompetitorIntelView showToast={showToast} />}
                 {activeModule === 'SQUAD' && <SquadView showToast={showToast} />}
                 {activeModule === 'ARCHIVES' && <ArchivesView />}
               </>
           )}
        </div>
        <SenseiWidget toastMessage={toastMessage} onClearToast={() => { if(toastMessage) setToastMessage(null); else showToast(null, true); }} />
      </div>

      {selectedTask && <TaskModal task={selectedTask} isNew={isNewTask} onClose={() => setSelectedTask(null)} onSave={handleSaveTask} onDelete={handleDeleteTask} showToast={showToast} />}
    </div>
  );
}