import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    Rocket,
    Search,
    LayoutDashboard,
    CheckSquare,
    Menu,
    X,
    Bell,
    Settings,
    LogOut
} from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, logout } = useAuthStore()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const TABS = [
        { id: 'search', label: 'Discovery', icon: Search, path: '/search' },
        { id: 'tracker', label: 'Pipeline', icon: LayoutDashboard, path: '/tracker' },
        { id: 'checklist', label: 'Protocol', icon: CheckSquare, path: '/checklist' },
    ]

    const activeTab = TABS.find(t => t.path === location.pathname) || { label: 'Dashboard' }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            {/* Modern Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="bg-[#fdf2f4] p-1.5 rounded-lg mr-3">
                        <Rocket className="w-5 h-5 text-[#840032] fill-[#840032]" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">JobStack</span>
                </div>

                <nav className="p-4 space-y-1 flex-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = location.pathname === tab.path
                        return (
                            <Link
                                key={tab.id}
                                to={tab.path}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-[#fdf2f4] text-[#840032]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-[#840032]' : 'text-slate-400'}`} />
                                {tab.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold truncate">{user?.name}</div>
                            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between">
                    <div className="md:hidden flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="text-slate-600" />
                        </button>
                        <span className="font-bold text-lg">JobStack</span>
                    </div>

                    <div className="hidden md:block">
                        <h1 className="text-lg font-semibold text-slate-800">
                            {activeTab.label}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#840032] rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Dynamic View */}
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-bold text-xl">JobStack</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-slate-500" /></button>
                        </div>
                        <nav className="space-y-1">
                            {TABS.map(tab => (
                                <Link
                                    key={tab.id}
                                    to={tab.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium ${location.pathname === tab.path ? 'bg-[#fdf2f4] text-[#840032]' : 'text-slate-600'}`}
                                >
                                    {tab.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

        </div>
    )
}
