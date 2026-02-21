import { useState, useRef, useMemo, useEffect } from 'react'
import {
  Search, MapPin, ExternalLink, Plus, Clock, Building2,
  Check, List, Grid3x3, Globe, DollarSign,
  ArrowUpRight, BookmarkCheck, Bookmark, RefreshCw, Zap
} from 'lucide-react'
import useJobStore from '../store/jobStore'
import api from '../api/axios'
import { toast } from 'sonner'

/* ─── Constants ───────────────────────────────────────────── */
const JOB_TYPES = [
  { value: '', label: 'Any type' },
  { value: 'FULLTIME', label: 'Full-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'PARTTIME', label: 'Part-time' },
  { value: 'INTERN', label: 'Internship' },
]
const DATE_OPTIONS = [
  { value: 'month', label: 'Past month' },
  { value: 'week', label: 'Past week' },
  { value: '3days', label: 'Past 3 days' },
  { value: 'today', label: 'Past 24 hours' },
]
const EXP_LEVELS = [
  { value: '', label: 'Any level' },
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior level' },
  { value: 'lead', label: 'Lead / Manager' },
]
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Most recent' },
  { value: 'salary', label: 'Highest salary' },
]
const POPULAR_ROLES = [
  'React Developer', 'Node.js Engineer', 'Full Stack Developer',
  'Python Developer', 'Data Scientist', 'Product Manager',
]
const POPULAR_LOCATIONS = ['Remote', 'United States', 'India', 'United Kingdom', 'Germany']

const METRO_TYPES = {
  FULLTIME: { bg: '#00a300', label: 'Full-time' },
  CONTRACT: { bg: '#ffc40d', label: 'Contract' },
  PARTTIME: { bg: '#2d89ef', label: 'Part-time' },
  INTERN: { bg: '#9f00a7', label: 'Internship' },
}

/* ─── Helpers ─────────────────────────────────────────────── */
const jobKey = (job, idx) => `${job.id ?? ''}-${idx}`

