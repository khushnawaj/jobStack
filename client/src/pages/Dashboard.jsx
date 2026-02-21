import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    TrendingUp, BriefcaseBusiness, Target, Award, ChevronRight,
    Flame, Search, Sparkles, CalendarDays, ArrowUpRight, Clock,
    CheckCircle2, AlertCircle, Star, MapPin, Building2, Briefcase, Zap, CheckSquare
} from 'lucide-react'
import useJobStore from '../store/jobStore'
import useAuthStore from '../store/authStore'

const METRO_STATUS = {
    Saved: { color: '#64748b', label: 'Saved' },
    Applied: { color: '#2d89ef', label: 'Applied' },
    Interview: { color: '#9f00a7', label: 'Interview' },
    Offer: { color: '#00a300', label: 'Offer' },
    Rejected: { color: '#ee1111', label: 'Rejected' },
}

function MetroProgressBar({ label, value, max, color }) {
    const pct = max > 0 ? (value / max) * 100 : 0
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-stone-500 tracking-widest">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="h-4 bg-stone-100 flex-1">
                <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    )
}

const TIPS = [
    { icon: <Zap />, title: 'Better Outreach', desc: 'AI tools can help you write better LinkedIn messages.' },
    { icon: <Target />, title: 'Stay Organized', desc: 'Keep your job status updated to track your progress.' },
    { icon: <Sparkles />, title: 'Tailor Resumes', desc: 'Match your resume to the job description easily.' },
]

