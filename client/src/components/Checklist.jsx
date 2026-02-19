import { useState, useEffect } from 'react'
import { CheckSquare, ArrowRight, RotateCcw, Save, Plus as PlusIcon, X as XIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import useJobStore from '../store/jobStore'
import { toast } from 'sonner'

export default function Checklist() {
  const { addJob } = useJobStore()

  // Persist state to LocalStorage
  const [role, setRole] = useState(() => localStorage.getItem('checklist_role') || '')
  const [company, setCompany] = useState(() => localStorage.getItem('checklist_company') || '')

  const DEFAULT_STEPS = [
    { id: 1, text: "Read the full Job Description carefully", checked: false },
    { id: 2, text: "Research the Company (Website, LinkedIn, Product)", checked: false },
    { id: 3, text: "Check salary range & glassdoor reviews", checked: false },
    { id: 4, text: "Tailor Resume keywords to match JD", checked: false },
    { id: 5, text: "Write a short, custom Cover Note", checked: false },
    { id: 6, text: "Find the Hiring Manager/Recruiter on LinkedIn", checked: false },
    { id: 7, text: "Apply on the Company Site (not Easy Apply if possible)", checked: false },
    { id: 8, text: "Send connection request to Recruiter", checked: false },
    { id: 9, text: "Set a reminder to follow up in 3 days", checked: false },
    { id: 10, text: "Log application in Job Tracker", checked: false },
  ]

  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('checklist_steps')
    return saved ? JSON.parse(saved) : DEFAULT_STEPS
  })

  // Save changes
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
      setSteps([...steps, { id: Date.now(), text, checked: false }])
      toast.success("New step added to protocol")
    }
  }

  const progress = steps.length > 0 ? Math.round((steps.filter(s => s.checked).length / steps.length) * 100) : 0

  const handleReset = () => {
    if (window.confirm("Start fresh for a new job?")) {
      setRole('')
      setCompany('')
      setSteps(DEFAULT_STEPS.map(s => ({ ...s, checked: false }))) // Reset to default steps
      toast.info("Protocol reset")
    }
  }

  const handleSaveToTracker = async () => {
    if (!role || !company) return toast.error("Please enter Role and Company")

    try {
      await addJob({
        role,
        company,
        status: 'Applied',
        checklistDone: steps.filter(s => s.checked).map(s => s.text),
        appliedDate: new Date()
      })

      toast.success(`${role} at ${company} logged!`)
    } catch (err) {
      toast.error("Failed to save to tracker")
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#fdf2f4] rounded-lg">
            <CheckSquare className="w-6 h-6 text-[#840032]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Application Protocol</h1>
            <p className="text-slate-500">Don't just apply. Apply correctly. Follow this 10-step protocol for every single job.</p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
            <input
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#840032]/10 outline-none"
              placeholder="e.g. SDE II"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Company</label>
            <input
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#840032]/10 outline-none"
              placeholder="e.g. Swiggy"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-[#840032] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-right text-xs font-bold text-[#840032]">{progress}% Complete</p>
      </div>

      {/* Checklist Items */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        {steps.map((step, index) => (
          <div
            key={step.id}
            onClick={() => toggleStep(step.id)}
            className={`flex items-center gap-4 p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${step.checked ? 'bg-[#fdf2f4]' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${step.checked ? 'bg-[#840032] border-[#840032]' : 'border-slate-300'}`}>
              {step.checked && <CheckSquare className="w-4 h-4 text-white" />}
            </div>
            <span className={`flex-1 font-medium ${step.checked ? 'text-[#840032]/60 line-through opacity-70' : 'text-slate-700'}`}>
              {/* Step Number Badge */}
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md mr-3">Step {index + 1}</span>
              {step.text}
            </span>
            <button onClick={(e) => deleteStep(e, step.id)} className="text-slate-400 hover:text-red-500 p-2">
              <XIcon />
            </button>
          </div>
        ))}
        <div className="p-4 bg-slate-50">
          <button onClick={addStep} className="text-sm font-bold text-[#840032] hover:text-[#660029] flex items-center gap-2">
            <PlusIcon /> Add Step
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex justify-center items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" /> Reset Protocol
        </button>

        <button
          onClick={handleSaveToTracker}
          disabled={progress < 100}
          className={`flex-1 py-4 font-bold rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all ${progress === 100
            ? 'bg-[#840032] hover:bg-[#660029] text-white shadow-[#840032]/20'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          <Save className="w-5 h-5" /> Log to Job Tracker
        </button>
      </div>

    </div>
  )
}
