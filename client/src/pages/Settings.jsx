import { useState } from 'react'
import { User, Mail, Shield, Bell, Zap, Save, Check, RefreshCw, Trash2, Settings as SettingsIcon } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { toast } from 'sonner'

export default function Settings() {
    const { user } = useAuthStore()
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        notifications: true,
        emailDigest: false,
        theme: 'dark'
    })

    const handleSave = () => {
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            toast.success('Settings updated')
        }, 800)
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* ── Settings Header ── */}
            <div className="bg-stone-900 p-8 md:p-16 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00aba9] opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 100px, currentColor 100px, currentColor 101px)' }} />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 flex-center bg-[#00aba9]">
                            <SettingsIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.4em] text-[#00aba9] uppercase">App settings</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-light tracking-tighter leading-none mb-6 uppercase">Settings</h2>
                    <p className="text-base md:text-lg font-bold text-stone-500 tracking-[0.2em] max-w-2xl leading-relaxed">
                        Change your profile info and notification settings.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* ── Configuration Categories ── */}
                <div className="xl:col-span-1 grid grid-cols-1 gap-2">
                    {[
                        { id: 'profile', label: 'Profile', icon: User, color: '#2d89ef' },
                        { id: 'security', label: 'Security', icon: Shield, color: '#9f00a7' },
                        { id: 'notifs', label: 'Alerts', icon: Bell, color: '#00a300' },
                        { id: 'plan', label: 'Plan', icon: Zap, color: '#ffc40d' },
                    ].map(item => (
                        <button key={item.id} className={`h-14 p-5 flex items-center justify-between transition-all group ${item.id === 'profile' ? 'bg-black text-white' : 'bg-stone-50 hover:bg-stone-100 text-stone-400'}`}>
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-4 h-4 ${item.id === 'profile' ? 'text-white' : 'text-stone-300'}`} />
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">{item.label}</span>
                            </div>
                            {item.id === 'profile' && <div className="w-1 h-5" style={{ background: item.color }} />}
                        </button>
                    ))}
                </div>

                {/* ── Parameter Fields ── */}
                <div className="xl:col-span-3 space-y-12">
                    <div className="bg-white p-8 md:p-12 border-t border-stone-200">
                        <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                            <span className="w-6 h-1 bg-stone-900" />
                            Personal info
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold text-stone-500 tracking-widest uppercase">Display name</label>
                                <input className="metro-input h-12 px-6 text-sm font-bold"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-bold text-stone-500 tracking-widest uppercase">Email address</label>
                                <input className="metro-input h-12 px-6 text-sm font-bold opacity-50 bg-stone-50 cursor-not-allowed"
                                    value={formData.email} disabled />
                            </div>
                        </div>

                        <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                            <span className="w-6 h-1 bg-stone-900" />
                            Notifications
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {[
                                { id: 'notifications', title: 'Status alerts', desc: 'Real-time pipeline notifications' },
                                { id: 'emailDigest', title: 'Weekly summary', desc: 'Consolidated Monday digest' }
                            ].map(pref => (
                                <div key={pref.id} onClick={() => setFormData(p => ({ ...p, [pref.id]: !p[pref.id] }))}
                                    className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${formData[pref.id] ? 'bg-stone-900 text-white' : 'bg-stone-50 hover:bg-stone-100'}`}>
                                    <div>
                                        <p className="text-xs font-bold tracking-widest mb-1">{pref.title}</p>
                                        <p className="text-[9px] font-bold opacity-50 tracking-widest uppercase">{pref.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 border-2 flex items-center justify-center ${formData[pref.id] ? 'border-white bg-white text-black font-black' : 'border-stone-200'}`}>
                                        {formData[pref.id] && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t border-stone-100 flex justify-end">
                            <button onClick={handleSave} disabled={isSaving}
                                className="btn-metro btn-metro-accent h-14 px-10 text-[10px] font-bold tracking-widest flex items-center gap-4 uppercase">
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Commit updates
                            </button>
                        </div>
                    </div>

                    {/* ── Danger Zone ── */}
                    <div className="bg-stone-50 p-10 border-l-8 border-[#ee1111] flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-lg font-bold tracking-tighter text-[#ee1111] mb-2 uppercase">Delete Account</h3>
                            <p className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">This will permanently delete all your job data.</p>
                        </div>
                        <button className="btn-metro !bg-white !text-[#ee1111] border-[#ee1111] hover:!bg-[#ee1111] hover:!text-white h-14 px-8 text-[10px] font-bold tracking-widest flex items-center gap-3 uppercase">
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
