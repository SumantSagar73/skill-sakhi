import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, getCourseReviews, createBooking, createReview } from '../services/skillSakhiAPI';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { getYouTubeEmbed, extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import { HiOutlineClock, HiOutlineChartBar, HiOutlineStar, HiOutlineUser, HiOutlineUserGroup, HiOutlineVideoCamera, HiOutlineCalendarDays, HiOutlineLockClosed, HiOutlinePlayCircle, HiOutlineChevronDown } from 'react-icons/hi2';

const CourseDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingDate, setBookingDate] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [booking, setBooking] = useState(false);
    const [reviewing, setReviewing] = useState(false);

    // Curriculum player state
    const [activeTopic, setActiveTopic] = useState(null);  // { moduleIdx, topicIdx }
    const [openModules, setOpenModules] = useState({});    // { [moduleIdx]: true/false }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, reviewsRes] = await Promise.all([
                    getCourseById(id),
                    getCourseReviews(id),
                ]);
                setCourse(courseRes.data);
                setReviews(reviewsRes.data);
                // Auto-open first module and select first free topic
                if (courseRes.data.modules?.length) {
                    setOpenModules({ 0: true });
                    const firstFreeTopic = courseRes.data.modules[0]?.topics?.findIndex(t => t.isFree);
                    if (firstFreeTopic >= 0) {
                        setActiveTopic({ moduleIdx: 0, topicIdx: firstFreeTopic });
                    }
                }
            } catch {
                toast.error('Course not found');
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        setBooking(true);
        try {
            await createBooking({ courseId: id, date: bookingDate });
            toast.success('Session booked successfully! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        setReviewing(true);
        try {
            const { data } = await createReview({ courseId: id, ...reviewForm });
            setReviews([data, ...reviews]);
            toast.success('Review submitted! ⭐');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Review failed');
        } finally {
            setReviewing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>;
    if (!course) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link to="/courses" className="text-sm font-bold text-indigo-600 hover:underline">← Back to Marketplace</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 mb-8">
                            <div className="aspect-video relative">
                                {course.thumbnail ? (
                                    <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-9xl border-b border-slate-100">📖</div>
                                )}
                                <div className="absolute top-8 left-8">
                                    <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                        {course.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                    {course.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 mb-10 text-sm font-bold text-slate-500 uppercase tracking-tighter">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                                        <HiOutlineClock className="w-5 h-5 text-indigo-500" />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                                        <HiOutlineChartBar className="w-5 h-5 text-indigo-500" />
                                        <span>{course.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl">
                                        <HiOutlineStar className="w-5 h-5 fill-current" />
                                        <span>{course.rating} ({course.totalReviews} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                                        <HiOutlineUserGroup className="w-5 h-5 text-indigo-500" />
                                        <span>{course.enrolledCount} enrolled</span>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 mb-4 underline decoration-indigo-200 underline-offset-8">About this Course</h2>
                                <p className="text-slate-600 leading-relaxed mb-12 text-lg">
                                    {course.description}
                                </p>

                                <div className="bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center text-4xl">
                                        {course.instructor?.profilePicture ? (
                                            <img src={`http://localhost:5000${course.instructor.profilePicture}`} alt={course.instructor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <HiOutlineUser className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Taught by {course.instructor?.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{course.instructor?.bio}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Curriculum Section ─────────────────────────────── */}
                        {course.modules?.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 mb-8">

                                {/* Video Player */}
                                {activeTopic !== null && (() => {
                                    const topic = course.modules[activeTopic.moduleIdx]?.topics[activeTopic.topicIdx];
                                    const embedUrl = topic ? getYouTubeEmbed(topic.videoUrl) : null;
                                    return (
                                        <div className="bg-black">
                                            {embedUrl ? (
                                                <div className="aspect-video w-full">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={embedUrl}
                                                        title={topic.title}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video w-full flex flex-col items-center justify-center gap-3 text-slate-400">
                                                    <HiOutlineVideoCamera className="w-16 h-16 opacity-30" />
                                                    <p className="text-sm font-bold">{topic?.title}</p>
                                                    <p className="text-xs opacity-60">No video attached to this lesson</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Now Playing label */}
                                {activeTopic !== null && (
                                    <div className="px-8 py-4 bg-slate-900 flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        <span className="text-white font-bold text-sm">
                                            Now Playing: {course.modules[activeTopic.moduleIdx]?.topics[activeTopic.topicIdx]?.title}
                                        </span>
                                        {course.modules[activeTopic.moduleIdx]?.topics[activeTopic.topicIdx]?.duration && (
                                            <span className="ml-auto text-slate-400 text-xs font-bold">
                                                {course.modules[activeTopic.moduleIdx]?.topics[activeTopic.topicIdx]?.duration}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Accordion */}
                                <div className="p-8">
                                    <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                                        <HiOutlinePlayCircle className="text-indigo-600" />
                                        Course Curriculum
                                        <span className="ml-auto text-sm font-bold text-slate-400">
                                            {course.modules.reduce((acc, m) => acc + m.topics.length, 0)} lessons
                                        </span>
                                    </h2>

                                    <div className="space-y-3">
                                        {course.modules.map((mod, mi) => (
                                            <div key={mi} className="border border-slate-100 rounded-2xl overflow-hidden">
                                                {/* Module header */}
                                                <button
                                                    className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-indigo-50 transition-colors text-left"
                                                    onClick={() => setOpenModules(prev => ({ ...prev, [mi]: !prev[mi] }))}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center">{mi + 1}</span>
                                                        <span className="font-bold text-slate-800">{mod.title}</span>
                                                        <span className="text-xs text-slate-400 font-bold">{mod.topics.length} lessons</span>
                                                    </div>
                                                    <HiOutlineChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openModules[mi] ? 'rotate-180' : ''}`} />
                                                </button>

                                                {/* Topics list */}
                                                {openModules[mi] && (
                                                    <div className="divide-y divide-slate-50">
                                                        {mod.topics.map((topic, ti) => {
                                                            const isActive = activeTopic?.moduleIdx === mi && activeTopic?.topicIdx === ti;
                                                            const canPlay = topic.isFree || user;
                                                            return (
                                                                <button
                                                                    key={ti}
                                                                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${isActive
                                                                        ? 'bg-indigo-50 text-indigo-700'
                                                                        : canPlay
                                                                            ? 'hover:bg-slate-50 text-slate-700'
                                                                            : 'opacity-50 cursor-not-allowed text-slate-400'
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (!canPlay) {
                                                                            toast.info('Enroll in this course to access all lessons');
                                                                            return;
                                                                        }
                                                                        setActiveTopic({ moduleIdx: mi, topicIdx: ti });
                                                                        // Scroll to top of player
                                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                    }}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                                                        }`}>
                                                                        {canPlay
                                                                            ? <HiOutlinePlayCircle className="w-4 h-4" />
                                                                            : <HiOutlineLockClosed className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold truncate">{topic.title}</p>
                                                                        {topic.description && (
                                                                            <p className="text-xs text-slate-400 truncate">{topic.description}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        {topic.isFree && (
                                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>
                                                                        )}
                                                                        {extractYouTubeId(topic.videoUrl) && (
                                                                            <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">▶ YT</span>
                                                                        )}
                                                                        {topic.duration && (
                                                                            <span className="text-xs text-slate-400 font-bold">{topic.duration}</span>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                                <HiOutlineStar className="text-rose-500" /> Student Feedback
                            </h2>

                            {user && (
                                <form onSubmit={handleReview} className="mb-12 p-6 rounded-3xl bg-slate-50 border border-indigo-50">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">How was your experience?</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            <HiOutlineStar className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 w-5 h-5 pointer-events-none" />
                                            <select
                                                className="pl-10 pr-8 py-2 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none text-sm font-bold appearance-none cursor-pointer"
                                                value={reviewForm.rating}
                                                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                            >
                                                {[5, 4, 3, 2, 1].map((n) => (
                                                    <option key={n} value={n}>{n} Stars</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-600 outline-none mb-4 text-sm resize-none"
                                        placeholder="Write an honest review to help other students..."
                                        rows="4"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary px-8" disabled={reviewing}>
                                        {reviewing ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </form>
                            )}

                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 italic">No reviews yet. Be the first to share!</div>
                                ) : (
                                    reviews.map((r) => (
                                        <div key={r._id} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <strong className="text-slate-900">{r.user?.name}</strong>
                                                <div className="flex items-center text-rose-500 gap-0.5">
                                                    {[...Array(r.rating)].map((_, i) => <HiOutlineStar key={i} className="fill-current w-4 h-4" />)}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-indigo-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-16 translate-x-16"></div>

                                <div className="relative z-10 text-center">
                                    <span className="block text-5xl font-black text-slate-900 mb-2 tracking-tighter">
                                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                                    </span>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        {course.availableSlots} Slots Left
                                    </div>

                                    {course.meetingLink && (
                                        <a href={course.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full mb-4 py-4 rounded-2xl">
                                            <HiOutlineVideoCamera className="w-5 h-5" /> Join Preview Meeting
                                        </a>
                                    )}

                                    <div className="h-px bg-slate-100 mb-8"></div>

                                    <form onSubmit={handleBook} className="text-left">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Workshop Date</label>
                                        <div className="relative mb-6">
                                            <HiOutlineCalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                type="datetime-local"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm appearance-none"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                required
                                                min={new Date().toISOString().slice(0, 16)}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full py-5 text-lg rounded-[1.5rem] shadow-indigo-200" disabled={booking}>
                                            {booking ? 'Reserving...' : 'Reserve My Spot'}
                                        </button>
                                        <p className="mt-4 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Secure checkout & global access</p>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">🎁</div>
                                    <div>
                                        <h4 className="font-bold leading-tight">Gift this course?</h4>
                                        <p className="text-xs text-indigo-100">Spread the skill to a friend.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
