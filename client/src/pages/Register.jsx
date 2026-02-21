import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Target, ArrowRight, Check, Zap, MapPin, Briefcase, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';

const MISSION_BRIEF = [
    { label: 'TRACKING', text: 'Unlimited Jobs', color: '#2d89ef' },
    { icon: <Zap />, label: 'AI TOOLS', text: 'AI-driven help', color: '#9f00a7' },
    { label: 'SEARCH', text: '50+ Global sources', color: '#00a300' },
]

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('Password too short'); return; }
        setIsLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Sign up failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#111]">

            {/* ── Left Panoramic Panel ── */}
            <div className="lg:flex-1 bg-stone-900 border-r-8 border-[#00a300] p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, #fff 100px, #fff 101px)' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-20">
                        <div className="w-12 h-12 flex-center bg-[#00a300] text-white">
                            <Target className="w-7 h-7" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-[0.4em] text-white">JOBSTACK</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-light text-white tracking-tighter leading-none mb-10">
                        SIGN<br />
                        <span className="text-[#00a300] font-bold italic uppercase">Up</span>
                    </h1>

                    <p className="text-base lg:text-lg font-bold text-stone-500 uppercase tracking-[0.2em] max-w-xl leading-relaxed mb-16">
                        Create your account and start tracking your job search today.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
                        {MISSION_BRIEF.map((f, i) => (
                            <div key={i} className="p-6 text-white relative h-28 flex flex-col justify-end group overflow-hidden" style={{ background: f.color }}>
                                <div className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-60 mb-1">{f.label}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest leading-tight">{f.text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-12 flex items-center gap-6 text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em]">
                    <span>© 2026 JOBSTACK</span>
                    <span className="w-8 h-px bg-stone-800" />
                    <span>ALL RIGHTS RESERVED</span>
                </div>
            </div>

            {/* ── Registration Interface ── */}
            <div className="w-full lg:w-[600px] flex items-center justify-center p-8 lg:p-24 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-16">
                        <div className="text-[10px] font-bold text-[#00a300] uppercase tracking-[0.4em] mb-4">Secure Sign Up</div>
                        <h2 className="text-4xl md:text-5xl font-light tracking-tighter uppercase mb-2">Create<br />Account</h2>
                    </div>

                    {error && (
                        <div className="bg-[#ee1111] text-white p-6 font-bold text-xs uppercase tracking-widest mb-8">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-stone-500 tracking-widest uppercase">Full Name</label>
                            <input
                                type="text" required
                                className="metro-input h-12 px-6 font-bold text-xs"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-stone-500 tracking-widest uppercase">Email Address</label>
                            <input
                                type="email" required
                                className="metro-input h-12 px-6 font-bold text-xs"
                                placeholder="name@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-bold text-stone-500 tracking-widest uppercase">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'} required
                                    className="metro-input h-12 px-6 pr-16 font-bold text-xs"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="btn-metro h-14 w-full text-[10px] font-bold tracking-widest mt-6 flex-center gap-4 bg-stone-900 border-stone-900 text-white hover:bg-black uppercase">
                            {isLoading
                                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...</>
                                : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold text-stone-400 tracking-[0.3em] uppercase">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#00a300] hover:underline">
                                Log In →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
