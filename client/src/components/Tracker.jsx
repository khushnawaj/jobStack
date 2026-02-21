import { useState, useEffect } from 'react'
import {
  Plus, X, Edit2, Trash2, Calendar, KanbanSquare, List,
  Search, DollarSign, ExternalLink, ArrowUpRight, Building2,
  Briefcase, Check, ChevronDown, MoreHorizontal, GripVertical,
  TrendingUp, Clock, Star, Tag, Zap, Sparkles, CheckSquare
} from 'lucide-react'
import useJobStore from '../store/jobStore'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  Saved: {
    label: 'Saved', color: '#fff', bg: '#2d89ef',
    border: '#2d89ef', lightBg: '#f0f7ff',
    dot: '#fff', header: '#2d89ef'
  },
  Applied: {
    label: 'Applied', color: '#fff', bg: '#00a300',
    border: '#00a300', lightBg: '#f0fdf4',
    dot: '#fff', header: '#00a300'
  },
  Interview: {
    label: 'Interview', color: '#fff', bg: '#9f00a7',
    border: '#9f00a7', lightBg: '#fdf2f4',
    dot: '#fff', header: '#9f00a7'
  },
  Offer: {
    label: 'Offer', color: '#fff', bg: '#ffc40d',
    border: '#ffc40d', lightBg: '#fffdf0',
    dot: '#fff', header: '#ffc40d'
  },
  Rejected: {
    label: 'Rejected', color: '#fff', bg: '#ee1111',
    border: '#ee1111', lightBg: '#fef2f2',
    dot: '#fff', header: '#ee1111'
  },
}

const STATUS_ORDER = Object.keys(STATUS_CONFIG)
const EMPTY_FORM = { role: '', company: '', status: 'Saved', notes: '', salary: '', jdUrl: '', recruiterName: '' }

