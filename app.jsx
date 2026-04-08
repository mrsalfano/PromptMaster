import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  FlaskConical, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Award, 
  RotateCcw,
  EyeOff,
  Sparkles,
  HelpCircle,
  Zap,
  MessageSquare,
  Wand2,
  ShieldCheck,
  Target,
  TrendingUp,
  Info,
  GraduationCap
} from 'lucide-react';

const PCTFC_ELEMENTS = [
  { 
    key: 'P', 
    name: 'Persona', 
    desc: 'Expert Identity', 
    color: 'text-blue-500', 
    border: 'border-blue-200',
    advice: "Without a Persona, the AI acts like a generic search engine.",
    guidingQuestion: "Who is the expert?",
    suggestion: "Try: 'Act as a veteran science educator...'"
  },
  { 
    key: 'T', 
    name: 'Task', 
    desc: 'Specific Action', 
    color: 'text-green-500', 
    border: 'border-green-200',
    advice: "Strong tasks use Bloom's Taxonomy verbs.",
    guidingQuestion: "What is the action?",
    suggestion: "Use: 'Design a project-based module...'"
  },
  { 
    key: 'C', 
    name: 'Context', 
    desc: 'Student/Class Profile', 
    color: 'text-orange-500', 
    border: 'border-orange-200',
    advice: "Critical for differentiation.",
    guidingQuestion: "Who are the students?",
    suggestion: "Add: 'For 9th graders, including ELLs...'"
  },
  { 
    key: 'F', 
    name: 'Format', 
    desc: 'Output Structure', 
    color: 'text-purple-500', 
    border: 'border-purple-200',
    advice: "Format saves you time.",
    guidingQuestion: "What's the output?",
    suggestion: "Try: 'Organize into a 3-column table...'"
  }
];

const PRACTICE_ACTIVITIES = [
  {
    id: 1,
    title: "The Missing Persona",
    description: "Shift dry facts to engaging storytelling by giving the AI an identity.",
    learningContext: "In prompt engineering, a Persona sets the 'boundary' for the AI's knowledge and tone. For teachers, this ensures the AI doesn't just give you a Wikipedia summary, but instead provides content designed with pedagogical intent.",
    whyItMatters: "A 'Science Educator' persona will prioritize misconceptions and safety, whereas a 'Scientist' persona might be too technical for your students.",
    instruction: "Add a Persona to the beginning of the prompt.",
    initialPrompt: "Create a lesson on photosynthesis.",
    goal: "Add persona",
    scaffold: "[Persona] + [Prompt]",
    requirements: ['persona']
  },
  {
    id: 2,
    title: "Contextual Clarity",
    description: "AI output is only as good as its understanding of your classroom.",
    learningContext: "Context is the 'Secret Sauce' of differentiation. AI models are trained on general data; without your specific class context, they produce 'average' content that may not meet your students' specific needs.",
    whyItMatters: "Providing details about grade levels, reading abilities (lexile), or IEP requirements allows the AI to suggest appropriate scaffolds and relevant real-world analogies.",
    instruction: "Add Context for who your students are.",
    initialPrompt: "Act as a history expert. Write a lesson about the Silk Road.",
    goal: "Add context",
    scaffold: "[Prompt] + [Context]",
    requirements: ['context']
  },
  {
    id: 3,
    title: "Formatting for Utility",
    description: "Make output immediately usable by requesting a specific structure.",
    learningContext: "Standard AI responses are often long-form text blocks that require heavy editing. Formatting instructions tell the AI exactly how to visualize and organize information.",
    whyItMatters: "Asking for a '3-column table' or a 'dialogue script' saves you 15-20 minutes of reformatting time. It makes the content ready to be pasted directly into your slides or handouts.",
    instruction: "Add a Format instruction to the end.",
    initialPrompt: "Act as an English teacher. Write 5 hooks for Romeo and Juliet for 9th graders.",
    goal: "Add format",
    scaffold: "[Prompt] + [Format]",
    requirements: ['format']
  },
  {
    id: 4,
    title: "The Full Stack",
    description: "Layer P, T, C, and F to create a high-leverage teaching tool.",
    learningContext: "This is where the PTCF framework becomes a 'Master Key.' When all four elements are present, you move from 'chatting with an AI' to 'using a professional curriculum assistant.'",
    whyItMatters: "Full-stack prompts are reproducible. Once you find a formula that works for your specific teaching style and student population, you can reuse it for any topic across the entire school year.",
    instruction: "Include all four PTCF elements in one cohesive prompt.",
    initialPrompt: "Give me a lesson on fractions.",
    goal: "Include all",
    scaffold: "P + T + C + F",
    requirements: ['persona', 'task', 'context', 'format']
  },
  {
    id: 5,
    title: "Master Challenge",
    description: "Now it's your turn. Create a new prompt from scratch using the framework.",
    learningContext: "Mastery isn't just about following steps; it's about internalizing the framework so it becomes second nature during your planning periods.",
    whyItMatters: "By starting from scratch, you're building the mental muscle to recognize when a prompt is weak before you even hit enter, saving you from 'prompt fatigue.'",
    instruction: "Create an entirely new prompt.",
    initialPrompt: "",
    goal: "Full autonomy",
    scaffold: "Role + Action + Audience + Structure",
    requirements: ['persona', 'task', 'context', 'format']
  }
];

