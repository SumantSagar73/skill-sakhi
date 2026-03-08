import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, getCourseReviews, createBooking, createReview, checkEnrollment } from '../services/skillSakhiAPI';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { HiOutlineClock, HiOutlineChartBar, HiOutlineStar, HiOutlineUser, HiOutlineUserGroup, HiOutlineVideoCamera, HiOutlinePlayCircle, HiOutlineChevronDown, HiOutlinePlay, HiOutlineCheckCircle } from 'react-icons/hi2';

const CourseDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [enrolling, setEnrolling] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Curriculum accordion state
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

                // Open first module by default
                if (courseRes.data.modules?.length) {
                    setOpenModules({ 0: true });
                }

                // Check environment if logged in
                if (user) {
                    try {
                        const enrollment = await checkEnrollment(id);
                        setIsEnrolled(enrollment.data.isEnrolled);
                    } catch (e) {
                        console.error("Failed to check enrollment", e);
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

    const handleEnroll = async () => {
        if (!user) return navigate('/login');
        setEnrolling(true);
        try {
            await createBooking({ courseId: id });
            setIsEnrolled(true);
            toast.success('Enrolled successfully! 🎉 Start learning now.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Enrollment failed');
        } finally {
            setEnrolling(false);
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
                                                            return (
                                                                <div
                                                                    key={ti}
                                                                    className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors text-slate-700"
                                                                >
                                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                                                                        <HiOutlinePlayCircle className="w-4 h-4" />
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
                                                                        {topic.duration && (
                                                                            <span className="text-xs text-slate-400 font-bold">{topic.duration}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
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

                                    {isEnrolled ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm py-2">
                                                <HiOutlineCheckCircle className="w-5 h-5" /> You're enrolled!
                                            </div>
                                            <button
                                                onClick={() => navigate(`/player/${course._id}`)}
                                                className="btn btn-primary w-full py-5 text-lg rounded-[1.5rem] shadow-indigo-200 flex justify-center items-center gap-2"
                                            >
                                                <HiOutlinePlay className="w-5 h-5 fill-current" /> Start Learning
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <button
                                                onClick={handleEnroll}
                                                disabled={enrolling}
                                                className="btn btn-primary w-full py-5 text-lg rounded-[1.5rem] shadow-indigo-200"
                                            >
                                                {enrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll for Free' : `Enroll for ₹${course.price}`}
                                            </button>
                                            {!user && (
                                                <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                                    <Link to="/login" className="text-indigo-600 hover:underline">Login</Link> to enroll
                                                </p>
                                            )}
                                        </div>
                                    )}
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