export default function Dashboard() {
    const { jobs, fetchJobs, isLoading } = useJobStore()
    const { user } = useAuthStore()
    const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length))

    useEffect(() => { fetchJobs() }, [])

    const statusCounts = Object.fromEntries(
        Object.keys(METRO_STATUS).map(k => [k, jobs.filter(j => j.status === k).length])
    )

    const total = jobs.length
    const active = (statusCounts.Applied || 0) + (statusCounts.Interview || 0)
    const interviews = statusCounts.Interview || 0
    const offers = statusCounts.Offer || 0

    const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    const tip = TIPS[tipIdx]
    const firstName = user?.name?.split(' ')[0] || 'User'

    return (
        <div className="space-y-12 animate-fade-in pb-20">

            {/* Hub Header */}
            <div className="relative bg-stone-900 p-8 md:p-16 text-white flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 flex-center bg-[#00aba9]">
                            <Flame className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.4em] text-[#00aba9] uppercase">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-light tracking-tighter leading-none mb-6 uppercase">Welcome back,<br />{firstName}</h2>
                    <p className="text-base md:text-lg font-bold text-stone-500 tracking-[0.2em] max-w-2xl leading-relaxed">
                        {total === 0
                            ? 'Start by searching for jobs and adding them to your list.'
                            : `You have ${active} active applications right now.`}
                    </p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <Link to="/search" className="btn-metro btn-metro-accent h-14 px-10 text-base tracking-widest font-bold flex-center gap-3">
                        <Search className="w-5 h-5" /> Find Jobs
                    </Link>
                    <Link to="/ai" className="btn-metro h-14 px-10 text-base tracking-widest font-bold flex-center gap-3 bg-stone-800">
                        <Sparkles className="w-5 h-5" /> AI Copilot
                    </Link>
                </div>
            </div>

            {/* Performance Hub */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Main Stats Tile Group */}
                <div className="xl:col-span-2 grid grid-cols-2 gap-2">
                    {[
                        { label: 'Applied', value: total, color: '#2d89ef', icon: Briefcase },
                        { label: 'Active', value: active, color: '#00aba9', icon: Zap },
                        { label: 'Interviews', value: interviews, color: '#9f00a7', icon: Target },
                        { label: 'Offers', value: offers, color: '#00a300', icon: Award },
                    ].map((s, i) => (
                        <div key={i} className="h-40 p-5 text-white relative flex flex-col justify-end group overflow-hidden" style={{ background: s.color }}>
                            <s.icon className="absolute top-4 right-4 w-8 h-8 opacity-20 group-hover:scale-125 transition-transform" />
                            <div className="text-[9px] font-bold tracking-[0.3em] opacity-80 mb-1 uppercase">{s.label}</div>
                            <div className="text-4xl font-light tracking-tighter leading-none">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Distribution Tile */}
                <div className="bg-stone-50 p-6 flex flex-col justify-between border-t border-stone-200">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-6">Status Summary</h3>
                    <div className="space-y-8 flex-1">
                        {Object.entries(METRO_STATUS).map(([key, cfg]) => (
                            <MetroProgressBar
                                key={key}
                                label={cfg.label}
                                value={statusCounts[key] || 0}
                                max={total || 1}
                                color={cfg.color}
                            />
                        ))}
                    </div>
                </div>

                {/* Growth Tile */}
                <div className="bg-[#ff0097] p-6 text-white relative flex flex-col justify-between overflow-hidden">
                    <Star className="absolute -top-10 -right-10 w-48 h-48 opacity-10" />
                    <div>
                        <div className="text-[9px] font-bold tracking-[0.4em] opacity-80 mb-6 text-white/50 uppercase">Daily Tip</div>
                        <div className="w-12 h-12 flex-center bg-white/20 mb-4">
                            {tip.icon}
                        </div>
                        <h4 className="text-2xl font-light tracking-tighter leading-none mb-3">{tip.title}</h4>
                        <p className="text-[11px] font-bold tracking-widest leading-relaxed opacity-80">{tip.desc}</p>
                    </div>
                    <Link to="/ai" className="mt-10 flex items-center gap-2 text-[10px] font-bold tracking-widest hover:gap-4 transition-all uppercase">
                        Go to AI Tools <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Data Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Feed */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.4em]">Recent Jobs</h3>
                        <Link to="/tracker" className="text-[10px] font-bold text-[#00aba9] tracking-widest hover:opacity-70 uppercase">
                            View all jobs →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-stone-100 skeleton" />
                            ))}
                        </div>
                    ) : recentJobs.length === 0 ? (
                        <div className="p-20 bg-stone-50 flex-center flex-col text-center border-t border-stone-200">
                            <Briefcase className="w-12 h-12 text-stone-200 mb-6" />
                            <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">No jobs added yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1">
                            {recentJobs.map((job) => (
                                <div key={job.id} className="bg-stone-50 hover:bg-stone-100 p-3 flex items-center gap-4 group transition-colors">
                                    <div className="w-10 h-10 flex-center bg-stone-900 text-white font-bold text-lg uppercase flex-shrink-0">
                                        {job.company?.[0] || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base font-bold tracking-tighter leading-none mb-1 truncate">{job.role}</div>
                                        <div className="text-[9px] font-bold text-stone-400 tracking-widest flex items-center gap-2 uppercase">
                                            <Building2 className="w-2.5 h-2.5" /> {job.company}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-[9px] font-bold px-3 py-1 text-white tracking-widest uppercase"
                                            style={{ background: METRO_STATUS[job.status]?.color || '#444' }}>
                                            {METRO_STATUS[job.status]?.label}
                                        </div>
                                        <div className="text-[9px] font-bold text-stone-300 tracking-widest hidden sm:block">
                                            {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Shortlinks Hub */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.4em] mb-6">Quick Links</h3>
                    {[
                        { to: '/search', color: '#2d89ef', icon: Search, title: 'Job Search' },
                        { to: '/ai', color: '#ff0097', icon: Sparkles, title: 'AI Tools' },
                        { to: '/checklist', color: '#00a300', icon: CheckSquare, title: 'Checklist' },
                    ].map((link, i) => (
                        <Link key={i} to={link.to}
                            className="flex items-center gap-3 p-4 transition-transform hover:scale-[1.02] text-white overflow-hidden group"
                            style={{ background: link.color }}>
                            <div className="w-10 h-10 flex-center bg-white/20 group-hover:bg-white/40 transition-colors flex-shrink-0">
                                <link.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-light tracking-tighter">{link.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
