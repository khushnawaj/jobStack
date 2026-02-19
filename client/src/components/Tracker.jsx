import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Calendar, Filter, X, Save, Trash2, Edit2 } from 'lucide-react'
import useJobStore from '../store/jobStore'
import { toast } from 'sonner'

const PILLS = {
  'Saved': 'bg-slate-100 text-slate-600',
  'Applied': 'bg-blue-50 text-blue-700 border-blue-200',
  'Interview': 'bg-[#fdf2f4] text-[#840032] border-[#840032]/10',
  'Offer': 'bg-[#fdf2f4] text-[#840032] border-[#840032]/20',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_OPTIONS = Object.keys(PILLS)

const EMPTY_FORM = { role: '', company: '', status: 'Saved', notes: '', salary: '' }

export default function Tracker() {
  const { jobs, fetchJobs, addJob, updateJob, deleteJob, isLoading } = useJobStore()

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const total = jobs.length
  const active = jobs.filter(a => ['Applied', 'Interview'].includes(a.status)).length
  const interviews = jobs.filter(a => a.status === 'Interview').length
  const offers = jobs.filter(a => a.status === 'Offer').length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.role || !formData.company) return

    try {
      if (editId) {
        await updateJob(editId, formData)
        toast.success("Job updated successfully")
      } else {
        await addJob(formData)
        toast.success("New job added to pipeline")
      }
      closeModal()
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const openEdit = (app) => {
    setFormData(app)
    setEditId(app.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setFormData(EMPTY_FORM)
    setEditId(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Application Pipeline</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary cursor-pointer">
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Jobs" value={total} color="text-slate-900" />
        <StatsCard label="Active" value={active} color="text-blue-600" />
        <StatsCard label="Interviews" value={interviews} color="text-[#840032]" />
        <StatsCard label="Offers" value={offers} color="text-[#840032]" bg="bg-[#fdf2f4] border-[#840032]/10" />
      </div>

      {/* Main Table Card */}
      <div className="card overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#840032] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <p className="mb-4">No applications yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-secondary text-sm">Add your first job</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Role / Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{app.role}</div>
                      <div className="text-slate-500 text-xs">{app.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          await updateJob(app.id, { status: newStatus })
                          toast.success(`Status updated to ${newStatus}`)
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer appearance-none ${PILLS[app.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {app.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(app)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-[#840032]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={async () => {
                          if (window.confirm("Delete this application?")) {
                            await deleteJob(app.id)
                            toast.info("Job deleted")
                          }
                        }} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editId ? 'Edit Application' : 'Add New Job'}</h3>
              <button onClick={closeModal}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Title</label>
                <input className="input-clean" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                <input className="input-clean" required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select className="input-clean cursor-pointer" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salary (Optional)</label>
                  <input className="input-clean" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. ₹20L" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea className="input-clean min-h-[80px]" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Referral, JD link, etc." />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Save Changes' : 'Add Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatsCard({ label, value, color, bg = "bg-white" }) {
  return (
    <div className={`card p-4 ${bg}`}>
      <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