function KanbanCard({ job, onEdit, onDelete, onStatusChange }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="metro-kanban-item group relative p-4" onClick={() => onEdit(job)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-stone-900 leading-tight tracking-tighter mb-1 truncate">{job.role}</h4>
          <div className="flex items-center gap-2 text-stone-500 font-bold text-[9px] uppercase">
            <Building2 className="w-3 h-3" />
            <span>{job.company}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
          className="p-1 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-900">
          <MoreHorizontal className="w-5 h-5" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-10 w-48 bg-white border-2 border-stone-800 z-50 p-1"
            onMouseLeave={() => setShowMenu(false)}>
            {STATUS_ORDER.filter(s => s !== job.status).map(s => (
              <button key={s}
                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-stone-100"
                onClick={(e) => { e.stopPropagation(); onStatusChange(job.id, s); setShowMenu(false) }}>
                Move to {s}
              </button>
            ))}
            <button className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-600 hover:text-white text-red-600 border-t border-stone-100 mt-1"
              onClick={(e) => { e.stopPropagation(); onDelete(job.id) }}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.salary && (
          <span className="bg-stone-100 text-stone-600 px-2 py-1 text-[10px] font-bold">{job.salary}</span>
        )}
        {job.jdUrl && (
          <a href={job.jdUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="bg-[#00aba9] text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1">
            JD Link <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="text-[9px] font-bold text-stone-400 flex items-center gap-2">
        <Clock className="w-2.5 h-2.5" />
        {new Date(job.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

function KanbanView({ jobs, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-hide">
      {STATUS_ORDER.map(status => {
        const cfg = STATUS_CONFIG[status]
        const columnJobs = jobs.filter(j => j.status === status)
        return (
          <div key={status} className="metro-kanban-col">
            {/* Column Header */}
            <div className="mb-4">
              <h3 className="text-xl font-light text-stone-900 tracking-tighter flex items-center gap-3">
                <span className="w-6 h-6 flex-center text-white text-[10px] font-bold" style={{ background: cfg.header }}>
                  {columnJobs.length}
                </span>
                {status.toUpperCase()}
              </h3>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {columnJobs.map(job => (
                <KanbanCard
                  key={job.id}
                  job={job}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
              {columnJobs.length === 0 && (
                <div className="border-4 border-dashed border-stone-100 p-12 text-center text-stone-300 font-bold text-xs">
                  No {status}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableView({ jobs, onEdit, onDelete, onStatusChange }) {
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = jobs.filter(j => {
    const role = j.role || ''
    const company = j.company || ''
    const matchQ = !searchQ ||
      role.toLowerCase().includes(searchQ.toLowerCase()) ||
      company.toLowerCase().includes(searchQ.toLowerCase())
    const matchStatus = statusFilter === 'All' || j.status === statusFilter
    return matchQ && matchStatus
  })

  return (
    <div>
      {/* Table toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1 flex items-center">
          <Search className="lucide-abs left-4 w-5 h-5 text-slate-400" />
          <input
            className="input-clean !pl-12 h-10 py-0 text-sm"
            placeholder="Filter by role or company..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...STATUS_ORDER].map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-all"
              style={{
                background: statusFilter === s ? (STATUS_CONFIG[s]?.bg || '#0f172a') : 'white',
                color: statusFilter === s ? (STATUS_CONFIG[s]?.color || 'white') : '#64748b',
                borderColor: statusFilter === s ? (STATUS_CONFIG[s]?.border || '#0f172a') : '#e2e8f0',
              }}>
              {s} {s !== 'All' && <span className="ml-1 opacity-60">{jobs.filter(j => j.status === s).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left text-sm hidden md:table">
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-widest">Role / Company</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-widest hidden lg:table-cell">Salary</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-widest hidden lg:table-cell">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">
                  No applications match your filters
                </td>
              </tr>
            ) : (
              filtered.map(job => {
                const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Saved
                return (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {job.company?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{job.role}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3" />{job.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={job.status}
                        onChange={async e => await onStatusChange(job.id, e.target.value)}
                        className="text-[12px] font-black tracking-wider px-4 py-2 rounded-full border outline-none cursor-pointer appearance-none transition-all min-w-[120px]"
                        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                        {STATUS_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs hidden lg:table-cell font-medium">
                      {job.salary || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs hidden lg:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(job.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {job.jdUrl && (
                          <a href={job.jdUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => onEdit(job)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(job.id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-100 bg-white">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              No search results.
            </div>
          ) : (
            filtered.map(job => {
              const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Saved
              return (
                <div key={job.id}
                  onClick={() => onEdit(job)}
                  className="p-5 active:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {job.company?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate leading-tight mb-1">{job.role}</h4>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />{job.company}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black tracking-wider px-2 py-1 rounded-full border flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                      {STATUS_CONFIG[job.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(job.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-3">
                      {job.jdUrl && (
                        <a href={job.jdUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[10px] font-bold text-[#00aba9]">JD Link</a>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onDelete(job.id) }}
                        className="text-[10px] font-bold text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function Tracker() {
  const { jobs, fetchJobs, addJob, updateJob, deleteJob, isLoading } = useJobStore()
  const [view, setView] = useState('kanban')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { fetchJobs() }, [])

  const total = jobs.length
  const active = jobs.filter(j => ['Applied', 'Interview'].includes(j.status)).length
  const interviews = jobs.filter(j => j.status === 'Interview').length
  const offers = jobs.filter(j => j.status === 'Offer').length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.role || !formData.company) return
    setIsSaving(true)
    try {
      if (editId) {
        await updateJob(editId, formData)
        toast.success('Job updated!')
      } else {
        await addJob(formData)
        toast.success('Job added to board!')
      }
      closeModal()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    await updateJob(id, { status: newStatus })
    toast.success(`Moved to ${newStatus}`)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return
    await deleteJob(id)
    toast.info('Job removed')
  }

  const openEdit = (job) => {
    setFormData({
      role: job.role || '',
      company: job.company || '',
      status: job.status || 'Saved',
      notes: job.notes || '',
      salary: job.salary || '',
      jdUrl: job.jdUrl || '',
      recruiterName: job.recruiterName || '',
    })
    setEditId(job.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setFormData(EMPTY_FORM)
    setEditId(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-light text-stone-900 tracking-tighter leading-none mb-1 uppercase">Jobs</h2>
          <p className="text-[10px] font-bold text-stone-400 tracking-[0.3em] uppercase">My Board</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-stone-100 p-1">
            {[
              { v: 'kanban', Icon: KanbanSquare },
              { v: 'table', Icon: List },
            ].map(({ v, Icon }) => (
              <button key={v}
                onClick={() => setView(v)}
                className={`flex-center w-12 h-12 transition-all ${view === v ? 'bg-stone-900 text-white' : 'bg-transparent text-stone-400 hover:text-stone-900'}`}>
                <Icon className="w-6 h-6" />
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-metro btn-metro-accent h-14 px-8 text-sm tracking-widest font-bold uppercase">
            Add Job
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {[
          { label: 'Total', value: total, color: '#2d89ef', icon: Briefcase },
          { label: 'Active', value: active, color: '#00aba9', icon: Zap },
          { label: 'Interviews', value: interviews, color: '#9f00a7', icon: Sparkles },
          { label: 'Offers', value: offers, color: '#00a300', icon: CheckSquare },
        ].map((s, i) => (
          <div key={i} className="flex-1 min-w-[140px] h-[120px] p-5 text-white relative cursor-default group overflow-hidden" style={{ background: s.color }}>
            <div className="text-[9px] font-bold tracking-[0.2em] opacity-70 mb-1 uppercase">{s.label}</div>
            <div className="text-3xl font-light tracking-tighter leading-none">{s.value}</div>
            <s.icon className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
        ))}
      </div>

      {/* Main View */}
      <div className="relative">
        {isLoading ? (
          <div className="flex-center h-96">
            <div className="w-20 h-20 border-8 border-stone-100 border-t-stone-900 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 bg-stone-50 text-center border-t border-stone-200">
            <div className="w-16 h-16 flex-center bg-stone-900 mx-auto mb-8">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-light text-stone-900 tracking-tighter mb-4 uppercase">No Jobs Found</h3>
            <p className="text-xs text-stone-500 mb-8 tracking-widest uppercase">Start by adding your first job application</p>
            <button onClick={() => setShowModal(true)} className="btn-metro btn-metro-accent h-14 px-10 text-xs font-bold tracking-widest uppercase">
              Add Job
            </button>
          </div>
        ) : view === 'kanban' ? (
          <KanbanView jobs={jobs} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        ) : (
          <TableView jobs={jobs} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        )}
      </div>

      {/* Metro Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white overflow-y-auto animate-fade-in">
          {/* Top Bar Overlay */}
          <div className="h-16 bg-stone-900 text-white flex items-center justify-between px-8 flex-shrink-0">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 flex-center bg-stone-800">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-light tracking-tighter uppercase">
                {editId ? 'Edit Job' : 'Add a new job'}
              </h3>
            </div>
            <button onClick={closeModal} className="w-12 h-12 flex-center hover:bg-[#ee1111] transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 p-10 md:p-20 lg:p-32">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <div className="col-span-1 lg:col-span-2 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 tracking-widest mb-3 uppercase">Role *</label>
                      <input className="metro-input h-12" required
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. Software Engineer" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 tracking-widest mb-3 uppercase">Company *</label>
                      <input className="metro-input h-12" required
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Google" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 tracking-widest mb-3 uppercase">Notes</label>
                    <textarea className="metro-input min-h-[200px] py-4 resize-none"
                      value={formData.notes || ''}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter job details, interview notes, etc." />
                  </div>
                </div>

                <div className="space-y-6 bg-stone-50 p-6 border-t border-stone-900">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 tracking-widest mb-3 uppercase">Status</label>
                    <select className="metro-input h-12 cursor-pointer font-bold text-xs"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      {STATUS_ORDER.map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 tracking-widest mb-3 uppercase">Salary</label>
                    <input className="metro-input h-12"
                      value={formData.salary || ''}
                      onChange={e => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. $100k" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 tracking-widest mb-3 uppercase">Job Link (URL)</label>
                    <input className="metro-input h-12"
                      value={formData.jdUrl || ''}
                      onChange={e => setFormData({ ...formData, jdUrl: e.target.value })}
                      placeholder="Paste link here..." />
                  </div>
                  <div className="pt-6">
                    <button type="submit" disabled={isSaving} className="btn-metro btn-metro-accent w-full h-14 text-sm font-bold tracking-widest uppercase">
                      {isSaving ? 'Saving...' : (editId ? 'Save changes' : 'Add Job')}
                    </button>
                    <button type="button" onClick={closeModal} className="w-full h-10 mt-2 text-[10px] font-bold text-stone-400 tracking-widest hover:text-stone-900 transition-colors uppercase">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