const analyzePrompt = (text) => {
  const lower = text.toLowerCase();
  const feedback = {
    persona: lower.includes("act as") || lower.includes("you are") || lower.includes("persona") || lower.includes("expert") || lower.includes("specialist") || lower.includes("educator") || lower.includes("teacher"),
    task: lower.length > 10 && (lower.includes("create") || lower.includes("write") || lower.includes("generate") || lower.includes("design") || lower.includes("plan") || lower.includes("draft")),
    context: lower.includes("grade") || lower.includes("student") || lower.includes("level") || lower.includes("class") || lower.includes("year") || lower.includes("aged") || lower.includes("iep") || lower.includes("ell"),
    format: lower.includes("table") || lower.includes("list") || lower.includes("script") || lower.includes("markdown") || lower.includes("bullet") || lower.includes("format") || lower.includes("csv")
  };
  
  const score = Object.values(feedback).filter(Boolean).length;
  return { feedback, score };
};

export default function App() {
  const [view, setView] = useState('practice'); // 'practice' or 'sandbox'
  const [currentActivity, setCurrentActivity] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [results, setResults] = useState(null);
  const [practiceStatus, setPracticeStatus] = useState(new Array(5).fill(false));
  const [showHint, setShowHint] = useState(false);
  
  const activityRef = useRef(null);

  useEffect(() => {
    setUserPrompt(view === 'practice' ? PRACTICE_ACTIVITIES[currentActivity].initialPrompt : '');
    setResults(null);
    setShowHint(false);
  }, [currentActivity, view]);

  const handleModuleClick = (idx) => {
    setCurrentActivity(idx);
    // Smooth scroll to the activity content area
    if (activityRef.current) {
      activityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCheck = () => {
    const analysis = analyzePrompt(userPrompt);
    setResults(analysis);

    if (view === 'practice') {
      const reqs = PRACTICE_ACTIVITIES[currentActivity].requirements;
      const isSuccess = reqs.every(r => analysis.feedback[r]);
      
      if (isSuccess) {
        const newStatus = [...practiceStatus];
        newStatus[currentActivity] = true;
        setPracticeStatus(newStatus);
      }
    }
  };

  const currentActData = PRACTICE_ACTIVITIES[currentActivity];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Premium Header */}
      <header className="bg-slate-900 text-white p-6 shadow-xl border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">PromptMaster <span className="text-indigo-400">Educator</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">AI Pedagogy Accelerator</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <button 
              onClick={() => setView('practice')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'practice' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              Guided Practice
            </button>
            <button 
              onClick={() => setView('sandbox')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'sandbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              Sandbox Lab
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {view === 'practice' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-2 lg:sticky lg:top-28 lg:h-fit">
              <div className="mb-4 px-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Training Progress</h3>
                <div className="flex gap-1 mt-2">
                  {practiceStatus.map((s, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${s ? 'bg-green-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>
              {PRACTICE_ACTIVITIES.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => handleModuleClick(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                    currentActivity === idx 
                      ? 'border-indigo-500 bg-white shadow-md' 
                      : 'border-transparent hover:bg-slate-200/50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      practiceStatus[idx] ? 'bg-green-100 text-green-600' : (currentActivity === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500')
                    }`}>
                      {practiceStatus[idx] ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <span className={`font-bold text-sm ${currentActivity === idx ? 'text-slate-900' : ''}`}>{act.title}</span>
                  </div>
                  <ChevronRight size={16} className={`${currentActivity === idx ? 'text-indigo-500' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6" ref={activityRef}>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <BookOpen size={120} />
                </div>
                
                <h2 className="text-3xl font-black mb-2 text-slate-900">{currentActData.title}</h2>
                <p className="text-slate-600 mb-8 max-w-3xl leading-relaxed">{currentActData.description}</p>
                
                {/* Educational Context Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                      <GraduationCap size={16} className="text-indigo-500" /> Pedagogical Context
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{currentActData.learningContext}</p>
                  </div>
                  <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                    <h4 className="flex items-center gap-2 text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
                      <Info size={16} /> Why It Matters
                    </h4>
                    <p className="text-xs text-indigo-900/80 leading-relaxed">{currentActData.whyItMatters}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="flex-1 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target size={14} /> Objective
                    </p>
                    <p className="text-slate-900 font-bold text-lg leading-tight">{currentActData.instruction}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap size={14} /> PTCF Scaffold
                    </p>
                    <p className="text-slate-600 font-mono text-sm bg-white p-2 rounded border border-slate-200">{currentActData.scaffold}</p>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-mono text-slate-700 shadow-inner"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Refine the prompt here..."
                  />
                  {results && results.score === 4 && (
                    <div className="absolute top-4 right-4 animate-bounce">
                      <Award className="text-yellow-500" size={32} />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleCheck}
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                      <Zap size={18} /> Audit Prompt
                    </button>
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                      title="Get a hint"
                    >
                      <Lightbulb size={20} />
                    </button>
                  </div>

                  {results && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentActData.requirements.map(req => (
                        <div key={req} className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                          results.feedback[req] ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-300 border-slate-100'
                        }`}>
                          <Icon name={results.feedback[req] ? "CheckCircle2" : "AlertCircle"} size={12} />
                          {req}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showHint && (
                  <div className="mt-6 p-6 bg-yellow-50 border border-yellow-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="text-yellow-600 mt-1" />
                      <div>
                        <h4 className="font-bold text-yellow-800">Framework Hint</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          {currentActData.requirements.includes('persona') && !results?.feedback.persona && "Try starting with: 'Act as a high school English teacher specialized in Shakespeare'"}
                          {currentActData.requirements.includes('context') && !results?.feedback.context && " Mention your target audience, e.g., 'for a 3rd grade class with diverse reading levels'"}
                          {currentActData.requirements.includes('format') && !results?.feedback.format && " Define the output, e.g., 'Organize the information in a 2-column comparison table'"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Prompting Sandbox</h2>
              <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
                A professional environment to stress-test your prompts against pedagogical frameworks. Audit, refine, and deploy.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-200">
              <textarea
                className="w-full h-64 p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-mono text-lg text-slate-700 shadow-inner"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Type any prompt you use in your daily workflow..."
              />
              
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <button 
                  onClick={handleCheck}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <ShieldCheck size={24} /> Audit Pedagogical Strength
                </button>
                <button 
                  onClick={() => setUserPrompt('')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw size={20} /> Clear Lab
                </button>
              </div>

              {results && (
                <div className="mt-12 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Diagnostic Results</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PCTFC_ELEMENTS.map((el) => {
                      const isActive = results.feedback[el.name.toLowerCase()];
                      return (
                        <div 
                          key={el.key} 
                          className={`p-5 rounded-2xl border-2 transition-all ${
                            isActive ? `${el.border} bg-white shadow-lg shadow-slate-100` : 'border-slate-100 bg-slate-50 grayscale opacity-40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xl font-black ${el.color}`}>{el.key}</span>
                            {isActive ? <CheckCircle2 className="text-green-500" size={18} /> : <EyeOff className="text-slate-300" size={18} />}
                          </div>
                          <h4 className="font-bold text-slate-900">{el.name}</h4>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{el.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic Insight Card */}
                  <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-6">Pedagogical Insight Engine</h4>
                      <div className="space-y-6">
                        {Object.entries(results.feedback).map(([key, isPresent]) => {
                          if (isPresent) return null;
                          const el = PCTFC_ELEMENTS.find(e => e.name.toLowerCase() === key);
                          return (
                            <div key={key} className="flex gap-5 group">
                              <div className="mt-1 p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-900/50 transition-colors">
                                <AlertCircle className="text-indigo-400" size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-slate-100">Missing {el.name}</p>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{el.advice}</p>
                                <div className="mt-3 flex items-center gap-2 text-indigo-400 text-sm font-bold">
                                  <Wand2 size={14} />
                                  <span>{el.suggestion}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {results.score === 4 && (
                          <div className="text-center py-6">
                            <div className="inline-block p-4 bg-indigo-500/20 rounded-full mb-4">
                              <Award className="text-yellow-400" size={48} />
                            </div>
                            <h5 className="text-2xl font-black mb-2">Framework Mastery Detected</h5>
                            <p className="text-slate-400 max-w-sm mx-auto">This prompt is highly optimized for educational quality and precise AI interpretation.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto px-6 pt-10 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Teacher-Led Development</span>
          </div>
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase">Powered by PTCF Methodology</p>
        </div>
      </footer>
    </div>
  );
}

// Helper to handle dynamic icon rendering from strings in JSON data
function Icon({ name, size = 24, className = "" }) {
  const icons = {
    CheckCircle2: <CheckCircle2 size={size} className={className} />,
    AlertCircle: <AlertCircle size={size} className={className} />,
    Target: <Target size={size} className={className} />,
    RotateCcw: <RotateCcw size={size} className={className} />
  };
  return icons[name] || null;
}