/** Robust salary extraction: extracts the first numeric value found. */
const extractSalary = (val) => {
  if (!val || typeof val !== 'string' || val.toLowerCase().includes('disclosed')) return 0
  const match = val.replace(/,/g, '').match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

/** Robust date parsing: fallbacks to 0 for invalid/human-readable strings to maintain sort order. */
const parseDate = (d) => {
  if (!d) return 0
  const timestamp = Date.parse(d)
  return isNaN(timestamp) ? 0 : timestamp
}

/** Unified key for preventing duplicates with extremely aggressive normalization. 
 * We ignore specific IDs as they differ between platforms for the same job. */
const getJobUniqueKey = (job) => {
  if (!job) return ''

  const clean = (s) => (s || '').toLowerCase()
    .replace(/limited|pvt|ltd|inc|corp|corporation|private/g, '') // remove company suffixes
    .replace(/\|.*$/g, '') // strip pipe separators
    .replace(/\(.*?\)/g, '') // strip parentheses
    .replace(/[^a-z0-9]/g, '') // strip all non-alphanumeric
    .trim()

  const t = clean(job.title)
  const c = clean(job.company)
  // We exclude location from the primary key to catch duplicates posted in different zones 
  // (e.g. "Mumbai" vs "Mumbai, Maharashtra") unless the user specifically wants different locations.
  return `${t}|${c}`
}

/** UI Helper: Capitalize job titles for consistency. */
const formatTitle = (str) => {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

/* ─── Sub-components ────────────────────────────────────────── */

function CompanyAvatar({ company, size = 48 }) {
  const letter = (company || '?')[0].toUpperCase()
  return (
    <div className="flex-shrink-0 rounded-lg border border-stone-100 shadow-sm" style={{
      width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fff', color: '#333', fontWeight: 700, fontSize: size * 0.45,
    }}>
      {letter}
    </div>
  )
}

function JobCard({ job, isSaved, onSave, view }) {
  const isGrid = view === 'grid'

  return (
    <div className={`group bg-white rounded-xl border border-stone-100 hover:border-stone-900 transition-all flex flex-col gap-4 p-6 shadow-sm hover:shadow-lg relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-4">
        <CompanyAvatar company={job.company} size={54} />
        <button
          onClick={(e) => { e.preventDefault(); !isSaved && onSave(job); }}
          className={`p-2 rounded-full transition-all ${isSaved ? 'text-[#ee1111] bg-red-50' : 'text-stone-300 hover:text-[#ee1111] hover:bg-stone-50'}`}>
          {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="text-lg font-bold text-stone-900 leading-tight group-hover:underline cursor-pointer decoration-2 underline-offset-4 transition-all">
          {formatTitle(job.title)}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-stone-900 font-medium">{job.company}</span>
          <span className="w-1 h-1 rounded-full bg-stone-300" />
          <span className="text-[12px] font-bold text-stone-500 uppercase tracking-widest">{job.type || 'Full-time'}</span>
        </div>
        <p className="text-[14px] text-stone-500">{job.location}</p>
      </div>

      <div className="flex items-center gap-2 pt-2 pb-1">
        <div className="w-5 h-5 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
          <Check className="w-3.5 h-3.5 text-stone-900" strokeWidth={3} />
        </div>
        <span className="text-[12px] font-bold tracking-tight text-stone-600 uppercase">Actively reviewing</span>
      </div>

      <div className="pt-4 mt-auto border-t border-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-stone-400 uppercase tracking-widest">{job.posted}</span>
          <span className="w-1 h-1 rounded-full bg-stone-200" />
          <div className="flex items-center gap-1.5 text-stone-700 font-bold text-[11px] uppercase tracking-widest">
            {job.platform || 'Platform'}
          </div>
        </div>

        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="text-[12px] font-bold text-[#ee1111] hover:bg-red-50 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-100 uppercase tracking-widest">
          View Detail
        </a>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function JobSearch() {
  const { addJob } = useJobStore()
  // State Initialization from LocalStorage
  const [query, setQuery] = useState(() => localStorage.getItem('last_job_query') || '')
  const [location, setLocation] = useState(() => localStorage.getItem('last_job_location') || '')
  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem('job_scan_results')
      if (!saved) return []
      const parsed = JSON.parse(saved)
      // De-duplicate on hydration to clean up old data
      const seen = new Set()
      return parsed.filter(job => {
        const key = getJobUniqueKey(job)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
    } catch { return [] }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(() => !!localStorage.getItem('job_scan_results'))
  const [view, setView] = useState('list')
  const [sortBy, setSortBy] = useState('relevance')
  const [savedKeys, setSavedKeys] = useState(new Set())
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('job_filters')
      return saved ? JSON.parse(saved) : { type: '', date: 'month', remote: false, experience: '' }
    } catch { return { type: '', date: 'month', remote: false, experience: '' } }
  })

  // Persistence Sync
  useEffect(() => {
    localStorage.setItem('job_scan_results', JSON.stringify(results))
    localStorage.setItem('last_job_query', query)
    localStorage.setItem('last_job_location', location)
    localStorage.setItem('job_filters', JSON.stringify(filters))
  }, [results, query, location, filters])

  const doSearch = async (q, l, f) => {
    if (!q && !l) { toast.error('Check entry points: Input required'); return }
    setIsLoading(true)
    setHasSearched(true)
    setPage(1)
    // Note: results are NOT cleared here to prevent UI flicker while fetching new scan data
    try {
      const p = new URLSearchParams({
        q: q || '',
        l: l || '',
        type: f.type,
        date: f.date,
        remote: f.remote,
        experience: f.experience // Fixed: included missing experience filter
      })
      const res = await api.get(`/jobs/search?${p}`)

      // Strict de-duplication based on case-insensitive fingerprint
      const seen = new Set()
      const unique = res.data.filter(job => {
        const key = getJobUniqueKey(job)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })

      setResults(unique)
      if (unique.length > 0) toast.success(`Found ${unique.length} matching leads`)
      else if (res.data.length > 0) toast.info('Duplicates hidden')
      else toast.info('Database exhausted - try adjusting keywords')
    } catch (error) {
      toast.error('CONNECTION ERROR')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setHasSearched(false)
    localStorage.removeItem('job_scan_results')
    toast.info('Workspace cleared')
  }

  const handleSearch = (e) => { if (e) e.preventDefault(); doSearch(query, location, filters) }
  const handleQuickRole = (role) => { setQuery(role); doSearch(role, location, filters) }

  // Auto-search when filters change to improve UX
  useEffect(() => {
    if (hasSearched) {
      const delaySearch = setTimeout(() => {
        doSearch(query, location, filters)
      }, 400) // Small debounce
      return () => clearTimeout(delaySearch)
    }
  }, [filters.type, filters.date, filters.remote, filters.experience])

  const handleExternalSearch = (platform) => {
    const q = encodeURIComponent(query); const l = encodeURIComponent(location)
    const urls = {
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`,
      indeed: `https://www.indeed.com/jobs?q=${q}&l=${l}`,
      wellfound: `https://wellfound.com/jobs?role_l=${q}`,
    }
    if (urls[platform]) window.open(urls[platform], '_blank')
  }

  const handleSaveJob = async (job) => {
    const saveKey = getJobUniqueKey(job)
    if (savedKeys.has(saveKey)) return

    try {
      await addJob({
        role: job.title,
        company: job.company,
        status: 'Saved',
        salary: job.salary !== 'Not disclosed' ? job.salary : '',
        notes: `Found on ${job.platform} · ${job.location}`,
        jdUrl: job.url
      })
      setSavedKeys(prev => new Set(prev).add(saveKey))
      toast.success('Job saved to your list')
    } catch {
      toast.error('Failed to save job')
    }
  }

  // Performance: Memoize sorted and strictly filtered results
  const sorted = useMemo(() => {
    let list = [...results]

    // Secondary frontend filter for Experience Level (Safety net for API imperfections)
    if (filters.experience) {
      list = list.filter(job => {
        const title = (job.title || '').toLowerCase()
        if (filters.experience === 'entry') {
          // If user wants Entry Level, hide anything that screams Senior/Lead/10+
          const isSenior = title.includes('senior') || title.includes('lead') || title.includes('staff') || title.includes('principal')
          const hasHighExp = /\b(5\+|8\+|10\+|12\+|15\+)\s*(years|yrs)\b/i.test(title)
          return !isSenior && !hasHighExp
        }
        if (filters.experience === 'senior') {
          // If user wants Senior, hide obviously junior/intern roles
          return !title.includes('intern') && !title.includes('junior') && !title.includes('entry') && !title.includes('graduate')
        }
        return true
      })
    }

    return list.sort((a, b) => {
      if (sortBy === 'date') return parseDate(b.postedDate) - parseDate(a.postedDate)
      if (sortBy === 'salary') return extractSalary(b.salary) - extractSalary(a.salary)
      return 0
    })
  }, [results, sortBy, filters.experience])

  const paginated = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page])
  const hasMore = paginated.length < sorted.length

  return (
    <div className="space-y-12 animate-fade-in pb-20">

      {/* ── Search Hub ── */}
      <div className="bg-stone-900 p-6 md:p-16 lg:p-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ee1111] opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)' }} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 flex-center bg-[#ee1111]">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] text-[#ee1111] uppercase whitespace-nowrap">Find your next job</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tighter leading-tight mb-8 md:mb-12 uppercase max-w-4xl">Search <br className="hidden md:block" /> Opportunities</h1>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-white/5 p-1 border border-white/10">
              <div className="relative lg:col-span-5 flex items-center">
                <Search className="lucide-abs left-4 w-5 h-5 text-stone-500" />
                <input className="metro-input !border-none h-14 !pl-12 text-base"
                  placeholder="Job title / Skills" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <div className="relative lg:col-span-4 flex items-center border-t lg:border-t-0 lg:border-l border-white/10">
                <MapPin className="lucide-abs left-4 w-5 h-5 text-stone-500" />
                <input className="metro-input !border-none h-14 !pl-12 text-base"
                  placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <button type="submit" className="lg:col-span-3 btn-metro btn-metro-accent h-14 text-sm font-bold tracking-widest flex-center gap-2 uppercase">
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Scan Jobs
              </button>
            </div>

            {/* Quick Filters */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest min-w-[60px]">Refine:</span>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {[
                    { label: 'Work Type', options: JOB_TYPES, key: 'type' },
                    { label: 'Timeframe', options: DATE_OPTIONS, key: 'date' },
                    { label: 'Experience', options: EXP_LEVELS, key: 'experience' },
                  ].map(f => (
                    <select key={f.key}
                      className="metro-input !bg-stone-800 !border-white/10 !text-white h-11 px-4 text-[11px] font-bold cursor-pointer min-w-0 flex-1 md:flex-none md:min-w-[150px]"
                      value={filters[f.key]} onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}>
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ))}
                  <button type="button"
                    onClick={() => setFilters(f => ({ ...f, remote: !f.remote }))}
                    className={`h-11 px-6 border text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 flex-1 md:flex-none justify-center md:justify-start ${filters.remote ? 'bg-[#ee1111] border-[#ee1111] text-white' : 'border-white/10 text-stone-400 hover:border-white/30'}`}>
                    <Globe className="w-3.5 h-3.5" /> Remote
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-6">
              <span className="text-[9px] font-bold text-stone-500 uppercase mr-2 flex items-center">Popular:</span>
              {POPULAR_ROLES.map(role => (
                <button key={role} type="button" onClick={() => handleQuickRole(role)}
                  className="bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] font-bold tracking-widest hover:bg-[#ee1111] hover:border-[#ee1111] transition-colors uppercase">
                  {role}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* ── Platforms ── */}
      <div className="bg-stone-50 p-6 border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400">Search on other sites</span>
            <p className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">Cross-reference with external platforms</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            {['LinkedIn', 'Indeed', 'Wellfound'].map(p => (
              <button key={p} onClick={() => handleExternalSearch(p.toLowerCase())}
                className="btn-metro h-11 px-6 active:scale-95 !bg-white !border-stone-200 !text-stone-600 text-[10px] font-bold hover:!border-black uppercase flex-1 md:flex-none">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results Feed ── */}
      <div className="space-y-8">
        {hasSearched ? (
          <div className="animate-slide-up px-6 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-4 border-b-2 border-stone-800">
              <div className="flex items-center gap-4 md:gap-6">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap">Search Results</h3>
                <span className="bg-stone-100 px-3 py-1 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">{results.length} jobs</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button onClick={clearResults} className="h-9 px-4 text-[9px] font-bold tracking-widest text-stone-400 hover:text-[#ee1111] uppercase border border-stone-200 hover:border-[#ee1111] transition-all whitespace-nowrap">Clear Feed</button>
                <select className="bg-transparent text-[#ee1111] text-[10px] md:text-[11px] font-bold tracking-widest outline-none cursor-pointer uppercase pr-8"
                  value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className="flex border-2 border-stone-900 flex-shrink-0">
                  <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'}`}><List className="w-4 h-4 md:w-5 md:h-5" /></button>
                  <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'}`}><Grid3x3 className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>
              </div>
            </div>

            {/* Loading Progress Bar (Metro Style) */}
            {isLoading && (
              <div className="h-1 w-full bg-stone-100 overflow-hidden mb-8">
                <div className="h-full bg-[#ee1111] animate-metro-progress" />
              </div>
            )}

            {isLoading && results.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-stone-100 skeleton animate-pulse" />)}
              </div>
            ) : results.length === 0 ? (
              <div className="p-32 bg-stone-50 flex-center flex-col text-center">
                <Search className="w-20 h-20 text-stone-200 mb-8" />
                <h4 className="text-xl font-bold tracking-[0.2em] text-stone-400">NO DATA POINTS FOUND</h4>
              </div>
            ) : (
              <div className="relative">
                {isLoading && (
                  <div className="absolute inset-x-0 top-[-20px] flex justify-center z-20">
                    <div className="bg-white px-4 py-2 border-2 border-stone-800 flex items-center gap-3 shadow-xl animate-bounce">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#ee1111]" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-stone-900">Scanning Database...</span>
                    </div>
                  </div>
                )}
                <div className={`${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2' : 'flex flex-col gap-2'} ${isLoading ? 'opacity-50 pointer-events-none grayscale transition-all' : ''}`}>
                  {paginated.map((job, idx) => (
                    <JobCard
                      key={jobKey(job, idx)}
                      job={job}
                      isSaved={savedKeys.has(getJobUniqueKey(job))}
                      onSave={handleSaveJob}
                      view={view}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasMore && (
              <div className="mt-12 text-center">
                <button onClick={() => setPage(p => p + 1)} className="btn-metro h-14 px-12 text-xs font-bold tracking-widest uppercase">
                  Show more jobs
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-stone-50 p-12 text-center border-t border-stone-200">
            <Search className="w-12 h-12 text-stone-100 mx-auto mb-8" />
            <h3 className="text-3xl font-light tracking-tighter uppercase mb-4">Search for jobs</h3>
            <p className="max-w-md mx-auto text-[10px] font-bold text-stone-400 tracking-widest leading-relaxed mb-8 uppercase">
              Enter what you're looking for and hit search to get started.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {POPULAR_ROLES.map(r => (
                <button key={r} onClick={() => handleQuickRole(r)}
                  className="px-4 py-3 bg-white border-2 border-stone-100 text-[10px] font-bold tracking-widest hover:border-black transition-all">
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
