import { useState } from 'react'
import {
    Sparkles, FileText, MessageSquare, Mic, Loader2,
    Copy, Check, ChevronDown, ChevronUp, RefreshCw,
    Download, Star, Zap, Target, Brain, ArrowRight,
    ClipboardList, Send, Target as TargetIcon
} from 'lucide-react'
import api from '../api/axios'
import { toast } from 'sonner'

// Mock responses for demo
const MOCK_OUTREACH = (role, company, name) => `Hi ${name || 'there'}! I came across ${company}'s innovative approach to engineering and I'm genuinely excited about the ${role} role. My background in full-stack development and a passion for scalable systems makes me believe I can add real value to your team. Would love to connect! 🚀`

const MOCK_RESUME_RESULT = {
    score_before: 42,
    score_after: 87,
    improved_bullets: [
        "Engineered scalable React applications serving 100K+ daily active users, improving performance by 40%",
        "Architected RESTful APIs using Node.js and MongoDB with JWT authentication and role-based access control",
        "Led agile sprint planning and code reviews, reducing bug cycle time by 35% across a team of 6 engineers"
    ],
    missing_keywords: ["TypeScript", "AWS Lambda", "Redis", "Docker", "CI/CD"],
    suggestions: [
        "Add quantifiable metrics to every bullet point",
        "Include TypeScript and cloud platform experience prominently",
        "Mention Agile/Scrum methodology explicitly"
    ]
}

const MOCK_INTERVIEW_PREP = {
    questions: [
        {
            question: "Tell me about a challenging technical problem you solved.",
            answer_star_format: "SITUATION: At my previous role, our API was handling 500ms latency. TASK: I was assigned to optimize response times. ACTION: I implemented Redis caching and optimized MongoDB queries with proper indexing. RESULT: Reduced latency by 80% to under 100ms.",
            tips: "Always quantify your impact. Focus on YOUR actions, not the team's."
        },
        {
            question: "How do you approach system design for a scalable application?",
            answer_star_format: "SITUATION: Designing a high-traffic notification system. TASK: Must handle 1M+ events/day. ACTION: Chose event-driven architecture with Redis pub/sub and horizontal scaling. RESULT: System handled 3x projected load during peak.",
            tips: "Mention trade-offs, not just solutions. Show you think about constraints."
        }
    ],
    company_tips: [
        "Research their engineering blog and recent open-source contributions",
        "Prepare questions about their tech stack evolution and engineering culture"
    ]
}

const TABS = [
    { id: 'outreach', label: 'Outreach', icon: MessageSquare, color: '#2d89ef' },
    { id: 'resume', label: 'Optimizer', icon: FileText, color: '#9f00a7' },
    { id: 'interview', label: 'Interview', icon: Brain, color: '#00a300' },
]

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success('Copied to clipboard!')
    }
    return (
        <button onClick={copy} className="btn-metro py-2 !text-[11px] gap-2">
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy data</>}
        </button>
    )
}

