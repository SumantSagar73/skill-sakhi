import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/skillSakhiAPI';
import { toast } from 'react-toastify';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineUserPlus } from 'react-icons/hi2';

const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        setLoading(true);
        try {
            const { data } = await register(form);
            login(data);
            toast.success('Welcome to Skill Sakhi!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-50 -translate-y-16 translate-x-16"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 mb-6">
                            <HiOutlineUserPlus className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Join Skill Sakhi</h2>
                        <p className="mt-2 text-sm text-slate-500 font-medium">Your space to teach, learn &amp; grow together 🌸</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-600" />
                                    <input
                                        type="text"
                                        name="name"
                                        className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm"
                                        placeholder="Your full name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-600" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-600" />
                                    <input
                                        type="password"
                                        name="password"
                                        className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm"
                                        placeholder="Min 6 characters"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-lg rounded-2xl shadow-indigo-200 mt-8"
                        >
                            {loading ? 'Creating Account...' : 'Get Started'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 font-extrabold hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
