import { useState, useEffect } from 'react'
import { CheckSquare, ArrowRight, RotateCcw, Save, Plus as PlusIcon, X as XIcon, Sparkles, Copy, RefreshCw, Zap, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import useJobStore from '../store/jobStore'
import { toast } from 'sonner'
import api from '../api/axios'

export default function Checklist() {
  const { addJob } = useJobStore()

  const [role, setRole] = useState(() => localStorage.getItem('checklist_role') || '')
  const [company, setCompany] = useState(() => localStorage.getItem('checklist_company') || '')
  const [aiMessage, setAiMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const DEFAULT_STEPS = [
    { id: 1, text: "Read the job description carefully", checked: false },
    { id: 2, text: "Research the company and their website", checked: false },
    { id: 3, text: "Check salary ranges and company reviews", checked: false },
    { id: 4, text: "Update your resume for this job", checked: false },
    { id: 5, text: "Write a personalized cover letter", checked: false },
    { id: 6, text: "Find the hiring manager on LinkedIn", checked: false },
    { id: 7, text: "Apply through the company website", checked: false },
    { id: 8, text: "Send a message to the recruiter", checked: false },
    { id: 9, text: "Set a reminder to follow up in 3 days", checked: false },
    { id: 10, text: "Add this job to your board", checked: false },
  ]

  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('checklist_steps')
    return saved ? JSON.parse(saved) : DEFAULT_STEPS
  })

  useEffect(() => {
    localStorage.setItem('checklist_role', role)
    localStorage.setItem('checklist_company', company)
    localStorage.setItem('checklist_steps', JSON.stringify(steps))
  }, [role, company, steps])

  const toggleStep = (id) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, checked: !step.checked } : step
    ))
  }

  const deleteStep = (e, id) => {
    e.stopPropagation()
    setSteps(steps.filter(s => s.id !== id))
  }

  const addStep = () => {
    const text = prompt("Enter new step:")
    if (text) {
      setSteps([...steps, { id: Date.now(), text: text, checked: false }])
      toast.success("Step added")
    }
  }

  const progress = steps.length > 0 ? Math.round((steps.filter(s => s.checked).length / steps.length) * 100) : 0

  const handleReset = () => {
    if (window.confirm("Start fresh for a new job?")) {
      setRole('')
      setCompany('')
      setSteps(DEFAULT_STEPS.map(s => ({ ...s, checked: false })))
      toast.info("Checklist reset")
    }
  }

  const handleSaveToTracker = async () => {
    if (!role || !company) return toast.error("Role/Company data missing")

    try {
      await addJob({ role, company, status: 'Applied', checklistDone: steps.filter(s => s.checked).map(s => s.text), appliedDate: new Date() })
      toast.success("Job added to tracker")
    } catch (err) {
      toast.error("Failed to save")
    }
  }

  const generateOutreach = async () => {
    if (!role || !company) return toast.error("Enter parameters to generate")
    setIsGenerating(true)
    try {
      const res = await api.post('/ai/generate-outreach', { role, company })
      setAiMessage(res.data.message)
      toast.success("AI output generated")
    } catch (err) {
      toast.error("Generation error")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">

      {/* ── Protocol Header ── */}
      <div className="bg-stone-900 p-8 md:p-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00a300] opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, currentColor 100px, currentColor 101px)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 flex-center bg-[#00a300]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#00a300]">Step-by-step application</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-none mb-10 uppercase">Job<br />Checklist</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
            <input className="metro-input h-12 px-6 text-sm"
              placeholder="Job Title" value={role} onChange={e => setRole(e.target.value)} />
            <input className="metro-input h-12 px-6 text-sm"
              placeholder="Company Name" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

        {/* ── Steps Hub ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em]">Steps to follow</h3>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">{steps.filter(s => s.checked).length} / {steps.length} complete</span>
              <button onClick={addStep} className="btn-metro h-10 px-4 text-[10px] font-bold tracking-widest flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> Add step
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {steps.map((step, idx) => (
              <div key={step.id} onClick={() => toggleStep(step.id)}
                className={`group p-6 flex items-center gap-6 cursor-pointer transition-colors ${step.checked ? 'bg-[#f0fdf4] border-[#00a300]' : 'bg-stone-50 hover:bg-stone-100'}`}>
                <div className={`w-7 h-7 flex-center font-bold text-[10px] ${step.checked ? 'bg-[#00a300] text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {step.checked ? <CheckSquare className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`flex-1 text-xs font-bold tracking-widest ${step.checked ? 'text-[#00a300] line-through opacity-50' : 'text-stone-900'}`}>
                  {step.text}
                </span>
                <button onClick={(e) => deleteStep(e, step.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-opacity">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Status & AI Hub ── */}
        <div className="space-y-12">

          {/* Progress Panel */}
          <div className="bg-stone-50 p-8 border-t border-stone-200">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-8">Progress</h3>
            <div className="text-5xl font-light tracking-tighter mb-4">{progress}%</div>
            <div className="h-4 bg-stone-200">
              <div className="h-full bg-[#00a300] transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* AI Hub */}
          <div className="bg-[#2d89ef] p-8 text-white relative overflow-hidden group">
            <Sparkles className="absolute -top-10 -right-10 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8">AI Message writer</h3>
            <div className="space-y-4">
              <button onClick={generateOutreach} disabled={isGenerating}
                className="btn-metro h-12 w-full bg-white text-black font-bold tracking-widest flex-center gap-2 uppercase">
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Write Message
              </button>
              {aiMessage && (
                <div className="bg-white/10 p-4 border-l-4 border-white animate-slide-up">
                  <p className="text-[11px] font-bold leading-relaxed mb-3">{aiMessage}</p>
                  <button onClick={() => { navigator.clipboard.writeText(aiMessage); toast.success("Message copied") }}
                    className="text-[9px] font-bold tracking-widest flex items-center gap-2 hover:opacity-70 uppercase">
                    <Copy className="w-2.5 h-2.5" /> Copy Message
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={handleSaveToTracker} disabled={progress < 100}
              className={`btn-metro h-14 w-full text-[10px] font-bold tracking-widest flex-center gap-3 uppercase ${progress === 100 ? 'btn-metro-accent' : 'bg-stone-100 text-stone-300'}`}>
              <Save className="w-4 h-4" /> Save to tracker
            </button>
            <button onClick={handleReset}
              className="btn-metro h-14 w-full text-[10px] font-bold tracking-widest flex-center gap-3 bg-stone-100 uppercase">
              <RotateCcw className="w-4 h-4" /> Reset Checklist
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
