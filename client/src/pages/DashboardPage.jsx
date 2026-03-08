import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineUser, HiOutlineAcademicCap, HiOutlineIdentification,
    HiOutlineBookOpen, HiOutlineClock, HiOutlinePlayCircle,
    HiOutlineArrowRight, HiOutlineUserGroup, HiOutlineCheckCircle,
    HiOutlineStar,
} from 'react-icons/hi2';
import { getMyBookings, getCoursesByInstructor } from '../services/skillSakhiAPI';
import Spinner from '../components/ui/Spinner';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [b, c] = await Promise.all([
                    getMyBookings(),
                    getCoursesByInstructor(user._id),
                ]);
                setBookings(b.data);
                setMyCourses(c.data);
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>;

    const enrolledCourses = bookings.filter(b => b.status === 'confirmed');

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32"
                        style={{ background: user.role === 'instructor' ? '#f43f5e' : '#6366f1' }} />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                                {user.profilePicture
                                    ? <img src={`http://localhost:5000${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                                    : <HiOutlineUser className="text-slate-300 w-10 h-10" />
                                }
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-md ${user.role === 'instructor' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                                {user.role === 'instructor' ? <HiOutlineAcademicCap className="w-4 h-4" /> : <HiOutlineIdentification className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                                <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'instructor' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm">{user.email}</p>
                            {user.bio && <p className="text-slate-600 text-sm mt-2 max-w-lg">{user.bio}</p>}
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Link to="/courses" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                                <HiOutlineBookOpen className="w-4 h-4" /> Browse Courses
                            </Link>
                            {user.role === 'instructor' && (
                                <Link to="/instructor/courses" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors">
                                    <HiOutlineAcademicCap className="w-4 h-4" /> Manage Courses
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: <HiOutlineBookOpen className="w-6 h-6" />, value: enrolledCourses.length, label: 'Courses Enrolled', color: 'bg-indigo-50 text-indigo-600' },
                        { icon: <HiOutlineCheckCircle className="w-6 h-6" />, value: 0, label: 'Completed', color: 'bg-emerald-50 text-emerald-600' },
                        ...(user.role === 'instructor' ? [
                            { icon: <HiOutlineAcademicCap className="w-6 h-6" />, value: myCourses.length, label: 'Courses Created', color: 'bg-rose-50 text-rose-600' },
                            { icon: <HiOutlineUserGroup className="w-6 h-6" />, value: myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0), label: 'Total Students', color: 'bg-amber-50 text-amber-600' },
                        ] : [
                            { icon: <HiOutlineStar className="w-6 h-6" />, value: '—', label: 'Avg Progress', color: 'bg-violet-50 text-violet-600' },
                            { icon: <HiOutlineClock className="w-6 h-6" />, value: '—', label: 'Hours Learned', color: 'bg-amber-50 text-amber-600' },
                        ]),
                    ].map(({ icon, value, label, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>{icon}</div>
                            <div>
                                <span className="block text-2xl font-black text-slate-900">{value}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instructor Quick Card */}
                {user.role === 'instructor' && myCourses.length > 0 && (
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-20 translate-x-16" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-extrabold mb-1">Instructor Hub</h2>
                                <p className="text-white/70 text-sm">You have {myCourses.length} course{myCourses.length !== 1 ? 's' : ''} with {myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0)} enrolled students.</p>
                            </div>
                            <Link to="/instructor/courses"
                                className="flex items-center gap-2 px-6 py-3 bg-white text-violet-700 rounded-2xl font-bold text-sm hover:shadow-lg transition-all shrink-0">
                                Manage Courses <HiOutlineArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Continue Learning */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-extrabold text-slate-900">Continue Learning</h2>
                        <Link to="/courses" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                            Browse all <HiOutlineArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                            <HiOutlineBookOpen className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No courses yet</h3>
                            <p className="text-slate-400 text-sm mb-6">Enroll in a course to start learning today.</p>
                            <Link to="/courses"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-colors">
                                <HiOutlineBookOpen className="w-4 h-4" /> Explore Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {enrolledCourses.map((b) => (
                                <div key={b._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                                        {b.course?.thumbnail
                                            ? <img
                                                src={b.course.thumbnail.startsWith('http') ? b.course.thumbnail : `http://localhost:5000${b.course.thumbnail}`}
                                                alt={b.course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            : <div className="w-full h-full flex items-center justify-center">
                                                <HiOutlineBookOpen className="w-12 h-12 text-slate-200" />
                                            </div>
                                        }
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {b.course?.category}
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-4 line-clamp-2">{b.course?.title}</h3>
                                        <div className="flex items-center gap-2 mt-auto">
                                            <button
                                                onClick={() => navigate(`/player/${b.course?._id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors"
                                            >
                                                <HiOutlinePlayCircle className="w-4 h-4" /> Continue
                                            </button>
                                            <Link to={`/courses/${b.course?._id}`}
                                                className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                                                <HiOutlineArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
