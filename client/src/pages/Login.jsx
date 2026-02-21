import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Target, ArrowRight, Zap, Target as TargetIcon, Search, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';

const FEATURES = [
    { icon: <Search className="w-6 h-6" />, label: 'SEARCH', text: '50+ Global sources', color: '#2d89ef' },
    { icon: <Zap className="w-6 h-6" />, label: 'TRACK', text: 'AI Tools', color: '#ffc40d' },
    { icon: <ShieldCheck className="w-6 h-6" />, label: 'SUCCEED', text: 'Step by step guide', color: '#00a300' },
]

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'INVALID CREDENTIALS');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#111]">

            {/* ── Left Panoramic Panel ── */}
            <div className="lg:flex-1 bg-stone-900 border-r-8 border-[#ee1111] p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 100px, #fff 100px, #fff 101px)' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-20">
                        <div className="w-12 h-12 flex-center bg-[#ee1111] text-white">
                            <TargetIcon className="w-7 h-7" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-[0.4em] text-white">JOBSTACK</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-light text-white tracking-tighter leading-none mb-10">
                        FIND YOUR<br />
                        <span className="text-[#ee1111] font-bold italic uppercase">Job</span>
                    </h1>

                    <p className="text-base lg:text-lg font-bold text-stone-500 uppercase tracking-[0.2em] max-w-xl leading-relaxed mb-16">
                        Search thousands of jobs and track your applications in one place.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="p-6 text-white relative h-28 flex flex-col justify-end group overflow-hidden" style={{ background: f.color }}>
                                <div className="absolute top-3 right-3 opacity-20 group-hover:scale-125 transition-transform">{f.icon}</div>
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

            {/* ── Login Interface ── */}
            <div className="w-full lg:w-[600px] flex items-center justify-center p-8 lg:p-24 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-16">
                        <div className="text-[10px] font-bold text-[#ee1111] uppercase tracking-[0.4em] mb-4">Secure Sign In</div>
                        <h2 className="text-4xl md:text-5xl font-light tracking-tighter uppercase mb-2">Welcome<br />Back</h2>
                    </div>

                    {error && (
                        <div className="bg-[#ee1111] text-white p-6 font-bold text-xs uppercase tracking-widest mb-8 animate-slide-up">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className="absolute right-6 top-0 bottom-0 flex items-center text-stone-400 hover:text-black transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="btn-metro btn-metro-accent h-14 w-full text-[10px] font-bold tracking-widest mt-6 flex-center gap-4 uppercase">
                            {isLoading
                                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Logging in...</>
                                : <>Log In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-[10px] font-bold text-stone-400 tracking-[0.3em] uppercase">
                        New here?{' '}
                        <Link to="/register" className="text-[#ee1111] hover:underline">
                            Create an account →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
