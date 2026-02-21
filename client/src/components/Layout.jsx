import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, CheckSquare, Menu, X,
  Bell, LogOut, Sparkles, BriefcaseBusiness, ChevronRight,
  BarChart3, Settings, User, Zap, Target
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useUIStore from '../store/uiStore'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard', badge: null },
  { id: 'search', label: 'Job Search', icon: Search, path: '/search', badge: null },
  { id: 'tracker', label: 'My Jobs', icon: BriefcaseBusiness, path: '/tracker', badge: null },
  { id: 'ai', label: 'AI Tools', icon: Sparkles, path: '/ai', badge: 'AI' },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare, path: '/checklist', badge: null },
]

const AVATAR_COLORS = ['#840032', '#1e40af', '#065f46', '#7c3aed', '#b45309']

export default function Layout() {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setMobileMenu,
    windowWidth,
    setWindowWidth
  } = useUIStore()

  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      if (width >= 1024) {
        setMobileMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    return () => window.removeEventListener('resize', handleResize)
  }, [setWindowWidth, setMobileMenu])

  useEffect(() => {
    // Scroll content to top on navigation
    const main = document.querySelector('main')
    if (main) main.scrollTop = 0
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const activeTab = TABS.find(t => location.pathname.startsWith(t.path)) || TABS[0]
  const initials = user?.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))

  const NavItem = ({ tab, isMobile = false }) => {
    const Icon = tab.icon
    const active = isActive(tab.path)
    return (
      <Link
        key={tab.id}
        to={tab.path}
        onClick={() => isMobile && setMobileMenu(false)}
        className={`sidebar-item ${active ? 'active' : ''}`}
      >
        <div className="flex-center w-5 h-5 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        {(!isSidebarCollapsed || isMobile) && (
          <>
            <span className="font-bold tracking-widest text-[11px] animate-fade-in">{tab.label}</span>
            {tab.badge && (
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 animate-fade-in"
                style={{ background: tab.badge === 'AI' ? '#840032' : '#444' }}>
                {tab.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <div className="h-screen flex font-sans text-stone-900 bg-white overflow-hidden">

      {/* Dark Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen z-30 sidebar-nav flex-shrink-0 ${isSidebarCollapsed ? 'collapsed' : ''}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-4 px-6 border-b border-stone-800 flex-shrink-0 mb-6">
          <div className="w-10 h-10 flex-center bg-[#00aba9] flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="animate-fade-in whitespace-nowrap overflow-hidden">
              <span className="font-light text-white text-2xl tracking-tighter leading-none block">JobStack</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {!isSidebarCollapsed && (
            <div className="sidebar-section-label">
              Overview
            </div>
          )}
          {TABS.map(tab => <NavItem key={tab.id} tab={tab} />)}

          {!isSidebarCollapsed && (
            <div className="sidebar-section-label">
              Personal
            </div>
          )}
          <Link to="/settings" className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`} title={isSidebarCollapsed ? 'Settings' : ''}>
            <div className="flex-center w-5 h-5 flex-shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold tracking-widest text-[10px] animate-fade-in uppercase">Settings</span>
            )}
          </Link>
        </nav>

        {/* Tips Banner */}
        {!isSidebarCollapsed && (
          <div className="mx-6 mb-8 p-6 bg-stone-800 border-l-4 border-[#00aba9] animate-fade-in">
            <p className="text-[10px] font-bold leading-relaxed text-stone-400 uppercase tracking-widest">
              Tip: Use the Checklist for every job you apply to.
            </p>
          </div>
        )}

        {/* User Footer */}
        <div className={`mt-auto border-t border-stone-800 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center gap-4 transition-all bg-stone-800 cursor-pointer hover:bg-stone-700 ${isSidebarCollapsed ? 'p-2 justify-center' : 'p-4 mb-4'}`}>
            <div className="w-8 h-8 flex-center bg-stone-600 text-white font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 animate-fade-in">
                <div className="text-xs font-bold text-white truncate leading-none mb-1">{user?.name || 'User'}</div>
                <div className="text-[9px] text-stone-500 truncate tracking-tighter">{user?.email}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout}
            className={`flex items-center gap-3 w-full text-red-500 hover:bg-stone-800 font-bold text-[10px] uppercase transition-all ${isSidebarCollapsed ? 'p-4 justify-center' : 'px-4 py-3'}`}>
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && <span className="animate-fade-in tracking-widest">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-stone-200 sticky top-0 z-20 px-8 flex items-center justify-between">

          {/* Mobile Logo & Desktop Toggle */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-900 bg-stone-100">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={toggleSidebar}
              className="hidden lg:flex p-2 text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl lg:text-2xl font-light text-stone-900 tracking-tighter uppercase">{activeTab.label}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <Link to="/settings" className="flex items-center gap-3 pl-3 border-l border-stone-200">
              <div className="w-7 h-7 flex-center bg-stone-900 text-white font-bold text-[10px] uppercase">
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-bold text-stone-900 tracking-tighter truncate max-w-[100px]">{user?.name}</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden overflow-y-auto animate-fade-in custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && windowWidth < 1024 && (
        <div className="fixed inset-0 z-50 animate-fade-in" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setMobileMenu(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-64 p-0 flex flex-col animate-slide-right sidebar-nav bg-black"
            style={{ width: '260px' }}
            onClick={e => e.stopPropagation()}>
            {/* Mobile Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex-center bg-[#00aba9]">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="font-light text-white text-2xl tracking-tighter leading-none block">JobStack</span>
              </div>
              <button onClick={() => setMobileMenu(false)} className="text-stone-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto mt-6 scrollbar-hide">
              <div className="sidebar-section-label">Menu</div>
              {TABS.map(tab => <NavItem key={tab.id} tab={tab} isMobile />)}

              <div className="sidebar-section-label">Account</div>
              <Link to="/settings" onClick={() => setMobileMenu(false)}
                className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}>
                <div className="flex-center w-5 h-5 flex-shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-widest text-[11px] uppercase">Settings</span>
              </Link>
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-stone-800">
              <div className="flex items-center gap-4 p-4 bg-stone-800 mb-4">
                <div className="w-8 h-8 flex-center bg-stone-600 text-white font-bold text-xs">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                  <div className="text-[9px] text-stone-500 truncate">{user?.email}</div>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full text-red-500 px-4 py-3 font-bold text-[10px] uppercase hover:bg-stone-800 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="tracking-widest">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
