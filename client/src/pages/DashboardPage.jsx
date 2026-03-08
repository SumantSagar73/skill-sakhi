import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getMyBookings, getInstructorBookings, getCoursesByInstructor,
    createCourse, updateBookingStatus,
} from '../services/skillSakhiAPI';
import Spinner from '../components/ui/Spinner';
import CourseCard from '../components/ui/CourseCard';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    HiOutlineSquares2X2,
    HiOutlineTicket,
    HiOutlineAcademicCap,
    HiOutlinePlus,
    HiOutlineStar,
    HiOutlineChartBar,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineUser,
    HiOutlineClock,
    HiOutlineChevronRight,
    HiOutlineBookOpen,
} from 'react-icons/hi2';

const CATEGORIES = ['Cooking', 'Technology', 'Art & Design', 'Business', 'Fitness', 'Language', 'Handicrafts', 'Digital Marketing', 'Other'];

const DashboardPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('overview');
    const [myEnrollments, setMyEnrollments] = useState([]);    // courses I enrolled in
    const [myTeaching, setMyTeaching] = useState([]);          // bookings from my students
    const [myCourses, setMyCourses] = useState([]);            // courses I created
    const [loading, setLoading] = useState(true);
    const [courseForm, setCourseForm] = useState({
        title: '', description: '', category: 'Cooking', price: '', duration: '', level: 'Beginner', availableSlots: 10,
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [enrollRes, teachRes, coursesRes] = await Promise.all([
                    getMyBookings(),
                    getInstructorBookings(),
                    getCoursesByInstructor(user._id),
                ]);
                setMyEnrollments(enrollRes.data);
                setMyTeaching(teachRes.data);
                setMyCourses(coursesRes.data);
            } catch {
                /* silent */
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleCourseCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createCourse(courseForm);
            toast.success('Course created! 🎉');
            setCourseForm({ title: '', description: '', category: 'Cooking', price: '', duration: '', level: 'Beginner', availableSlots: 10 });
            // Refresh my courses
            const { data } = await getCoursesByInstructor(user._id);
            setMyCourses(data);
            setTab('teaching');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create course');
        } finally {
            setCreating(false);
        }
    };

    const handleStatusChange = async (bookingId, status) => {
        try {
            await updateBookingStatus(bookingId, status);
            setMyTeaching(myTeaching.map((b) => b._id === bookingId ? { ...b, status } : b));
            toast.success(`Booking ${status}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>;

    const navItems = [
        { key: 'overview', icon: HiOutlineSquares2X2, label: 'Overview' },
        { key: 'learning', icon: HiOutlineBookOpen, label: 'My Learning' },
        { key: 'teaching', icon: HiOutlineAcademicCap, label: 'My Teaching' },
        { key: 'create', icon: HiOutlinePlus, label: 'Create Course' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Dashboard Header */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center text-4xl">
                                {user.profilePicture ? (
                                    <img src={`http://localhost:5000${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                                ) : <HiOutlineUser className="text-slate-300 w-12 h-12" />}
                            </div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user.name}! 👋</h1>
                            <p className="text-slate-500 font-medium mt-1">You can learn from and teach other women on Skill Sakhi.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-3 bg-indigo-50 rounded-2xl text-center border border-indigo-100">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Enrolled</span>
                                <span className="text-2xl font-black text-indigo-600">{myEnrollments.length}</span>
                            </div>
                            <div className="px-6 py-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Teaching</span>
                                <span className="text-2xl font-black text-slate-900">{myCourses.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2">
                        {navItems.map(({ key, icon: Icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${tab === key
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </button>
                        ))}

                        {/* Info card */}
                        <div className="mt-6 p-6 bg-slate-900 rounded-[2rem] text-white">
                            <h3 className="font-black text-sm mb-1">You're both a learner & teacher</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">Every woman on Skill Sakhi can share skills and learn from peers — no role switching needed.</p>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">

                        {/* Overview Tab */}
                        {tab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { icon: HiOutlineBookOpen, label: 'Enrolled Courses', value: myEnrollments.length, color: 'bg-indigo-50 text-indigo-600' },
                                        { icon: HiOutlineAcademicCap, label: 'Courses Created', value: myCourses.length, color: 'bg-rose-50 text-rose-600' },
                                        { icon: HiOutlineTicket, label: 'Students Teaching', value: myTeaching.length, color: 'bg-emerald-50 text-emerald-600' },
                                        { icon: HiOutlineStar, label: 'Avg Rating', value: user.rating || '—', color: 'bg-amber-50 text-amber-600' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                                <stat.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-3xl font-black text-slate-900 mb-1">{stat.value}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent activity */}
                                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                                        <HiOutlineCalendarDays className="text-indigo-600" /> Recent Enrollments
                                    </h3>
                                    {myEnrollments.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-slate-400 font-medium">No enrolments yet. Start learning!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {myEnrollments.slice(0, 5).map(b => (
                                                <div key={b._id} className="py-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-2 h-2 rounded-full ${b.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{b.course?.title}</p>
                                                            <p className="text-xs text-slate-400 font-medium">with {b.instructor?.name}</p>
                                                        </div>
                                                    </div>
                                                    <HiOutlineChevronRight className="text-slate-300" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* My Learning Tab */}
                        {tab === 'learning' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-extrabold text-slate-900">Courses I'm Learning</h2>
                                {myEnrollments.length === 0 ? (
                                    <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                                        <HiOutlineBookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No enrollments yet</h3>
                                        <p className="text-slate-500">Browse courses and start learning something new today.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {myEnrollments.map((b) => (
                                            <div key={b._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                                        <HiOutlineBookOpen className="w-7 h-7 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-extrabold text-slate-900">{b.course?.title}</h4>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                                <HiOutlineUser className="w-3.5 h-3.5" /> {b.instructor?.name}
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                                <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                                                {b.date ? format(new Date(b.date), 'dd MMM yyyy') : 'Anytime'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                                                    b.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Teaching Tab */}
                        {tab === 'teaching' && (
                            <div className="space-y-6">
                                {/* My Courses Grid */}
                                <h2 className="text-xl font-extrabold text-slate-900">Courses I Teach</h2>
                                {myCourses.length === 0 ? (
                                    <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200">
                                        <HiOutlineAcademicCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
                                        <button onClick={() => setTab('create')} className="mt-2 text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">
                                            Create your first course →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {myCourses.map((c) => <CourseCard key={c._id} course={c} />)}
                                    </div>
                                )}

                                {/* Student Bookings */}
                                {myTeaching.length > 0 && (
                                    <>
                                        <h2 className="text-xl font-extrabold text-slate-900 pt-4">Students in My Courses</h2>
                                        <div className="grid grid-cols-1 gap-4">
                                            {myTeaching.map((b) => (
                                                <div key={b._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                            <HiOutlineTicket className="w-7 h-7 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-extrabold text-slate-900">{b.course?.title}</h4>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                                    <HiOutlineUser className="w-3.5 h-3.5" /> {b.user?.name}
                                                                </p>
                                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                                    <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                                                    {b.date ? format(new Date(b.date), 'dd MMM yyyy') : 'Anytime'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 ml-auto">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                                                            b.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {b.status}
                                                        </span>
                                                        {b.status === 'pending' && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleStatusChange(b._id, 'confirmed')}
                                                                    className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                                                >
                                                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(b._id, 'cancelled')}
                                                                    className="p-2 bg-slate-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                                                                >
                                                                    <HiOutlineXCircle className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Create Course Tab */}
                        {tab === 'create' && (
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Create a New Course</h2>
                                <p className="text-slate-500 text-sm mb-10">Share your knowledge with other women on Skill Sakhi.</p>

                                <form onSubmit={handleCourseCreate} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Course Title</label>
                                            <input
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm"
                                                placeholder="e.g. Master the Art of Traditional Cooking"
                                                value={courseForm.title}
                                                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Detailed Description</label>
                                            <textarea
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm resize-none"
                                                placeholder="Share exactly what students will learn..."
                                                rows="5"
                                                value={courseForm.description}
                                                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                            <select
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm cursor-pointer"
                                                value={courseForm.category}
                                                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                                            >
                                                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Skill Level</label>
                                            <select
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm cursor-pointer"
                                                value={courseForm.level}
                                                onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Advanced</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                                                <input
                                                    type="number" min="0"
                                                    className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm"
                                                    placeholder="0 for free"
                                                    value={courseForm.price}
                                                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Duration</label>
                                            <div className="relative">
                                                <HiOutlineClock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <input
                                                    type="text" placeholder="e.g. 2 hours"
                                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm"
                                                    value={courseForm.duration}
                                                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Max Students</label>
                                            <div className="relative">
                                                <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <input
                                                    type="number" min="1"
                                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 text-sm"
                                                    value={courseForm.availableSlots}
                                                    onChange={(e) => setCourseForm({ ...courseForm, availableSlots: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full py-5 text-base rounded-2xl mt-6"
                                        disabled={creating}
                                    >
                                        {creating ? 'Creating...' : 'Launch Your Course'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