function MetroMeter({ label, value, color }) {
    return (
        <div className="flex-1">
            <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-500 tracking-widest uppercase">{label}</span>
                <span className="text-xl font-light text-stone-900">{value}%</span>
            </div>
            <div className="h-6 bg-stone-100">
                <div className="h-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    )
}

function OutreachTab() {
    const [form, setForm] = useState({ role: '', company: '', name: '' })
    const [result, setResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const generate = async () => {
        if (!form.role || !form.company) { toast.error('Required fields: Role & Company'); return }
        setIsLoading(true)
        try {
            const res = await api.post('/ai/generate-outreach', form)
            setResult(res.data.message || res.data)
        } catch (err) {
            setResult(MOCK_OUTREACH(form.role, form.company, form.name))
            toast.info('AI Demo Mode Active')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Target Role *</label>
                    <input className="metro-input h-14"
                        value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                        placeholder="Software Engineer" />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Company *</label>
                    <input className="metro-input h-14"
                        value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                        placeholder="Google" />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Recipient</label>
                    <input className="metro-input h-14"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Doe" />
                </div>
            </div>

            <button onClick={generate} disabled={isLoading} className="btn-metro btn-metro-accent h-14 px-10 text-base font-bold tracking-widest uppercase">
                {isLoading ? 'Writing...' : 'Write message'}
            </button>

            {result && (
                <div className="bg-stone-50 border-t border-stone-200 p-8 animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-stone-900 tracking-[0.2em] flex items-center gap-3 uppercase">
                            <MessageSquare className="w-5 h-5 text-[#2d89ef]" />
                            Message
                        </h3>
                        <div className="flex gap-3">
                            <CopyButton text={result} />
                            <button onClick={generate} className="btn-metro h-10 px-4 text-[10px] font-bold uppercase">Try again</button>
                        </div>
                    </div>
                    <div className="bg-white p-6 border-l-4 border-stone-200">
                        <p className="text-base text-stone-700 leading-relaxed font-light">{result}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

function ResumeTab() {
    const [form, setForm] = useState({ jdText: '', resumeText: '' })
    const [result, setResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const analyze = async () => {
        if (!form.jdText || !form.resumeText) { toast.error('Content required for both blocks'); return }
        setIsLoading(true)
        try {
            const res = await api.post('/ai/tailor-resume', form)
            setResult(res.data)
        } catch (err) {
            setResult(MOCK_RESUME_RESULT)
            toast.info('AI Demo Mode Active')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Job Specification</label>
                    <textarea className="metro-input min-h-[250px] py-6 resize-none scrollbar-hide"
                        value={form.jdText}
                        onChange={e => setForm({ ...form, jdText: e.target.value })}
                        placeholder="Paste job description here..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Current Assets</label>
                    <textarea className="metro-input min-h-[250px] py-6 resize-none scrollbar-hide"
                        value={form.resumeText}
                        onChange={e => setForm({ ...form, resumeText: e.target.value })}
                        placeholder="Paste resume content here..." />
                </div>
            </div>

            <button onClick={analyze} disabled={isLoading} className="btn-metro btn-metro-accent h-14 px-10 text-base font-bold tracking-widest uppercase">
                {isLoading ? 'Analyzing...' : 'Improve resume'}
            </button>

            {result && (
                <div className="space-y-8 animate-slide-up">
                    <div className="bg-stone-50 p-8 border-t border-stone-200">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-8">Score</h4>
                        <div className="flex flex-col md:flex-row gap-10">
                            <MetroMeter label="Current" value={result.score_before} color="#ee1111" />
                            <MetroMeter label="After Fixes" value={result.score_after} color="#00a300" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="bg-stone-900 text-white p-8 md:p-10">
                            <h4 className="text-[10px] font-bold text-[#9f00a7] uppercase tracking-[0.3em] mb-8">Better Bullet Points</h4>
                            <div className="space-y-6">
                                {result.improved_bullets?.map((b, i) => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-stone-800 p-4 hover:border-[#9f00a7] transition-colors">
                                        <div className="w-6 h-6 flex-center bg-stone-800 text-[10px] font-bold">{i + 1}</div>
                                        <p className="text-stone-300 text-sm font-light leading-relaxed">{b}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-stone-50 p-8">
                                <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-6 whitespace-nowrap">Keywords to add</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_keywords?.map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-stone-900 text-white text-[9px] font-bold uppercase tracking-widest">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[#fdf2f4] p-8">
                                <h4 className="text-[10px] font-bold text-[#840032] uppercase tracking-[0.4em] mb-6">What to do</h4>
                                <ul className="space-y-4">
                                    {result.suggestions?.map((s, i) => (
                                        <li key={i} className="flex items-center gap-4 text-xs font-bold text-stone-600">
                                            <div className="w-1.5 h-1.5 bg-[#840032] flex-shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function InterviewTab() {
    const [form, setForm] = useState({ role: '', company: '', jdText: '' })
    const [result, setResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [openIdx, setOpenIdx] = useState(0)

    const prepare = async () => {
        if (!form.role || !form.company) { toast.error('Core data required'); return }
        setIsLoading(true)
        try {
            const res = await api.post('/ai/interview-prep', form)
            setResult(res.data)
        } catch (err) {
            setResult(MOCK_INTERVIEW_PREP)
            toast.info('AI Demo Mode Active')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Target Role</label>
                    <input className="metro-input h-14"
                        value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                        placeholder="Backend Engineer" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-500 tracking-widest mb-4 uppercase">Company</label>
                    <input className="metro-input h-14"
                        value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                        placeholder="Netflix" />
                </div>
            </div>

            <button onClick={prepare} disabled={isLoading} className="btn-metro btn-metro-accent h-14 px-10 text-base font-bold tracking-widest uppercase">
                {isLoading ? 'Preparing...' : 'Start interview prep'}
            </button>

            {result && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-slide-up">
                    <div className="xl:col-span-2 space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 text-stone-400">Practice Questions</h3>
                        {result.questions?.map((q, i) => (
                            <div key={i} className="border-4 border-stone-50 overflow-hidden">
                                <button
                                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                    className={`w-full p-6 text-left transition-colors flex items-center justify-between ${openIdx === i ? 'bg-stone-900 text-white' : 'bg-white hover:bg-stone-50'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className="text-2xl font-light opacity-30">{i + 1}</div>
                                        <span className="text-base font-bold tracking-tighter uppercase">{q.question}</span>
                                    </div>
                                    {openIdx === i ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                {openIdx === i && (
                                    <div className="p-8 space-y-6 bg-stone-50">
                                        <div>
                                            <div className="text-[9px] font-bold text-[#00a300] uppercase tracking-[0.3em] mb-3">Best way to answer</div>
                                            <p className="text-base text-stone-700 font-light leading-relaxed">{q.answer_star_format}</p>
                                        </div>
                                        <div className="p-6 bg-amber-50 border-l-4 border-amber-500 flex items-start gap-4">
                                            <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                            <span className="text-xs font-bold text-amber-900 leading-relaxed uppercase">{q.tips}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 text-stone-400">Company Tips</h3>
                        {result.company_tips?.map((tip, i) => (
                            <div key={i} className="bg-stone-900 text-white p-6 relative overflow-hidden group">
                                <TargetIcon className="absolute -right-8 -bottom-8 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold tracking-widest leading-relaxed uppercase">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AITools() {
    const [activeTab, setActiveTab] = useState('outreach')

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Massive Hero */}
            <div className="bg-stone-900 p-8 md:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00aba9] transform translate-x-1/2 -skew-x-12 opacity-5" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 flex-center bg-[#00aba9]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.4em] text-[#00aba9] uppercase whitespace-nowrap">AI Tools for your career</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-light tracking-tighter leading-none mb-6 uppercase">AI Assistant</h2>
                    <p className="text-base md:text-lg font-bold text-stone-500 tracking-[0.2em] max-w-3xl leading-relaxed">
                        Use our AI tools to write messages, improve your resume, and prepare for interviews.
                    </p>
                </div>
            </div>

            {/* Pivot Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="h-32 p-6 text-left transition-all relative flex flex-col justify-end overflow-hidden group"
                            style={{
                                background: isActive ? tab.color : '#f9f9f9',
                                color: isActive ? 'white' : '#777'
                            }}>
                            <Icon className={`absolute top-6 right-6 w-10 h-10 transition-transform ${isActive ? 'opacity-30' : 'opacity-10'} group-hover:scale-110`} />
                            <span className="text-2xl font-light tracking-tighter uppercase">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Operation Area */}
            <div className="bg-white p-8 md:p-16 border-t-8 border-stone-100">
                {activeTab === 'outreach' && <OutreachTab />}
                {activeTab === 'resume' && <ResumeTab />}
                {activeTab === 'interview' && <InterviewTab />}
            </div>
        </div>
    )
}
