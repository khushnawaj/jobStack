import { useState } from 'react'
import { Search, MapPin, ExternalLink, Plus, Briefcase, Clock, Building2, Check } from 'lucide-react'
import useJobStore from '../store/jobStore'
import api from '../api/axios'
import { toast } from 'sonner'

export default function JobSearch() {
  const { addJob } = useJobStore()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    date: 'month',
    remote: false
  })

  // Track saved jobs locally for UI feedback
  const [savedIds, setSavedIds] = useState(new Set())

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query && !location) return

    setIsLoading(true)
    setHasSearched(true)
    try {
      const queryParams = new URLSearchParams({
        q: query,
        l: location,
        type: filters.type,
        date: filters.date,
        remote: filters.remote
      })

      const res = await api.get(`/jobs/search?${queryParams.toString()}`)
      setResults(res.data)
      if (res.data.length > 0) {
        toast.success(`Found ${res.data.length} jobs!`)
      } else {
        toast.info("No jobs found for this search.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch jobs. Check your API key.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExternalSearch = (platform) => {
    const q = encodeURIComponent(query)
    const l = encodeURIComponent(location)

    let url = ''
    if (platform === 'linkedin') url = `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`
    if (platform === 'indeed') url = `https://in.indeed.com/jobs?q=${q}&l=${l}`
    if (platform === 'wellfound') url = `https://wellfound.com/jobs?role_l=${q}&l=${l}`
    if (platform === 'glassdoor') url = `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${q}&locT=C&locId=0&locKeyword=${l}`

    if (url) window.open(url, '_blank')
  }

  const handleSaveJob = async (job) => {
    try {
      await addJob({
        role: job.title,
        company: job.company,
        status: 'Saved',
        salary: job.salary,
        notes: `Found on ${job.platform}`,
      })
      setSavedIds(prev => new Set(prev).add(job.title + job.company))
      toast.success(`${job.title} at ${job.company} saved to pipeline!`)
    } catch (err) {
      toast.error("Failed to save job.")
    }
  }

  return (
    <div className="space-y-8">

      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#fdf2f4] rounded-lg">
            <Search className="w-5 h-5 text-[#840032]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Discover Jobs</h2>
            <p className="text-slate-500 text-sm">Search across our partner network and save to your pipeline.</p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                className="w-full h-12 pl-4 pr-12 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#840032]/10 outline-none"
                placeholder="Job Title (e.g. React Developer)"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 relative">
              <input
                className="w-full h-12 pl-4 pr-12 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#840032]/10 outline-none"
                placeholder="Location (e.g. Remote)"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <MapPin className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <select
              className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#840032]"
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Any Job Type</option>
              <option value="FULLTIME">Full-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="PARTTIME">Part-time</option>
              <option value="INTERN">Internship</option>
            </select>

            <select
              className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#840032]"
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
            >
              <option value="month">Past Month</option>
              <option value="week">Past Week</option>
              <option value="3days">Past 3 Days</option>
              <option value="today">Past 24 Hours</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={e => setFilters({ ...filters, remote: e.target.checked })}
                className="w-4 h-4 text-[#840032] rounded border-slate-300 focus:ring-[#840032]"
              />
              Remote Only
            </label>

            <button type="submit" className="ml-auto btn-primary h-10 px-6">Search Jobs</button>
          </div>
        </form>

        {/* External Links */}
        <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500">
          <span>Or open directly in:</span>
          <button onClick={() => handleExternalSearch('linkedin')} className="hover:text-[#840032] font-medium">LinkedIn</button>
          &bull;
          <button onClick={() => handleExternalSearch('indeed')} className="hover:text-[#840032] font-medium">Indeed</button>
          &bull;
          <button onClick={() => handleExternalSearch('wellfound')} className="hover:text-[#840032] font-medium">Wellfound</button>
        </div>
      </div>

      {/* Results Area */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#840032] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No results found. Try a different query or location.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((job, idx) => {
            const isSaved = savedIds.has(job.title + job.company)
            return (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-1">
                    {job.logo && <img src={job.logo} alt={job.company} className="w-10 h-10 rounded object-contain bg-white border border-slate-100" />}
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.posted}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">{job.type}</span>
                    <span className="px-2 py-1 bg-[#fdf2f4] rounded text-xs font-semibold text-[#840032]">{job.salary}</span>
                    <span className="px-2 py-1 bg-blue-50 rounded text-xs font-semibold text-blue-700">{job.platform}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Apply
                  </a>
                  <button
                    onClick={() => {
                      if (!isSaved) handleSaveJob(job)
                    }}
                    disabled={isSaved}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isSaved
                      ? 'bg-[#fdf2f4] text-[#840032] cursor-default'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                  >
                    {isSaved ? <><Check className="w-4 h-4" /> Saved</> : <><Plus className="w-4 h-4" /> Save</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
